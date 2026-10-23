/**
 * ==============================================================================
 * ExpendeX® — PORTAL ADMINISTRATIVO, TELEMETRÍA IoT & ESTADO DE CUENTA
 * Facultad de Ingeniería Mecánica y Eléctrica (FIME) • UANL
 * Desarrollado para gestión ejecutiva, simulación de 3 meses, análisis por día/hora
 * y control de inventario en tiempo real sincronizado bidireccionalmente.
 * ==============================================================================
 */

// ==============================================================================
// 1. GESTIÓN DE INVENTARIO CENTRALIZADO (SINCRONIZADO CON LA APP DE VENTA)
// Capacidad física exacta en máquina llena: 8 para comidas, 10 para bebidas
// ==============================================================================
const ExpendeXInventory = {
  KEY: 'EXPANDEX_LIVE_INVENTORY',
  SALES_KEY: 'EXPANDEX_LIVE_SALES',
  channel: (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('expandex_sync') : null,

  getInventory() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error leyendo inventario:", e);
    }

    // Inicializar inventario físico con stock inicial uniforme
    const initial = {};
    if (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) {
      EXPANDEX_HISTORY_DATA.products.forEach(p => {
        if (p.category !== 'combos') {
          const cap = (p.category === 'comida') ? 8 : 10;
          initial[p.id] = {
            id: p.id,
            name: p.name,
            category: p.category,
            slot: p.slot,
            capacity: cap,
            stock: (p.category === 'comida') ? 6 : 8, // Stock inicial coherente (6 de 8, 8 de 10)
            price: p.price,
            cost: p.cost,
            image: p.image
          };
        }
      });
    }
    this.saveInventory(initial, false);
    return initial;
  },

  saveInventory(inv, notify = true) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(inv));
    } catch (e) {}
    if (notify && this.channel) {
      try {
        this.channel.postMessage({ type: 'INVENTORY_UPDATED', inventory: inv, timestamp: Date.now() });
      } catch (e) {}
    }
  },

  updateItemStock(id, newStock) {
    const inv = this.getInventory();
    if (inv[id]) {
      const cap = inv[id].capacity || (inv[id].category === 'comida' ? 8 : 10);
      inv[id].stock = Math.max(0, Math.min(cap, parseInt(newStock) || 0));
      this.saveInventory(inv, true);
      return inv[id].stock;
    }
    return 0;
  },

  adjustStock(id, delta) {
    const inv = this.getInventory();
    if (inv[id]) {
      const cap = inv[id].capacity || (inv[id].category === 'comida' ? 8 : 10);
      inv[id].stock = Math.max(0, Math.min(cap, (inv[id].stock || 0) + delta));
      this.saveInventory(inv, true);
      return inv[id].stock;
    }
    return 0;
  },

  fillSlot(id) {
    const inv = this.getInventory();
    if (inv[id]) {
      const cap = inv[id].capacity || (inv[id].category === 'comida' ? 8 : 10);
      inv[id].stock = cap;
      this.saveInventory(inv, true);
      return inv[id].stock;
    }
    return 0;
  },

  restockAll() {
    const inv = this.getInventory();
    Object.keys(inv).forEach(id => {
      const cap = inv[id].capacity || (inv[id].category === 'comida' ? 8 : 10);
      inv[id].stock = cap;
    });
    this.saveInventory(inv, true);
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'RESTOCK_ALL', inventory: inv, timestamp: Date.now() });
      } catch (e) {}
    }
    return inv;
  }
};

// ==============================================================================
// 1.1 GESTIÓN DE PRECIOS FIJOS EDITABLES (RECALCULACIÓN DINÁMICA DE GRÁFICAS)
// ==============================================================================
const ExpendeXPrices = {
  KEY: 'EXPANDEX_CUSTOM_PRICES_V4',
  channel: ExpendeXInventory.channel,

  initBasePrices() {
    if (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) {
      const saved = this.getCustomMap();
      EXPANDEX_HISTORY_DATA.products.forEach(p => {
        if (typeof p.basePrice === 'undefined') {
          p.basePrice = p.price;
        }
        if (saved[p.id] !== undefined && !isNaN(parseFloat(saved[p.id]))) {
          p.price = parseFloat(saved[p.id]);
        }
      });
    }
  },

  getCustomMap() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  },

  saveCustomMap(map, notify = true) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(map));
    } catch (e) {}
    if (notify && this.channel) {
      try {
        this.channel.postMessage({ type: 'PRICES_UPDATED', prices: map, timestamp: Date.now() });
      } catch (e) {}
    }
  },

  getPrice(id, fallback = 0) {
    const map = this.getCustomMap();
    if (map[id] !== undefined && !isNaN(parseFloat(map[id]))) {
      return parseFloat(map[id]);
    }
    if (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) {
      const prod = EXPANDEX_HISTORY_DATA.products.find(p => p.id === id);
      if (prod) return prod.price;
    }
    return fallback;
  },

  setPrice(id, newPrice) {
    const val = Math.max(1, Math.round((parseFloat(newPrice) || 1) * 100) / 100);
    const map = this.getCustomMap();
    map[id] = val;
    this.saveCustomMap(map, true);

    if (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) {
      const prod = EXPANDEX_HISTORY_DATA.products.find(p => p.id === id);
      if (prod) prod.price = val;
    }

    // Sincronizar también en el objeto de inventario físico
    const inv = ExpendeXInventory.getInventory();
    if (inv[id]) {
      inv[id].price = val;
      ExpendeXInventory.saveInventory(inv, true);
    }
    return val;
  },

  resetAllPrices() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {}
    if (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) {
      const inv = ExpendeXInventory.getInventory();
      EXPANDEX_HISTORY_DATA.products.forEach(p => {
        if (typeof p.basePrice !== 'undefined') {
          p.price = p.basePrice;
        }
        if (inv[p.id]) {
          inv[p.id].price = p.price;
        }
      });
      ExpendeXInventory.saveInventory(inv, true);
    }
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'PRICES_UPDATED', prices: {}, timestamp: Date.now() });
      } catch (e) {}
    }
  },

  resetDefaultPrices() {
    this.resetAllPrices();
  }
};

ExpendeXPrices.initBasePrices();

// ==============================================================================
// 2. ESTADO GLOBAL DE LA APLICACIÓN ADMINISTRATIVA
// ==============================================================================
const STATE = {
  isLoggedIn: false,
  currentPeriod: '3m', // 'custom_day', '7d', '30d', '1m', '2m', '3m', '6m', '1y', 'total'
  selectedDayDate: '2026-10-15',
  dayViewMode: 'hourly', // 'hourly' o 'daily'
  selectedProductId: 'MEAL_A1',
  inventoryFilter: 'all', // 'all', 'comida', 'bebida', 'alert', 'low'
  priceFilter: 'all', // 'all', 'comida', 'bebida', 'combos'
  statementSearch: ''
};

// ==============================================================================
// 3. CONTROL DE AUTENTICACIÓN (LOGIN: admin / admin)
// ==============================================================================
function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const loginWrapper = document.getElementById("loginWrapper");
  const dashboardWrapper = document.getElementById("dashboardWrapper");
  const loginAlert = document.getElementById("loginAlert");
  const btnTogglePass = document.getElementById("btnTogglePass");
  const userInput = document.getElementById("loginUser");
  const passInput = document.getElementById("loginPass");
  const btnLogout = document.getElementById("btnLogout");

  // Botón circular de Admin / Salir (registrado antes del retorno de sesión activa)
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      STATE.isLoggedIn = false;
      localStorage.removeItem("expandex_admin_logged");
      if (dashboardWrapper) dashboardWrapper.style.display = "none";
      if (loginWrapper) loginWrapper.style.display = "flex";
      if (passInput) passInput.value = "admin";
    });
  }

  // Recordar sesión o autologin por parámetro
  if (localStorage.getItem("expandex_admin_logged") === "true" || window.location.search.includes("autologin=1")) {
    STATE.isLoggedIn = true;
    if (loginWrapper) loginWrapper.style.display = "none";
    if (dashboardWrapper) {
      dashboardWrapper.style.display = "flex";
      initDashboard();
    }
    return;
  }

  // Toggle de visibilidad de contraseña
  if (btnTogglePass && passInput) {
    btnTogglePass.addEventListener("click", () => {
      if (passInput.type === "password") {
        passInput.type = "text";
        btnTogglePass.textContent = "🔒";
      } else {
        passInput.type = "password";
        btnTogglePass.textContent = "👁️";
      }
    });
  }

  // Submit de login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = (userInput ? userInput.value : '').trim().toLowerCase();
      const p = (passInput ? passInput.value : '').trim();

      if (u === "admin" && p === "admin") {
        STATE.isLoggedIn = true;
        if (document.getElementById("chkRemember")?.checked) {
          localStorage.setItem("expandex_admin_logged", "true");
        }
        if (loginAlert) loginAlert.style.display = "none";

        if (loginWrapper) loginWrapper.style.display = "none";
        if (dashboardWrapper) {
          dashboardWrapper.style.display = "flex";
          initDashboard();
        }
      } else {
        if (loginAlert) {
          loginAlert.textContent = "❌ Usuario o contraseña incorrectos. Usa admin y admin.";
          loginAlert.style.display = "block";
        }
        if (passInput) passInput.focus();
      }
    });
  }
}

// ==============================================================================
// 4. MOTOR DE PROCESAMIENTO DE DATOS HISTÓRICOS & FILTRO DE PERIODOS Y DÍAS
// ==============================================================================
function getPeriodDays() {
  if (typeof EXPANDEX_HISTORY_DATA === 'undefined' || !EXPANDEX_HISTORY_DATA.days) {
    return [];
  }
  const allDays = EXPANDEX_HISTORY_DATA.days;
  const total = allDays.length;

  switch (STATE.currentPeriod) {
    case 'custom_day': {
      const found = allDays.find(d => d.date === STATE.selectedDayDate);
      return found ? [found] : [allDays[allDays.length - 1]];
    }
    case '7d':
      return allDays.slice(Math.max(0, total - 7));
    case '30d':
      return allDays.slice(Math.max(0, total - 30));
    case '1m': // Último Mes (30 días)
      return allDays.slice(Math.max(0, total - 30));
    case '2m': // Últimos 2 Meses (60 días)
      return allDays.slice(Math.max(0, total - 60));
    case '3m': // Últimos 3 Meses (90 días)
    case '90d':
      return allDays.slice(Math.max(0, total - 90));
    case '6m': // Últimos 6 Meses (180 días)
      return allDays.slice(Math.max(0, total - 180));
    case '1y': // Último Año (365 días)
      return allDays.slice(Math.max(0, total - 365));
    case 'total': // Historial Total
    default:
      return allDays;
  }
}

