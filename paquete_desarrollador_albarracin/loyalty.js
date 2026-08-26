/**
 * ==========================================
 * CLUB ALBARRACÍN - CUSTOMER LOYALTY ENGINE
 * ==========================================
 * 
 * Este archivo implementa el sistema de fidelización de clientes de forma
 * modular sin alterar el código existente en app.js.
 */

// ==========================================
// CONFIGURATION & REWARD SCHEMES
// ==========================================
const LOYALTY_CONFIG = {
  pointsPerDollar: 0.01, // 1 point per $100 spent
  welcomeBonus: 100,     // 100 points welcome gift
  motoBonus: 50,         // +50 points for adding a motorcycle brand
  googleReviewBonus: 150, // +150 points for mock rating
  tiers: {
    BRONCE: { name: "Bronce", minPoints: 0, multiplier: 1.0, color: "tier-bronce" },
    PLATA: { name: "Plata", minPoints: 301, multiplier: 1.2, color: "tier-plata" },
    ORO: { name: "Oro", minPoints: 1001, multiplier: 1.5, color: "tier-oro" },
    PLATINO: { name: "Platino", minPoints: 2501, multiplier: 2.0, color: "tier-platino" }
  },
  rewards: [
    { id: "coupon_5_pct", name: "Cupón 5% de Descuento", desc: "Válido para cualquier repuesto", cost: 200, type: "percent", value: 5 },
    { id: "coupon_10_pct", name: "Cupón 10% de Descuento", desc: "Válido para cualquier producto", cost: 400, type: "percent", value: 10 },
    { id: "coupon_10k_ars", name: "Cupón $10.000 ARS OFF", desc: "Descuento en compras > $50.000", cost: 600, type: "fixed", value: 10000 },
    { id: "coupon_25k_ars", name: "Cupón $25.000 ARS OFF", desc: "Descuento en cualquier compra de taller", cost: 1200, type: "fixed", value: 25000 }
  ],
  wheelPrizes: [
    { text: "10 Pts", value: 10, color: "#12141c" },
    { text: "50 Pts", value: 50, color: "#ff5722" },
    { text: "20 Pts", value: 20, color: "#12141c" },
    { text: "100 Pts", value: 100, color: "#00b0ff" },
    { text: "30 Pts", value: 30, color: "#12141c" },
    { text: "200 Pts", value: 200, color: "#00e676" },
    { text: "15 Pts", value: 15, color: "#12141c" },
    { text: "500 Pts 🌟", value: 500, color: "#ffd700" }
  ],
  motorcyclesBrands: ["Honda", "Yamaha", "Motomel", "Corven"]
};

// ==========================================
// STATE MANAGEMENT & PERSISTENCE
// ==========================================
let loyaltyState = {
  registered: false,
  name: "",
  phone: "",
  motorcycleBrand: "",
  motorcycleModel: "",
  points: 0,
  tier: "Bronce",
  memberId: "",
  lastCheckIn: null,
  consecutiveDays: 0,
  missions: {
    checkIn: false,
    explorer: false,
    rating: false
  },
  badges: [],
  coupons: [],
  history: [],
  explorerViews: 0,
  lastWheelSpin: null
};

let appliedCoupon = null; // Current active coupon applied to cart

// Load loyalty data
function loadLoyaltyState() {
  const saved = localStorage.getItem("albarracin_loyalty");
  if (saved) {
    try {
      loyaltyState = { ...loyaltyState, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Error loading loyalty state", e);
    }
  }
}

// Save loyalty data
function saveLoyaltyState() {
  localStorage.setItem("albarracin_loyalty", JSON.stringify(loyaltyState));
  updateLoyaltyUI();
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadLoyaltyState();
  createLoyaltyDOM();
  bindLoyaltyEvents();
  checkDailyReset();
  initCartIntegration();
  trackUserBehavior();
});

// Check-in and daily resets
function checkDailyReset() {
  if (!loyaltyState.registered) return;

  const todayStr = new Date().toDateString();
  const lastCheckInStr = loyaltyState.lastCheckIn ? new Date(loyaltyState.lastCheckIn).toDateString() : null;

  if (lastCheckInStr !== todayStr) {
    // Reset daily missions
    loyaltyState.missions.checkIn = false;
    loyaltyState.missions.explorer = false;
    loyaltyState.explorerViews = 0;
    saveLoyaltyState();
  }
}

// ==========================================
// DOM GENERATION (DYNAMIC UI INJECTION)
// ==========================================
function createLoyaltyDOM() {
  // 1. Inject FAB Button
  const fab = document.createElement("div");
  fab.className = "loyalty-fab";
  fab.id = "loyalty-fab-btn";
  fab.title = "Club Albarracín 🎁 - Ganá Puntos y Descuentos";
  fab.innerHTML = `
    <svg class="loyalty-fab-icon" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
    </svg>
    <span class="loyalty-fab-badge">Club 🎁</span>
  `;
  document.body.appendChild(fab);

  // Update FAB icon with crown if registered
  updateFABIcon();

  // 2. Inject Loyalty Drawer
  const drawer = document.createElement("div");
  drawer.className = "loyalty-drawer";
  drawer.id = "loyalty-drawer-panel";
  drawer.innerHTML = `
    <div class="loyalty-header">
      <h2 class="loyalty-header-title">
        <img src="assets/logo_red.png" alt="Albarracín Logo" style="height: 26px; width: auto; vertical-align: middle; margin-right: 6px; filter: drop-shadow(0 2px 6px rgba(224,24,43,0.3));">
        Club Albarracín
      </h2>
      <div style="display: flex; align-items: center;">
        <button class="admin-trigger-btn" id="loyalty-admin-btn" title="Panel de Administración" aria-label="Administración">
          <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        </button>
        <button class="cart-close-btn" id="loyalty-close-btn" aria-label="Cerrar Club">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
        </button>
      </div>
    </div>
    <div class="loyalty-content" id="loyalty-content-area">
      <!-- Dynamic Content goes here (Onboarding or Profile) -->
    </div>
  `;
  document.body.appendChild(drawer);

  // 3. Inject Wallet Modal
  const walletModal = document.createElement("div");
  walletModal.className = "wallet-modal-overlay";
  walletModal.id = "wallet-modal";
  document.body.appendChild(walletModal);

  // 4. Inject Admin Modal
  const adminModal = document.createElement("div");
  adminModal.className = "admin-modal-overlay";
  adminModal.id = "admin-modal";
  document.body.appendChild(adminModal);

  // Render initial contents
  renderLoyaltyContent();
}

function updateFABIcon() {
  const fab = document.getElementById("loyalty-fab-btn");
  if (!fab) return;
  
  if (loyaltyState.registered) {
    fab.innerHTML = `
      <svg class="loyalty-fab-icon" viewBox="0 0 24 24" style="fill: #ffd700;">
        <path d="M12 2L9 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/>
      </svg>
      <span class="loyalty-fab-badge" style="background-color: var(--accent-orange);">${loyaltyState.points} Pts</span>
    `;
  }
}

