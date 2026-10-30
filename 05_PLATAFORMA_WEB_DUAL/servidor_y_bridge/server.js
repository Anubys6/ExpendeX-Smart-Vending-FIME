/**
 * ==============================================================================
 * EXPENDEX® VENDING - SERVIDOR BACKEND OFICIAL NODE.JS + PUENTE WOKWI ESP32
 * Ingeniería en Electrónica y Automatización (IEA) - FIME UANL
 * Servidor de Kiosco Táctil 10.1", Pasarela Mercado Pago Real, QR y Matriz 6x6
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const net = require('net');
const https = require('https');
const QRCode = require('qrcode');

const inventoryManager = require('./inventory_manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Manejadores globales para robustez del servidor
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// CONFIGURACIÓN DE CREDENCIALES DE MERCADO PAGO (VÍA VARIABLES DE ENTORNO O PLACEHOLDER)
const MP_PUBLIC_KEY   = process.env.MP_PUBLIC_KEY   || 'TU_MERCADOPAGO_PUBLIC_KEY_AQUI';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'TU_MERCADOPAGO_ACCESS_TOKEN_AQUI';

// Caché en memoria para pagos aprobados (vía Webhooks o Polling)
const approvedPaymentsCache = {};

// Cola de comandos pendientes para el ESP32 (Wokwi o Dispositivo Físico)
const pendingEsp32Commands = [];

// Puente directo TCP/Serial RFC2217 al simulador Wokwi en VS Code (Puerto 4000)
function pushCommandToWokwiSerial(cmd) {
  try {
    const client = new net.Socket();
    client.setTimeout(600);
    client.connect(4000, '127.0.0.1', () => {
      const payload = JSON.stringify({
        pending: true,
        id: cmd.id,
        slot: cmd.slot,
        amount: cmd.price,
        name: cmd.name
      });
      client.write(`\nCMD_JSON:${payload}\n`);
      console.log(`⚡ [PUENTE DIRECTO WOKWI:4000] Enviado a Matriz 36 LEDs -> Casilla ${cmd.slot} (#${cmd.id})`);
      setTimeout(() => {
        try { client.destroy(); } catch (e) {}
      }, 120);
    });
    client.on('error', () => {
      // Si el puerto 4000 no está activo aún, el ESP32 lo recibirá vía HTTP Polling /api/esp32/pendientes
      try { client.destroy(); } catch (e) {}
    });
    client.on('timeout', () => {
      try { client.destroy(); } catch (e) {}
    });
  } catch (e) {}
}

function enqueueEsp32Command(cmd) {
  pendingEsp32Commands.push(cmd);
  pushCommandToWokwiSerial(cmd);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. RESOLUCIÓN AUTOMÁTICA DE CARPETAS WEB (SOPORTA ESTRUCTURA PROYECTO FINAL Y LEGACY)
const kioskDirCandidates = [
  path.join(__dirname, '..', 'pagina_web_kiosco'),
  path.join(__dirname, 'pagina_web_kiosco'),
  path.join(__dirname, 'página web'),
  path.join(__dirname, '..', 'página web')
];
const adminDirCandidates = [
  path.join(__dirname, '..', 'user_interface_admin'),
  path.join(__dirname, 'user_interface_admin'),
  path.join(__dirname, 'user interface'),
  path.join(__dirname, '..', 'user interface')
];

const KIOSK_DIR = kioskDirCandidates.find(d => fs.existsSync(d)) || kioskDirCandidates[0];
const ADMIN_DIR = adminDirCandidates.find(d => fs.existsSync(d)) || adminDirCandidates[0];

// Aplicación del Cliente (Kiosco táctil 10.1" en "/")
app.use(['/', '/kiosk', '/tienda', '/pagina_web_kiosco', '/página web', '/p%C3%A1gina%20web', '/pagina web'], express.static(KIOSK_DIR));

// Panel de Administración y Telemetría del Dueño en "/admin"
app.use(['/admin', '/user_interface_admin', '/user interface', '/user%20interface', '/panel'], express.static(ADMIN_DIR));

// Enrutamiento explícito para evitar fallos 404
app.get('/admin', (req, res) => {
  res.sendFile(path.join(ADMIN_DIR, 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(KIOSK_DIR, 'index.html'));
});

// 2. ENDPOINT: OBTENER CONFIGURACIÓN PÚBLICA
app.get('/api/config', (req, res) => {
  res.json({
    appName: 'ExpendeX Vending',
    publicKey: MP_PUBLIC_KEY,
    status: 'ONLINE',
    esp32Mode: 'WOKWI_36_LEDS_AND_HARDWARE'
  });
});

// 2.1 ENDPOINTS DE INVENTARIO CENTRALIZADO Y CASILLAS MULTI-RANURA (FIFO)
app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    inventory: inventoryManager.getAll(),
    occupancy: inventoryManager.getOccupancyMatrix()
  });
});

app.post('/api/inventory/update-slots', (req, res) => {
  try {
    const id = req.body.id || req.body.productId;
    const { slots, customStocks, customCaps } = req.body;
    if (!id || !slots) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros id y slots' });
    }
    const updated = inventoryManager.updateProductSlots(id, slots, customStocks, customCaps);
    console.log(`[INVENTARIO] Ranuras actualizadas para ${updated.name}: [${updated.slots.join(', ')}] (Capacidad: ${updated.capacity}, Stock: ${updated.stock})`);
    res.json({ success: true, product: updated, item: updated, inventory: inventoryManager.getAll() });
  } catch (err) {
    console.error('[ERROR en update-slots]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/inventory/update-stock', (req, res) => {
  try {
    const id = req.body.id || req.body.productId;
    const { delta, directStock, fill, slot } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Falta parámetro id' });
    }
    const updated = inventoryManager.updateProductStock(id, { delta, directStock, fill, slot });
    res.json({ success: true, product: updated, item: updated, inventory: inventoryManager.getAll() });
  } catch (err) {
    console.error('[ERROR en update-stock]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/inventory/restock-all', (req, res) => {
  try {
    const all = inventoryManager.restockAll();
    console.log(`[INVENTARIO] Toda la máquina reabastecida a tope.`);
    res.json({ success: true, inventory: all });
  } catch (err) {
    console.error('[ERROR en restock-all]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/inventory/dispense', (req, res) => {
  try {
    const id = req.body.id || req.body.productId;
    const { qty, name, price, method } = req.body;
    const dispenseResult = inventoryManager.dispense(id, qty || 1);

    dispenseResult.dispensedSlots.forEach((dispensedSlot) => {
      const cmd = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        slot: dispensedSlot,
        name: name || (dispenseResult.product ? dispenseResult.product.name : 'ExpendeX'),
        price: parseFloat(price) || (dispenseResult.product ? dispenseResult.product.price : 0),
        method: method || 'Venta Quiosco',
        timestamp: new Date().toISOString()
      };
      enqueueEsp32Command(cmd);
      console.log(`⚡ [DISPENSADO EN ESP32] Comando enviado para casilla física: ${dispensedSlot} (${cmd.name})`);
    });

    res.json({
      success: dispenseResult.success,
      dispensedSlots: dispenseResult.dispensedSlots,
      primarySlot: dispenseResult.primaryDispensedSlot,
      activeSlot: inventoryManager.peekActiveSlot(id),
      remainingTotalStock: dispenseResult.remainingTotalStock,
      product: dispenseResult.product,
      item: dispenseResult.product,
      inventory: inventoryManager.getAll()
    });
  } catch (err) {
    console.error('[ERROR en dispense]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Función auxiliar para peticiones HTTPS con Promesas
function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          resolve({ statusCode: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: null, raw: body });
        }
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// 3. ENDPOINT: CREAR PREFERENCIA REAL EN MERCADO PAGO Y GENERAR QR AUTÉNTICO
app.post('/api/crear-preferencia', async (req, res) => {
  try {
    const { id, name, price, slot } = req.body;
    const precioUnitario = parseFloat(price) || 35.00;
    
    // Casilla exacta para el ESP32 (ej: "A1", "A6", "A1-A2", "B4")
    let slotLimpio = (slot || '').trim().toUpperCase();
    if (id && inventoryManager.getProduct(id)) {
      slotLimpio = inventoryManager.peekActiveSlot(id);
    }
    if (!slotLimpio) slotLimpio = (slot || 'A1').trim().toUpperCase();
    const externalRef = slotLimpio;

    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    let notificationUrl = undefined;
    if (host.includes('trycloudflare.com') || host.includes('loca.lt')) {
      notificationUrl = `https://${host}/api/webhook`;
    }

    const payloadObj = {
      items: [
        {
          id: id || 'EXPENDEX_ITEM',
          title: `ExpendeX: ${name || 'Comida FIME'}`,
          description: `Dispensador Automático FIME - Casilla ${slot || 'A1'}`,
          quantity: 1,
          unit_price: precioUnitario,
          currency_id: 'MXN'
        }
      ],
      external_reference: externalRef,
      statement_descriptor: 'EXPENDEX VENDING',
      back_urls: {
        success: 'https://www.mercadopago.com.mx',
        failure: 'https://www.mercadopago.com.mx',
        pending: 'https://www.mercadopago.com.mx'
      },
      auto_return: 'approved'
    };

    if (notificationUrl) {
      payloadObj.notification_url = notificationUrl;
    }

    const payload = JSON.stringify(payloadObj);

    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: '/checkout/preferences',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const mpRes = await httpsRequest(options, payload);

    if (mpRes.statusCode === 201 && mpRes.data && mpRes.data.init_point) {
      const initPoint = mpRes.data.init_point;
      console.log(`\n=============================================================`);
      console.log(`[MERCADO PAGO OK] PREFERENCIA REAL CREADA:`);
      console.log(`  Item:         ${name} ($${precioUnitario} MXN)`);
      console.log(`  Casilla Slot: ${externalRef}`);
      console.log(`  Enlace Pago:  ${initPoint}`);
      console.log(`=============================================================\n`);

      const qrDataUrl = await QRCode.toDataURL(initPoint, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 340,
        color: {
          dark: '#002D62',
          light: '#FFFFFF'
        }
      });

      return res.json({
        success: true,
        init_point: initPoint,
        sandbox_init_point: mpRes.data.sandbox_init_point,
        qr_image: qrDataUrl,
        preference_id: mpRes.data.id,
        external_reference: externalRef,
        slot: slot || 'A1'
      });
    } else {
      console.error('[MERCADO PAGO ERROR]', mpRes.data || mpRes.raw);
      return res.status(mpRes.statusCode || 500).json({ success: false, error: mpRes.data });
    }
  } catch (err) {
    console.error('[SERVER ERROR en crear-preferencia]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. WEBHOOK OFICIAL DE MERCADO PAGO (IPN / Webhook v2)
app.all('/api/webhook', async (req, res) => {
  try {
    let paymentId = req.query['data.id'] || req.query.id;
    if (!paymentId && req.body && req.body.data) {
      paymentId = req.body.data.id;
    }

    if (paymentId) {
      const options = {
        hostname: 'api.mercadopago.com',
        port: 443,
        path: `/v1/payments/${paymentId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      };

      const payRes = await httpsRequest(options);
      if (payRes.statusCode === 200 && payRes.data) {
        const p = payRes.data;
        const status = p.status;
        const ref = p.external_reference || 'A1';
        const monto = p.transaction_amount;

        if (status === 'approved') {
          approvedPaymentsCache[ref] = {
            status: 'approved',
            payment_id: p.id,
            amount: monto,
            external_reference: ref,
            date: p.date_approved
          };
          enqueueEsp32Command({
            id: String(p.id),
            slot: ref,
            name: 'Mercado Pago QR',
            price: monto,
            method: 'Mercado Pago'
          });
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[ERROR EN WEBHOOK]', err);
    res.status(200).send('OK');
  }
});

// 5. ENDPOINT: VERIFICAR ESTADO DE PAGO EN TIEMPO REAL (POLLING + CACHE)
app.get('/api/pago-status/:ref', async (req, res) => {
  const ref = req.params.ref.toUpperCase();

  if (approvedPaymentsCache[ref]) {
    return res.json(approvedPaymentsCache[ref]);
  }

  try {
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: `/v1/payments/search?external_reference=${encodeURIComponent(ref)}&sort=date_created&criteria=desc&limit=5`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const mpRes = await httpsRequest(options);
    if (mpRes.statusCode === 200 && mpRes.data && mpRes.data.results) {
      for (const p of mpRes.data.results) {
        if (p.status === 'approved') {
          const resultado = {
            status: 'approved',
            payment_id: p.id,
            amount: p.transaction_amount,
            external_reference: ref,
            date: p.date_approved
          };
          approvedPaymentsCache[ref] = resultado;
          return res.json(resultado);
        }
      }
    }
    res.json({ status: 'pending', external_reference: ref });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5.1 ENDPOINT DIRECTO DE PAGO QR DESDE CELULAR O ESCANEO
app.get('/api/pagar-qr/:ref', (req, res) => {
  const ref = req.params.ref.toUpperCase();
  const cmd = {
    id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
    slot: ref,
    name: 'Pago QR Celular',
    price: 35.00,
    method: 'Mercado Pago QR Móvil',
    timestamp: new Date().toISOString()
  };
  approvedPaymentsCache[ref] = {
    status: 'approved',
    payment_id: cmd.id,
    amount: cmd.price,
    external_reference: ref,
    date: new Date().toISOString()
  };
  enqueueEsp32Command(cmd);
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>ExpendeX - Pago QR Confirmado</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1527; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #162036; border: 1px solid #10b981; border-radius: 18px; padding: 32px 24px; max-width: 400px; text-align: center; box-shadow: 0 16px 36px rgba(0,0,0,0.5); }
        .icon { font-size: 56px; color: #10b981; margin-bottom: 12px; }
        h1 { margin: 0 0 10px; font-size: 1.6rem; color: #10b981; }
        p { color: #94a3b8; margin: 8px 0; font-size: 0.95rem; }
        .badge { display: inline-block; background: #064e3b; color: #6ee7b7; padding: 6px 14px; border-radius: 999px; font-weight: 700; margin-top: 12px; font-size: 1rem; border: 1px solid #10b981; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✓</div>
        <h1>¡Pago QR Aprobado!</h1>
        <p>Tu orden ha sido validada por el servidor mecatrónico.</p>
        <div class="badge">Casilla ${ref} Dispensando</div>
        <p style="margin-top: 16px; font-size: 0.82rem; color: #64748b;">El LED M-${ref} y el motor de espiral han sido activados en Visual Studio Code (Wokwi).</p>
      </div>
    </body>
    </html>
  `);
});

// 7. ENDPOINT: SOLICITAR DISPENSADO MANUAL / TARJETA / SALDO / WALLETS (DISPARA ESP32)
app.post('/api/dispensar', (req, res) => {
  try {
    const { id, slot, name, price, method } = req.body;
    let slotLimpio = (slot || '').trim().toUpperCase();
    let dispenseResult = null;

    if (id && inventoryManager.getProduct(id)) {
      try {
        dispenseResult = inventoryManager.dispense(id, 1);
        slotLimpio = dispenseResult.primaryDispensedSlot || slotLimpio;
      } catch (e) {
        console.warn(`[DISPENSAR WARNING] ${e.message}`);
      }
    }
    if (!slotLimpio) slotLimpio = 'A1';

    const cmd = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      slot: slotLimpio,
      name: name || 'Comida ExpendeX',
      price: parseFloat(price) || 0,
      method: method || 'Tarjeta / Saldo',
      timestamp: new Date().toISOString()
    };

    enqueueEsp32Command(cmd);

    console.log(`\n=============================================================`);
    console.log(`💳 [COMPRA CONFIRMADA EN PÁGINA WEB -> MATRIZ 36 LEDs WOKWI]`);
    console.log(`   Producto:     ${cmd.name} ($${cmd.price} MXN)`);
    console.log(`   Casilla Slot: ${cmd.slot} (LED M-${cmd.slot} ENCENDIDO)`);
    console.log(`   Método:       ${cmd.method}`);
    console.log(`   ID Orden:     #${cmd.id}`);
    console.log(`=============================================================\n`);

    res.json({ success: true, command: cmd });
  } catch (err) {
    console.error('[ERROR en /api/dispensar]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. ENDPOINT: POLLING DEL ESP32 PARA OBTENER COMANDOS PENDIENTES EN TIEMPO REAL
app.get('/api/esp32/pendientes', (req, res) => {
  if (pendingEsp32Commands.length > 0) {
    const cmd = pendingEsp32Commands.shift();
    console.log(`⚡ [ESP32 HTTP POLLING] Entregando comando a microcontrolador: Casilla ${cmd.slot} (#${cmd.id})`);
    return res.json({
      pending: true,
      id: cmd.id,
      slot: cmd.slot,
      amount: cmd.price,
      name: cmd.name
    });
  }
  res.json({ pending: false });
});

// INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log('=============================================================');
  console.log(`  EXPENDEX® VENDING SERVER ACTIVO EN PUERTO ${PORT}`);
  console.log('  Kiosco Pantalla 10.1": http://localhost:' + PORT + '/');
  console.log('  Panel del Dueño:       http://localhost:' + PORT + '/admin');
  console.log('  Puente Wokwi 36 LEDs:  Puerto 4000 (TCP) + /api/esp32/pendientes');
  console.log('=============================================================');
});