function calculatePeriodMetrics() {
  ExpendeXPrices.initBasePrices();
  const rawDays = getPeriodDays();
  const products = EXPANDEX_HISTORY_DATA.products || [];

  let totalRevenue = 0;
  let totalCogs = 0;
  let totalUnits = 0;

  const productTotals = {};
  products.forEach(p => {
    const activePrice = ExpendeXPrices.getPrice(p.id, p.price);
    productTotals[p.id] = {
      ...p,
      price: activePrice,
      unitPrice: activePrice,
      unitCost: p.cost,
      units: 0,
      revenue: 0,
      totalCost: 0,
      profit: 0
    };
  });

  // Recalcular cada día y cada hora en función de los precios fijos actuales
  const days = rawDays.map(d => {
    let dayRev = 0;
    let dayCost = 0;
    let dayUnits = 0;

    if (d.salesByProduct) {
      Object.entries(d.salesByProduct).forEach(([pId, u]) => {
        if (productTotals[pId]) {
          productTotals[pId].units += u;
          const rev = Math.round(u * productTotals[pId].unitPrice * 100) / 100;
          const itemCost = Math.round(u * productTotals[pId].unitCost * 100) / 100;
          productTotals[pId].revenue += rev;
          productTotals[pId].totalCost += itemCost;
          productTotals[pId].profit += (rev - itemCost);

          dayRev += rev;
          dayCost += itemCost;
          dayUnits += u;
        }
      });
    } else {
      dayRev = d.revenue;
      dayCost = d.cost;
      dayUnits = d.units;
    }

    dayRev = Math.round(dayRev * 100) / 100;
    dayCost = Math.round(dayCost * 100) / 100;
    const dayProfit = Math.round((dayRev - dayCost) * 100) / 100;

    totalRevenue += dayRev;
    totalCogs += dayCost;
    totalUnits += dayUnits;

    const revRatio = (d.revenue > 0) ? (dayRev / d.revenue) : 1;
    const scaledHours = {};
    if (d.salesByHour) {
      Object.entries(d.salesByHour).forEach(([h, hData]) => {
        const hRev = Math.round((hData.revenue || 0) * revRatio * 100) / 100;
        const hCost = hData.cost || 0;
        scaledHours[h] = {
          ...hData,
          revenue: hRev,
          profit: Math.round((hRev - hCost) * 100) / 100
        };
      });
    }

    return {
      ...d,
      revenue: dayRev,
      cost: dayCost,
      profit: dayProfit,
      units: dayUnits,
      salesByHour: scaledHours
    };
  });

  totalRevenue = Math.round(totalRevenue * 100) / 100;
  totalCogs = Math.round(totalCogs * 100) / 100;
  const grossProfit = Math.round((totalRevenue - totalCogs) * 100) / 100;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const avgTicket = totalUnits > 0 ? (totalRevenue / (totalUnits / 1.65)).toFixed(2) : "0.00";

  // Ordenar por ingresos o unidades
  const sortedByUnits = Object.values(productTotals).sort((a, b) => (b.revenue - a.revenue) || (b.units - a.units));
  const topProduct = sortedByUnits[0] || null;
  const leastProduct = sortedByUnits[sortedByUnits.length - 1] || null;

  // Desglose de unidades
  let mealsUnits = 0, drinksUnits = 0, combosUnits = 0;
  Object.values(productTotals).forEach(p => {
    if (p.category === 'comida') mealsUnits += p.units;
    else if (p.category === 'bebida') drinksUnits += p.units;
    else if (p.category === 'combos') combosUnits += p.units;
  });

  return {
    days,
    totalRevenue,
    totalCogs,
    grossProfit,
    grossMarginPct,
    totalUnits,
    avgTicket,
    topProduct,
    leastProduct,
    mealsUnits,
    drinksUnits,
    combosUnits,
    productTotals: sortedByUnits
  };
}

// ==============================================================================
// 5. RENDERIZADO DE MÉTRICAS EJECUTIVAS (KPIs)
// ==============================================================================
function renderKPIs(metrics) {
  const elRev = document.getElementById("kpiRevenue");
  const elProfit = document.getElementById("kpiProfit");
  const elMargin = document.getElementById("kpiMarginBadge");
  const elUnits = document.getElementById("kpiUnits");
  const elBreakdown = document.getElementById("kpiUnitsBreakdown");
  const elTicket = document.getElementById("kpiAvgTicket");
  const elTop = document.getElementById("kpiTopProduct");
  const elLeast = document.getElementById("kpiLeastProduct");

  if (elRev) elRev.textContent = `$${metrics.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  if (elProfit) elProfit.textContent = `$${metrics.grossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  if (elMargin) elMargin.textContent = `Margen ${metrics.grossMarginPct}%`;
  if (elUnits) elUnits.textContent = metrics.totalUnits.toLocaleString('es-MX');
  if (elBreakdown) elBreakdown.textContent = `Comidas: ${metrics.mealsUnits.toLocaleString()} • Bebidas: ${metrics.drinksUnits.toLocaleString()} • Combos: ${metrics.combosUnits.toLocaleString()}`;
  if (elTicket) elTicket.textContent = `$${metrics.avgTicket} MXN`;

  if (elTop && metrics.topProduct) {
    elTop.textContent = `🥇 ${metrics.topProduct.name} (${metrics.topProduct.units} uds • $${(metrics.topProduct.revenue).toLocaleString()} MXN)`;
  }
  if (elLeast && metrics.leastProduct) {
    elLeast.textContent = `Menor rotación: ⚠️ ${metrics.leastProduct.name} (${metrics.leastProduct.units} uds)`;
  }

  // Actualizar rango de fechas
  const elRange = document.getElementById("periodDateRange");
  if (elRange && metrics.days.length > 0) {
    if (metrics.days.length === 1) {
      elRange.textContent = `Día específico: ${metrics.days[0].date} (${metrics.days[0].dayName})`;
    } else {
      const firstDate = metrics.days[0].date;
      const lastDate = metrics.days[metrics.days.length - 1].date;
      elRange.textContent = `${firstDate} – ${lastDate} (${metrics.days.length} días de operación continua)`;
    }
  }
}

// ==============================================================================
// 6. MOTOR DE GRÁFICAS EN CANVAS DE ALTO RENDIMIENTO (ZERO DEPENDENCIAS, 100% OFFLINE)
// ==============================================================================

/**
 * Gráfica de Barras Horizontales (Top 8 Más Vendidos y Menos Vendidos)
 */
function drawHorizontalBarChart(canvasId, items, isTop = true) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.offsetParent === null) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement?.offsetWidth || 560;
  const height = 280;
  if (width === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (!items || items.length === 0) return;

  const isCompact = width < 480;
  const topItems = isTop ? items.slice(0, 8) : items.slice(-8).reverse();
  const maxUnits = Math.max(...topItems.map(i => i.units), 1);

  const startY = 16;
  const rowHeight = 31;
  const labelWidth = isCompact ? Math.min(118, Math.floor(width * 0.35)) : 190;
  const barStartX = labelWidth + (isCompact ? 8 : 12);
  const rightTextReserve = isCompact ? 84 : 115;
  const maxBarWidth = Math.max(20, width - barStartX - rightTextReserve);

  topItems.forEach((item, idx) => {
    const y = startY + idx * rowHeight;
    const barWidth = Math.max(6, (item.units / maxUnits) * maxBarWidth);

    ctx.fillStyle = "#0f172a";
    ctx.font = isCompact ? "bold 10px system-ui, sans-serif" : "bold 11px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    let displayName = `${idx + 1}. ${item.name}`;
    const maxChars = isCompact ? 16 : 25;
    if (displayName.length > maxChars) displayName = displayName.slice(0, maxChars - 1) + "…";
    ctx.fillText(displayName, labelWidth, y + 10);

    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(barStartX, y, maxBarWidth, 18, 5);
    ctx.fill();

    const grad = ctx.createLinearGradient(barStartX, 0, barStartX + barWidth, 0);
    if (isTop) {
      grad.addColorStop(0, "#10b981");
      grad.addColorStop(1, "#059669");
    } else {
      grad.addColorStop(0, "#fbbf24");
      grad.addColorStop(1, "#f59e0b");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(barStartX, y, barWidth, 18, 5);
    ctx.fill();

    ctx.fillStyle = isTop ? "#064e3b" : "#92400e";
    ctx.font = isCompact ? "bold 9.5px monospace" : "bold 10.5px monospace";
    ctx.textAlign = "left";
    const unitLabel = isCompact
      ? `${item.units}u ($${Math.round(item.revenue).toLocaleString()})`
      : `${item.units} uds ($${Math.round(item.revenue).toLocaleString()})`;
    ctx.fillText(unitLabel, barStartX + barWidth + 6, y + 10);
  });
}

/**
 * Gráfica de Línea/Área de Tendencia Diaria de Ingresos
 */
function drawDailyRevenueChart(canvasId, days) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.offsetParent === null) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement?.offsetWidth || 1100;
  const height = 260;
  if (width === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (!days || days.length === 0) return;

  const isCompact = width < 480;
  const padLeft = isCompact ? 52 : 70;
  const padRight = isCompact ? 16 : 30;
  const padTop = 20;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const revenues = days.map(d => d.revenue);
  const maxRev = Math.max(...revenues, 500);
  const minRev = 0;

  // Eje horizontal de fondo y líneas guía
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const val = minRev + (maxRev - minRev) * (i / 4);
    const y = padTop + chartH - (i / 4) * chartH;

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = isCompact ? "9px monospace" : "10px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`$${Math.round(val).toLocaleString()}`, padLeft - 6, y);
  }

  if (days.length === 1) {
    // Dibujar barra única si es un solo día
    const barW = Math.min(80, chartW / 2);
    const barX = padLeft + (chartW - barW) / 2;
    const barH = (days[0].revenue / maxRev) * chartH;
    const barY = padTop + chartH - barH;

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();

    ctx.fillStyle = "#064e3b";
    ctx.font = isCompact ? "bold 10.5px monospace" : "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`$${Math.round(days[0].revenue).toLocaleString()} MXN (${days[0].units} uds)`, barX + barW / 2, barY - 10);
    return;
  }

  const points = days.map((d, i) => {
    const x = padLeft + (i / (days.length - 1)) * chartW;
    const y = padTop + chartH - ((d.revenue - minRev) / (maxRev - minRev || 1)) * chartH;
    return { x, y, data: d };
  });

  // Área verde degradada
  const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  areaGrad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
  areaGrad.addColorStop(1, "rgba(16, 185, 129, 0.02)");

  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(points[0].x, padTop + chartH);
  points.forEach((p, idx) => {
    if (idx === 0) ctx.lineTo(p.x, p.y);
    else {
      const prev = points[idx - 1];
      const cx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, padTop + chartH);
  ctx.closePath();
  ctx.fill();

  // Línea esmeralda continua
  ctx.strokeStyle = "#059669";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else {
      const prev = points[idx - 1];
      const cx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
    }
  });
  ctx.stroke();

  // Nodos circulares
  points.forEach(p => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isCompact ? 2.5 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Fechas en el eje horizontal (continuo)
  ctx.fillStyle = "#64748b";
  ctx.font = isCompact ? "9px system-ui, sans-serif" : "10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const maxTicks = isCompact ? 5 : 10;
  const step = Math.max(1, Math.ceil(days.length / maxTicks));
  days.forEach((d, i) => {
    if (i % step === 0 || i === days.length - 1) {
      const x = padLeft + (i / (days.length - 1)) * chartW;
      ctx.fillText(d.date.slice(5), x, padTop + chartH + 8);
    }
  });
}

/**
 * Gráfica de Ventas por Hora (07:00 a 22:00) para el día seleccionado
 */
function drawHourlySalesChart(canvasId, salesByHour) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.offsetParent === null) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement?.offsetWidth || 1100;
  const height = 280;
  if (width === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (!salesByHour) return;

  const isCompact = width < 480;
  const hours = Object.keys(salesByHour); // 07:00 a 22:00 (16 horas)
  const padLeft = isCompact ? 42 : 55;
  const padRight = isCompact ? 12 : 25;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxUnits = Math.max(...hours.map(h => salesByHour[h].units || 0), 5);

  // Líneas horizontales de guía
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxUnits / 4) * i);
    const y = padTop + chartH - (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = isCompact ? "9px monospace" : "10px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${val}u`, padLeft - 6, y);
  }

  // Dibujar barras horarias
  const slotW = chartW / hours.length;
  const barW = Math.max(6, slotW * 0.65);

  hours.forEach((h, idx) => {
    const data = salesByHour[h];
    const u = data.units || 0;
    const barH = (u / maxUnits) * chartH;
    const x = padLeft + idx * slotW + (slotW - barW) / 2;
    const y = padTop + chartH - barH;

    const isPeak = ["12:00", "13:00", "14:00"].includes(h);

    const grad = ctx.createLinearGradient(0, y, 0, padTop + chartH);
    if (isPeak) {
      grad.addColorStop(0, "#f59e0b");
      grad.addColorStop(1, "#d97706");
    } else {
      grad.addColorStop(0, "#0284c7");
      grad.addColorStop(1, "#0369a1");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 4);
    ctx.fill();

    // Etiqueta de unidades encima
    if (u > 0) {
      ctx.fillStyle = isPeak ? "#b45309" : "#0369a1";
      ctx.font = isCompact ? "bold 8.5px monospace" : "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${u}`, x + barW / 2, y - 6);
    }

    // Hora abajo (en móvil mostrar formato corto 07h o alternado para no encimar)
    if (!isCompact || idx % 2 === 0 || isPeak) {
      ctx.fillStyle = isPeak ? "#b45309" : "#64748b";
      ctx.font = isPeak ? (isCompact ? "bold 8.5px system-ui" : "bold 10px system-ui") : (isCompact ? "8.5px system-ui" : "9.5px system-ui");
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(isCompact ? h.slice(0, 2) + "h" : h, x + barW / 2, padTop + chartH + 8);
    }
  });
}

/**
 * Gráfica de Rendimiento Individual de Cada Producto a lo largo del tiempo o por horas
 */