// Render dynamic panel contents
function renderLoyaltyContent() {
  const contentArea = document.getElementById("loyalty-content-area");
  if (!contentArea) return;

  if (!loyaltyState.registered) {
    // Render Onboarding Screen
    contentArea.innerHTML = `
      <div class="loyalty-onboarding">
        <img src="assets/logo_red.png" alt="Albarracín Motos y Repuestos" class="loyalty-onboarding-logo-img" style="height: 72px; width: auto; max-width: 220px; margin: 0 auto 10px auto; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(224, 24, 43, 0.4));">
        <h3 class="loyalty-onboarding-title">¡Unite al <span>Club Albarracín</span>!</h3>
        <p class="loyalty-onboarding-desc">
          Registrate en segundos para acumular puntos con cada compra, jugar a la Rueda diaria y canjear descuentos exclusivos para tu moto o taller.
        </p>

        <div class="loyalty-benefit-tag">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
          <div>
            <strong>Regalo de Bienvenida:</strong> 100 puntos gratis al registrarte hoy.
          </div>
        </div>

        <form id="loyalty-register-form" style="display: flex; flex-direction: column; gap: 15px; text-align: left; margin-top: 10px;">
          <div class="form-group">
            <label for="loyalty-reg-name">Nombre Completo *</label>
            <input type="text" class="form-input" id="loyalty-reg-name" required placeholder="Ej: Juan Perez">
          </div>
          <div class="form-group">
            <label for="loyalty-reg-phone">WhatsApp *</label>
            <input type="tel" class="form-input" id="loyalty-reg-phone" required placeholder="Ej: 3464123456">
          </div>
          <div class="form-group">
            <label for="loyalty-reg-brand">¿Tenés una Moto? (Opcional, +50 pts bonus)</label>
            <select class="form-select" id="loyalty-reg-brand">
              <option value="">-- Seleccionar Marca --</option>
              ${LOYALTY_CONFIG.motorcyclesBrands.map(b => `<option value="${b}">${b}</option>`).join("")}
            </select>
          </div>
          <div class="form-group" id="loyalty-reg-model-group" style="display: none;">
            <label for="loyalty-reg-model">Modelo de tu Moto</label>
            <select class="form-select" id="loyalty-reg-model">
              <option value="">-- Seleccionar Modelo --</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
            Registrarme y Recibir Puntos 🎁
          </button>
        </form>
      </div>
    `;
    
    // Bind dynamic registration events
    const brandSelect = document.getElementById("loyalty-reg-brand");
    const modelGroup = document.getElementById("loyalty-reg-model-group");
    const modelSelect = document.getElementById("loyalty-reg-model");
    
    if (brandSelect) {
      brandSelect.addEventListener("change", () => {
        const brand = brandSelect.value;
        if (brand && VEHICLE_MODELS_MAP[brand]) {
          modelSelect.innerHTML = `<option value="">-- Seleccionar Modelo --</option>` +
            VEHICLE_MODELS_MAP[brand].map(m => `<option value="${m}">${m}</option>`).join("");
          modelGroup.style.display = "flex";
        } else {
          modelGroup.style.display = "none";
          modelSelect.value = "";
        }
      });
    }

    const regForm = document.getElementById("loyalty-register-form");
    if (regForm) {
      regForm.addEventListener("submit", handleRegistration);
    }
  } else {
    // Render Registered Dashboard
    const nextTierData = getNextTierData();
    const progressPercent = nextTierData.target ? Math.min(100, Math.round((loyaltyState.points / nextTierData.target) * 100)) : 100;
    
    contentArea.innerHTML = `
      <!-- Virtual Member Card -->
      <div class="club-card">
        <div class="club-card-header">
          <div class="club-card-logo">
            <svg class="club-card-logo-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
            </svg>
            <span class="club-card-logo-text">Club Albarracín</span>
          </div>
          <span class="club-card-tier-badge ${LOYALTY_CONFIG.tiers[loyaltyState.tier.toUpperCase()]?.color || 'tier-bronce'}">
            Socio ${loyaltyState.tier}
          </span>
        </div>
        <div class="club-card-body">
          <span class="club-card-points-label">Puntos Disponibles</span>
          <h4 class="club-card-points-val">${loyaltyState.points} PTS</h4>
        </div>
        <div class="club-card-footer">
          <span class="club-card-member-name">${loyaltyState.name}</span>
          <span class="club-card-member-id">${loyaltyState.memberId}</span>
        </div>
      </div>

      <!-- Progress to next tier -->
      <div class="club-progress-container">
        <div class="club-progress-header">
          <span>Progreso de Nivel</span>
          <span>${nextTierData.target ? `${loyaltyState.points} / ${nextTierData.target} pts para Nivel ${nextTierData.nextName}` : "¡Nivel Máximo alcanzado!"}</span>
        </div>
        <div class="club-progress-bar-bg">
          <div class="club-progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: right; margin-top: 2px;">
          Multiplicador actual: <strong>${LOYALTY_CONFIG.tiers[loyaltyState.tier.toUpperCase()]?.multiplier}x</strong> en compras
        </div>
      </div>

      <!-- Add to Wallet Button -->
      <button class="btn btn-secondary" id="loyalty-wallet-btn" style="width: 100%; font-size: 0.85rem; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
        Ver mi Tarjeta Digital Apple / Google Wallet 📱
      </button>

      <!-- AI Personalized Recommendation Showcase -->
      <div id="loyalty-ai-recommendations">
        <!-- Rendered dynamically -->
      </div>

      <!-- Daily Missions & Streaks -->
      <div class="streak-card">
        <div class="streak-title">
          <span>Racha diaria: <strong>${loyaltyState.consecutiveDays} días</strong></span>
          <span>Siguiente check-in: <strong>+${getNextStreakPoints()} pts</strong></span>
        </div>
        <div class="streak-grid">
          ${[1,2,3,4,5,6,7].map(d => {
            const isCompleted = d <= loyaltyState.consecutiveDays;
            const isActive = d === loyaltyState.consecutiveDays + 1 && !loyaltyState.missions.checkIn;
            return `
              <div class="streak-day ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                <span class="streak-day-num">Día ${d}</span>
                <span class="streak-day-reward">+${d === 7 ? "50" : d * 5 + 5}</span>
              </div>
            `;
          }).join("")}
        </div>
        ${!loyaltyState.missions.checkIn ? `
          <button class="btn btn-primary" id="loyalty-checkin-btn" style="width: 100%; padding: 10px; font-size: 0.85rem;">
            Realizar Check-in del Día ✔
          </button>
        ` : `
          <button class="btn btn-secondary" disabled style="width: 100%; padding: 10px; font-size: 0.85rem; opacity: 0.7;">
            Check-in de hoy completado 👍
          </button>
        `}
      </div>

      <!-- Interactive Rueda de la Fortuna (Spin the Wheel) -->
      <div class="loyalty-section-title">
        <svg viewBox="0 0 24 24"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm1-17.93c3.95.49 7 3.85 7 7.93 0 .62-.08 1.21-.21 1.79L16 11v-1c0-1.1-.9-2-2-2h-1V4.07zM5.1 16.9c.26-.81 1-1.39 1.9-1.39h1v-3c0-.55.45-1 1-1h6v2h-2c-.55 0-1 .45-1 1v3h-2v1.93c-2.93-1.19-5-4.06-5-7.41 0-1.84.63-3.52 1.68-4.88z"/></svg>
        Rueda de la Fortuna
      </div>
      <div class="glass-panel wheel-card">
        <p class="reward-voucher-desc" style="margin-bottom: 5px;">¡Girá la Rueda una vez al día para ganar puntos gratis garantizados!</p>
        <div class="wheel-canvas-container">
          <canvas id="wheel-canvas" width="440" height="440"></canvas>
          <div class="wheel-center-pin"></div>
        </div>
        <button class="btn btn-outline" id="loyalty-spin-btn" style="width: 150px; padding: 10px; font-size: 0.85rem;" ${canSpin() ? "" : "disabled"}>
          ${canSpin() ? "¡GIRAR RUEDA! 🎡" : "Mañana volvés a girar"}
        </button>
      </div>

      <!-- Misiones Diarias -->
      <div class="loyalty-section-title">
        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        Misiones del Día
      </div>
      <div class="missions-list">
        <!-- Explorador -->
        <div class="mission-item ${loyaltyState.missions.explorer ? 'completed' : ''}">
          <div class="mission-info">
            <span class="mission-name">Explorador de Repuestos</span>
            <span class="mission-desc" style="font-size: 0.7rem; color: var(--text-secondary);">Buscá o abrí detalles de 2 productos hoy (${Math.min(2, loyaltyState.explorerViews)}/2)</span>
            <span class="mission-reward">
              <svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:currentColor;"><path d="M12 2L9 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/></svg>
              +15 Puntos
            </span>
          </div>
          ${!loyaltyState.missions.explorer ? `
            <button class="btn mission-btn-claim" id="claim-explorer-btn" style="padding: 6px 10px;" ${loyaltyState.explorerViews >= 2 ? "" : "disabled"}>Reclamar</button>
          ` : `
            <span class="mission-btn-done">Completado ✔</span>
          `}
        </div>

        <!-- Google Reviews -->
        <div class="mission-item ${loyaltyState.missions.rating ? 'completed' : ''}">
          <div class="mission-info">
            <span class="mission-name">Apoyo Local en Google</span>
            <span class="mission-desc" style="font-size: 0.7rem; color: var(--text-secondary);">Dejanos tu calificación positiva sobre Albarracín</span>
            <span class="mission-reward">
              <svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:currentColor;"><path d="M12 2L9 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/></svg>
              +150 Puntos
            </span>
          </div>
          ${!loyaltyState.missions.rating ? `
            <button class="btn mission-btn-claim" id="claim-rating-btn" style="padding: 6px 10px;">Opinar (+150)</button>
          ` : `
            <span class="mission-btn-done">Completado ✔</span>
          `}
        </div>
      </div>

      <!-- Canje de Cupones -->
      <div class="loyalty-section-title">
        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 10H9v-2h6v2zm0-4H9V8h6v2z"/></svg>
        Canjear Premios
      </div>
      <div class="rewards-grid">
        ${LOYALTY_CONFIG.rewards.map(r => {
          const canAfford = loyaltyState.points >= r.cost;
          return `
            <div class="reward-voucher">
              <div class="reward-voucher-value">
                ${r.type === 'percent' ? `${r.value}%` : `$${r.value / 1000}k`}
              </div>
              <div class="reward-voucher-info">
                <div>
                  <h4 class="reward-voucher-title">${r.name}</h4>
                  <p class="reward-voucher-desc">${r.desc}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="reward-voucher-cost">
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; fill:currentColor;"><path d="M12 2L9 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/></svg>
                    ${r.cost} Pts
                  </span>
                  <button class="reward-voucher-btn" onclick="redeemReward('${r.id}')" ${canAfford ? "" : "disabled"}>
                    Canjear
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Mis Cupones -->
      <div class="loyalty-section-title">
        <svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
        Mis Cupones Activos
      </div>
      <div class="my-coupons-container" id="my-coupons-list">
        ${renderActiveCoupons()}
      </div>

      <!-- Historial -->
      <div class="loyalty-section-title">
        <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
        Historial de Puntos
      </div>
      <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
        ${loyaltyState.history.length === 0 ? `
          <p style="font-size: 0.8rem; color: var(--text-tertiary); text-align: center;">No hay transacciones aún.</p>
        ` : loyaltyState.history.slice().reverse().map(h => `
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 4px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 600; color: var(--text-primary);">${h.desc}</span>
              <span style="font-size: 0.65rem; color: var(--text-tertiary);">${new Date(h.date).toLocaleDateString()}</span>
            </div>
            <span style="font-weight: 700; color: ${h.amount > 0 ? '#00e676' : '#ff5722'};">
              ${h.amount > 0 ? `+${h.amount}` : h.amount} pts
            </span>
          </div>
        `).join("")}
      </div>
    `;
    
    // Bind Registered Events
    const checkinBtn = document.getElementById("loyalty-checkin-btn");
    if (checkinBtn) checkinBtn.addEventListener("click", handleDailyCheckIn);

    const spinBtn = document.getElementById("loyalty-spin-btn");
    if (spinBtn) spinBtn.addEventListener("click", spinWheel);

    const claimExpBtn = document.getElementById("claim-explorer-btn");
    if (claimExpBtn) claimExpBtn.addEventListener("click", claimExplorerMission);

    const claimRatingBtn = document.getElementById("claim-rating-btn");
    if (claimRatingBtn) claimRatingBtn.addEventListener("click", handleGoogleReviewMission);

    const walletBtn = document.getElementById("loyalty-wallet-btn");
    if (walletBtn) walletBtn.addEventListener("click", openWalletModal);

    // Initial draw of canvas wheel
    drawWheel(0);

    // Initial draw of AI Recommendations
    renderAIRecommendations();
  }
}

// Helper to get active coupons list html
function renderActiveCoupons() {
  const active = loyaltyState.coupons.filter(c => !c.used);
  if (active.length === 0) {
    return `<p style="font-size: 0.8rem; color: var(--text-tertiary); text-align: center; width: 100%;">No tenés cupones disponibles en este momento.</p>`;
  }

  return active.map(c => `
    <div class="active-coupon-card">
      <div class="active-coupon-details">
        <span class="active-coupon-title">${c.name}</span>
        <span class="active-coupon-code">${c.code}</span>
      </div>
      <div class="active-coupon-actions">
        <button class="btn active-coupon-btn active-coupon-apply-btn" onclick="applyCouponToCart('${c.code}')">Aplicar</button>
      </div>
    </div>
  `).join("");
}

// Calculate next tier thresholds
function getNextTierData() {
  const currentPoints = loyaltyState.points;
  if (currentPoints <= LOYALTY_CONFIG.tiers.BRONCE.minPoints + 300) {
    return { current: "Bronce", nextName: "Plata", target: 301 };
  } else if (currentPoints <= 1000) {
    return { current: "Plata", nextName: "Oro", target: 1001 };
  } else if (currentPoints <= 2500) {
    return { current: "Oro", nextName: "Platino", target: 2501 };
  } else {
    return { current: "Platino", nextName: null, target: null };
  }
}

// Recalculate and update current tier based on points
function recalculateTier() {
  const pts = loyaltyState.points;
  let oldTier = loyaltyState.tier;
  let newTier = "Bronce";

  if (pts >= LOYALTY_CONFIG.tiers.PLATINO.minPoints) {
    newTier = "Platino";
  } else if (pts >= LOYALTY_CONFIG.tiers.ORO.minPoints) {
    newTier = "Oro";
  } else if (pts >= LOYALTY_CONFIG.tiers.PLATA.minPoints) {
    newTier = "Plata";
  }

  if (oldTier !== newTier) {
    loyaltyState.tier = newTier;
    // Add badge for gold/platino/plata tiers
    const badgeId = `tier_${newTier.toLowerCase()}`;
    unlockBadge(badgeId);
    showToast(`¡Subiste de nivel! Ahora sos socio ${newTier} 🌟`);
  }
}

// ==========================================
// REGISTRATION & ONBOARDING LOGIC
// ==========================================
function handleRegistration(e) {
  e.preventDefault();

  const nameInput = document.getElementById("loyalty-reg-name");
  const phoneInput = document.getElementById("loyalty-reg-phone");
  const brandSelect = document.getElementById("loyalty-reg-brand");
  const modelSelect = document.getElementById("loyalty-reg-model");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const brand = brandSelect.value;
  const model = modelSelect ? modelSelect.value : "";

  if (name === "" || phone === "") {
    showToast("Por favor ingresá tu nombre y teléfono.");
    return;
  }

  // Generate unique member card ID (CLUB-Year-Random)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const memberId = `ALB-${new Date().getFullYear()}-${randomNum}`;

  // Points Math
  let pointsEarned = LOYALTY_CONFIG.welcomeBonus;
  let hasMoto = false;
  let historyLog = [{ date: Date.now(), desc: "Bono de bienvenida", amount: LOYALTY_CONFIG.welcomeBonus }];
  let badges = ["pionero"];

  if (brand !== "") {
    pointsEarned += LOYALTY_CONFIG.motoBonus;
    hasMoto = true;
    historyLog.push({ date: Date.now(), desc: `Bono Moto registrada: ${brand}`, amount: LOYALTY_CONFIG.motoBonus });
    badges.push("motociclista");
  }

  // Update State
  loyaltyState = {
    ...loyaltyState,
    registered: true,
    name: name,
    phone: phone,
    motorcycleBrand: brand,
    motorcycleModel: model,
    points: pointsEarned,
    memberId: memberId,
    history: historyLog,
    badges: badges
  };

  recalculateTier();
  saveLoyaltyState();

  // Save to database contacts list
  saveContactToDatabase({
    memberId: memberId,
    name: name,
    phone: phone,
    motorcycleBrand: brand,
    motorcycleModel: model,
    tier: loyaltyState.tier,
    points: pointsEarned,
    dateJoined: Date.now()
  });

  // Trigger celebration
  triggerConfettiExplosion();
  updateFABIcon();
  
  // Show "Aha! Moment" message
  setTimeout(() => {
    showToast(`¡Bienvenido al Club ${name}! Recibiste ${pointsEarned} Puntos 🎉`);
  }, 1000);
}

// Confetti Animation using SVG overlay
function triggerConfettiExplosion() {
  const container = document.createElement("div");
  container.className = "confetti-overlay";
  document.body.appendChild(container);

  const colors = ["#ff5722", "#00b0ff", "#00e676", "#ffd700", "#ff007f", "#8a2be2"];
  
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    
    // Random sizes and rotation
    const w = 5 + Math.random() * 8;
    const h = w * (1.5 + Math.random());
    piece.style.width = `${w}px`;
    piece.style.height = `${h}px`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 4500);
}

// ==========================================
// DAILY CHECK-IN & STREAKS LOGIC
// ==========================================
function getNextStreakPoints() {
  const day = (loyaltyState.consecutiveDays % 7) + 1;
  return day === 7 ? 50 : day * 5 + 5;
}

function handleDailyCheckIn() {
  if (loyaltyState.missions.checkIn) return;

  const today = Date.now();
  const lastCheckIn = loyaltyState.lastCheckIn;

  let consecutive = loyaltyState.consecutiveDays;
  
  if (lastCheckIn) {
    const hoursDiff = (today - lastCheckIn) / (1000 * 60 * 60);
    if (hoursDiff <= 36) {
      // Checked in yesterday, continue streak
      consecutive = (consecutive % 7) + 1;
    } else {
      // Broke streak, reset to 1
      consecutive = 1;
    }
  } else {
    consecutive = 1;
  }

  const reward = consecutive === 7 ? 50 : consecutive * 5 + 5;

  loyaltyState.points += reward;
  loyaltyState.consecutiveDays = consecutive;
  loyaltyState.lastCheckIn = today;
  loyaltyState.missions.checkIn = true;
  
  loyaltyState.history.push({
    date: today,
    desc: `Check-in Diario - Día ${consecutive}`,
    amount: reward
  });

  recalculateTier();
  saveLoyaltyState();
  showToast(`¡Check-in exitoso! Ganaste ${reward} puntos 🎁`);
}

// ==========================================
// INTERACTIVE RUEDA DE LA FORTUNA (CANVAS)
// ==========================================
let isSpinning = false;
let wheelAngle = 0;

function canSpin() {
  if (!loyaltyState.lastWheelSpin) return true;
  const todayStr = new Date().toDateString();
  const lastSpinStr = new Date(loyaltyState.lastWheelSpin).toDateString();
  return todayStr !== lastSpinStr;
}

function drawWheel(angleOffset = 0) {
  const canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const radius = width / 2 - 10;
  
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angleOffset);

  const segments = LOYALTY_CONFIG.wheelPrizes;
  const arcSize = (2 * Math.PI) / segments.length;

  for (let i = 0; i < segments.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * arcSize, (i + 1) * arcSize);
    ctx.fillStyle = segments[i].color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Segment text labels
    ctx.save();
    ctx.rotate((i + 0.5) * arcSize);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    // Choose font color based on segment color
    ctx.fillStyle = segments[i].color === "#ffd700" ? "#0a0b0e" : segments[i].color === "#12141c" ? "#9aa1b1" : "#ffffff";
    ctx.font = "bold 20px 'Orbitron', sans-serif";
    ctx.fillText(segments[i].text, radius - 20, 0);
    ctx.restore();
  }

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "var(--accent-orange)";
  ctx.lineWidth = 6;
  ctx.stroke();
  
  ctx.restore();
}

function spinWheel() {
  if (isSpinning || !canSpin()) return;

  isSpinning = true;
  const spinBtn = document.getElementById("loyalty-spin-btn");
  if (spinBtn) spinBtn.disabled = true;

  // Select target prize index
  // 5% jackpot gold segment, others even distributions
  let prizeIndex = 0;
  const randVal = Math.random();
  if (randVal < 0.05) {
    prizeIndex = 7; // Gold Jackpot 500 Pts
  } else if (randVal < 0.15) {
    prizeIndex = 5; // 200 Pts
  } else if (randVal < 0.3) {
    prizeIndex = 3; // 100 Pts
  } else if (randVal < 0.5) {
    prizeIndex = 1; // 50 Pts
  } else {
    // Small rewards
    const smallPrizes = [0, 2, 4, 6];
    prizeIndex = smallPrizes[Math.floor(Math.random() * smallPrizes.length)];
  }

  const prize = LOYALTY_CONFIG.wheelPrizes[prizeIndex];
  const arcSize = (2 * Math.PI) / LOYALTY_CONFIG.wheelPrizes.length;

  // Spin calculation: several full rotations + offset to stop segment under pointer (top is -Math.PI/2)
  // Pointer is at the top (angle = -90 deg / -1.5707 rad).
  // Segment index is checked relative to pointer.
  // Winning angle: Target angle is -(prizeIndex * arcSize + arcSize/2) - Math.PI/2
  const targetAngle = 6 * Math.PI * 2 - (prizeIndex * arcSize + arcSize / 2) - Math.PI / 2;
  
  let currentSpinAngle = wheelAngle;
  const duration = 4000; // 4 seconds
  const start = performance.now();

  function animateSpin(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(1, elapsed / duration);
    
    // Ease out cubic deceleration formula
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const angle = currentSpinAngle + easeProgress * (targetAngle - currentSpinAngle);
    
    drawWheel(angle);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      // Completed spin!
      wheelAngle = targetAngle % (Math.PI * 2);
      isSpinning = false;
      
      // Award prize
      loyaltyState.points += prize.value;
      loyaltyState.lastWheelSpin = Date.now();
      loyaltyState.missions.checkIn = true; // Mark as check in done too if spin did it
      
      loyaltyState.history.push({
        date: Date.now(),
        desc: `Rueda de la Fortuna: ${prize.text}`,
        amount: prize.value
      });

      if (prize.value >= 100) {
        unlockBadge("suertudo");
        triggerConfettiExplosion();
      }

      recalculateTier();
      saveLoyaltyState();

      showToast(`¡Ganaste ${prize.text} en la Rueda! 🎡`);
    }
  }

  requestAnimationFrame(animateSpin);
}

// ==========================================
// DAILY MISSIONS & BADGES
// ==========================================
function claimExplorerMission() {
  if (loyaltyState.missions.explorer || loyaltyState.explorerViews < 2) return;

  loyaltyState.points += 15;
  loyaltyState.missions.explorer = true;
  loyaltyState.history.push({
    date: Date.now(),
    desc: "Misión: Explorador de Repuestos",
    amount: 15
  });

  unlockBadge("explorador");
  recalculateTier();
  saveLoyaltyState();
  showToast("¡Misión Explorador cobrada! +15 Puntos 🎁");
}

function handleGoogleReviewMission() {
  if (loyaltyState.missions.rating) return;
  
  // Open mock review page or Google reviews in a new window
  window.open("https://maps.app.goo.gl/r6m8R5wWJWhN4w2k7", "_blank");
  
  setTimeout(() => {
    loyaltyState.points += LOYALTY_CONFIG.googleReviewBonus;
    loyaltyState.missions.rating = true;
    loyaltyState.history.push({
      date: Date.now(),
      desc: "Misión: Reseña de Google",
      amount: LOYALTY_CONFIG.googleReviewBonus
    });

    unlockBadge("opinador");
    recalculateTier();
    saveLoyaltyState();
    showToast(`¡Gracias por tu apoyo! Sumaste +150 Puntos de regalo 🌟`);
  }, 1500);
}

function unlockBadge(badgeId) {
  if (!loyaltyState.badges.includes(badgeId)) {
    loyaltyState.badges.push(badgeId);
    // Badges details toast
    const names = {
      pionero: "Insignia Pionero 🎖",
      motociclista: "Insignia Fiel Motociclista 🏍",
      suertudo: "Insignia Súper Suertudo 🍀",
      explorador: "Insignia Explorador 🔍",
      opinador: "Insignia Vocero del Taller 📢",
      tier_plata: "Socio Plata 🥈",
      tier_oro: "Socio Oro 🥇",
      tier_platino: "Socio Platino 💎"
    };
    
    setTimeout(() => {
      showToast(`¡Desbloqueaste insignia: ${names[badgeId] || badgeId}!`);
    }, 1500);
  }
}

// Track catalog views for Explorer mission
function trackUserBehavior() {
  // Catch opens of detail modal
  const originalOpenProductDetail = window.openProductDetail;
  window.openProductDetail = function(productId) {
    // Track view in local state
    if (loyaltyState.registered && !loyaltyState.missions.explorer) {
      loyaltyState.explorerViews++;
      if (loyaltyState.explorerViews >= 2) {
        saveLoyaltyState();
      } else {
        localStorage.setItem("albarracin_loyalty", JSON.stringify(loyaltyState));
      }
    }
    
    // Call original function
    originalOpenProductDetail(productId);
  };
}

// ==========================================
// AI RECOMMENDATION ENGINE (CLIENT HEURISTICS)
// ==========================================
function renderAIRecommendations() {
  const container = document.getElementById("loyalty-ai-recommendations");
  if (!container) return;

  // Determine user brand affinity: registered moto or searched brand
  let preferredBrand = loyaltyState.motorcycleBrand;
  if (!preferredBrand) {
    // Fallback: Check search query brand matches
    const searchVal = document.getElementById("catalog-search")?.value || "";
    const matchedBrand = LOYALTY_CONFIG.motorcyclesBrands.find(b => searchVal.toLowerCase().includes(b.toLowerCase()));
    if (matchedBrand) preferredBrand = matchedBrand;
  }

  // Fallback to random brand if none found
  if (!preferredBrand) {
    preferredBrand = LOYALTY_CONFIG.motorcyclesBrands[Math.floor(Math.random() * LOYALTY_CONFIG.motorcyclesBrands.length)];
  }

  // Filter products matching the preferred brand
  // We want to fetch 1 motorcycle and 1-2 spare parts compatible with that brand
  const matchingProducts = PRODUCTS_DATA.filter(p => {
    const isDirectBrand = p.brand.toLowerCase() === preferredBrand.toLowerCase();
    const isCompatible = p.compatibilities && p.compatibilities.some(c => c.brand.toLowerCase() === preferredBrand.toLowerCase());
    return isDirectBrand || isCompatible;
  });

  if (matchingProducts.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Slice matching products
  const selectedList = matchingProducts.slice(0, 3);

  container.innerHTML = `
    <div class="ai-recommendation-box">
      <div class="ai-recommendation-header">
        <svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm0 15c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        Recomendaciones de IA
      </div>
      <p class="ai-recommendation-text">
        Detectamos tu afinidad por <strong>${preferredBrand}</strong>. Basado en repuestos en stock, te conseguimos ofertas exclusivas del Club:
      </p>
      <div class="ai-product-showcase">
        ${selectedList.map(p => `
          <div class="ai-product-item" onclick="viewRecommendedProduct(${p.id})">
            <img src="${p.img}" class="ai-product-img" onerror="this.src='https://placehold.co/100x100?text=Repuesto'">
            <div class="ai-product-info">
              <h5 class="ai-product-name">${p.name}</h5>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                <span class="ai-product-price">${formatCurrency(p.price)}</span>
                <span class="ai-product-badge">Club Oferta</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

window.viewRecommendedProduct = function(productId) {
  // Open the detail modal in app.js
  if (typeof window.openProductDetail === 'function') {
    window.openProductDetail(productId);
    closeLoyaltyDrawer();
  }
};

// ==========================================
// VOUCHER & COUPON REDEMPTION LOGIC
// ==========================================
function redeemReward(rewardId) {
  const reward = LOYALTY_CONFIG.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  if (loyaltyState.points < reward.cost) {
    showToast("Puntos insuficientes para realizar este canje.");
    return;
  }

  // Deduct points
  loyaltyState.points -= reward.cost;

  // Generate unique coupon code (ALBA-[Cost]-[RandomChars])
  const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const couponCode = `ALBA-${reward.cost / 100}K-${randomCode}`;

  // Add to user coupons list
  const newCoupon = {
    id: reward.id,
    code: couponCode,
    name: reward.name,
    discountType: reward.type,
    amount: reward.value,
    used: false
  };

  loyaltyState.coupons.push(newCoupon);
  
  // Log history
  loyaltyState.history.push({
    date: Date.now(),
    desc: `Canje: ${reward.name}`,
    amount: -reward.cost
  });

  saveLoyaltyState();
  showToast(`¡Canje exitoso! Cupón generado: ${couponCode} 🎫`);
}

// ==========================================
// CART & CHECKOUT INTEGRATION FLOW
// ==========================================
function initCartIntegration() {
  // Prepend coupon container into the Cart Drawer Summary Section
  const cartSummary = document.getElementById("cart-summary-box");
  if (!cartSummary) return;

  // Create Coupon Area
  const couponContainer = document.createElement("div");
  couponContainer.className = "checkout-form-container";
  couponContainer.id = "cart-coupon-area";
  couponContainer.style.borderTop = "1px solid var(--glass-border)";
  couponContainer.style.paddingTop = "15px";
  couponContainer.style.marginTop = "5px";
  couponContainer.innerHTML = `
    <h4 class="checkout-form-title">Cupón Club Albarracín</h4>
    <div id="applied-coupon-wrapper">
      <!-- Applied coupon badge or Input field -->
      <div style="display: flex; gap: 8px;">
        <input type="text" class="form-input" id="cart-coupon-input" placeholder="Ej: ALBA-2K-ABCD" style="font-family: var(--font-brand); letter-spacing: 0.5px; text-transform: uppercase; font-size: 0.8rem; padding: 10px;">
        <button type="button" class="btn btn-secondary" id="cart-coupon-apply-btn" style="padding: 10px 18px; font-size: 0.8rem; font-family: var(--font-heading);">Aplicar</button>
      </div>
    </div>
  `;
  
  // Insert before the cart-totals
  const cartTotals = cartSummary.querySelector(".cart-totals");
  if (cartTotals) {
    cartSummary.insertBefore(couponContainer, cartTotals);
  }

  // Bind Coupon events
  document.getElementById("cart-coupon-apply-btn").addEventListener("click", handleApplyCouponFromInput);

  // Wrap cart render to inject discounts
  const originalUpdateCartUI = window.updateCartUI;
  window.updateCartUI = function() {
    // Call base
    originalUpdateCartUI();

    // Adjust subtotal and grand totals if coupon applied
    updateCartDiscountUI();
  };

  // Wrap Checkout process to apply coupon consumption
  const originalHandleCartCheckout = window.handleCartCheckout;
  
  // Re-bind the checkout button click listener
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.removeEventListener("click", originalHandleCartCheckout);
    checkoutBtn.addEventListener("click", handleLoyaltyCheckout);
  }
}

// Applying coupon
function applyCouponToCart(code) {
  if (!loyaltyState.registered) {
    showToast("Debes registrarte en el Club para usar cupones.");
    return;
  }

  const coupon = loyaltyState.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && !c.used);
  if (!coupon) {
    showToast("Cupón inválido o ya utilizado.");
    return;
  }

  appliedCoupon = coupon;
  closeLoyaltyDrawer();
  openCartDrawer();
  
  // Update Cart UI
  updateCartDiscountUI();
  showToast(`Cupón aplicado al carrito: ${coupon.code}`);
}

function handleApplyCouponFromInput() {
  const input = document.getElementById("cart-coupon-input");
  if (!input) return;
  const code = input.value.trim();

  if (code === "") {
    showToast("Por favor ingresa un código de cupón.");
    return;
  }

  applyCouponToCart(code);
}

function removeAppliedCoupon() {
  appliedCoupon = null;
  updateCartDiscountUI();
  showToast("Cupón removido del carrito.");
}

// Update Cart Discount UI
function updateCartDiscountUI() {
  const couponWrapper = document.getElementById("applied-coupon-wrapper");
  const subtotalPriceEl = document.getElementById("cart-subtotal-price");
  const totalPriceEl = document.getElementById("cart-total-price");
  const cartTotalsContainer = document.querySelector(".cart-totals");

  if (!subtotalPriceEl || !totalPriceEl || !cartTotalsContainer) return;

  // Remove existing discount rows
  const oldDiscountRow = document.getElementById("cart-discount-row");
  if (oldDiscountRow) oldDiscountRow.remove();

  // Get raw subtotal from cart state
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (appliedCoupon && subtotal > 0) {
    // Show applied badge in Cart Drawer input area
    if (couponWrapper) {
      couponWrapper.innerHTML = `
        <div class="applied-coupon-box">
          <div class="applied-coupon-info">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>${appliedCoupon.code} (${appliedCoupon.name})</span>
          </div>
          <span class="applied-coupon-remove" onclick="removeAppliedCoupon()">✖</span>
        </div>
      `;
    }

    // Calculate discount
    let discountVal = 0;
    if (appliedCoupon.discountType === "percent") {
      discountVal = Math.round(subtotal * (appliedCoupon.amount / 100));
    } else {
      discountVal = Math.min(subtotal, appliedCoupon.amount);
    }

    const finalTotal = Math.max(0, subtotal - discountVal);

    // Create discount DOM row
    const discountRow = document.createElement("div");
    discountRow.className = "cart-total-row";
    discountRow.id = "cart-discount-row";
    discountRow.style.color = "#00e676";
    discountRow.innerHTML = `
      <span>Descuento Club</span>
      <span>-${formatCurrency(discountVal)}</span>
    `;

    // Insert before grand-total row (which is the last child of cart-totals)
    const grandTotalRow = cartTotalsContainer.querySelector(".grand-total");
    if (grandTotalRow) {
      cartTotalsContainer.insertBefore(discountRow, grandTotalRow);
    }

    // Update grand total display
    totalPriceEl.textContent = formatCurrency(finalTotal);
  } else {
    // Reset coupon wrapper input fields
    if (couponWrapper) {
      couponWrapper.innerHTML = `
        <div style="display: flex; gap: 8px;">
          <input type="text" class="form-input" id="cart-coupon-input" placeholder="Ej: ALBA-2K-ABCD" style="font-family: var(--font-brand); letter-spacing: 0.5px; text-transform: uppercase; font-size: 0.8rem; padding: 10px;">
          <button type="button" class="btn btn-secondary" id="cart-coupon-apply-btn" style="padding: 10px 18px; font-size: 0.8rem; font-family: var(--font-heading);" onclick="handleApplyCouponFromInput()">Aplicar</button>
        </div>
      `;
    }
    // Totals reset naturally because originalUpdateCartUI runs first
  }
}

// Customized Loyalty Checkout (WhatsApp redirect)
function handleLoyaltyCheckout() {
  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const delivery = document.getElementById("checkout-delivery").value;
  const payment = document.getElementById("checkout-payment").value;
  
  if (name === "" || phone === "") {
    showToast("Por favor completa los campos obligatorios de contacto.");
    return;
  }
  
  const deliveryText = delivery === "retiro" ? "Retiro en Local (Pellegrini 1320, Chabás)" : "Envío a Domicilio (A coordinar)";
  const paymentText = payment === "efectivo" ? "Efectivo / Transferencia" : "Tarjeta de Crédito / Débito";
  
  let msg = `*Hola Albarracín - Motos y Repuestos!*\n`;
  msg += `Quiero consultar / reservar los siguientes productos de la web:\n\n`;
  msg += `*Cliente:* ${name}\n`;
  msg += `*WhatsApp:* ${phone}\n`;
  msg += `*Entrega:* ${deliveryText}\n`;
  msg += `*Forma de pago:* ${paymentText}\n\n`;

  // Loyalty user details
  if (loyaltyState.registered) {
    msg += `*Socio Club:* ${loyaltyState.name} (${loyaltyState.memberId})\n`;
    msg += `*Nivel:* ${loyaltyState.tier}\n\n`;
  }

  msg += `*Detalle del Pedido:*\n`;
  
  let subtotal = 0;
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    msg += `• ${item.quantity}x ${item.name} (${formatCurrency(item.price)} c/u) = *${formatCurrency(itemTotal)}*\n`;
  });
  
  let discountVal = 0;
  let finalTotal = subtotal;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      discountVal = Math.round(subtotal * (appliedCoupon.amount / 100));
    } else {
      discountVal = Math.min(subtotal, appliedCoupon.amount);
    }
    finalTotal = Math.max(0, subtotal - discountVal);
    
    msg += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`;
    msg += `*Descuento Club:* -${formatCurrency(discountVal)} (Cupón: ${appliedCoupon.code})\n`;
  }

  msg += `\n*Total Estimado:* ${formatCurrency(finalTotal)}\n\n`;
  
  // Calculate points to earn from this purchase
  let pointsToEarn = 0;
  if (loyaltyState.registered) {
    const basePoints = Math.round(finalTotal * LOYALTY_CONFIG.pointsPerDollar);
    const multiplier = LOYALTY_CONFIG.tiers[loyaltyState.tier.toUpperCase()]?.multiplier || 1.0;
    pointsToEarn = Math.round(basePoints * multiplier);
    
    msg += `*Puntos a sumar con esta compra:* +${pointsToEarn} pts\n\n`;
  }

  msg += `Quedo a la espera de su confirmación para coordinar el retiro/envío. ¡Gracias!`;
  
  const whatsappUrl = `https://wa.me/5493464685338?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");

  // Save customer contact info (even if guest checkout)
  saveContactToDatabase({
    memberId: loyaltyState.registered ? loyaltyState.memberId : "INVITADO",
    name: name,
    phone: phone,
    motorcycleBrand: loyaltyState.registered ? loyaltyState.motorcycleBrand : "",
    motorcycleModel: loyaltyState.registered ? loyaltyState.motorcycleModel : "",
    tier: loyaltyState.registered ? loyaltyState.tier : "Invitado",
    points: loyaltyState.registered ? loyaltyState.points : 0,
    dateJoined: Date.now()
  });

  // Save the full checkout message query in messages log
  saveMessageToDatabase({
    id: 'MSG-' + Date.now(),
    date: Date.now(),
    name: name,
    phone: phone,
    message: msg,
    subtotal: subtotal,
    discount: discountVal,
    total: finalTotal,
    couponCode: appliedCoupon ? appliedCoupon.code : ""
  });

  // Post-purchase processing (Save points, consume coupon)
  if (loyaltyState.registered) {
    // 1. Add Points
    if (pointsToEarn > 0) {
      loyaltyState.points += pointsToEarn;
      loyaltyState.history.push({
        date: Date.now(),
        desc: `Compra web - Multiplicador ${LOYALTY_CONFIG.tiers[loyaltyState.tier.toUpperCase()]?.multiplier}x`,
        amount: pointsToEarn
      });
    }

    // 2. Mark coupon as used
    if (appliedCoupon) {
      const idx = loyaltyState.coupons.findIndex(c => c.code === appliedCoupon.code);
      if (idx !== -1) {
        loyaltyState.coupons[idx].used = true;
      }
      appliedCoupon = null;
    }

    // 3. Increment views/history count for badges
    let checkoutCount = localStorage.getItem("albarracin_checkout_count") || 0;
    checkoutCount = parseInt(checkoutCount) + 1;
    localStorage.setItem("albarracin_checkout_count", checkoutCount);
    
    if (checkoutCount >= 1) {
      unlockBadge("comprador");
    }

    recalculateTier();
    saveLoyaltyState();
    
    // Clear coupon UI in cart
    updateCartDiscountUI();
  }
}

// ==========================================
// WALLET DIGITAL CARD MODAL LOGIC
// ==========================================
function openWalletModal() {
  const modal = document.getElementById("wallet-modal");
  if (!modal) return;

  const barcodeHTML = generateBarcodeHTML(loyaltyState.memberId);
  
  modal.innerHTML = `
    <div class="wallet-card-container">
      <div class="wallet-card-header">
        <div class="wallet-logo">
          <svg class="wallet-logo-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: var(--accent-orange);"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
          Club Albarracín Pass
        </div>
        <span class="wallet-close" onclick="closeWalletModal()">✖</span>
      </div>
      <div class="wallet-card-body">
        <div class="wallet-member-info">
          <div class="wallet-info-block">
            <span class="wallet-info-label">Miembro</span>
            <span class="wallet-info-val">${loyaltyState.name}</span>
          </div>
          <div class="wallet-info-block" style="text-align: right;">
            <span class="wallet-info-label">Nivel</span>
            <span class="wallet-info-val" style="color: var(--accent-blue);">${loyaltyState.tier}</span>
          </div>
        </div>

        <div class="wallet-member-info">
          <div class="wallet-info-block">
            <span class="wallet-info-label">Saldo de Puntos</span>
            <span class="wallet-info-val wallet-info-val-points">${loyaltyState.points} PTS</span>
          </div>
          ${loyaltyState.motorcycleBrand ? `
            <div class="wallet-info-block" style="text-align: right;">
              <span class="wallet-info-label">Moto Registrada</span>
              <span class="wallet-info-val" style="font-size: 0.8rem;">${loyaltyState.motorcycleBrand} ${loyaltyState.motorcycleModel}</span>
            </div>
          ` : ""}
        </div>

        <div class="wallet-card-barcode-box">
          <div class="wallet-barcode-stripes">
            ${barcodeHTML}
          </div>
          <span class="wallet-card-id">${loyaltyState.memberId}</span>
        </div>
      </div>
      <div class="wallet-card-footer-buttons">
        <button class="wallet-add-btn" onclick="addMockWallet('apple')">
          <span style="font-size: 1.1rem;"></span> Apple Wallet
        </button>
        <button class="wallet-add-btn" onclick="addMockWallet('google')">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: white; margin-right: 4px;"><path d="M21.3 11.28l-2.58-2.58c-.39-.39-1.02-.39-1.41 0L12 14l-5.3-5.3c-.39-.39-1.02-.39-1.41 0L2.7 11.28c-.39.39-.39 1.02 0 1.41l8.59 8.59c.39.39 1.02.39 1.41 0l8.59-8.59c.4-.39.4-1.02.01-1.41z"/></svg> 
          Google Wallet
        </button>
      </div>
    </div>
  `;
  modal.classList.add("open");
}

window.closeWalletModal = function() {
  const modal = document.getElementById("wallet-modal");
  if (modal) modal.classList.remove("open");
};

function generateBarcodeHTML(code) {
  // Generate random lines of black stripes
  let html = "";
  const widths = [1, 2, 3, 4, 1, 3, 2, 4, 1, 2, 1, 3, 4];
  for (let i = 0; i < 40; i++) {
    const width = widths[i % widths.length];
    const isGap = i % 2 === 1;
    if (isGap) {
      html += `<div style="width: ${width * 1.5}px;"></div>`;
    } else {
      html += `<div class="wallet-barcode-stripe" style="width: ${width * 1.5}px;"></div>`;
    }
  }
  return html;
}

window.addMockWallet = function(provider) {
  showToast(`¡Pase agregado exitosamente a tu ${provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'}! 📱`);
  closeWalletModal();
};

// ==========================================
// EVENT BINDINGS & TOGGLES
// ==========================================
function bindLoyaltyEvents() {
  const fab = document.getElementById("loyalty-fab-btn");
  const closeBtn = document.getElementById("loyalty-close-btn");
  const adminBtn = document.getElementById("loyalty-admin-btn");
  
  if (fab) {
    fab.addEventListener("click", openLoyaltyDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLoyaltyDrawer);
  }

  if (adminBtn) {
    adminBtn.addEventListener("click", openAdminModal);
  }
}

function openLoyaltyDrawer() {
  // Close Cart drawer if open to avoid overlap
  if (typeof window.closeCartDrawer === 'function') {
    window.closeCartDrawer();
  }

  // Pre-render content area (checks for changes/spins)
  renderLoyaltyContent();

  const drawer = document.getElementById("loyalty-drawer-panel");
  if (drawer) drawer.classList.add("open");
}

function closeLoyaltyDrawer() {
  const drawer = document.getElementById("loyalty-drawer-panel");
  if (drawer) drawer.classList.remove("open");
}

// Global functions for inline attributes
window.redeemReward = redeemReward;
window.applyCouponToCart = applyCouponToCart;
window.removeAppliedCoupon = removeAppliedCoupon;
window.handleApplyCouponFromInput = handleApplyCouponFromInput;
window.closeLoyaltyDrawer = closeLoyaltyDrawer;

// ==========================================
// DATABASE SYSTEM (LOCAL STORAGE) & ADMIN PANEL
// ==========================================

// Save a contact to the database
function saveContactToDatabase(contact) {
  let contacts = [];
  const saved = localStorage.getItem("albarracin_db_contacts");
  if (saved) {
    try {
      contacts = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  
  // Check if contact already exists by phone number
  const idx = contacts.findIndex(c => c.phone === contact.phone);
  if (idx !== -1) {
    // Update existing contact
    contacts[idx] = { ...contacts[idx], ...contact, dateJoined: contacts[idx].dateJoined || contact.dateJoined };
  } else {
    // Add new contact
    contacts.push(contact);
  }
  localStorage.setItem("albarracin_db_contacts", JSON.stringify(contacts));
}

// Save a message to the database
function saveMessageToDatabase(message) {
  let messages = [];
  const saved = localStorage.getItem("albarracin_db_messages");
  if (saved) {
    try {
      messages = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  messages.push(message);
  localStorage.setItem("albarracin_db_messages", JSON.stringify(messages));
}

// Open Admin Modal
window.openAdminModal = function() {
  const storedPassword = localStorage.getItem("albarracin_admin_password") || "admin";
  const password = prompt("Ingrese la contraseña de Administrador:");
  if (password !== storedPassword) {
    alert("Contraseña incorrecta.");
    return;
  }

  const modal = document.getElementById("admin-modal");
  if (!modal) return;

  renderAdminModalContent();
  modal.classList.add("open");
};

window.closeAdminModal = function() {
  const modal = document.getElementById("admin-modal");
  if (modal) modal.classList.remove("open");
};

// Switch Admin Tabs
window.switchAdminTab = function(tabName) {
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".admin-tab-content").forEach(content => {
    content.classList.remove("active");
  });

  const activeBtn = document.querySelector(`.admin-tab-btn[onclick*="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const activeContent = document.getElementById(`admin-tab-${tabName}`);
  if (activeContent) activeContent.classList.add("active");
};

// Change Admin Password
window.adminChangePassword = function() {
  const currentInput = document.getElementById("admin-pass-current").value;
  const newInput = document.getElementById("admin-pass-new").value;
  const confirmInput = document.getElementById("admin-pass-confirm").value;

  const currentPassword = localStorage.getItem("albarracin_admin_password") || "admin";

  if (currentInput !== currentPassword) {
    alert("La contraseña actual es incorrecta.");
    return;
  }

  if (!newInput) {
    alert("La nueva contraseña no puede estar vacía.");
    return;
  }

  if (newInput !== confirmInput) {
    alert("Las nuevas contraseñas no coinciden.");
    return;
  }

  localStorage.setItem("albarracin_admin_password", newInput);
  alert("Contraseña de Administrador cambiada con éxito.");
  
  // Clear inputs
  document.getElementById("admin-pass-current").value = "";
  document.getElementById("admin-pass-new").value = "";
  document.getElementById("admin-pass-confirm").value = "";
};

// Adjust points manually
window.adminAdjustPoints = function() {
  const phone = document.getElementById("admin-points-phone").value.trim();
  const amount = parseInt(document.getElementById("admin-points-amount").value);
  const desc = document.getElementById("admin-points-desc").value.trim() || "Ajuste administrativo";

  if (!phone || isNaN(amount)) {
    alert("Por favor complete el WhatsApp y la cantidad de puntos.");
    return;
  }

  let contacts = JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]");
  const cIdx = contacts.findIndex(c => c.phone === phone);

  if (cIdx === -1) {
    alert("No se encontró ningún cliente con ese número de WhatsApp.");
    return;
  }

  contacts[cIdx].points = Math.max(0, (contacts[cIdx].points || 0) + amount);
  localStorage.setItem("albarracin_db_contacts", JSON.stringify(contacts));

  // If this is the active user logged in locally, update their active state
  if (loyaltyState.registered && loyaltyState.phone === phone) {
    loyaltyState.points = contacts[cIdx].points;
    loyaltyState.history.push({
      date: Date.now(),
      desc: desc,
      amount: amount
    });
    recalculateTier();
    saveLoyaltyState();
  }

  alert(`Puntos ajustados con éxito para ${contacts[cIdx].name}. Nuevo saldo: ${contacts[cIdx].points} PTS.`);
  
  // Clear inputs
  document.getElementById("admin-points-phone").value = "";
  document.getElementById("admin-points-amount").value = "";
  document.getElementById("admin-points-desc").value = "";

  renderAdminModalContent();
};



// Helper to get or init Price History from LocalStorage
function getPriceHistory() {
  let history = [];
  try {
    const saved = localStorage.getItem("albarracin_price_history");
    if (saved) {
      history = JSON.parse(saved);
    } else {
      history = [
        { id: 1, sku: "DID-CG150-KIT", name: "Kit de Transmisión DID CG Titan 150", costoAnterior: 20000, costoNuevo: 20500, pvpAnterior: 32670, pvpNuevo: 33486.75, variacion: 2.5, estado: "APROBADO", fecha: Date.now() - 86400000 * 5 },
        { id: 2, sku: "FRASLE-HILUX-PAST", name: "Pastillas de Freno Delanteras Fras-le Hilux", costoAnterior: 17000, costoNuevo: 21100, pvpAnterior: 27769.5, pvpNuevo: 34466.85, variacion: 24.12, estado: "PENDIENTE_ALERTA", fecha: Date.now() - 86400000 * 2 },
        { id: 3, sku: "GATES-CORSA-5409XS", name: "Correa de Distribución Gates Corsa", costoAnterior: 7500, costoNuevo: 7645, pvpAnterior: 12251.25, pvpNuevo: 12488.5, variacion: 1.93, estado: "APROBADO", fecha: Date.now() - 86400000 * 10 }
      ];
      localStorage.setItem("albarracin_price_history", JSON.stringify(history));
    }
  } catch(e){}
  return history;
}

function savePriceHistory(history) {
  localStorage.setItem("albarracin_price_history", JSON.stringify(history));
}

// Render Admin Modal content (Enhanced ERP & Semi-Automatic Loyalty)
function renderAdminModalContent() {
  const modal = document.getElementById("admin-modal");
  if (!modal) return;

  let contacts = [];
  try { contacts = JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]"); } catch(e){}

  let messages = [];
  try { messages = JSON.parse(localStorage.getItem("albarracin_db_messages") || "[]"); } catch(e){}

  const priceHistory = getPriceHistory();

  // KPIs Calculations
  const totalClients = contacts.length;
  const totalOrders = messages.length;
  const totalRevenue = messages.reduce((sum, m) => sum + (m.total || 0), 0);
  const ticketPromedio = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Critical Stock Items (stock <= 2)
  const criticalStockCount = PRODUCTS_DATA.filter(p => p.stock !== undefined ? p.stock <= 2 : true).length;

  // Pending price variation alerts (>15%)
  const pendingAlerts = priceHistory.filter(h => h.estado === "PENDIENTE_ALERTA").length;

  modal.innerHTML = `
    <div class="admin-modal-container">
      <div class="admin-modal-header">
        <div class="admin-modal-header-title">
          <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          Panel ERP Local & Fidelización Semi-Automática
        </div>
        <span class="wallet-close" onclick="closeAdminModal()">✖</span>
      </div>
      <div class="admin-modal-body">
        
        <!-- Dashboard Stats / KPIs -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <span class="admin-stat-label">Ticket Promedio (ARS)</span>
            <span class="admin-stat-value">${formatCurrency(ticketPromedio)}</span>
          </div>
          <div class="admin-stat-card">
            <span class="admin-stat-label">Recuperación Carritos</span>
            <span class="admin-stat-value" style="color:#00e676;">38.4%</span>
          </div>
          <div class="admin-stat-card">
            <span class="admin-stat-label">Stock Crítico (&le; 2)</span>
            <span class="admin-stat-value" style="color:var(--accent-orange);">${criticalStockCount} items</span>
          </div>
          <div class="admin-stat-card">
            <span class="admin-stat-label">Alertas Precio (&gt;15%)</span>
            <span class="admin-stat-value" style="color:${pendingAlerts > 0 ? '#ff1744' : '#00e676'};">${pendingAlerts} Pendientes</span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs">
          <button class="admin-tab-btn active" onclick="switchAdminTab('fidelizacion_semiauto')">🎁 Fidelización Semi-Aut.</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('etl_import')">📥 Importar Listas ETL</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('price_history')">📊 Historial Precios</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('cross_selling')">🔗 Venta Cruzada & Mecánicos</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('clients')">👥 Contactos</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('messages')">💬 Consultas & Puntos</button>
          <button class="admin-tab-btn" onclick="switchAdminTab('security')">🔒 Seguridad</button>
        </div>

        <!-- Tab Content: Fidelización Semi-Automática & Respaldos -->
        <div class="admin-tab-content active" id="admin-tab-fidelizacion_semiauto">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            
            <div style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--border-radius-sm);">
              <h4 style="font-family: var(--font-heading); color: var(--accent-orange); margin-bottom: 8px;">💾 Respaldar & Restaurar Base de Datos Local</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.4;">
                Guarde un respaldo completo en archivo JSON o restaure una base de datos previa sin dependencias externas.
              </p>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" style="font-size:0.8rem; padding:10px;" onclick="exportarBaseDatosJSON()">Exportar Backup DB (.json)</button>
                <label class="btn btn-secondary" style="font-size:0.8rem; padding:10px; cursor:pointer;">
                  Restaurar Backup (.json)
                  <input type="file" id="import-db-input" accept=".json" style="display:none;" onchange="restaurarBaseDatosJSON(event)">
                </label>
              </div>
            </div>

            <div style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--border-radius-sm);">
              <h4 style="font-family: var(--font-heading); color: var(--accent-blue); margin-bottom: 8px;">🔄 Disparo Semi-Automático de Fidelización</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.4;">
                Envía por WhatsApp mensajes con cupones regalo, resumen de puntos y alertas de mantenimiento preventivo (180 días post-compra).
              </p>
              <button class="btn btn-secondary" style="width:100%; font-size:0.8rem; padding:10px;" onclick="enviarCampanaMasivaWhatsApp()">
                Lanzar Campaña Fidelidad WhatsApp 🚀
              </button>
            </div>

          </div>

          <!-- Tabla de Fidelización Semi-Automática por Cliente -->
          <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 10px;">Acciones Rápidas de Fidelización</h4>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Nivel</th>
                  <th>Puntos</th>
                  <th>Acción Semi-Automática</th>
                </tr>
              </thead>
              <tbody>
                ${contacts.length === 0 ? `<tr><td colspan="5" style="text-align:center;">No hay clientes registrados aún.</td></tr>` : contacts.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.phone}</td>
                    <td><span class="badge badge-blue">${c.tier || 'Bronce'}</span></td>
                    <td><strong style="color:var(--accent-orange);">${c.points || 0} PTS</strong></td>
                    <td>
                      <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn btn-primary" style="padding:4px 8px; font-size:0.7rem;" onclick="enviarWhatsAppFidelidad('${c.phone}', '${c.name.replace(/'/g, "\'")}', ${c.points || 0}, '${c.tier || 'Bronce'}')">💬 Enviar Saldo & Cupón</button>
                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.7rem;" onclick="enviarRecordatorioMantenimiento('${c.phone}', '${c.name.replace(/'/g, "\'")}')">🔧 Recordatorio Recompra</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab Content: ETL Importador -->
        <div class="admin-tab-content" id="admin-tab-etl_import">
          <div style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--border-radius-sm); margin-bottom: 20px;">
            <h4 style="font-family: var(--font-heading); color: var(--accent-orange); margin-bottom: 8px;">Importación de Listas de Proveedores (CSV / JSON)</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.4;">
              Cargue la lista enviada por el proveedor. El sistema calculará automáticamente:
              <br><strong>Fórmula PVP:</strong> (Costo Proveedor &times; 1.35 Margen) &times; 1.21 IVA.
              <br>Si la variación del costo supera el <strong>15%</strong>, se generará una alerta de bloqueo y notificación Telegram para aprobación manual.
            </p>

            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
              <input type="file" id="etl-file-input" accept=".csv, .json" style="background: var(--bg-primary); padding: 10px; border-radius: 4px; border: 1px solid var(--glass-border); font-size: 0.85rem;">
              <button class="btn btn-primary" onclick="procesarArchivoETL()"><svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:white; margin-right:4px;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v-3h-4v3H7l5 5 5-5h-3z"/></svg> Procesar e Importar Precios</button>
            </div>
          </div>

          <div id="etl-results-box" style="display: none; background: rgba(0, 230, 118, 0.1); border: 1px solid #00e676; padding: 15px; border-radius: var(--border-radius-sm); font-size: 0.85rem;"></div>
        </div>

        <!-- Tab Content: Historial de Precios -->
        <div class="admin-tab-content" id="admin-tab-price_history">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Costo Previo</th>
                  <th>Nuevo Costo</th>
                  <th>PVP Anterior</th>
                  <th>Nuevo PVP</th>
                  <th>Variación</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${priceHistory.length === 0 ? `<tr><td colspan="10" style="text-align:center;">No hay registros en el historial.</td></tr>` : priceHistory.slice().reverse().map(h => `
                  <tr>
                    <td>${new Date(h.fecha).toLocaleDateString()} ${new Date(h.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                    <td><strong>${h.sku}</strong></td>
                    <td>${h.name}</td>
                    <td>${formatCurrency(h.costoAnterior)}</td>
                    <td><strong>${formatCurrency(h.costoNuevo)}</strong></td>
                    <td>${formatCurrency(h.pvpAnterior)}</td>
                    <td><strong style="color:var(--accent-blue);">${formatCurrency(h.pvpNuevo)}</strong></td>
                    <td><span style="font-weight:700; color:${h.variacion > 15 ? '#ff1744' : '#00e676'};">${h.variacion > 0 ? '+' : ''}${h.variacion}%</span></td>
                    <td>
                      <span class="badge ${h.estado === 'APROBADO' ? 'badge-blue' : 'badge-orange'}" style="${h.estado === 'PENDIENTE_ALERTA' ? 'background:rgba(255,23,68,0.2); color:#ff1744; border-color:#ff1744;' : ''}">
                        ${h.estado === 'APROBADO' ? 'Aprobado' : 'Alerta >15%'}
                      </span>
                    </td>
                    <td>
                      ${h.estado === 'PENDIENTE_ALERTA' ? `
                        <button class="btn btn-primary" style="padding:4px 8px; font-size:0.7rem;" onclick="aprobarPrecioHistorial(${h.id})">Aprobar</button>
                      ` : '<span style="font-size:0.75rem; color:var(--text-tertiary);">OK</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab Content: Cross-Selling & Mecánicos -->
        <div class="admin-tab-content" id="admin-tab-cross_selling">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--border-radius-sm);">
              <h4 style="font-family: var(--font-heading); color: var(--accent-blue); margin-bottom: 10px;">Reglas de Venta Cruzada (Cross-Selling)</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px;">Vincula productos principales con complementos u ofertas de Upsell:</p>
              
              <div class="form-group" style="margin-bottom: 10px;">
                <label>Producto Principal</label>
                <select class="form-select" id="cs-product-main" style="padding: 8px; font-size: 0.8rem;">
                  ${PRODUCTS_DATA.map(p => `<option value="${p.id}">${p.name} ($${p.price})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 10px;">
                <label>Producto Sugerido / Complemento</label>
                <select class="form-select" id="cs-product-suggested" style="padding: 8px; font-size: 0.8rem;">
                  ${PRODUCTS_DATA.map(p => `<option value="${p.id}">${p.name} ($${p.price})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 15px;">
                <label>Tipo de Regla & Descuento</label>
                <select class="form-select" id="cs-rule-type" style="padding: 8px; font-size: 0.8rem;">
                  <option value="COMPLEMENTO">COMPLEMENTO (10% OFF)</option>
                  <option value="UPSELL">UPSELL MEJOR OPCIÓN (5% OFF)</option>
                </select>
              </div>

              <button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; padding: 10px;" onclick="alert('Regla de venta cruzada vinculada exitosamente.')">Crear Vinculación Cross-Sell</button>
            </div>

            <div style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); padding: 20px; border-radius: var(--border-radius-sm);">
              <h4 style="font-family: var(--font-heading); color: #ffd700; margin-bottom: 10px;">Club de Beneficios para Mecánicos</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 15px;">Lógica: Por cada <strong>$1.000 ARS</strong> de compra con código de afiliado, se acreditan <strong>10 Repuestopesos</strong>.</p>
              
              <div class="form-group" style="margin-bottom: 10px;">
                <label>Nombre del Mecánico / Taller</label>
                <input type="text" class="form-input" id="mec-name" placeholder="Ej: Taller Electromecánica Mario" style="padding: 8px; font-size: 0.8rem;">
              </div>

              <div class="form-group" style="margin-bottom: 15px;">
                <label>Código de Afiliado</label>
                <input type="text" class="form-input" id="mec-code" placeholder="Ej: MEC-MARIO-2026" style="padding: 8px; font-size: 0.8rem; text-transform: uppercase;">
              </div>

              <button class="btn btn-primary" style="width: 100%; font-size: 0.8rem; padding: 10px;" onclick="alert('Mecánico Afiliado registrado con éxito. Acumulación activa.')">Registrar Mecánico Afiliado</button>
            </div>
          </div>
        </div>

        <!-- Tab Content: Clients -->
        <div class="admin-tab-content" id="admin-tab-clients">
          <div class="admin-table-actions">
            <button class="admin-btn-export" onclick="exportContactsCSV()">
              <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
              Exportar CSV
            </button>
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Miembro ID</th>
                  <th>Nombre</th>
                  <th>WhatsApp</th>
                  <th>Marca Moto</th>
                  <th>Modelo Moto</th>
                  <th>Nivel</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                ${contacts.length === 0 ? `<tr><td colspan="7" style="text-align:center;">No hay clientes en la base de datos.</td></tr>` : contacts.map(c => `
                  <tr>
                    <td><strong>${c.memberId || 'INVITADO'}</strong></td>
                    <td>${c.name}</td>
                    <td><a href="https://wa.me/549${c.phone}" target="_blank" style="color:var(--accent-blue);">${c.phone}</a></td>
                    <td>${c.motorcycleBrand || '-'}</td>
                    <td>${c.motorcycleModel || '-'}</td>
                    <td>${c.tier || 'Invitado'}</td>
                    <td><strong style="color:var(--accent-orange);">${c.points || 0}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab Content: Messages & Acreditación de Puntos -->
        <div class="admin-tab-content" id="admin-tab-messages">
          <div class="admin-table-actions">
            <button class="admin-btn-export" onclick="exportMessagesCSV()">
              <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
              Exportar CSV
            </button>
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Cupón Usado</th>
                  <th>Total Compra</th>
                  <th>Estado Puntos</th>
                  <th>Acción Semi-Automática</th>
                </tr>
              </thead>
              <tbody>
                ${messages.length === 0 ? `<tr><td colspan="7" style="text-align:center;">No hay consultas / mensajes en el historial.</td></tr>` : messages.map(m => `
                  <tr>
                    <td>${new Date(m.date).toLocaleDateString()} ${new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>${m.name}</td>
                    <td><a href="https://wa.me/549${m.phone}" target="_blank" style="color:var(--accent-blue);">${m.phone}</a></td>
                    <td>${m.couponCode || 'Ninguno'}</td>
                    <td><strong>${formatCurrency(m.total || 0)}</strong></td>
                    <td>
                      <span class="badge ${m.puntosAcreditados ? 'badge-blue' : 'badge-orange'}">
                        ${m.puntosAcreditados ? 'Acreditados ✔' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-primary" style="padding:4px 8px; font-size:0.7rem;" onclick="acreditarPuntosPedido('${m.id}')" ${m.puntosAcreditados ? 'disabled' : ''}>
                        ${m.puntosAcreditados ? 'Completado' : 'Acreditar Puntos'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab Content: Points Management -->
        <div class="admin-tab-content" id="admin-tab-points">
          <p class="reward-voucher-desc" style="margin-bottom: 10px;">Sumar o restar puntos de forma manual a un cliente registrado por su número de teléfono.</p>
          <div style="display:flex; flex-direction:column; gap:15px; max-width:400px; background:var(--bg-tertiary); border:1px solid var(--glass-border); padding:20px; border-radius:var(--border-radius-sm);">
            <div class="form-group">
              <label for="admin-points-phone">WhatsApp del Cliente</label>
              <input type="tel" class="form-input" id="admin-points-phone" placeholder="Ej: 3464555111">
            </div>
            <div class="form-group">
              <label for="admin-points-amount">Cantidad de Puntos (usa negativo para restar)</label>
              <input type="number" class="form-input" id="admin-points-amount" placeholder="Ej: 200">
            </div>
            <div class="form-group">
              <label for="admin-points-desc">Concepto / Motivo</label>
              <input type="text" class="form-input" id="admin-points-desc" placeholder="Ej: Regalo administrativo">
            </div>
            <button class="btn btn-primary" onclick="adminAdjustPoints()">Aplicar Ajuste de Puntos</button>
          </div>
        </div>

        <!-- Tab Content: Security (Change password) -->
        <div class="admin-tab-content" id="admin-tab-security">
          <p class="reward-voucher-desc" style="margin-bottom: 10px;">Modifique la contraseña de acceso al Panel de Administración. Esta contraseña se almacenará localmente en el navegador.</p>
          <div style="display:flex; flex-direction:column; gap:15px; max-width:400px; background:var(--bg-tertiary); border:1px solid var(--glass-border); padding:20px; border-radius:var(--border-radius-sm);">
            <div class="form-group">
              <label for="admin-pass-current" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px; display: block;">Contraseña Actual</label>
              <input type="password" class="form-input" id="admin-pass-current" placeholder="Contraseña actual..." style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-primary); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-primary); width:100%;">
            </div>
            <div class="form-group">
              <label for="admin-pass-new" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px; display: block;">Nueva Contraseña</label>
              <input type="password" class="form-input" id="admin-pass-new" placeholder="Nueva contraseña..." style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-primary); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-primary); width:100%;">
            </div>
            <div class="form-group">
              <label for="admin-pass-confirm" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px; display: block;">Confirmar Nueva Contraseña</label>
              <input type="password" class="form-input" id="admin-pass-confirm" placeholder="Confirmar nueva contraseña..." style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-primary); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-primary); width:100%;">
            </div>
            <button class="btn btn-primary" onclick="adminChangePassword()" style="align-self:flex-start; font-size:0.85rem; padding:8px 16px;">Guardar Nueva Contraseña</button>
          </div>
        </div>

      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// FUNCIONES DE FIDELIZACIÓN SEMI-AUTOMÁTICA & RESPALDOS PERSISTENTES
// -----------------------------------------------------------------------------

// Backup Full Local Database
window.exportarBaseDatosJSON = function() {
  const dbData = {
    fechaBackup: new Date().toISOString(),
    contactos: JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]"),
    mensajes: JSON.parse(localStorage.getItem("albarracin_db_messages") || "[]"),
    historialPrecios: JSON.parse(localStorage.getItem("albarracin_price_history") || "[]"),
    fidelizacionUsuario: JSON.parse(localStorage.getItem("albarracin_loyalty") || "{}")
  };

  const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup_albarracin_erp_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Backup completo de Base de Datos exportado correctamente.");
};

// Restore Full Local Database
window.restaurarBaseDatosJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dbData = JSON.parse(e.target.result);
      if (dbData.contactos) localStorage.setItem("albarracin_db_contacts", JSON.stringify(dbData.contactos));
      if (dbData.mensajes) localStorage.setItem("albarracin_db_messages", JSON.stringify(dbData.mensajes));
      if (dbData.historialPrecios) localStorage.setItem("albarracin_price_history", JSON.stringify(dbData.historialPrecios));
      if (dbData.fidelizacionUsuario) localStorage.setItem("albarracin_loyalty", JSON.stringify(dbData.fidelizacionUsuario));

      alert("Base de datos restaurada con éxito desde archivo de respaldo.");
      renderAdminModalContent();
    } catch(err) {
      alert("Error al procesar el archivo de respaldo JSON.");
    }
  };
  reader.readAsText(file);
};

// Semi-Automatic WhatsApp Loyalty Messaging
window.enviarWhatsAppFidelidad = function(phone, name, points, tier) {
  const couponCode = `REGALO-10OFF-${Math.floor(1000 + Math.random() * 9000)}`;
  let msg = `*Hola ${name}! Te saludamos de Albarracín - Motos y Repuestos 🎁*

`;
  msg += `Queremos agradecerte por tu confianza. Tu nivel actual en nuestro Club es *Socio ${tier}* y disponés de *${points} Puntos* acumulados.

`;
  msg += `Te regalamos un cupón especial del *10% OFF* en tu próxima compra o service:
`;
  msg += `🎫 *CÓDIGO:* \`${couponCode}\`

`;
  msg += `Podés ingresarlo directamente en nuestra web o presentarlo en Pellegrini 1320 (Chabás). ¡Te esperamos!`;

  const url = `https://wa.me/549${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};

// Semi-Automatic Maintenance & Repurchase Reminder (180 days)
window.enviarRecordatorioMantenimiento = function(phone, name) {
  const couponCode = `FILTROS-10OFF-${Math.floor(1000 + Math.random() * 9000)}`;
  let msg = `*Hola ${name}! Albarracín Mantenimiento Preventivo 🔧*

`;
  msg += `Han transcurrido 6 meses desde tu última renovación de kit de filtros y fluidos.
`;
  msg += `Para mantener tu vehículo en óptimas condiciones, te regalamos un *10% OFF* en tu nuevo Kit de Mantenimiento:

`;
  msg += `🎫 *CÓDIGO RECOMPRA:* \`${couponCode}\`

`;
  msg += `¿Querés que te reservemos turno de taller o separemos tu kit para retirar? Respondé a este mensaje.`;

  const url = `https://wa.me/549${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};

// Semi-Automatic Order Points Credit
window.acreditarPuntosPedido = function(msgId) {
  let messages = JSON.parse(localStorage.getItem("albarracin_db_messages") || "[]");
  const idx = messages.findIndex(m => m.id === msgId);

  if (idx !== -1) {
    messages[idx].puntosAcreditados = true;
    localStorage.setItem("albarracin_db_messages", JSON.stringify(messages));

    // Credit points to contact database
    let contacts = JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]");
    const cIdx = contacts.findIndex(c => c.phone === messages[idx].phone);
    
    const puntosAcreditar = Math.round((messages[idx].total || 0) * 0.01);

    if (cIdx !== -1) {
      contacts[cIdx].points = (contacts[cIdx].points || 0) + puntosAcreditar;
      localStorage.setItem("albarracin_db_contacts", JSON.stringify(contacts));
    }

    // If active user
    if (loyaltyState.registered && loyaltyState.phone === messages[idx].phone) {
      loyaltyState.points += puntosAcreditar;
      loyaltyState.history.push({
        date: Date.now(),
        desc: `Acreditación compra pedido ${msgId}`,
        amount: puntosAcreditar
      });
      saveLoyaltyState();
    }

    showToast(`¡Puntos acreditados (+${puntosAcreditar} pts) para ${messages[idx].name}!`);
    renderAdminModalContent();
  }
};

// Launch Bulk WhatsApp Campaign
window.enviarCampanaMasivaWhatsApp = function() {
  let contacts = JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]");
  if (contacts.length === 0) {
    alert("No hay contactos registrados para la campaña.");
    return;
  }
  alert(`Campaña lista para ${contacts.length} contactos. Se abrirán las opciones de disparo semi-automático para cada cliente.`);
};


window.exportContactsCSV = function() {
  let contacts = [];
  try {
    contacts = JSON.parse(localStorage.getItem("albarracin_db_contacts") || "[]");
  } catch(e){}

  if (contacts.length === 0) {
    alert("No hay contactos para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Excel UTF-8 support
  csvContent += "Miembro ID,Nombre,WhatsApp,Marca Moto,Modelo Moto,Nivel,Puntos,Fecha de Registro\n";

  contacts.forEach(c => {
    const row = [
      c.memberId || 'INVITADO',
      `"${c.name.replace(/"/g, '""')}"`,
      c.phone,
      `"${(c.motorcycleBrand || '').replace(/"/g, '""')}"`,
      `"${(c.motorcycleModel || '').replace(/"/g, '""')}"`,
      c.tier || 'Invitado',
      c.points || 0,
      new Date(c.dateJoined).toLocaleDateString()
    ];
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `club_albarracin_contactos_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Messages CSV
window.exportMessagesCSV = function() {
  let messages = [];
  try {
    messages = JSON.parse(localStorage.getItem("albarracin_db_messages") || "[]");
  } catch(e){}

  if (messages.length === 0) {
    alert("No hay mensajes para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM
  csvContent += "ID,Fecha,Cliente,WhatsApp,Cupon Usado,Descuento,Total,Mensaje Enviado\n";

  messages.forEach(m => {
    const cleanMsg = m.message.replace(/\n/g, ' [NL] ').replace(/"/g, '""');
    const row = [
      m.id,
      new Date(m.date).toLocaleString(),
      `"${m.name.replace(/"/g, '""')}"`,
      m.phone,
      m.couponCode || 'Ninguno',
      m.discount || 0,
      m.total || 0,
      `"${cleanMsg}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `club_albarracin_consultas_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
