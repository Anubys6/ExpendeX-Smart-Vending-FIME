/**
 * ==============================================================================
 * EXPENDEX® VENDING — GESTOR DE INVENTARIO CENTRALIZADO Y MULTI-RANURA (FIFO)
 * Ingeniería en Electrónica y Automatización (IEA) • FIME UANL
 * Manejo de ranuras físicas (A1-F6), charolas dobles/múltiples, apilamiento
 * y despacho automático en cascada entre el quiosco cliente y el portal dueño.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const INVENTORY_FILE = path.join(__dirname, 'inventory_state.json');

// Base de productos físicos inicial con capacidades oficiales:
// 12 Comidas (Capacidad base por charola: 8 toppers)
// 24 Bebidas (Capacidad base por canal: 10 botellas)
const DEFAULT_PRODUCTS = [
  // --- 12 COMIDAS CORRIDAS (Columnas 1 y 6) ---
  {
    id: "MEAL_A1",
    name: "Pechuga al Limón con Arroz y Espárragos",
    category: "comida",
    slots: ["A1"],
    slotsStock: { "A1": 8 },
    slotCapacities: { "A1": 8 },
    capacity: 8,
    stock: 8,
    price: 125,
    cost: 52.0,
    image: "images/pechuga_limon.jpg"
  },
  {
    id: "MEAL_A6",
    name: "Salmón a la Plancha con Puré de Camote",
    category: "comida",
    slots: ["A6"],
    slotsStock: { "A6": 8 },
    slotCapacities: { "A6": 8 },
    capacity: 8,
    stock: 8,
    price: 145,
    cost: 68.0,
    image: "images/salmon_camote.jpg"
  },
  {
    id: "MEAL_B1",
    name: "Picadillo Norteño Fitness 95/5 con Nopales",
    category: "comida",
    slots: ["B1"],
    slotsStock: { "B1": 8 },
    slotCapacities: { "B1": 8 },
    capacity: 8,
    stock: 8,
    price: 120,
    cost: 48.0,
    image: "images/picadillo_norteno.jpg"
  },
  {
    id: "MEAL_B6",
    name: "Fajitas de Pollo con Pimientos Asados",
    category: "comida",
    slots: ["B6"],
    slotsStock: { "B6": 8 },
    slotCapacities: { "B6": 8 },
    capacity: 8,
    stock: 8,
    price: 125,
    cost: 50.0,
    image: "images/fajitas_pollo.jpg"
  },
  {
    id: "MEAL_C1",
    name: "Albóndigas de Pavo Caseras con Quinoa",
    category: "comida",
    slots: ["C1"],
    slotsStock: { "C1": 8 },
    slotCapacities: { "C1": 8 },
    capacity: 8,
    stock: 8,
    price: 125,
    cost: 51.0,
    image: "images/albondigas_pavo.jpg"
  },
  {
    id: "MEAL_C6",
    name: "Lomo de Cerdo Magro Adobado con Puré",
    category: "comida",
    slots: ["C6"],
    slotsStock: { "C6": 8 },
    slotCapacities: { "C6": 8 },
    capacity: 8,
    stock: 8,
    price: 130,
    cost: 53.0,
    image: "images/lomo_adobado.jpg"
  },
  {
    id: "MEAL_D1",
    name: "Bowl de Ternera con Champiñones Portobello",
    category: "comida",
    slots: ["D1"],
    slotsStock: { "D1": 8 },
    slotCapacities: { "D1": 8 },
    capacity: 8,
    stock: 8,
    price: 135,
    cost: 56.0,
    image: "images/bowl_ternera.jpg"
  },
  {
    id: "MEAL_D6",
    name: "Chiles Poblanos Rellenos de Queso Panela",
    category: "comida",
    slots: ["D6"],
    slotsStock: { "D6": 8 },
    slotCapacities: { "D6": 8 },
    capacity: 8,
    stock: 8,
    price: 120,
    cost: 47.0,
    image: "images/chile_poblano_relleno.jpg"
  },
  {
    id: "MEAL_E1",
    name: "Tinga de Pollo Pechuga Magra con Tostadas",
    category: "comida",
    slots: ["E1"],
    slotsStock: { "E1": 8 },
    slotCapacities: { "E1": 8 },
    capacity: 8,
    stock: 8,
    price: 120,
    cost: 46.0,
    image: "images/tinga_pollo.jpg"
  },
  {
    id: "MEAL_E6",
    name: "Lasaña de Berenjena y Calabaza",
    category: "comida",
    slots: ["E6"],
    slotsStock: { "E6": 8 },
    slotCapacities: { "E6": 8 },
    capacity: 8,
    stock: 8,
    price: 125,
    cost: 49.0,
    image: "images/lasana_berenjena.jpg"
  },
  {
    id: "MEAL_F1",
    name: "Pechuga Cordon Bleu Horneada Light",
    category: "comida",
    slots: ["F1"],
    slotsStock: { "F1": 8 },
    slotCapacities: { "F1": 8 },
    capacity: 8,
    stock: 8,
    price: 135,
    cost: 55.0,
    image: "images/pechuga_cordon_bleu.jpg"
  },
  {
    id: "MEAL_F6",
    name: "Guisado de Res Magra en Salsa Verde",
    category: "comida",
    slots: ["F6"],
    slotsStock: { "F6": 8 },
    slotCapacities: { "F6": 8 },
    capacity: 8,
    stock: 8,
    price: 130,
    cost: 52.0,
    image: "images/guisado_res.jpg"
  },

  // --- 24 BEBIDAS FRÍAS (Columnas 2, 3, 4 y 5) ---
  { id: "DRINK_A2", name: "Agua Ciel Purificada 600 ml", category: "bebida", slots: ["A2"], slotsStock: { "A2": 10 }, slotCapacities: { "A2": 10 }, capacity: 10, stock: 10, price: 18, cost: 7.0, image: "images/ciel_purificada.jpg" },
  { id: "DRINK_A3", name: "Agua Ciel Alcalina 600 ml", category: "bebida", slots: ["A3"], slotsStock: { "A3": 10 }, slotCapacities: { "A3": 10 }, capacity: 10, stock: 10, price: 24, cost: 10.0, image: "images/ciel_alcalina.jpg" },
  { id: "DRINK_A4", name: "Ciel Mineralizada Gasificada 600 ml", category: "bebida", slots: ["A4"], slotsStock: { "A4": 10 }, slotCapacities: { "A4": 10 }, capacity: 10, stock: 10, price: 22, cost: 9.0, image: "images/ciel_gasificada.jpg" },
  { id: "DRINK_A5", name: "Ciel Exprim Jamaica 600 ml", category: "bebida", slots: ["A5"], slotsStock: { "A5": 10 }, slotCapacities: { "A5": 10 }, capacity: 10, stock: 10, price: 25, cost: 11.0, image: "images/ciel_exprim_jamaica.jpg" },
  { id: "DRINK_B2", name: "Agua Fresca Jamaica Natural 500 ml", category: "bebida", slots: ["B2"], slotsStock: { "B2": 10 }, slotCapacities: { "B2": 10 }, capacity: 10, stock: 10, price: 28, cost: 12.0, image: "images/agua_jamaica.jpg" },
  { id: "DRINK_B3", name: "Agua Fresca Limón con Chía 500 ml", category: "bebida", slots: ["B3"], slotsStock: { "B3": 10 }, slotCapacities: { "B3": 10 }, capacity: 10, stock: 10, price: 28, cost: 12.0, image: "images/agua_limon_chia.jpg" },
  { id: "DRINK_B4", name: "Agua Fresca Horchata Avena Ligera", category: "bebida", slots: ["B4"], slotsStock: { "B4": 10 }, slotCapacities: { "B4": 10 }, capacity: 10, stock: 10, price: 30, cost: 13.0, image: "images/agua_horchata.jpg" },
  { id: "DRINK_B5", name: "Agua Fresca Pepino Limón Menta", category: "bebida", slots: ["B5"], slotsStock: { "B5": 10 }, slotCapacities: { "B5": 10 }, capacity: 10, stock: 10, price: 28, cost: 12.0, image: "images/agua_pepino_menta.jpg" },
  { id: "DRINK_C2", name: "Agua Artesanal Tamarindo 500 ml", category: "bebida", slots: ["C2"], slotsStock: { "C2": 10 }, slotCapacities: { "C2": 10 }, capacity: 10, stock: 10, price: 28, cost: 12.0, image: "images/agua_tamarindo.jpg" },
  { id: "DRINK_C3", name: "Infusión Frutos Rojos Silvestres", category: "bebida", slots: ["C3"], slotsStock: { "C3": 10 }, slotCapacities: { "C3": 10 }, capacity: 10, stock: 10, price: 32, cost: 14.0, image: "images/infusion_frutos_rojos.jpg" },
  { id: "DRINK_C4", name: "Infusión Manzanilla y Miel Fría", category: "bebida", slots: ["C4"], slotsStock: { "C4": 10 }, slotCapacities: { "C4": 10 }, capacity: 10, stock: 10, price: 30, cost: 13.0, image: "images/infusion_manzanilla.jpg" },
  { id: "DRINK_C5", name: "Agua Natural Manzana Jengibre", category: "bebida", slots: ["C5"], slotsStock: { "C5": 10 }, slotCapacities: { "C5": 10 }, capacity: 10, stock: 10, price: 32, cost: 14.0, image: "images/agua_manzana_jengibre.jpg" },
  { id: "DRINK_D2", name: "Coca-Cola Sin Azúcar 600 ml", category: "bebida", slots: ["D2"], slotsStock: { "D2": 10 }, slotCapacities: { "D2": 10 }, capacity: 10, stock: 10, price: 25, cost: 11.0, image: "images/coca_cola_sin_azucar.jpg" },
  { id: "DRINK_D3", name: "Coca-Cola Light 600 ml", category: "bebida", slots: ["D3"], slotsStock: { "D3": 10 }, slotCapacities: { "D3": 10 }, capacity: 10, stock: 10, price: 25, cost: 11.0, image: "images/coca_cola_light.jpg" },
  { id: "DRINK_D4", name: "Sprite Cero Azúcar 600 ml", category: "bebida", slots: ["D4"], slotsStock: { "D4": 10 }, slotCapacities: { "D4": 10 }, capacity: 10, stock: 10, price: 24, cost: 10.5, image: "images/sprite_cero.jpg" },
  { id: "DRINK_D5", name: "Del Valle Cero Durazno 500 ml", category: "bebida", slots: ["D5"], slotsStock: { "D5": 10 }, slotCapacities: { "D5": 10 }, capacity: 10, stock: 10, price: 26, cost: 11.5, image: "images/del_valle_cero.jpg" },
  { id: "DRINK_E2", name: "Fuze Tea Cero Té Negro Limón", category: "bebida", slots: ["E2"], slotsStock: { "E2": 10 }, slotCapacities: { "E2": 10 }, capacity: 10, stock: 10, price: 26, cost: 11.5, image: "images/fuze_tea_cero.jpg" },
  { id: "DRINK_E3", name: "Té Verde Comercial Natural Frío", category: "bebida", slots: ["E3"], slotsStock: { "E3": 10 }, slotCapacities: { "E3": 10 }, capacity: 10, stock: 10, price: 28, cost: 12.0, image: "images/te_verde_comercial.jpg" },
  { id: "DRINK_E4", name: "Té Matcha Helado Orgánico", category: "bebida", slots: ["E4"], slotsStock: { "E4": 10 }, slotCapacities: { "E4": 10 }, capacity: 10, stock: 10, price: 35, cost: 15.0, image: "images/te_matcha_frio.jpg" },
  { id: "DRINK_E5", name: "Kombucha Orgánica de Manzana", category: "bebida", slots: ["E5"], slotsStock: { "E5": 10 }, slotCapacities: { "E5": 10 }, capacity: 10, stock: 10, price: 42, cost: 19.0, image: "images/kombucha.jpg" },
  { id: "DRINK_F2", name: "Electrolit Cero Mora Azul 625 ml", category: "bebida", slots: ["F2"], slotsStock: { "F2": 10 }, slotCapacities: { "F2": 10 }, capacity: 10, stock: 10, price: 36, cost: 16.0, image: "images/electrolit_zero.jpg" },
  { id: "DRINK_F3", name: "Powerade Zero Frutas 600 ml", category: "bebida", slots: ["F3"], slotsStock: { "F3": 10 }, slotCapacities: { "F3": 10 }, capacity: 10, stock: 10, price: 30, cost: 13.0, image: "images/powerade_zero.jpg" },
  { id: "DRINK_F4", name: "Gatorade Cero Naranja 600 ml", category: "bebida", slots: ["F4"], slotsStock: { "F4": 10 }, slotCapacities: { "F4": 10 }, capacity: 10, stock: 10, price: 32, cost: 14.0, image: "images/gatorade_zero.jpg" },
  { id: "DRINK_F5", name: "Agua Artesiana Fiji Natural 500 ml", category: "bebida", slots: ["F5"], slotsStock: { "F5": 10 }, slotCapacities: { "F5": 10 }, capacity: 10, stock: 10, price: 45, cost: 20.0, image: "images/fiji_water.jpg" }
];

class InventoryManager {
  constructor() {
    this.inventory = {};
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(INVENTORY_FILE)) {
        const raw = fs.readFileSync(INVENTORY_FILE, 'utf8');
        this.inventory = JSON.parse(raw);
        console.log(`[INVENTARIO] Cargado desde archivo persistente: ${Object.keys(this.inventory).length} productos.`);
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.error("[INVENTARIO ERROR] Fallo al cargar:", e);
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    this.inventory = {};
    DEFAULT_PRODUCTS.forEach(p => {
      this.inventory[p.id] = { ...p };
    });
    this.save();
    console.log(`[INVENTARIO] Inicializado con valores por defecto (36 productos).`);
  }

  save() {
    try {
      fs.writeFileSync(INVENTORY_FILE, JSON.stringify(this.inventory, null, 2), 'utf8');
    } catch (e) {
      console.error("[INVENTARIO ERROR] No se pudo guardar en disco:", e);
    }
  }

  getAll() {
    return this.inventory;
  }

  getProduct(id) {
    return this.inventory[id] || null;
  }

  /**
   * Obtiene la casilla activa inmediata de la cual se va a expulsar el producto (FIFO)
   * Recorre la lista de ranuras asignadas y devuelve la primera que tenga stock > 0.
   */
  peekActiveSlot(productId) {
    const prod = this.inventory[productId];
    if (!prod) return 'A1';

    const slots = Array.isArray(prod.slots) ? prod.slots : [prod.slot || 'A1'];
    const stocks = prod.slotsStock || {};

    for (const s of slots) {
      if ((stocks[s] || 0) > 0) {
        return s;
      }
    }
    // Si todas están vacías, retorna la primera ranura principal
    return slots[0] || prod.slot || 'A1';
  }

  /**
   * Actualiza las ranuras físicas asignadas a un producto (simple, doble o múltiple)
   * @param {string} id - ID del producto (ej: 'MEAL_A1')
   * @param {Array<string>} slots - Arreglo de ranuras (ej: ['A1', 'A6'])
   * @param {Object} [customStocks] - Stock específico por ranura { 'A1': 8, 'A6': 8 }
   * @param {Object} [customCaps] - Capacidad por ranura { 'A1': 8, 'A6': 8 }
   */
  updateProductSlots(id, slots, customStocks = null, customCaps = null) {
    const prod = this.inventory[id];
    if (!prod) {
      throw new Error(`Producto ${id} no encontrado en inventario.`);
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      throw new Error("Debe especificarse al menos una ranura válida.");
    }

    // Normalizar slots limpios en mayúsculas (ej: ['A1', 'A6'])
    const cleanSlots = slots.map(s => String(s).trim().toUpperCase()).filter(Boolean);
    const defaultCapPerSlot = (prod.category === 'comida') ? 8 : 10;

    const newSlotsStock = {};
    const newSlotCapacities = {};
    let totalCap = 0;
    let totalStock = 0;

    cleanSlots.forEach(slotName => {
      // Capacidad de esta ranura
      const cap = (customCaps && customCaps[slotName]) ? parseInt(customCaps[slotName]) : defaultCapPerSlot;
      newSlotCapacities[slotName] = cap;
      totalCap += cap;

      // Stock de esta ranura
      let stockForSlot = cap; // Por defecto llena
      if (customStocks && customStocks[slotName] !== undefined) {
        stockForSlot = Math.max(0, Math.min(cap, parseInt(customStocks[slotName]) || 0));
      } else if (prod.slotsStock && prod.slotsStock[slotName] !== undefined) {
        stockForSlot = Math.max(0, Math.min(cap, prod.slotsStock[slotName]));
      }
      newSlotsStock[slotName] = stockForSlot;
      totalStock += stockForSlot;
    });

    prod.slots = cleanSlots;
    prod.slot = cleanSlots[0]; // Ranura principal para compatibilidad
    prod.slotsStock = newSlotsStock;
    prod.slotCapacities = newSlotCapacities;
    prod.capacity = totalCap;
    prod.stock = totalStock;

    this.save();
    return prod;
  }

  /**
   * Modifica el stock de un producto (sumar, restar, fijar directo o llenar a tope)
   */
  updateProductStock(id, { delta, directStock, fill, slot }) {
    const prod = this.inventory[id];
    if (!prod) throw new Error(`Producto ${id} no encontrado.`);

    const slots = Array.isArray(prod.slots) ? prod.slots : [prod.slot || 'A1'];
    const caps = prod.slotCapacities || {};
    const stocks = prod.slotsStock || {};
    const defaultCap = (prod.category === 'comida') ? 8 : 10;

    // Asegurar estructura
    slots.forEach(s => {
      if (caps[s] === undefined) caps[s] = defaultCap;
      if (stocks[s] === undefined) stocks[s] = caps[s];
    });

    if (fill) {
      // Llenar todas las ranuras al tope
      slots.forEach(s => {
        stocks[s] = caps[s];
      });
    } else if (slot && (delta !== undefined || directStock !== undefined)) {
      // Ajuste enfocado a una ranura específica
      const maxCap = caps[slot] || defaultCap;
      if (directStock !== undefined) {
        stocks[slot] = Math.max(0, Math.min(maxCap, parseInt(directStock) || 0));
      } else if (delta !== undefined) {
        stocks[slot] = Math.max(0, Math.min(maxCap, (stocks[slot] || 0) + parseInt(delta)));
      }
    } else if (directStock !== undefined) {
      // Ajuste total directo distribuido en cascada
      let remainingToAssign = Math.max(0, Math.min(prod.capacity, parseInt(directStock) || 0));
      slots.forEach(s => {
        const c = caps[s] || defaultCap;
        const take = Math.min(c, remainingToAssign);
        stocks[s] = take;
        remainingToAssign -= take;
      });
    } else if (delta !== undefined) {
      let d = parseInt(delta) || 0;
      if (d > 0) {
        // Sumar: Llenar primero la primera ranura disponible
        for (const s of slots) {
          const c = caps[s] || defaultCap;
          const room = c - (stocks[s] || 0);
          if (room > 0) {
            const add = Math.min(room, d);
            stocks[s] = (stocks[s] || 0) + add;
            d -= add;
            if (d <= 0) break;
          }
        }
      } else if (d < 0) {
        // Restar: Descontar primero de la ranura activa que tiene stock (FIFO)
        let toRemove = Math.abs(d);
        for (const s of slots) {
          if ((stocks[s] || 0) > 0) {
            const rem = Math.min(stocks[s], toRemove);
            stocks[s] -= rem;
            toRemove -= rem;
            if (toRemove <= 0) break;
          }
        }
      }
    }

    prod.slotsStock = stocks;
    prod.slotCapacities = caps;
    prod.stock = slots.reduce((acc, s) => acc + (stocks[s] || 0), 0);
    prod.capacity = slots.reduce((acc, s) => acc + (caps[s] || defaultCap), 0);

    this.save();
    return prod;
  }

  /**
   * Llenar toda la máquina a tope
   */
  restockAll() {
    Object.values(this.inventory).forEach(prod => {
      const slots = Array.isArray(prod.slots) ? prod.slots : [prod.slot || 'A1'];
      const defaultCap = (prod.category === 'comida') ? 8 : 10;
      const caps = prod.slotCapacities || {};
      const stocks = {};

      slots.forEach(s => {
        const c = caps[s] || defaultCap;
        caps[s] = c;
        stocks[s] = c;
      });

      prod.slotsStock = stocks;
      prod.slotCapacities = caps;
      prod.capacity = slots.reduce((acc, s) => acc + caps[s], 0);
      prod.stock = prod.capacity;
    });

    this.save();
    return this.inventory;
  }

  /**
   * Despacha 1 o más unidades de un producto utilizando lógica FIFO entre ranuras.
   * Retorna las casillas físicas exactas de las que se despachó cada unidad.
   */
  dispense(productId, qty = 1) {
    const prod = this.inventory[productId];
    if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

    const slots = Array.isArray(prod.slots) ? prod.slots : [prod.slot || 'A1'];
    const stocks = prod.slotsStock || {};
    const defaultCap = (prod.category === 'comida') ? 8 : 10;

    const requested = parseInt(qty) || 1;
    const dispensedSlots = [];

    for (let i = 0; i < requested; i++) {
      let slotFound = null;

      // Buscar primera ranura en orden con stock > 0
      for (const s of slots) {
        if ((stocks[s] || 0) > 0) {
          slotFound = s;
          stocks[s]--;
          break;
        }
      }

      if (!slotFound) {
        console.warn(`[DISPENSE WARNING] Se agotó el stock para ${prod.name} en la unidad #${i + 1}`);
        break;
      }

      dispensedSlots.push(slotFound);
    }

    prod.slotsStock = stocks;
    prod.stock = slots.reduce((acc, s) => acc + (stocks[s] || 0), 0);
    prod.slot = this.peekActiveSlot(productId); // Actualizar ranura activa principal

    this.save();

    return {
      success: dispensedSlots.length > 0,
      dispensedSlots,
      primaryDispensedSlot: dispensedSlots[0] || slots[0],
      product: prod,
      remainingTotalStock: prod.stock
    };
  }

  /**
   * Obtiene el mapa de ocupación de las 36 casillas de la máquina
   */
  getOccupancyMatrix() {
    const occupancy = {};
    Object.values(this.inventory).forEach(prod => {
      const slots = Array.isArray(prod.slots) ? prod.slots : [prod.slot || 'A1'];
      slots.forEach((s, idx) => {
        occupancy[s] = {
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          isPrimary: idx === 0,
          slotIndex: idx + 1,
          totalSlotsForProduct: slots.length,
          stockInSlot: (prod.slotsStock && prod.slotsStock[s] !== undefined) ? prod.slotsStock[s] : 0,
          capInSlot: (prod.slotCapacities && prod.slotCapacities[s] !== undefined) ? prod.slotCapacities[s] : (prod.category === 'comida' ? 8 : 10)
        };
      });
    });
    return occupancy;
  }
}

module.exports = new InventoryManager();