function drawProductHistoryChart(canvasId, prodId, days) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.offsetParent === null) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.parentElement?.offsetWidth || 1100;
  const height = 320;
  if (width === 0) return;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (!days || days.length === 0) return;

  const isCompact = width < 480;
  const padLeft = isCompact ? 46 : 60;
  const padRight = isCompact ? 14 : 30;
  const padTop = 34;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const prodObj = (EXPANDEX_HISTORY_DATA.products || []).find(p => p.id === prodId);
  const activeUnitPrice = prodObj ? ExpendeXPrices.getPrice(prodId, prodObj.price) : 0;

  // Si estamos en un único día (o modo custom_day), mostramos el desglose por horas de este producto
  if (days.length === 1 && days[0].salesByHour) {
    const day = days[0];
    const series = EXPANDEX_HISTORY_DATA.productDailySeries[prodId] || [];
    const prodDayData = series.find(s => s.date === day.date);
    const hourlyData = prodDayData?.hourly || {};
    const hours = EXPANDEX_HISTORY_DATA.operatingHours || Object.keys(hourlyData);

    const maxU = Math.max(...hours.map(h => hourlyData[h] || 0), 3);
    const totalDayUnits = hours.reduce((acc, h) => acc + (hourlyData[h] || 0), 0);
    const totalDayRev = totalDayUnits * activeUnitPrice;

    // Eje de guía
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const val = Math.round((maxU / 3) * i);
      const y = padTop + chartH - (i / 3) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = isCompact ? "9px monospace" : "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${val}u`, padLeft - 6, y);
    }

    const slotW = chartW / hours.length;
    const barW = Math.max(6, slotW * 0.60);

    hours.forEach((h, idx) => {
      const u = hourlyData[h] || 0;
      const barH = (u / maxU) * chartH;
      const x = padLeft + idx * slotW + (slotW - barW) / 2;
      const y = padTop + chartH - barH;

      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();

      if (u > 0) {
        ctx.fillStyle = "#0369a1";
        ctx.font = isCompact ? "bold 8.5px monospace" : "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${u}`, x + barW / 2, y - 5);
      }

      if (!isCompact || idx % 2 === 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = isCompact ? "8.5px system-ui" : "9.5px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(isCompact ? h.slice(0, 2) + "h" : h, x + barW / 2, padTop + chartH + 8);
      }
    });

    ctx.fillStyle = "#0b2545";
    ctx.font = isCompact ? "bold 10px system-ui" : "bold 11px system-ui";
    ctx.textAlign = "left";
    const headerLabel = isCompact
      ? `${day.date} • $${totalDayRev.toLocaleString()} ($${activeUnitPrice}/u)`
      : `Desglose por Horas (${day.date}) • Precio Fijo: $${activeUnitPrice.toFixed(2)} MXN • Ingreso: $${totalDayRev.toLocaleString()} MXN`;
    ctx.fillText(headerLabel, padLeft, padTop - 12);
    return;
  }

  // Vista multi-día: cada día continuo sin brincos
  const productSeries = days.map(d => {
    const units = (d.salesByProduct && d.salesByProduct[prodId]) ? d.salesByProduct[prodId] : 0;
    return {
      date: d.date,
      units: units,
      revenue: units * activeUnitPrice
    };
  });

  const maxUnits = Math.max(...productSeries.map(p => p.units), 4);
  const totalPeriodUnits = productSeries.reduce((acc, p) => acc + p.units, 0);
  const totalPeriodRev = totalPeriodUnits * activeUnitPrice;

  // Subtítulo dinámico con el precio activo
  ctx.fillStyle = "#0b2545";
  ctx.font = isCompact ? "bold 10px system-ui" : "bold 11px system-ui";
  ctx.textAlign = "left";
  const topSummary = isCompact
    ? `Precio: $${activeUnitPrice} • Total: $${totalPeriodRev.toLocaleString()} MXN`
    : `Precio Fijo Activo: $${activeUnitPrice.toFixed(2)} MXN/ud • Ingreso Acumulado Periodo: $${totalPeriodRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`;
  ctx.fillText(topSummary, padLeft, padTop - 14);

  // Ejes y guías
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxUnits / 4) * i);
    const y = padTop + chartH - (i / 4) * chartH;

    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = isCompact ? "9px monospace" : "10px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${val}u`, padLeft - 6, y);
  }

  const points = productSeries.map((p, i) => {
    const x = padLeft + (i / (productSeries.length - 1 || 1)) * chartW;
    const y = padTop + chartH - (p.units / (maxUnits || 1)) * chartH;
    return { x, y, data: p };
  });

  // Área con degradado cobalto
  const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  areaGrad.addColorStop(0, "rgba(2, 132, 199, 0.35)");
  areaGrad.addColorStop(1, "rgba(2, 132, 199, 0.02)");

  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(points[0].x, padTop + chartH);
  points.forEach((p, idx) => {
    if (idx === 0) ctx.lineTo(p.x, p.y);
    else {
      const prev = points[idx - 1];
      const cx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, padTop + chartH);
  ctx.closePath();
  ctx.fill();

  // Línea principal
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else {
      const prev = points[idx - 1];
      const cx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
    }
  });
  ctx.stroke();

  // Nodos circulares
  points.forEach(p => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isCompact ? 2.5 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Fechas en eje horizontal continuo
  ctx.fillStyle = "#64748b";
  ctx.font = isCompact ? "9px system-ui, sans-serif" : "10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const maxTicks = isCompact ? 5 : 10;
  const step = Math.max(1, Math.ceil(days.length / maxTicks));
  days.forEach((d, i) => {
    if (i % step === 0 || i === days.length - 1) {
      const x = padLeft + (i / (days.length - 1 || 1)) * chartW;
      ctx.fillText(d.date.slice(5), x, padTop + chartH + 10);
    }
  });
}

// ==============================================================================
// 7. POBLAR SELECTOR DESPLEGABLE DE PRODUCTOS Y ACTUALIZAR RESUMEN
// ==============================================================================
function populateProductDropdown() {
  const sel = document.getElementById("productSelect");
  if (!sel || typeof EXPANDEX_HISTORY_DATA === 'undefined') return;

  const products = EXPANDEX_HISTORY_DATA.products || [];

  const meals = products.filter(p => p.category === 'comida');
  const drinks = products.filter(p => p.category === 'bebida');
  const combos = products.filter(p => p.category === 'combos');

  sel.innerHTML = `
    <optgroup label="🍱 Platillos de Comida Corrida (12)">
      ${meals.map(m => `<option value="${m.id}">${m.name} (${m.slot})</option>`).join('')}
    </optgroup>
    <optgroup label="🥤 Aguas Frescas & Bebidas Zero (24)">
      ${drinks.map(d => `<option value="${d.id}">${d.name} (${d.slot})</option>`).join('')}
    </optgroup>
    <optgroup label="⭐ Combos Promocionales (10)">
      ${combos.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    </optgroup>
  `;

  sel.value = STATE.selectedProductId;

  if (!sel.dataset.listenerAttached) {
    sel.dataset.listenerAttached = "true";
    sel.addEventListener("change", (e) => {
      STATE.selectedProductId = e.target.value;
      updateProductHistoryView();
    });
  }
}

function updateProductHistoryView() {
  const metrics = calculatePeriodMetrics();
  const prod = (EXPANDEX_HISTORY_DATA.products || []).find(p => p.id === STATE.selectedProductId);
  if (!prod) return;

  const prodTotals = metrics.productTotals.find(p => p.id === STATE.selectedProductId) || {
    units: 0,
    revenue: 0,
    profit: 0
  };

  const daysCount = metrics.days.length || 1;
  const avgDaily = (prodTotals.units / daysCount).toFixed(1);

  // Inventario en vivo de este producto
  const liveInv = ExpendeXInventory.getInventory();
  let currentStock = "N/A";
  if (prod.category !== 'combos' && liveInv[prod.id]) {
    currentStock = `${liveInv[prod.id].stock} de ${liveInv[prod.id].capacity}`;
  } else if (prod.category === 'combos') {
    currentStock = "Combo Activo";
  }

  const elU = document.getElementById("statProdUnits");
  const elR = document.getElementById("statProdRev");
  const elP = document.getElementById("statProdProfit");
  const elA = document.getElementById("statProdAvg");
  const elS = document.getElementById("statProdStock");

  if (elU) elU.textContent = prodTotals.units.toLocaleString();
  if (elR) elR.textContent = `$${prodTotals.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`;
  if (elP) elP.textContent = `$${prodTotals.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`;
  if (elA) elA.textContent = `${avgDaily} uds / día`;
  if (elS) elS.textContent = currentStock;

  drawProductHistoryChart("canvasProductHistory", STATE.selectedProductId, metrics.days);
}

// ==============================================================================
// 8. TABLA DE ESTADO DE CUENTA CONTABLE CON COSTOS DE INSUMOS REALES
// ==============================================================================
function renderStatementTable(metrics) {
  const tbody = document.getElementById("statementTableBody");
  const tfoot = document.getElementById("statementTableFoot");
  if (!tbody || !tfoot) return;

  let items = metrics.productTotals;
  const q = (STATE.statementSearch || '').toLowerCase().trim();

  if (q) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.slot.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  }

  tbody.innerHTML = items.map(p => {
    const marginPct = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : "0.0";
    const catBadge = p.category === 'comida'
      ? `<span class="margin-pill" style="background:#e0f2fe; color:#0369a1;">Comida</span>`
      : (p.category === 'bebida'
        ? `<span class="margin-pill" style="background:#ecfdf5; color:#065f46;">Bebida</span>`
        : `<span class="margin-pill" style="background:#fef3c7; color:#b45309;">Combo</span>`);

    return `
      <tr>
        <td><strong>${p.slot}</strong></td>
        <td>
          <div style="font-weight: 750; color: var(--navy);">${p.name}</div>
        </td>
        <td>${catBadge}</td>
        <td>$${p.unitPrice.toFixed(2)}</td>
        <td>$${p.unitCost.toFixed(2)}</td>
        <td><strong>${p.units.toLocaleString()}</strong></td>
        <td>$${p.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${p.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td class="profit-green">$${p.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td><span class="margin-pill">${marginPct}%</span></td>
      </tr>
    `;
  }).join('');

  tfoot.innerHTML = `
    <tr>
      <td colspan="5"><strong>TOTALES CONSOLIDADOS DEL PERIODO (${items.length} SKUs)</strong></td>
      <td><strong>${metrics.totalUnits.toLocaleString()} uds</strong></td>
      <td><strong>$${metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN</strong></td>
      <td><strong>$${metrics.totalCogs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN</strong></td>
      <td class="profit-green"><strong>$${metrics.grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN</strong></td>
      <td><span class="margin-pill">${metrics.grossMarginPct}%</span></td>
    </tr>
  `;
}

// ==============================================================================
// 9. TABLA DE CONTROL DE INVENTARIO FÍSICO (36 RANURAS) CON ALERTAS DE 2 A 4
// ==============================================================================
function updateInventoryCapacitySummary(products, inv) {
  let totalCap = 0, currentTotal = 0;
  let mealsCap = 0, currentMeals = 0;
  let drinksCap = 0, currentDrinks = 0;

  products.forEach(p => {
    const stock = inv[p.id] ? inv[p.id].stock : 0;
    const cap = p.capacity || (p.category === 'comida' ? 8 : 10);
    totalCap += cap;
    currentTotal += stock;

    if (p.category === 'comida') {
      mealsCap += cap;
      currentMeals += stock;
    } else {
      drinksCap += cap;
      currentDrinks += stock;
    }
  });

  const elTotVal = document.getElementById("capTotalVal");
  const elTotBar = document.getElementById("capTotalBar");
  const elMealsVal = document.getElementById("capMealsVal");
  const elMealsBar = document.getElementById("capMealsBar");
  const elDrinksVal = document.getElementById("capDrinksVal");
  const elDrinksBar = document.getElementById("capDrinksBar");

  if (elTotVal) elTotVal.textContent = `${currentTotal} / ${totalCap} productos (${Math.round((currentTotal / (totalCap || 1)) * 100)}%)`;
  if (elTotBar) elTotBar.style.width = `${(currentTotal / (totalCap || 1)) * 100}%`;

  if (elMealsVal) elMealsVal.textContent = `${currentMeals} / ${mealsCap} toppers (${Math.round((currentMeals / (mealsCap || 1)) * 100)}%)`;
  if (elMealsBar) elMealsBar.style.width = `${(currentMeals / (mealsCap || 1)) * 100}%`;

  if (elDrinksVal) elDrinksVal.textContent = `${currentDrinks} / ${drinksCap} botellas (${Math.round((currentDrinks / (drinksCap || 1)) * 100)}%)`;
  if (elDrinksBar) elDrinksBar.style.width = `${(currentDrinks / (drinksCap || 1)) * 100}%`;
}

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const inv = ExpendeXInventory.getInventory();
  // ÚNICAMENTE productos físicos con canales y resortes en la máquina (12 comidas + 24 bebidas = 36 slots)
  const products = (EXPANDEX_HISTORY_DATA.products || []).filter(p => p.category !== 'combos');

  // Evaluar alertas de 2 a 4 unidades
  const alertItems = products.filter(p => {
    const s = inv[p.id] ? inv[p.id].stock : 0;
    return (s >= 2 && s <= 4);
  });

  const banner = document.getElementById("inventoryStockAlertBanner");
  const bannerList = document.getElementById("alertBannerItemsList");
  if (banner && bannerList) {
    if (alertItems.length > 0) {
      banner.style.display = "flex";
      bannerList.innerHTML = alertItems.map(p => {
        const s = inv[p.id] ? inv[p.id].stock : 0;
        const c = p.capacity || (p.category === 'comida' ? 8 : 10);
        return `<strong>${p.name}</strong> (${s} de ${c} en ${p.slot})`;
      }).join(' • ');
    } else {
      banner.style.display = "none";
    }
  }

  let items = products;
  if (STATE.inventoryFilter === 'comida') items = items.filter(p => p.category === 'comida');
  else if (STATE.inventoryFilter === 'bebida') items = items.filter(p => p.category === 'bebida');
  else if (STATE.inventoryFilter === 'alert') {
    items = items.filter(p => {
      const s = inv[p.id] ? inv[p.id].stock : 0;
      return (s >= 2 && s <= 4);
    });
  } else if (STATE.inventoryFilter === 'low') {
    items = items.filter(p => (inv[p.id] ? inv[p.id].stock : 0) <= 1);
  }

  updateInventoryCapacitySummary(products, inv);

  tbody.innerHTML = items.map(p => {
    const curStock = inv[p.id] ? inv[p.id].stock : 0;
    const maxCap = p.capacity || (p.category === 'comida' ? 8 : 10);
    const pct = Math.round((curStock / maxCap) * 100);
    const activePrice = ExpendeXPrices.getPrice(p.id, p.price);

    let stockTagClass = "stock-optimal";
    let statusText = "🟢 Óptimo";
    let barColorClass = "level-high";
    let rowClass = "";

    if (curStock === 0) {
      stockTagClass = "stock-depleted";
      statusText = "🔴 Agotado (0)";
      barColorClass = "level-low";
      rowClass = "row-stock-critical";
    } else if (curStock === 1) {
      stockTagClass = "stock-depleted";
      statusText = "🔴 Crítico (1)";
      barColorClass = "level-low";
      rowClass = "row-stock-critical";
    } else if (curStock >= 2 && curStock <= 4) {
      stockTagClass = "stock-warning";
      statusText = `⚠️ Alerta Reabastecer (${curStock})`;
      barColorClass = "level-med";
      rowClass = "row-stock-alert";
    }

    return `
      <tr id="stock-row-${p.id}" data-id="${p.id}" class="${rowClass}">
        <td><span class="table-slot-badge">${p.slot}</span></td>
        <td>
          <img src="${p.image}" width="44" height="44" class="table-prod-thumb" alt="${p.name}" onerror="this.onerror=null; this.src='../p%C3%A1gina%20web/${p.image}';">
        </td>
        <td>
          <div style="font-weight: 800; color: var(--navy);">${p.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">$${activePrice.toFixed(2)} MXN • Insumo: $${p.cost.toFixed(2)}</div>
        </td>
        <td>
          <span style="font-size: 0.75rem; font-weight: 750; text-transform: uppercase;">
            ${p.category === 'comida' ? '🍱 Comida Corrida' : '🥤 Bebida Fría'}
          </span>
        </td>
        <td><strong>${maxCap} uds</strong></td>
        <td>
          <span id="stock-tag-${p.id}" class="stock-tag-lg ${stockTagClass}">
            ${curStock} de ${maxCap}
          </span>
        </td>
        <td>
          <div class="inv-level-container">
            <div class="inv-level-bar-outer">
              <div id="stock-bar-${p.id}" class="inv-level-bar-inner ${barColorClass}" style="width: ${pct}%;"></div>
            </div>
            <span id="stock-pct-${p.id}" class="inv-level-pct">${pct}%</span>
          </div>
        </td>
        <td>
          <span id="stock-status-${p.id}" style="font-size: 0.75rem; font-weight: 750;">${statusText}</span>
        </td>
        <td>
          <div class="inv-actions-cell">
            <button type="button" class="btn-inv-action" onclick="handleStockDelta('${p.id}', -1)" title="Restar 1 unidad">–</button>
            <input type="number" id="stock-input-${p.id}" class="inv-num-input" value="${curStock}" min="0" max="${maxCap}" onchange="handleStockDirect('${p.id}', this.value)">
            <button type="button" class="btn-inv-action" onclick="handleStockDelta('${p.id}', 1)" title="Sumar 1 unidad">+</button>
            <button type="button" class="btn-fill-top" onclick="handleStockFill('${p.id}')" title="Llenar a ${maxCap}">Llenar (${maxCap})</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateRowStockDOM(id) {
  const inv = ExpendeXInventory.getInventory();
  const products = (EXPANDEX_HISTORY_DATA.products || []).filter(p => p.category !== 'combos');
  const p = products.find(item => item.id === id);
  if (!p) return;

  const curStock = inv[id] ? inv[id].stock : 0;
  const maxCap = p.capacity || (p.category === 'comida' ? 8 : 10);
  const pct = Math.round((curStock / maxCap) * 100);

  let stockTagClass = "stock-optimal";
  let statusText = "🟢 Óptimo";
  let barColorClass = "level-high";
  let rowClass = "";

  if (curStock === 0) {
    stockTagClass = "stock-depleted";
    statusText = "🔴 Agotado (0)";
    barColorClass = "level-low";
    rowClass = "row-stock-critical";
  } else if (curStock === 1) {
    stockTagClass = "stock-depleted";
    statusText = "🔴 Crítico (1)";
    barColorClass = "level-low";
    rowClass = "row-stock-critical";
  } else if (curStock >= 2 && curStock <= 4) {
    stockTagClass = "stock-warning";
    statusText = `⚠️ Alerta Reabastecer (${curStock})`;
    barColorClass = "level-med";
    rowClass = "row-stock-alert";
  }

  const row = document.getElementById(`stock-row-${id}`);
  if (row) row.className = rowClass;

  const tag = document.getElementById(`stock-tag-${id}`);
  if (tag) {
    tag.className = `stock-tag-lg ${stockTagClass}`;
    tag.textContent = `${curStock} de ${maxCap}`;
  }

  const bar = document.getElementById(`stock-bar-${id}`);
  if (bar) {
    bar.className = `inv-level-bar-inner ${barColorClass}`;
    bar.style.width = `${pct}%`;
  }

  const pctElem = document.getElementById(`stock-pct-${id}`);
  if (pctElem) pctElem.textContent = `${pct}%`;

  const statusElem = document.getElementById(`stock-status-${id}`);
  if (statusElem) statusElem.textContent = statusText;

  const input = document.getElementById(`stock-input-${id}`);
  if (input) input.value = curStock;

  updateInventoryCapacitySummary(products, inv);

  // Actualizar banner de alerta sin destruir la tabla
  const alertItems = products.filter(prod => {
    const s = inv[prod.id] ? inv[prod.id].stock : 0;
    return (s >= 2 && s <= 4);
  });
  const banner = document.getElementById("inventoryStockAlertBanner");
  const bannerList = document.getElementById("alertBannerItemsList");
  if (banner && bannerList) {
    if (alertItems.length > 0) {
      banner.style.display = "flex";
      bannerList.innerHTML = alertItems.map(item => {
        const s = inv[item.id] ? inv[item.id].stock : 0;
        const c = item.capacity || (item.category === 'comida' ? 8 : 10);
        return `<strong>${item.name}</strong> (${s} de ${c} en ${item.slot})`;
      }).join(' • ');
    } else {
      banner.style.display = "none";
    }
  }
}

window.handleStockDelta = function(id, delta) {
  ExpendeXInventory.adjustStock(id, delta);
  updateRowStockDOM(id);
};

window.handleStockDirect = function(id, val) {
  ExpendeXInventory.updateItemStock(id, val);
  updateRowStockDOM(id);
};

window.handleStockFill = function(id) {
  ExpendeXInventory.fillSlot(id);
  updateRowStockDOM(id);
};

// ==============================================================================
// 10. EDITOR DE PRECIOS FIJOS Y RECALCULACIÓN DINÁMICA DE TODAS LAS GRÁFICAS
// ==============================================================================
function updatePriceAveragesSummary() {
  const products = (EXPANDEX_HISTORY_DATA.products || []);
  const meals = products.filter(p => p.category === 'comida');
  const drinks = products.filter(p => p.category === 'bebida');
  const combos = products.filter(p => p.category === 'combos');

  const avg = (arr) => {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, p) => acc + ExpendeXPrices.getPrice(p.id, p.price), 0);
    return sum / arr.length;
  };

  const elMeals = document.getElementById("avgPriceMeals");
  const elDrinks = document.getElementById("avgPriceDrinks");
  const elCombos = document.getElementById("avgPriceCombos");

  if (elMeals) elMeals.textContent = `$${avg(meals).toFixed(2)} MXN`;
  if (elDrinks) elDrinks.textContent = `$${avg(drinks).toFixed(2)} MXN`;
  if (elCombos) elCombos.textContent = `$${avg(combos).toFixed(2)} MXN`;
}

function renderPricesTable() {
  const tbody = document.getElementById("pricesTableBody");
  if (!tbody || typeof EXPANDEX_HISTORY_DATA === 'undefined') return;

  updatePriceAveragesSummary();

  const allProducts = EXPANDEX_HISTORY_DATA.products || [];
  let items = allProducts;

  if (STATE.priceFilter === 'comida') items = allProducts.filter(p => p.category === 'comida');
  else if (STATE.priceFilter === 'bebida') items = allProducts.filter(p => p.category === 'bebida');
  else if (STATE.priceFilter === 'combos') items = allProducts.filter(p => p.category === 'combos');

  tbody.innerHTML = items.map(p => {
    const basePrice = (p.basePrice !== undefined) ? p.basePrice : p.price;
    const activePrice = ExpendeXPrices.getPrice(p.id, basePrice);
    const unitCost = p.cost;
    const unitProfit = activePrice - unitCost;
    const marginPct = activePrice > 0 ? ((unitProfit / activePrice) * 100).toFixed(1) : "0.0";
    const isModified = Math.abs(activePrice - basePrice) > 0.001;

    const catBadge = p.category === 'comida'
      ? `<span class="margin-pill" style="background:#e0f2fe; color:#0369a1;">🍱 Comida</span>`
      : (p.category === 'bebida'
        ? `<span class="margin-pill" style="background:#ecfdf5; color:#065f46;">🥤 Bebida</span>`
        : `<span class="margin-pill" style="background:#fef3c7; color:#b45309;">⭐ Combo</span>`);

    return `
      <tr id="price-row-${p.id}" class="${isModified ? 'row-price-modified' : ''}">
        <td><span class="table-slot-badge">${p.slot}</span></td>
        <td>
          <img src="${p.image}" width="44" height="44" class="table-prod-thumb" alt="${p.name}" onerror="this.onerror=null; this.src='../p%C3%A1gina%20web/${p.image}';">
        </td>
        <td>
          <div style="font-weight: 800; color: var(--navy);">${p.name}</div>
          <div id="price-mod-badge-${p.id}" style="font-size: 0.72rem; color: ${isModified ? '#0284c7' : 'var(--text-muted)'}; font-weight: ${isModified ? '700' : '500'};">
            ${isModified ? `✏️ Editado (Original: $${basePrice.toFixed(2)})` : `Precio fijo estándar`}
          </div>
        </td>
        <td>${catBadge}</td>
        <td><strong>$${unitCost.toFixed(2)} MXN</strong></td>
        <td style="color: var(--text-muted);">$${basePrice.toFixed(2)} MXN</td>
        <td>
          <div class="price-editor-controls">
            <button type="button" class="btn-price-step" onclick="handlePriceDelta('${p.id}', -5)" title="Restar $5 MXN">-5</button>
            <button type="button" class="btn-price-step" onclick="handlePriceDelta('${p.id}', -1)" title="Restar $1 MXN">-1</button>
            <div class="price-input-wrap">
              <span class="price-currency-symbol">$</span>
              <input type="number" id="price-input-${p.id}" class="price-num-input" value="${activePrice}" min="1" max="999" step="1" onchange="handlePriceDirect('${p.id}', this.value)">
            </div>
            <button type="button" class="btn-price-step" onclick="handlePriceDelta('${p.id}', 1)" title="Sumar $1 MXN">+1</button>
            <button type="button" class="btn-price-step" onclick="handlePriceDelta('${p.id}', 5)" title="Sumar $5 MXN">+5</button>
          </div>
        </td>
        <td>
          <strong id="price-profit-${p.id}" class="${unitProfit >= 0 ? 'profit-green' : ''}" style="${unitProfit < 0 ? 'color:#dc2626;' : ''}">
            $${unitProfit.toFixed(2)} MXN
          </strong>
        </td>
        <td>
          <span id="price-margin-${p.id}" class="margin-pill">${marginPct}%</span>
        </td>
        <td>
          <button type="button" class="btn-fill-top" onclick="handlePriceResetSingle('${p.id}')" title="Restaurar precio base ($${basePrice})">
            ↺ Base ($${basePrice})
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateRowPriceDOM(id) {
  const allProducts = EXPANDEX_HISTORY_DATA.products || [];
  const p = allProducts.find(item => item.id === id);
  if (!p) return;

  const basePrice = (p.basePrice !== undefined) ? p.basePrice : p.price;
  const activePrice = ExpendeXPrices.getPrice(p.id, basePrice);
  const unitCost = p.cost;
  const unitProfit = activePrice - unitCost;
  const marginPct = activePrice > 0 ? ((unitProfit / activePrice) * 100).toFixed(1) : "0.0";
  const isModified = Math.abs(activePrice - basePrice) > 0.001;

  const row = document.getElementById(`price-row-${id}`);
  if (row) row.className = isModified ? 'row-price-modified' : '';

  const input = document.getElementById(`price-input-${id}`);
  if (input) input.value = activePrice;

  const modBadge = document.getElementById(`price-mod-badge-${id}`);
  if (modBadge) {
    modBadge.style.color = isModified ? '#0284c7' : 'var(--text-muted)';
    modBadge.style.fontWeight = isModified ? '700' : '500';
    modBadge.textContent = isModified ? `✏️ Editado (Original: $${basePrice.toFixed(2)})` : `Precio fijo estándar`;
  }

  const profitEl = document.getElementById(`price-profit-${id}`);
  if (profitEl) {
    profitEl.className = unitProfit >= 0 ? 'profit-green' : '';
    profitEl.style.color = unitProfit < 0 ? '#dc2626' : '';
    profitEl.textContent = `$${unitProfit.toFixed(2)} MXN`;
  }

  const marginEl = document.getElementById(`price-margin-${id}`);
  if (marginEl) {
    marginEl.textContent = `${marginPct}%`;
  }

  updatePriceAveragesSummary();
}

function recalculateAllFromPrices(changedId = null) {
  if (changedId) {
    updateRowPriceDOM(changedId);
  } else {
    renderPricesTable();
  }
  const metrics = calculatePeriodMetrics();
  renderKPIs(metrics);
  refreshCharts(metrics);
  renderStatementTable(metrics);
  renderInventoryTable();
  if (typeof window.refreshCalendarFromPrices === 'function') {
    window.refreshCalendarFromPrices();
  }
}

window.handlePriceDelta = function(id, delta) {
  const allProducts = EXPANDEX_HISTORY_DATA.products || [];
  const p = allProducts.find(item => item.id === id);
  if (!p) return;
  const basePrice = (p.basePrice !== undefined) ? p.basePrice : p.price;
  const current = ExpendeXPrices.getPrice(id, basePrice);
  const nextPrice = Math.max(1, Math.round((current + delta) * 100) / 100);
  ExpendeXPrices.setPrice(id, nextPrice);
  recalculateAllFromPrices(id);
};

window.handlePriceDirect = function(id, val) {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) {
    updateRowPriceDOM(id);
    return;
  }
  ExpendeXPrices.setPrice(id, Math.max(1, Math.round(num * 100) / 100));
  recalculateAllFromPrices(id);
};

window.handlePriceResetSingle = function(id) {
  const allProducts = EXPANDEX_HISTORY_DATA.products || [];
  const p = allProducts.find(item => item.id === id);
  if (!p) return;
  const basePrice = (p.basePrice !== undefined) ? p.basePrice : p.price;
  ExpendeXPrices.setPrice(id, basePrice);
  recalculateAllFromPrices(id);
};

// ==============================================================================
// 11. INICIALIZACIÓN COMPLETA DEL DASHBOARD Y LISTENERS
// ==============================================================================
function initDashboard() {
  populateProductDropdown();
  refreshDashboardView();
  if (typeof initInteractiveAdminMascot === 'function') {
    initInteractiveAdminMascot();
  }
  if (STATE.dashboardInitialized) return;
  STATE.dashboardInitialized = true;

  const dayPickerContainer = document.getElementById("dayPickerContainer");
  const inputDayPicker = document.getElementById("inputDayPicker");
  const dayNameTag = document.getElementById("dayNameTag");
  const hourlyChartCard = document.getElementById("hourlyChartCard");

  // Control de Apertura Directa de la App de Venta (Relativo para funcionar en Escritorio y VS Code)
  const btnOpenSales = document.getElementById("btnOpenSalesApp");
  if (btnOpenSales) {
    const targetSalesUrl = "../p%C3%A1gina%20web/index.html";
    btnOpenSales.setAttribute("href", targetSalesUrl);
    btnOpenSales.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = targetSalesUrl;
    });
  }

  // Variables de Estado del Calendario Interactivo
  let calCurrentYear = 2026;
  let calCurrentMonth = 9; // Octubre (0-indexed)

  function renderCustomCalendar() {
    const grid = document.getElementById("calendarDaysGrid");
    const monthTitle = document.getElementById("calendarMonthTitle");
    if (!grid || !monthTitle) return;

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    monthTitle.textContent = `${monthNames[calCurrentMonth]} ${calCurrentYear}`;

    const allDays = (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.days) ? EXPANDEX_HISTORY_DATA.days : [];
    const products = (typeof EXPANDEX_HISTORY_DATA !== 'undefined' && EXPANDEX_HISTORY_DATA.products) ? EXPANDEX_HISTORY_DATA.products : [];
    const prodMap = {};
    products.forEach(p => { prodMap[p.id] = p; });

    const daysMap = {};
    allDays.forEach(d => {
      let dynamicDayRev = 0;
      if (d.salesByProduct) {
        Object.keys(d.salesByProduct).forEach(pid => {
          const u = d.salesByProduct[pid] || 0;
          const pObj = prodMap[pid];
          if (pObj && u > 0) {
            dynamicDayRev += u * ExpendeXPrices.getPrice(pid, pObj.price);
          }
        });
      } else {
        dynamicDayRev = d.revenue;
      }
      daysMap[d.date] = { ...d, revenue: dynamicDayRev };
    });

    // Determinar primer día del mes (0=Dom, 1=Lun...)
    const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const startOffset = (firstDay + 6) % 7; // Convertir a 0=Lun, 6=Dom
    const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < startOffset; i++) {
      html += '<div class="cal-day-cell empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(calCurrentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${calCurrentYear}-${mm}-${dd}`;
      const dayData = daysMap[dateStr];

      const isActive = (dateStr === STATE.selectedDayDate);
      const isToday = (dateStr === '2026-10-15');
      let cellClasses = ['cal-day-cell'];
      if (isActive) cellClasses.push('active');
      if (isToday) cellClasses.push('today-cell');

      let subText = '';
      if (dayData) {
        subText = `<span class="cal-day-sub">$${Math.round(dayData.revenue).toLocaleString()}</span>`;
      } else {
        cellClasses.push('out-of-range');
      }

      html += `
        <div class="${cellClasses.join(' ')}" onclick="selectCalendarDate('${dateStr}')" title="${dateStr}: ${dayData ? dayData.units + ' ventas ($' + Math.round(dayData.revenue) + ')' : 'Sin ventas registradas'}">
          <span>${day}</span>
          ${subText}
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  window.refreshCalendarFromPrices = renderCustomCalendar;

  window.selectCalendarDate = function(dateStr) {
    const allDays = EXPANDEX_HISTORY_DATA.days || [];
    const found = allDays.find(d => d.date === dateStr);
    if (!found) return;

    STATE.selectedDayDate = dateStr;
    const dObj = new Date(dateStr + "T12:00:00");
    calCurrentYear = dObj.getFullYear();
    calCurrentMonth = dObj.getMonth();

    if (inputDayPicker) inputDayPicker.value = dateStr;
    updateDayNameTag();
    renderCustomCalendar();
    refreshDashboardView();
  };

  // Botones de navegación del calendario mensual
  const btnCalPrevMonth = document.getElementById("btnCalPrevMonth");
  const btnCalNextMonth = document.getElementById("btnCalNextMonth");
  const btnCalToday = document.getElementById("btnCalToday");

  if (btnCalPrevMonth) {
    btnCalPrevMonth.addEventListener("click", () => {
      calCurrentMonth--;
      if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
      }
      renderCustomCalendar();
    });
  }

  if (btnCalNextMonth) {
    btnCalNextMonth.addEventListener("click", () => {
      calCurrentMonth++;
      if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
      }
      renderCustomCalendar();
    });
  }

  if (btnCalToday) {
    btnCalToday.addEventListener("click", () => {
      window.selectCalendarDate('2026-10-15');
    });
  }

  // Selector de Periodos
  document.querySelectorAll(".btn-period").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-period").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const period = btn.dataset.period;
      STATE.currentPeriod = period;

      if (period === 'custom_day') {
        if (dayPickerContainer) dayPickerContainer.style.display = "flex";
        if (hourlyChartCard) hourlyChartCard.style.display = "block";
        renderCustomCalendar();
      } else {
        if (dayPickerContainer) dayPickerContainer.style.display = "none";
        if (hourlyChartCard) hourlyChartCard.style.display = "none";
      }

      btn.blur();
      refreshDashboardView();
    });
  });

  // Selector de Fecha Específica
  if (inputDayPicker) {
    inputDayPicker.addEventListener("change", (e) => {
      window.selectCalendarDate(e.target.value);
    });
  }

  // Navegación día anterior / siguiente
  const btnPrevDay = document.getElementById("btnPrevDay");
  const btnNextDay = document.getElementById("btnNextDay");

  const changeDayBy = (offset) => {
    const allDays = EXPANDEX_HISTORY_DATA.days || [];
    const idx = allDays.findIndex(d => d.date === STATE.selectedDayDate);
    if (idx !== -1) {
      const newIdx = Math.max(0, Math.min(allDays.length - 1, idx + offset));
      window.selectCalendarDate(allDays[newIdx].date);
    }
  };

  if (btnPrevDay) btnPrevDay.addEventListener("click", () => changeDayBy(-1));
  if (btnNextDay) btnNextDay.addEventListener("click", () => changeDayBy(1));

  function updateDayNameTag() {
    if (!dayNameTag) return;
    const allDays = EXPANDEX_HISTORY_DATA.days || [];
    const d = allDays.find(item => item.date === STATE.selectedDayDate);
    if (d) {
      const dateObj = new Date(d.date + "T12:00:00");
      const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dayNameTag.textContent = dateObj.toLocaleDateString('es-MX', opts);
    }
  }
  updateDayNameTag();
  renderCustomCalendar();

  // Toggles de modo horario vs diario
  const btnToggleHourly = document.getElementById("btnToggleHourlyView");
  const btnToggleDaily = document.getElementById("btnToggleDailyView");

  if (btnToggleHourly && btnToggleDaily) {
    btnToggleHourly.addEventListener("click", () => {
      btnToggleHourly.classList.add("active");
      btnToggleDaily.classList.remove("active");
      STATE.dayViewMode = 'hourly';
      if (hourlyChartCard) hourlyChartCard.style.display = "block";
      refreshDashboardView();
    });

    btnToggleDaily.addEventListener("click", () => {
      btnToggleDaily.classList.add("active");
      btnToggleHourly.classList.remove("active");
      STATE.dayViewMode = 'daily';
      if (hourlyChartCard) hourlyChartCard.style.display = "none";
      refreshDashboardView();
    });
  }

  // Pestañas del Dashboard
  document.querySelectorAll(".dash-tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dash-tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".dashboard-section").forEach(s => s.classList.remove("active"));

      tab.classList.add("active");
      tab.blur();
      const targetId = tab.dataset.target;
      const targetSec = document.getElementById(targetId);
      if (targetSec) targetSec.classList.add("active");

      // Redibujar gráficas o tablas al cambiar pestaña
      if (targetId === "analyticsSection") {
        setTimeout(refreshCharts, 40);
      } else if (targetId === "inventorySection") {
        renderInventoryTable();
      } else if (targetId === "pricesSection") {
        renderPricesTable();
      } else if (targetId === "brandingEsp32Section") {
        renderEsp32MpLogs();
      }
    });
  });

  // Filtros de tabla de inventario
  document.querySelectorAll(".inv-filter-btn:not(.price-filter-btn)").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".inv-filter-btn:not(.price-filter-btn)").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      btn.blur();
      STATE.inventoryFilter = btn.dataset.filter;
      renderInventoryTable();
    });
  });

  // Filtros de tabla de precios
  document.querySelectorAll(".price-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".price-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      btn.blur();
      STATE.priceFilter = btn.dataset.pfilter;
      renderPricesTable();
    });
  });

  // Botón Restaurar Precios Base Originales
  const btnResetPrices = document.getElementById("btnResetDefaultPrices");
  if (btnResetPrices) {
    btnResetPrices.addEventListener("click", () => {
      ExpendeXPrices.resetDefaultPrices();
      recalculateAllFromPrices();
    });
  }

  // Botón Rellenar Toda la Máquina a Tope
  const btnRestockAll = document.getElementById("btnRestockAllMachine");
  const btnTopRestockAll = document.getElementById("btnTopRestockAll");

  const doRestockAll = () => {
    ExpendeXInventory.restockAll();
    renderInventoryTable();
    updateProductHistoryView();
    alert("⚡ ¡Máquina completamente reabastecida! Todas las comidas a 8 y todas las bebidas a 10.");
  };

  if (btnRestockAll) btnRestockAll.addEventListener("click", doRestockAll);
  if (btnTopRestockAll) btnTopRestockAll.addEventListener("click", doRestockAll);

  // Buscador de la tabla contable
  const searchTableInput = document.getElementById("filterStatementTable");
  if (searchTableInput) {
    searchTableInput.addEventListener("input", (e) => {
      STATE.statementSearch = e.target.value;
      const metrics = calculatePeriodMetrics();
      renderStatementTable(metrics);
    });
  }

  // Botón Imprimir / PDF
  const btnPrint = document.getElementById("btnPrintStatement");
  if (btnPrint) {
    btnPrint.addEventListener("click", () => window.print());
  }

  // Configuración de Link Mercado Pago y Simulación Remota ESP32
  const adminMpInput = document.getElementById("adminMpLinkInput");
  const btnAdminSaveMp = document.getElementById("btnAdminSaveMpLink");
  const adminMpSavedMsg = document.getElementById("adminMpSavedMsg");
  const btnTriggerRemoteMp = document.getElementById("btnTriggerRemoteMpPayment");

  if (adminMpInput) {
    adminMpInput.value = localStorage.getItem('EXPANDEX_MP_CUSTOM_LINK') || 'https://mpago.la/expandex-fime';
  }

  if (btnAdminSaveMp && adminMpInput) {
    btnAdminSaveMp.addEventListener("click", () => {
      const val = (adminMpInput.value || '').trim() || 'https://mpago.la/expandex-fime';
      try {
        localStorage.setItem('EXPANDEX_MP_CUSTOM_LINK', val);
        if (ExpendeXInventory.channel) {
          ExpendeXInventory.channel.postMessage({ type: 'MP_LINK_UPDATED', link: val });
        }
      } catch (e) {}
      if (adminMpSavedMsg) {
        adminMpSavedMsg.style.display = "block";
        setTimeout(() => { adminMpSavedMsg.style.display = "none"; }, 3000);
      }
    });
  }

  if (btnTriggerRemoteMp) {
    btnTriggerRemoteMp.addEventListener("click", () => {
      const products = EXPANDEX_HISTORY_DATA.products || [];
      const sample = products[0] || { id: 'COMBO_01', name: 'Combo 1: Poder Proteico FIME', slot: 'Canal A1-A2 + Canal A3', price: 135 };
      const activePrice = ExpendeXPrices.getPrice(sample.id, sample.price);
      const mpId = Math.floor(1000000000 + Math.random() * 9000000000);

      const ev = {
        paymentId: mpId,
        sku: sample.id,
        productName: sample.name,
        slot: sample.slot,
        amount: activePrice,
        method: "Webhook Mercado Pago (Admin Test)",
        esp32Pin: "GPIO 26 (HIGH)",
        status: "Activación exitosa",
        time: new Date().toLocaleTimeString('es-MX', { hour12: false }),
        date: new Date().toISOString().slice(0, 10)
      };

      try {
        let logs = [];
        const raw = localStorage.getItem('EXPANDEX_ESP32_MP_LOGS');
        if (raw) logs = JSON.parse(raw);
        logs.unshift(ev);
        localStorage.setItem('EXPANDEX_ESP32_MP_LOGS', JSON.stringify(logs.slice(0, 60)));
      } catch (e) {}

      if (ExpendeXInventory.channel) {
        ExpendeXInventory.channel.postMessage({
          type: 'REMOTE_MP_PAYMENT_TRIGGER',
          sku: sample.id,
          event: ev
        });
      }

      const serialEl = document.getElementById("adminEsp32SerialLine");
      const pinEl = document.getElementById("adminEsp32PinState");
      if (serialEl) {
        serialEl.textContent = `> [ESP32-S3] Pago MP #${mpId} Autorizado ($${activePrice}.00 MXN) -> Activación exitosa en App de Venta`;
      }
      if (pinEl) {
        pinEl.textContent = "GPIO 26: ACTIVO (360°)";
        setTimeout(() => { pinEl.textContent = "GPIO 26: LISTO"; }, 2800);
      }

      renderEsp32MpLogs();
    });
  }

  // Sincronización en vivo con la app de venta
  if (typeof BroadcastChannel !== 'undefined') {
    const syncChannel = new BroadcastChannel('expandex_sync');
    syncChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'INVENTORY_UPDATED') {
        renderInventoryTable();
        updateProductHistoryView();
      } else if (e.data && e.data.type === 'PRICES_UPDATED') {
        recalculateAllFromPrices();
      } else if (e.data && e.data.type === 'MP_ESP32_EVENT') {
        const ev = e.data.event;
        const serialEl = document.getElementById("adminEsp32SerialLine");
        const pinEl = document.getElementById("adminEsp32PinState");
        const headerChip = document.getElementById("adminEsp32StatusChip");
        if (serialEl && ev) {
          serialEl.textContent = `> [ESP32-S3] Webhook MP #${ev.paymentId} • Cobrado $${ev.amount}.00 MXN (${ev.slot}) -> ${ev.status}`;
        }
        if (pinEl) {
          pinEl.textContent = "GPIO 26: ACTIVO";
          setTimeout(() => { pinEl.textContent = "GPIO 26: LISTO"; }, 2800);
        }
        if (headerChip && ev) {
          headerChip.textContent = `ESP32 Cobró $${ev.amount} MXN (${ev.slot})`;
        }
        renderEsp32MpLogs();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === ExpendeXInventory.KEY) {
      renderInventoryTable();
      updateProductHistoryView();
    } else if (e.key === ExpendeXPrices.KEY) {
      recalculateAllFromPrices();
    } else if (e.key === 'EXPANDEX_ESP32_MP_LOGS') {
      renderEsp32MpLogs();
    }
  });

  // Redibujar gráficos si cambia el tamaño de la ventana (solo si cambia el ancho real para evitar saltos en scroll móvil)
  let resizeTimeout;
  let lastWindowWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (Math.abs(window.innerWidth - lastWindowWidth) < 4) return;
    lastWindowWidth = window.innerWidth;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      refreshCharts();
    }, 120);
  });

  // Control de Carrusel Deslizable Horizontal de Gráficas
  const chartsTrack = document.getElementById("chartsScrollTrack");
  const btnScrollLeft = document.getElementById("btnScrollChartsLeft");
  const btnScrollRight = document.getElementById("btnScrollChartsRight");
  const carouselDots = document.querySelectorAll("#chartsCarouselDots .dot");

  if (chartsTrack) {
    if (btnScrollLeft) {
      btnScrollLeft.addEventListener("click", () => {
        const slideWidth = chartsTrack.querySelector(".chart-slide-item")?.offsetWidth || 560;
        chartsTrack.scrollBy({ left: -(slideWidth + 24), behavior: "smooth" });
      });
    }
    if (btnScrollRight) {
      btnScrollRight.addEventListener("click", () => {
        const slideWidth = chartsTrack.querySelector(".chart-slide-item")?.offsetWidth || 560;
        chartsTrack.scrollBy({ left: slideWidth + 24, behavior: "smooth" });
      });
    }

    // Sincronizar indicador de puntos según scroll horizontal
    chartsTrack.addEventListener("scroll", () => {
      const scrollPos = chartsTrack.scrollLeft;
      const slideWidth = chartsTrack.querySelector(".chart-slide-item")?.offsetWidth || 560;
      const activeIdx = Math.min(carouselDots.length - 1, Math.max(0, Math.round(scrollPos / (slideWidth + 24))));
      carouselDots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIdx);
      });
    }, { passive: true });

    carouselDots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        const slideWidth = chartsTrack.querySelector(".chart-slide-item")?.offsetWidth || 560;
        chartsTrack.scrollTo({ left: idx * (slideWidth + 24), behavior: "smooth" });
      });
    });
  }

  // Soporte de navegación directa por parámetro URL (?tab=prices o ?tab=inventory&filter=comida)
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam === "prices") {
    document.getElementById("btnTabPrices")?.click();
  } else if (tabParam === "branding") {
    document.getElementById("btnTabBrandingEsp32")?.click();
  } else if (tabParam === "inventory") {
    const filterParam = params.get("filter");
    if (filterParam) {
      STATE.inventoryFilter = filterParam;
      document.querySelectorAll(".inv-filter-btn:not(.price-filter-btn)").forEach(b => {
        b.classList.toggle("active", b.dataset.filter === filterParam);
      });
    }
    document.getElementById("btnTabInventory")?.click();
  }
}

function renderEsp32MpLogs() {
  const tbody = document.getElementById("esp32LogsTableBody");
  if (!tbody) return;

  let logs = [];
  try {
    const raw = localStorage.getItem('EXPANDEX_ESP32_MP_LOGS');
    if (raw) logs = JSON.parse(raw);
  } catch (e) {}

  if (!logs || logs.length === 0) {
    logs = [
      {
        time: "14:22:10",
        paymentId: "8492019482",
        productName: "Combo 1: Poder Proteico FIME",
        slot: "Canal A1-A2 + Canal A3",
        amount: 135,
        method: "Mercado Pago QR",
        esp32Pin: "GPIO 26 (HIGH)",
        status: "Activación exitosa"
      },
      {
        time: "13:48:05",
        paymentId: "8492015109",
        productName: "Pechuga al Limón con Arroz y Espárragos",
        slot: "A1-A2",
        amount: 125,
        method: "Escaneo QR Mercado Libre",
        esp32Pin: "GPIO 26 (HIGH)",
        status: "Activación exitosa"
      }
    ];
  }

  tbody.innerHTML = logs.map(ev => `
    <tr>
      <td><code>${ev.time || '—'}</code></td>
      <td><strong>#${ev.paymentId}</strong></td>
      <td><div style="font-weight: 750; color: var(--navy);">${ev.productName}</div></td>
      <td><span class="table-slot-badge">${ev.slot}</span></td>
      <td class="profit-green"><strong>$${Number(ev.amount).toFixed(2)} MXN</strong></td>
      <td>${ev.method}</td>
      <td><code>${ev.esp32Pin}</code></td>
      <td><span class="margin-pill" style="background:#dcfce7; color:#166534;">✅ ${ev.status}</span></td>
    </tr>
  `).join('');
}

function refreshDashboardView() {
  const metrics = calculatePeriodMetrics();
  renderKPIs(metrics);
  refreshCharts(metrics);
  renderStatementTable(metrics);
  renderInventoryTable();
  renderPricesTable();
  renderEsp32MpLogs();
}

function refreshCharts(metrics = calculatePeriodMetrics()) {
  drawHorizontalBarChart("canvasTopProducts", metrics.productTotals, true);
  drawHorizontalBarChart("canvasLeastProducts", metrics.productTotals, false);
  drawDailyRevenueChart("canvasDailyRevenue", metrics.days);

  // Si estamos en modo de día específico, graficar horas
  if (STATE.currentPeriod === 'custom_day' && metrics.days.length === 1) {
    drawHourlySalesChart("canvasHourlySales", metrics.days[0].salesByHour);
  }

  updateProductHistoryView();
}

// Iniciar al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});

// ==============================================================================
// 12. SISTEMA DE AUDIO SINTETIZADO WEB AUDIO PARA EL ADMIN
// ==============================================================================
const adminSound = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  beep(freq, type = 'sine', duration = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  successChime() {
    this.beep(523, 'sine', 0.1);
    setTimeout(() => this.beep(659, 'sine', 0.1), 100);
    setTimeout(() => this.beep(784, 'triangle', 0.15), 200);
  }
};

// ==============================================================================
// 13. MASCOTA INTERACTIVA VIRTUAL ESTILO DISNEY / VIDEO-GAME AGILITY (GUION KENNEDY)
// Estrictamente confinada a la barra superior azul - 22+ animaciones ágiles y partículas
// ==============================================================================
function initInteractiveAdminMascot() {
  // Mascota interactiva retirada a solicitud del usuario
  return;

  let posX = 24;
  let posY = 8; // Confinada estrictamente a la base de la barra azul
  let direction = 1;
  let baseSpeed = 2.2;
  let currentSpeed = 2.2;
  let state = "walking";
  let isSleeping = false;
  let isDancing = false;
  let isInteracting = false;
  let loopTimer = 0;
  let nextInterventionTime = 160 + Math.random() * 120; // Ritmo ágil y dinámico (cada 2.5 - 4s)

  // Emisor de partículas visuales de videojuego
  function spawnParticle(emoji, customX, customY) {
    if (!particleBox) return;
    const p = document.createElement("span");
    p.className = "fx-particle";
    p.textContent = emoji;
    const px = (typeof customX === "number") ? customX : (posX + 18);
    const py = (typeof customY === "number") ? customY : (posY + 12);
    p.style.left = Math.round(px) + "px";
    p.style.bottom = Math.round(py) + "px";
    particleBox.appendChild(p);
    setTimeout(() => { if (p && p.parentNode) p.parentNode.removeChild(p); }, 750);
  }

  // Burbuja Mímica Compacta y No Invasiva (0.65rem)
  function showBubble(text, duration = 2200) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0) scale(1)";
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => {
      bubble.style.opacity = "0";
      bubble.style.transform = "translateY(4px) scale(0.92)";
    }, duration);
  }

  function set3DPosture(posture) {
    if (!box) return;
    box.classList.remove("turn-3d-r", "turn-3d-l", "turn-front", "turn-crouch", "turn-push");
    if (posture) box.classList.add(posture);
  }

  const ALL_MASCOT_STATES = [
    "state-walking", "state-sidewalk", "state-frontwalk", "state-crouching",
    "state-stretching", "state-pushing", "state-dancing", "state-sleeping",
    "state-idle", "state-sprint", "state-backflip", "state-frontflip",
    "state-slide", "state-doublebounce", "state-superhero", "state-breakdance",
    "state-skate", "state-electric", "state-juggling", "state-rocket",
    "state-dj", "state-mime-wall", "state-confetti", "state-peekaboo",
    "state-magnifier", "state-helicopter", "state-thumbsup", "state-whistle", "state-pout"
  ];

  function setMascotState(newState) {
    state = newState;
    ALL_MASCOT_STATES.forEach(st => actor.classList.remove(st));
    actor.classList.add(`state-${newState}`);

    const armsPushing = document.getElementById("adminMascotArmsPushing");
    const armsStretched = document.getElementById("adminMascotArmsStretched");
    const armNormalL = document.getElementById("adminMascotArmNormalL");
    const armNormalR = document.getElementById("adminMascotArmNormalR");

    const isPush = (newState === "pushing" || newState === "mime-wall");
    const isStretch = (newState === "stretching");
    if (armsPushing) armsPushing.style.display = isPush ? "block" : "none";
    if (armsStretched) armsStretched.style.display = isStretch ? "block" : "none";
    if (armNormalL) armNormalL.style.display = (isPush || isStretch) ? "none" : "block";
    if (armNormalR) armNormalR.style.display = (isPush || isStretch) ? "none" : "block";
  }

  // Bucle de física ágil de 60fps confinado estrictamente en la barra azul
  function loopMovement() {
    const maxX = (header ? header.clientWidth : window.innerWidth) - 76;
    const minX = 14;

    if (!isSleeping && !isDancing && !isInteracting) {
      if (state === "walking" || state === "sprint" || state === "skate" || state === "whistle") {
        posX += direction * currentSpeed;

        if (state === "sprint" && Math.random() < 0.28) {
          spawnParticle("💨", posX + (direction === 1 ? -4 : 40), posY);
        } else if (state === "skate" && Math.random() < 0.2) {
          spawnParticle("💨", posX + 20, posY);
        }

        if (posX >= maxX) {
          posX = maxX;
          direction = -1;
          set3DPosture("turn-3d-l");
          setTimeout(() => set3DPosture("turn-front"), 220);
        } else if (posX <= minX) {
          posX = minX;
          direction = 1;
          set3DPosture("turn-3d-r");
          setTimeout(() => set3DPosture("turn-front"), 220);
        }

        actor.style.left = Math.round(posX) + "px";
        actor.style.bottom = posY + "px";
        box.style.transform = `scaleX(${direction})`;

        loopTimer++;
        if (loopTimer > nextInterventionTime) {
          loopTimer = 0;
          nextInterventionTime = 150 + Math.random() * 150;
          pickAutonomousAdminAction();
        }
      }
    }

    requestAnimationFrame(loopMovement);
  }

  // ==============================================================================
  // CATÁLOGO DE 22+ ACCIONES ÁGILES ESTILO VIDEOJUEGO
  // ==============================================================================
  function pickAutonomousAdminAction() {
    if (isSleeping || isDancing || isInteracting) return;

    // 22 animaciones ágiles distribuidas dinámicamente
    const actions = [
      actionSprintDash,       // 1. Sprint veloz con estela
      actionBackflip,         // 2. Backflip acrobático 3D
      actionFrontflip,        // 3. Frontflip hacia adelante
      actionNinjaSlide,       // 4. Slide ninja por el suelo
      actionDoubleBounce,     // 5. Doble rebote elástico
      actionSuperheroLanding, // 6. Aterrizaje de superhéroe con impacto
      actionBreakdance,       // 7. Molino breakdance
      actionSkateGlide,       // 8. Deslizamiento en patineta
      actionElectricSurge,    // 9. Sobrecarga eléctrica 100%
      actionPushRestock,      // 10. Empujar botón Rellenar con esfuerzo
      actionJuggle,           // 11. Malabares con monedas/letras
      actionRocketJetpack,    // 12. Propulsión jetpack
      actionDjScratch,        // 13. DJ scratching con tonos
      actionMimeWall,         // 14. Mimo tocando pared invisible
      actionConfettiPop,      // 15. Explosión de confeti festivo
      actionPeekaboo,         // 16. Juego peekaboo
      actionMagnifierInspect, // 17. Lupa inspeccionando barra
      actionHelicopterHover,  // 18. Helicóptero con antena
      actionThumbsUp,         // 19. Pulgar arriba y guiño
      actionWhistleStrut,     // 20. Caminata con silbido musical
      actionPoutStomp,        // 21. Berrinche tierno de niño
      actionStealHeaderChar,  // 22. Robar y voltear letra en el header
      actionScrambleHeader    // 23. Revolver letras del título
    ];

    const chosen = actions[Math.floor(Math.random() * actions.length)];
    chosen();
  }

  // 1. SPRINT DASH CON ESTELA DE VIENTO
  function actionSprintDash() {
    isInteracting = true;
    currentSpeed = 5.2;
    setMascotState("sprint");
    showBubble("💨 ¡Zoom!", 1800);
    adminSound.beep(580, 'sine', 0.08);

    const sprintFrames = 40;
    let count = 0;
    const sprintInt = setInterval(() => {
      count++;
      spawnParticle("💨", posX + (direction === 1 ? -6 : 38), posY);
      if (count >= sprintFrames) {
        clearInterval(sprintInt);
        currentSpeed = baseSpeed;
        setMascotState("walking");
        isInteracting = false;
      }
    }, 40);
  }

  // 2. BACKFLIP ACROBÁTICO 3D
  function actionBackflip() {
    isInteracting = true;
    setMascotState("backflip");
    showBubble("🤸‍♂️ ¡Flip!", 1900);
    adminSound.beep(720, 'triangle', 0.12);
    spawnParticle("✨", posX + 20, posY + 25);

    setTimeout(() => {
      spawnParticle("✨", posX + 20, posY + 5);
      setMascotState("walking");
      isInteracting = false;
    }, 850);
  }

  // 3. FRONTFLIP DIVE
  function actionFrontflip() {
    isInteracting = true;
    setMascotState("frontflip");
    showBubble("🤸‍♂️ ¡Roll!", 1800);
    adminSound.beep(660, 'triangle', 0.1);
    spawnParticle("✨", posX + 20, posY + 20);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 800);
  }

  // 4. NINJA SLIDE
  function actionNinjaSlide() {
    isInteracting = true;
    setMascotState("slide");
    showBubble("⚡ ¡Slide!", 1800);
    adminSound.beep(480, 'sine', 0.1);
    spawnParticle("💨", posX + 10, posY);

    const slideTarget = Math.max(16, Math.min((header ? header.clientWidth - 80 : 600), posX + direction * 70));
    actor.style.transition = "left 0.55s cubic-bezier(0.1, 0.9, 0.2, 1)";
    actor.style.left = slideTarget + "px";
    posX = slideTarget;

    setTimeout(() => {
      actor.style.transition = "none";
      setMascotState("walking");
      isInteracting = false;
    }, 600);
  }

  // 5. DOBLE REBOTE ELÁSTICO
  function actionDoubleBounce() {
    isInteracting = true;
    setMascotState("doublebounce");
    showBubble("🎈 ¡Boing!", 1800);
    adminSound.beep(520, 'sine', 0.08);
    setTimeout(() => adminSound.beep(680, 'sine', 0.1), 320);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 800);
  }

  // 6. ATERRIZAJE DE SUPERHÉROE
  function actionSuperheroLanding() {
    isInteracting = true;
    setMascotState("superhero");
    showBubble("💥 ¡Hero!", 2000);
    adminSound.beep(300, 'sawtooth', 0.16);
    spawnParticle("💥", posX + 20, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 7. BREAKDANCE MOLINO
  function actionBreakdance() {
    isInteracting = true;
    setMascotState("breakdance");
    showBubble("🕺 ¡Break!", 2200);
    adminSound.beep(440, 'triangle', 0.09);
    setTimeout(() => adminSound.beep(550, 'triangle', 0.09), 150);
    spawnParticle("✨", posX + 20, posY + 10);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 8. DESLIZAMIENTO EN PATINETA
  function actionSkateGlide() {
    isInteracting = true;
    currentSpeed = 3.8;
    setMascotState("skate");
    showBubble("🛹 ¡Skate!", 2000);
    adminSound.beep(620, 'sine', 0.08);

    setTimeout(() => {
      currentSpeed = baseSpeed;
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 9. SOBRECARGA ELÉCTRICA
  function actionElectricSurge() {
    isInteracting = true;
    setMascotState("electric");
    showBubble("⚡ ¡100%!", 2000);
    adminSound.beep(880, 'sawtooth', 0.08);
    setTimeout(() => adminSound.beep(1100, 'sawtooth', 0.1), 120);
    spawnParticle("⚡", posX + 10, posY + 15);
    spawnParticle("⚡", posX + 30, posY + 15);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 10. EMPUJAR BOTÓN RELLENAR CON ESFUERZO (CONFINADA EN BARRA AZUL)
  function actionPushRestock() {
    const btnRestock = document.getElementById("btnTopRestockAll");
    if (!btnRestock || !header) { actionSprintDash(); return; }

    isInteracting = true;
    const btnRect = btnRestock.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const targetLeft = Math.max(14, Math.min(header.clientWidth - 76, btnRect.left - headerRect.left - 46));

    actor.style.transition = "left 0.55s ease, bottom 0.4s ease";
    actor.style.left = targetLeft + "px";
    posX = targetLeft;
    showBubble("🏋️‍♂️ ¡Puff!", 1800);

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      setMascotState("pushing");
      set3DPosture("turn-push");
      if (sweatDrop) sweatDrop.style.display = "block";
      btnRestock.classList.add("btn-being-pushed");
      adminSound.beep(260, 'triangle', 0.15);

      setTimeout(() => {
        btnRestock.classList.remove("btn-being-pushed");
        if (sweatDrop) sweatDrop.style.display = "none";
        set3DPosture("turn-front");
        setMascotState("idle");
        showBubble("😅 ¡Pesa!", 1600);
        adminSound.beep(659, 'sine', 0.1);

        setTimeout(() => {
          actor.style.transition = "none";
          setMascotState("walking");
          isInteracting = false;
        }, 1000);
      }, 1600);
    }, 600);
  }

  // 11. MALABARES
  function actionJuggle() {
    isInteracting = true;
    setMascotState("juggling");
    showBubble("🤹‍♂️ ¡Coins!", 2000);
    adminSound.beep(740, 'sine', 0.08);
    spawnParticle("🪙", posX + 10, posY + 28);
    setTimeout(() => spawnParticle("🪙", posX + 30, posY + 32), 200);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 12. PROPULSIÓN JETPACK
  function actionRocketJetpack() {
    isInteracting = true;
    setMascotState("rocket");
    showBubble("🚀 ¡Boost!", 2000);
    adminSound.beep(400, 'sawtooth', 0.2);
    spawnParticle("🔥", posX + 12, posY);
    spawnParticle("🔥", posX + 28, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 13. DJ SCRATCH
  function actionDjScratch() {
    isInteracting = true;
    setMascotState("dj");
    showBubble("🎧 ¡Scratch!", 2000);
    adminSound.beep(380, 'square', 0.06);
    setTimeout(() => adminSound.beep(520, 'square', 0.06), 90);
    setTimeout(() => adminSound.beep(420, 'square', 0.08), 180);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 14. MIMO EN PARED INVISIBLE
  function actionMimeWall() {
    isInteracting = true;
    setMascotState("mime-wall");
    showBubble("🪟 ¡Pared!", 2000);
    adminSound.beep(500, 'sine', 0.07);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1400);
  }

  // 15. EXPLOSIÓN DE CONFETI
  function actionConfettiPop() {
    isInteracting = true;
    setMascotState("confetti");
    showBubble("🎉 ¡Fiesta!", 2200);
    adminSound.beep(880, 'sine', 0.1);
    spawnParticle("🎉", posX + 20, posY + 24);
    spawnParticle("✨", posX + 10, posY + 20);
    spawnParticle("🌟", posX + 30, posY + 20);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 16. PEEKABOO
  function actionPeekaboo() {
    isInteracting = true;
    setMascotState("peekaboo");
    showBubble("🙈 ¡Peek!", 1800);
    adminSound.beep(620, 'sine', 0.08);

    setTimeout(() => {
      showBubble("👀 ¡Te vi!", 1600);
      spawnParticle("✨", posX + 20, posY + 16);
      setTimeout(() => {
        setMascotState("walking");
        isInteracting = false;
      }, 700);
    }, 900);
  }

  // 17. INSPECCIÓN CON LUPA
  function actionMagnifierInspect() {
    isInteracting = true;
    setMascotState("magnifier");
    showBubble("🔍 ¡Scan!", 2000);
    adminSound.beep(450, 'sine', 0.08);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 18. HELICÓPTERO CON ANTENA
  function actionHelicopterHover() {
    isInteracting = true;
    setMascotState("helicopter");
    showBubble("🚁 ¡Heli!", 2000);
    adminSound.beep(600, 'triangle', 0.15);
    spawnParticle("💨", posX + 20, posY);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1300);
  }

  // 19. PULGAR ARRIBA Y GUIÑO
  function actionThumbsUp() {
    isInteracting = true;
    setMascotState("thumbsup");
    showBubble("👍 ¡Top!", 1800);
    adminSound.beep(780, 'sine', 0.09);
    spawnParticle("⭐", posX + 32, posY + 18);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1200);
  }

  // 20. CAMINATA CON SILBIDO MUSICAL
  function actionWhistleStrut() {
    isInteracting = true;
    setMascotState("whistle");
    showBubble("🎶 ¡Fiu!", 2200);
    adminSound.beep(650, 'sine', 0.07);
    setTimeout(() => adminSound.beep(780, 'sine', 0.08), 140);
    setTimeout(() => adminSound.beep(920, 'sine', 0.12), 280);
    spawnParticle("🎵", posX + 20, posY + 22);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1500);
  }

  // 21. BERRINCHE TIERNO DE NIÑO
  function actionPoutStomp() {
    isInteracting = true;
    setMascotState("pout");
    showBubble("😤 ¡Hmph!", 1800);
    adminSound.beep(280, 'sawtooth', 0.12);

    setTimeout(() => {
      setMascotState("walking");
      isInteracting = false;
    }, 1100);
  }

  // 22. ROBAR Y VOLTEAR LETRA EN LA BARRA AZUL (CONFINADA EN EL HEADER)
  function actionStealHeaderChar() {
    const chipText = document.getElementById("adminEsp32StatusChip") || document.getElementById("dashTempBadge");
    if (!chipText || !header) { actionSprintDash(); return; }

    isInteracting = true;
    const chipRect = chipText.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const targetLeft = Math.max(14, Math.min(header.clientWidth - 76, chipRect.left - headerRect.left - 28));

    if (!chipText.querySelector(".n-target-char")) {
      chipText.innerHTML = chipText.innerHTML.replace(/([A-Z])/i, '<span class="n-target-char" id="activeAdminChar">$1</span>');
    }

    setMascotState("sidewalk");
    actor.style.transition = "left 0.55s ease";
    actor.style.left = targetLeft + "px";
    posX = targetLeft;
    showBubble("🤫 ¡Psst!", 1600);

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      const targetChar = document.getElementById("activeAdminChar");
      if (targetChar) targetChar.classList.add("n-letter-missing");

      if (heldLetter) {
        heldLetter.textContent = targetChar ? targetChar.textContent : "E";
        heldLetter.style.display = "flex";
        void heldLetter.offsetWidth;
        heldLetter.classList.add("flipped");
      }

      set3DPosture("turn-3d-r");
      showBubble("🙃 ¡Giro!", 1800);
      adminSound.beep(880, 'sine', 0.1);

      setTimeout(() => {
        showBubble("🪄 ¡Listo!", 1600);
        if (heldLetter) {
          heldLetter.classList.remove("flipped");
          heldLetter.style.display = "none";
        }
        if (targetChar) {
          targetChar.classList.remove("n-letter-missing");
          targetChar.classList.add("n-letter-sparkle");
        }
        adminSound.successChime();

        setTimeout(() => {
          if (targetChar) targetChar.classList.remove("n-letter-sparkle");
          set3DPosture("turn-front");
          actor.style.transition = "none";
          isInteracting = false;
          setMascotState("walking");
        }, 800);
      }, 1600);
    }, 600);
  }

  // 23. REVOLVER LETRAS DEL TÍTULO EN LA BARRA AZUL (CONFINADA EN EL HEADER)
  function actionScrambleHeader() {
    const titleElem = document.querySelector(".admin-title");
    if (!titleElem || !header) { actionSprintDash(); return; }

    isInteracting = true;
    const titleRect = titleElem.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const targetLeft = Math.max(14, Math.min(header.clientWidth - 76, titleRect.left - headerRect.left + 15));

    showBubble("🔤 ¡Letras!", 1800);
    set3DPosture("turn-3d-r");
    actor.style.transition = "left 0.6s ease";
    actor.style.left = targetLeft + "px";
    posX = targetLeft;

    setTimeout(() => {
      if (isSleeping || isDancing) { isInteracting = false; return; }
      setMascotState("stretching");
      showBubble("🎨 ¡Mix!", 1800);
      adminSound.beep(520, 'sine', 0.08);

      const originalClean = titleElem.dataset.originalClean || titleElem.innerHTML;
      titleElem.dataset.originalClean = originalClean;

      const textNodes = titleElem.childNodes;
      if (textNodes.length > 0 && textNodes[0].nodeType === Node.TEXT_NODE) {
        const rawText = textNodes[0].textContent;
        const scrambled = rawText.split("").map(c => {
          if (c === " ") return " ";
          const rot = Math.round((Math.random() - 0.5) * 35);
          return `<span class="scrambled-char" style="--r:${rot}; transform:rotate(${rot}deg);">${c}</span>`;
        }).join("");
        textNodes[0].textContent = "";
        const spanWrap = document.createElement("span");
        spanWrap.id = "tempScrambledTitle";
        spanWrap.innerHTML = scrambled;
        titleElem.insertBefore(spanWrap, titleElem.firstChild);
      }

      setTimeout(() => {
        showBubble("🪄 ¡Magia!", 1600);
        titleElem.innerHTML = originalClean;
        adminSound.successChime();
        setMascotState("idle");
        set3DPosture("turn-front");

        setTimeout(() => {
          actor.style.transition = "none";
          isInteracting = false;
          setMascotState("walking");
        }, 800);
      }, 1800);
    }, 650);
  }

  // Clic en la mascota: Salto con giro 3D de 360° y animación
  actor.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isSleeping) {
      toggleSleep(false);
      return;
    }

    adminSound.beep(650, 'sine', 0.08);
    setTimeout(() => adminSound.beep(880, 'triangle', 0.09), 70);
    setTimeout(() => adminSound.beep(1175, 'sine', 0.12), 140);

    actor.classList.remove("spin-jump");
    void actor.offsetWidth;
    actor.classList.add("spin-jump");
    spawnParticle("🌟", posX + 20, posY + 20);

    const funPhrases = [
      "🤖 ¡ExpendeX!",
      "⚡ ¡100%!",
      "🚀 ¡Activo!",
      "✨ ¡Top!",
      "📊 ¡Online!"
    ];
    showBubble(funPhrases[Math.floor(Math.random() * funPhrases.length)], 1800);

    setTimeout(() => {
      actor.classList.remove("spin-jump");
    }, 700);
  });

  // Botón Bailar
  function triggerDance() {
    if (isSleeping) toggleSleep(false);
    isDancing = true;
    setMascotState("dancing");
    showBubble("🕺 ¡Ritmo!", 2400);

    adminSound.beep(523, 'sine', 0.09);
    setTimeout(() => adminSound.beep(659, 'sine', 0.09), 110);
    setTimeout(() => adminSound.beep(784, 'sine', 0.09), 220);
    setTimeout(() => adminSound.beep(1046, 'triangle', 0.16), 330);
    spawnParticle("🎵", posX + 20, posY + 20);

    setTimeout(() => {
      isDancing = false;
      setMascotState("walking");
    }, 3200);
  }

  if (btnDance) {
    btnDance.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerDance();
    });
  }

  // Botón Dormir / Despertar
  function toggleSleep(forceVal) {
    isSleeping = (typeof forceVal === "boolean") ? forceVal : !isSleeping;
    if (isSleeping) {
      setMascotState("sleeping");
      showBubble("💤 ¡Zzz!", 2400);
      if (btnSleep) btnSleep.textContent = "⏰";
    } else {
      setMascotState("walking");
      showBubble("☀️ ¡Listo!", 1800);
      if (btnSleep) btnSleep.textContent = "💤";
    }
  }

  if (btnSleep) {
    btnSleep.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSleep();
    });
  }

  // Inicio de caminata ágil dentro de la barra
  setMascotState("walking");
  showBubble("🤖 ¡ExpendeX!", 2000);
  loopMovement();
}


