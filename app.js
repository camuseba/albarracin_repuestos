// ==========================================
// VEHICLE MODELS DATABASE MAP
// ==========================================
const VEHICLE_MODELS_MAP = {
  Honda: ["CG Titan 150", "XR 250 Tornado"],
  Yamaha: ["YZF-R3"],
  Motomel: ["Blitz 110"],
  Corven: ["Triax 150"],
  Toyota: ["Hilux"],
  Volkswagen: ["Gol Trend", "Voyage", "Fox"],
  Chevrolet: ["Corsa", "Classic"]
};

// ==========================================
// LOCAL DATABASE: REALISTIC INVENTORY WITH COMPATIBILITIES
// ==========================================
const PRODUCTS_DATA = [
  // MOTOS Y VEHÍCULOS
  {
    id: 1,
    sku: "ACARA-HONDA-TORNADO",
    name: "Honda XR 250 Tornado 0km",
    category: "motos",
    subcategory: "motos",
    price: 9996916,
    cost: 6120000,
    brand: "Honda",
    img: "assets/moto_honda_xr.jpg",
    desc: "Moto de enduro legendaria, ideal para ciudad y terrenos mixtos. Arranque eléctrico, motor 249cc DOHC y caja de 6 velocidades. Disponibilidad inmediata en concesionaria.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 4,
    specs: {
      "Año": "2026",
      "Motor": "249cc DOHC Monocilíndrico",
      "Potencia": "23 HP a 7500 RPM",
      "Frenos": "Disco delantero hidráulico, tambor trasero",
      "Transmisión": "6 marchas manual"
    },
    promo: true,
    oldPrice: 10800000,
    compatibilities: [
      { brand: "Honda", model: "XR 250 Tornado", yearStart: 2010, yearEnd: 2026 }
    ],
  },
  {
    id: 2,
    sku: "ACARA-YAMAHA-R3",
    name: "Yamaha YZF-R3 ABS Usada (2022)",
    category: "motos",
    subcategory: "motos",
    price: 12292226,
    cost: 7520000,
    brand: "Yamaha",
    img: "assets/moto_yamaha_r3.jpg",
    desc: "Deportiva en impecable estado general, único dueño. Services al día en concesionaria oficial. Cubiertas nuevas y frenos ABS.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 2,
    specs: {
      "Año": "2022",
      "Kilometraje": "14.200 km",
      "Motor": "321cc bicilíndrico DOHC",
      "Refrigeración": "Líquida",
      "Frenos": "Discos con ABS delanteros y traseros"
    },
    promo: false,
    compatibilities: [
      { brand: "Yamaha", model: "YZF-R3", yearStart: 2015, yearEnd: 2026 }
    ],
  },
  {
    id: 3,
    sku: "ACARA-MOTOMEL-BLITZ",
    name: "Motomel Blitz 110 V8 0km",
    category: "motos",
    subcategory: "motos",
    price: 1690000,
    cost: 1030000,
    brand: "Motomel",
    img: "assets/moto_motomel_blitz.jpg",
    desc: "La motocicleta CUB más vendida del país. Ideal para traslados diarios y trabajo urbano por su consumo sumamente bajo y agilidad.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 10,
    specs: {
      "Año": "2026",
      "Motor": "110cc monocilíndrico de 4 tiempos",
      "Transmisión": "Semiautomática de 4 velocidades",
      "Capacidad Tanque": "3.8 Litros",
      "Consumo promedio": "2.1 L / 100 km"
    },
    promo: true,
    oldPrice: 1850000,
    compatibilities: [
      { brand: "Motomel", model: "Blitz 110", yearStart: 2012, yearEnd: 2026 }
    ],
  },

  // INYECCIÓN ELECTRÓNICA & SENSORES
  {
    id: 4,
    sku: "INJ-70014",
    name: "Módulo Bomba de Combustible 70014 VW Gol / Fox / Suran 1.6",
    category: "repuestos",
    subcategory: "autos",
    price: 84500,
    cost: 51770,
    brand: "Inyección",
    img: "assets/fispa_bomba_combustible.jpg",
    desc: "Módulo completo de bomba de combustible para inyección electrónica de alta presión (4.2 Bar). Fabricación bajo especificaciones OEM.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 14,
    specs: {
      "Marca": "Inyección",
      "Código de Pieza": "70014",
      "Presión de Trabajo": "4.2 Bar",
      "Caudal": "110 L/h",
      "Compatibilidad": "VW Gol Trend / Voyage / Fox / Suran 1.6 8V"
    },
    promo: true,
    oldPrice: 96000,
    compatibilities: [
      { brand: "Volkswagen", model: "Gol Trend", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Voyage", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Fox", yearStart: 2005, yearEnd: 2026 }
    ],
  },
  {
    id: 5,
    sku: "INJ-20045",
    name: "Bobina de Encendido 20045 Chevrolet Corsa / Classic / Agile 1.4",
    category: "repuestos",
    subcategory: "autos",
    price: 48200,
    cost: 29530,
    brand: "Encendido",
    img: "assets/fispa_bobina_encendido.jpg",
    desc: "Bobina de encendido directo de 4 pines. Proporciona una chispa constante de alta energía optimizando el consumo de combustible.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 18,
    specs: {
      "Marca": "Encendido",
      "Código de Pieza": "20045",
      "Conector": "4 Pines",
      "Compatibilidad": "Chevrolet Corsa / Classic / Agile / Celta 1.4 8V"
    },
    promo: false,
    compatibilities: [
      { brand: "Chevrolet", model: "Corsa", yearStart: 1996, yearEnd: 2016 },
      { brand: "Chevrolet", model: "Classic", yearStart: 2010, yearEnd: 2016 }
    ],
  },
  {
    id: 6,
    sku: "INJ-103001",
    name: "Sensor MAP Presión Colector 103001 Fiat / Chevrolet / Ford",
    category: "repuestos",
    subcategory: "autos",
    price: 26800,
    cost: 16425,
    brand: "Sensores",
    img: "assets/fispa_sensor_map.jpg",
    desc: "Sensor absoluto de presión en múltiple de admisión. Medición de alta precisión de mezcla de aire para ecu de motor.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 22,
    specs: {
      "Marca": "Sensores",
      "Código de Pieza": "103001",
      "Rango de lectura": "10 - 115 kPa",
      "Compatibilidad": "VW Gol / Fiat Palio / Siena / Corsa 1.4"
    },
    promo: false,
    compatibilities: [
      { brand: "Volkswagen", model: "Gol Trend", yearStart: 2008, yearEnd: 2020 },
      { brand: "Chevrolet", model: "Corsa", yearStart: 1996, yearEnd: 2016 }
    ],
  },
  {
    id: 7,
    sku: "INJ-104012",
    name: "Sensor CKP Posición Cigüeñal 104012 Ford Ecosport / Fiesta 1.6",
    category: "repuestos",
    subcategory: "autos",
    price: 31400,
    cost: 19245,
    brand: "Sensores",
    img: "assets/fispa_sensor_ckp.jpg",
    desc: "Sensor inductivo de posición de RPM y cigüeñal. Garantiza la sincronización perfecta de inyección y chispas.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 10,
    specs: {
      "Marca": "Sensores",
      "Código de Pieza": "104012",
      "Compatibilidad": "Ford Ecosport / Fiesta / Focus 1.6 Sigma 16V"
    },
    promo: false,
    compatibilities: [
      { brand: "Ford", model: "Fiesta", yearStart: 2005, yearEnd: 2020 }
    ],
  },

  // DISTRIBUCIÓN & FRENO
  {
    id: 8,
    sku: "AUTOCENTRAL-DIST-GATES",
    name: "Kit de Distribución Gates + Tensor Litens VW Gol Trend / Voyage 1.6 8V",
    category: "repuestos",
    subcategory: "autos",
    price: 65800,
    cost: 40300,
    brand: "Gates",
    img: "assets/kit_distribucion_gates.jpg",
    desc: "Kit completo de distribución incluye correa dentada de HNBR reforzada y polea tensora automotriz de alta resolución térmica.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 12,
    specs: {
      "Marca": "Gates / Litens OEM",
      "Código Gates": "KS-101",
      "Garantía": "60.000 Km",
      "Compatibilidad": "Gol Trend / Voyage / Fox / Suran 1.6 8V"
    },
    promo: true,
    oldPrice: 74000,
    compatibilities: [
      { brand: "Volkswagen", model: "Gol Trend", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Voyage", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Fox", yearStart: 2005, yearEnd: 2026 }
    ],
  },
  {
    id: 9,
    sku: "AUTOCENTRAL-PAST-BOSCH",
    name: "Juego de Pastillas de Freno Delanteras Bosch Chevrolet Corsa / Classic",
    category: "repuestos",
    subcategory: "autos",
    price: 38900,
    cost: 23835,
    brand: "Bosch",
    img: "assets/repuesto_pastillas_bosch.jpg",
    desc: "Pastillas de freno de compuesto cerámico de bajo polvo y respuesta de frenado inmediata. No rayan el disco.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 15,
    specs: {
      "Marca": "Bosch",
      "Posición": "Delantera",
      "Compatibilidad": "Chevrolet Corsa 1.4 / 1.6, Classic, Fun, Celta"
    },
    promo: false,
    compatibilities: [
      { brand: "Chevrolet", model: "Corsa", yearStart: 1996, yearEnd: 2016 },
      { brand: "Chevrolet", model: "Classic", yearStart: 2010, yearEnd: 2016 }
    ],
  },
  {
    id: 10,
    sku: "AUTOCENTRAL-NGK-IRIDIUM",
    name: "Bujías de Encendido NGK Iridium IX (Set x4) Honda / Toyota",
    category: "repuestos",
    subcategory: "autos",
    price: 34500,
    cost: 21140,
    brand: "NGK",
    img: "assets/bujias_ngk_iridium.jpg",
    desc: "Bujías de alto rendimiento con electrodo de Iridio. Mejoran la aceleración, el encendido en frío y ahorran combustible.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 25,
    specs: {
      "Marca": "NGK Japan",
      "Modelo": "CR9EIX / BKR6EIX",
      "Durabilidad": "100.000 Km"
    },
    promo: false,
    compatibilities: [
      { brand: "Honda", model: "CG Titan 150", yearStart: 2005, yearEnd: 2026 },
      { brand: "Toyota", model: "Hilux", yearStart: 2005, yearEnd: 2015 }
    ],
  },

  // EMBRAGUES, SUSPENSIÓN & MECÁNICA
  {
    id: 11,
    sku: "ALMA-EMB-SACHS",
    name: "Kit de Embrague Completo Sachs 190mm VW Gol / Voyage / Fox 1.6",
    category: "repuestos",
    subcategory: "autos",
    price: 185000,
    cost: 113260,
    brand: "Sachs",
    img: "assets/kit_embrague_sachs.jpg",
    desc: "Kit de embrague original Sachs que incluye placa de presión, disco con forro amortiguado y rulemán de empuje de alta durabilidad.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 8,
    specs: {
      "Marca": "ZF Sachs",
      "Diámetro": "190 mm",
      "Estrías": "28 estrías",
      "Compatibilidad": "VW Gol Trend / Voyage / Fox / Suran 1.6 8V"
    },
    promo: true,
    oldPrice: 205000,
    compatibilities: [
      { brand: "Volkswagen", model: "Gol Trend", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Voyage", yearStart: 2008, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Fox", yearStart: 2005, yearEnd: 2026 }
    ],
  },
  {
    id: 12,
    sku: "ALMA-DISCOS-CORVEN",
    name: "Juego de Discos de Freno Ventilados Corven Toyota Hilux 2.5 / 3.0",
    category: "repuestos",
    subcategory: "pickups",
    price: 92400,
    cost: 56600,
    brand: "Corven",
    img: "assets/repuesto_discos_corven.jpg",
    desc: "Par de discos de freno delanteros ventilados construidos en aleación de fundición gris de alta disipación térmica para piccups.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 10,
    specs: {
      "Marca": "Corven Hi-Tech",
      "Posición": "Delanteros (Par)",
      "Tipo": "Ventilado",
      "Compatibilidad": "Toyota Hilux 4x2 / 4x4 (2005 a 2015)"
    },
    promo: false,
    compatibilities: [
      { brand: "Toyota", model: "Hilux", yearStart: 2005, yearEnd: 2015 }
    ],
  },
  {
    id: 13,
    sku: "ALMA-BOMBA-DOLZ",
    name: "Bomba de Agua VMC / Dolz Chevrolet Corsa / Classic 1.4 / 1.6",
    category: "repuestos",
    subcategory: "autos",
    price: 32600,
    cost: 19960,
    brand: "Dolz",
    img: "assets/bomba_agua_dolz_corsa.jpg",
    desc: "Bomba de agua de refrigeración del motor con turbina de aluminio fundido y sello mecánico carbón-cerámica.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 14,
    specs: {
      "Marca": "Dolz España",
      "Turbina": "Aluminio fundido 19 dientes",
      "Compatibilidad": "Chevrolet Corsa / Classic / Fun 1.4 / 1.6 8V"
    },
    promo: false,
    compatibilities: [
      { brand: "Chevrolet", model: "Corsa", yearStart: 1996, yearEnd: 2016 },
      { brand: "Chevrolet", model: "Classic", yearStart: 2010, yearEnd: 2016 }
    ],
  },

  // ACCESORIOS, MOTOS Y EQUIPAMIENTO VIGIA / VIESA / BATERÍAS
  {
    id: 14,
    sku: "DID-CG150-KIT",
    name: "Kit de Transmisión DID CG Titan 150",
    category: "repuestos",
    subcategory: "motos",
    price: 32000,
    cost: 19600,
    brand: "DID",
    img: "assets/kit_distribucion_gates.jpg",
    desc: "Kit de transmisión de la más alta calidad compuesto por cadena reforzada, corona y piñón de acero térmico tratada.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 20,
    specs: {
      "Origen": "Japón",
      "Cadena": "428H x 118L",
      "Corona": "43 dientes reforzados",
      "Piñón": "16 dientes"
    },
    promo: true,
    oldPrice: 38000,
    compatibilities: [
      { brand: "Honda", model: "CG Titan 150", yearStart: 2005, yearEnd: 2026 }
    ],
  },
  {
    id: 15,
    sku: "FRASLE-HILUX-PAST",
    name: "Pastillas de Freno Delanteras Fras-le Hilux",
    category: "repuestos",
    subcategory: "pickups",
    price: 34500,
    cost: 21100,
    brand: "Fras-le",
    img: "assets/repuesto_pastillas_frasle.jpg",
    desc: "Pastillas de freno delanteras libres de asbesto. Garantizan frenado seguro para pickups y carga pesada.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 12,
    specs: {
      "Posición": "Delantera",
      "Material": "Semimetálico Premium",
      "Origen": "Brasil"
    },
    promo: false,
    compatibilities: [
      { brand: "Toyota", model: "Hilux", yearStart: 2005, yearEnd: 2015 }
    ],
  },
  {
    id: 16,
    sku: "PIRELLI-SUPER-CITY",
    name: "Cubierta Pirelli Super City 2.75-18",
    category: "repuestos",
    subcategory: "motos",
    price: 42000,
    cost: 25700,
    brand: "Pirelli",
    img: "assets/repuesto_cubierta_pirelli.jpg",
    desc: "Neumático diseñado para motocicletas urbanas. Excelente agarre en piso mojado y gran kilometraje.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 15,
    specs: {
      "Medidas": "2.75-18",
      "Índice": "42P (150 kg / 150 km/h)"
    },
    promo: false,
    compatibilities: [
      { brand: "Honda", model: "CG Titan 150", yearStart: 2005, yearEnd: 2026 },
      { brand: "Motomel", model: "Blitz 110", yearStart: 2010, yearEnd: 2026 }
    ],
  },
  {
    id: 17,
    sku: "VIESA-INTELLIGENT",
    name: "Climatizador Ecológico VIESA Intelligent v11",
    category: "vigia-viesa",
    subcategory: "camiones",
    price: 780000,
    cost: 477800,
    brand: "Viesa",
    img: "assets/service_viesa.jpg",
    desc: "Climatizador ecológico por evaporación de agua. Funciona a 12V/24V con el motor apagado sin consumir combustible.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 5,
    specs: {
      "Voltaje": "12V y 24V",
      "Consumo de agua": "0.5 a 1.5 L/h",
      "Instalación": "Servicio Oficial Albarracín Incluido"
    },
    promo: true,
    oldPrice: 850000,
    compatibilities: [], // Universal
  },
  {
    id: 18,
    sku: "VIGIA-500",
    name: "Protector de Motor VIGIA 500 Calibrador Interno",
    category: "vigia-viesa",
    subcategory: "camiones",
    price: 490000,
    cost: 300000,
    brand: "Vigia",
    img: "assets/equip_vigia_protector.jpg",
    desc: "Monitoreo permanente de presión de aceite y temperatura del motor. Evita fundidas graves con corte automático.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 6,
    specs: {
      "Modelo": "Vigia Serie 500",
      "Sensores": "Temperatura de agua / Presión de aceite",
      "Instalación": "Taller Oficial Homologado"
    },
    promo: false,
    compatibilities: [], // Universal
  },
  {
    id: 19,
    sku: "MOURA-M26AD",
    name: "Batería Moura 12V 75Ah M26AD",
    category: "electricidad-alarmas",
    subcategory: "autos",
    price: 165000,
    cost: 101000,
    brand: "Moura",
    img: "assets/bateria_moura_75.jpg",
    desc: "Batería de aleación Plata-Calcio libre de mantenimiento. Máxima potencia de arranque en frío para autos y pick-ups.",
    channelStatus: "Disponible en Showroom",
    mlLink: "https://listado.mercadolibre.com.ar/_CustId_3530277724",
    stock: 10,
    specs: {
      "Capacidad": "75 Ah (C20)",
      "Voltaje": "12 Volts",
      "CCA": "620 A"
    },
    promo: false,
    compatibilities: [
      { brand: "Toyota", model: "Hilux", yearStart: 2005, yearEnd: 2026 },
      { brand: "Volkswagen", model: "Gol Trend", yearStart: 2008, yearEnd: 2026 }
    ],
  }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  cart: [],
  filters: {
    category: "todos",
    vehicle: "todos",
    priceMin: null,
    priceMax: null,
    brand: "todas",
    search: "",
    // Compatibility Checker state
    compBrand: "",
    compModel: "",
    compYear: ""
  },
  sorting: "relevancia",
  theme: "dark"
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartFromStorage();
  initNavScroll();
  initRevealAnimations();
  initCategoryCards();
  
  // Render Filters sidebar dynamic brands
  renderBrandFilters();

  // Render Catalog
  renderCatalog();

  // Bind UI Events
  bindUIEvents();
  
  // Init Compatibility Dropdowns
  initCompatibilityWidget();
});

// ==========================================
// THEME MANAGER
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem("albarracin-theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  
  state.theme = savedTheme || systemTheme;
  document.documentElement.setAttribute("data-theme", state.theme);
  
  updateThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("albarracin-theme", state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const sunIcon = document.querySelector(".sun-icon");
  const moonIcon = document.querySelector(".moon-icon");
  
  if (state.theme === "dark") {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}

// ==========================================
// SCROLL & REVEAL ANIMATIONS
// ==========================================
function initNavScroll() {
  const header = document.getElementById("main-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    let currentSectionId = "";
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      const secHeight = sec.clientHeight;
      if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
        currentSectionId = sec.getAttribute("id");
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });

  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    mobileToggle.classList.toggle("active");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      mobileToggle.classList.remove("active");
    });
  });
}

function initRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

function initCategoryCards() {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category");
      setCatalogCategory(category);
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ==========================================
// COMPATIBILITY WIDGET MOTOR (INTEGRACIÓN RELACIONAL REAL)
// ==========================================
function initCompatibilityWidget() {
  if (window.COMPATIBILITY_ENGINE && typeof window.COMPATIBILITY_ENGINE.init === "function") {
    window.COMPATIBILITY_ENGINE.init();
  }
}


// ==========================================
// BRAND FILTERS RENDERER
// ==========================================
function renderBrandFilters() {
  const brandListContainer = document.getElementById("brand-filter-list");
  const brands = ["todas", ...new Set(PRODUCTS_DATA.map(p => p.brand))];
  
  let html = "";
  brands.forEach(brand => {
    const isSelected = state.filters.brand === brand;
    const label = brand === "todas" ? "Todas las marcas" : brand;
    
    html += `
      <li class="filter-item ${isSelected ? 'active' : ''}" data-brand="${brand}">
        <div class="filter-checkbox"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></div>
        ${label}
      </li>
    `;
  });
  
  brandListContainer.innerHTML = html;
  
  const brandItems = brandListContainer.querySelectorAll(".filter-item");
  brandItems.forEach(item => {
    item.addEventListener("click", () => {
      brandItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      state.filters.brand = item.getAttribute("data-brand");
      renderCatalog();
    });
  });
}

// ==========================================
// CATALOG ENGINE (FILTER, SEARCH, SORT)
// ==========================================
function renderCatalog() {
  const gridContainer = document.getElementById("products-grid-container");
  const noResults = document.getElementById("catalog-no-results");
  
  // Filter products
  let filtered = PRODUCTS_DATA.filter(product => {
    // Category match
    if (state.filters.category !== "todos" && product.category !== state.filters.category) {
      return false;
    }
    
    // Vehicle type (subcategory) match
    if (state.filters.vehicle !== "todos" && product.subcategory !== state.filters.vehicle) {
      return false;
    }
    
    // Brand match
    if (state.filters.brand !== "todas" && product.brand !== state.filters.brand) {
      return false;
    }
    
    // Min Price
    if (state.filters.priceMin !== null && product.price < state.filters.priceMin) {
      return false;
    }
    
    // Max Price
    if (state.filters.priceMax !== null && product.price > state.filters.priceMax) {
      return false;
    }
    
    // Text search
    if (state.filters.search.trim() !== "") {
      const q = state.filters.search.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.desc.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchBrand) {
        return false;
      }
    }

    // REAL RELATIONAL VEHICLE COMPATIBILITY FILTER
    if (window.COMPATIBILITY_ENGINE && window.COMPATIBILITY_ENGINE.activeVehicleFilter) {
      const compatibleSkus = window.COMPATIBILITY_ENGINE.getCompatibleSKUs();
      if (compatibleSkus !== null) {
        const isExactMatch = compatibleSkus.includes(product.sku);
        if (!isExactMatch) {
          // Si no es coincidencia exacta, chequear si es un accesorio universal
          if (product.compatibilityType === "UNIVERSAL" || (!product.compatibilities || product.compatibilities.length === 0)) {
            const makeObj = window.COMPATIBILITY_ENGINE.db?.vehicle_makes?.find(m => m.id === window.COMPATIBILITY_ENGINE.activeVehicleFilter.makeId);
            const isMoto = makeObj && makeObj.vehicle_type_id === 1;
            if (product.subcategory === "motos" && !isMoto) return false;
            if ((product.subcategory === "autos" || product.subcategory === "pickups") && isMoto) return false;
          } else {
            return false;
          }
        }
      }
    }
    
    return true;
  });

  // Sort products
  if (state.sorting === "precio-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sorting === "precio-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sorting === "nombre-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => {
      if (a.promo && !b.promo) return -1;
      if (!a.promo && b.promo) return 1;
      return b.price - a.price;
    });
  }

  if (filtered.length === 0) {
    gridContainer.style.display = "none";
    noResults.style.display = "block";
    const noResultsTitle = document.querySelector(".no-results-title");
    const noResultsDesc = document.querySelector(".no-results-desc");
    if (noResultsTitle && noResultsDesc) {
      if (window.COMPATIBILITY_ENGINE && window.COMPATIBILITY_ENGINE.activeVehicleFilter) {
        noResultsTitle.textContent = "No hay compatibilidad verificada para este vehículo";
        noResultsDesc.textContent = `No se encontraron repuestos con verificación técnica para ${window.COMPATIBILITY_ENGINE.activeVehicleFilter.displayName}. Podés consultarnos directamente por WhatsApp con el número de chasis o pieza.`;
      } else {
        noResultsTitle.textContent = "No encontramos resultados";
        noResultsDesc.textContent = "Probá ajustando los filtros de búsqueda o restableciendo los valores seleccionados.";
      }
    }
    return;
  } else {
    gridContainer.style.display = "grid";
    noResults.style.display = "none";
  }

  let html = "";
  filtered.forEach(product => {
    const formattedPrice = formatCurrency(product.price);
    const oldPriceHtml = product.oldPrice ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>` : "";
    const promoBadge = product.promo ? `<span class="product-badge-promo">Oferta</span>` : "";
    const statusText = product.channelStatus || "Disponible en Showroom";
    const statusBg = statusText === "Publicado en MercadoLibre" ? "background:#ffe600; color:#2d3277;" : "background:#00e676; color:#0a0b0e;";
    const catalogBadge = `<span class="product-badge-official" style="${statusBg} font-weight:800;">${statusText}</span>`;
    const categoryBadge = product.category === 'motos' ? 'Moto' : product.category === 'vigia-viesa' ? 'Vigia/Viesa' : product.category === 'repuestos' ? 'Repuesto' : 'Accesorios';
    const stockCount = product.stock || 5;
    const mlUrl = product.mlLink || "https://listado.mercadolibre.com.ar/_CustId_3530277724";

          const isMLAvailable = product.channelStatus === "Publicado en MercadoLibre";
          const mlPurchaseBoxHtml = isMLAvailable ? `
            <div class="product-ml-purchase-box">
              <a href="${mlUrl}" target="_blank" rel="noopener noreferrer" class="ml-btn-link" onclick="event.stopPropagation();">
                <svg viewBox="0 0 24 24" class="ml-icon"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-6.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.8-6.9-1.73-1.02-3.8 6.9H8.1L7 6.27l-.03-.02-1-2.1H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
                Comprar en MercadoLibre ↗
              </a>
            </div>
          ` : `
            <div class="product-ml-purchase-box">
              <a href="https://wa.me/5493464685338?text=${encodeURIComponent('Hola Albarracín, consulto por disponibilidad en Showroom de: ' + product.name)}" target="_blank" rel="noopener noreferrer" class="ml-btn-link" style="background:#00e676; color:#0a0b0e; font-weight:800;" onclick="event.stopPropagation();">
                <svg viewBox="0 0 24 24" class="ml-icon" style="fill:#0a0b0e;"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.9 5.86L2.5 22l4.31-1.37C8.4 21.46 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
                Consultar en Showroom / WhatsApp 💬
              </a>
            </div>
          `;

    html += `
      <article class="product-card glass-panel reveal active" data-id="${product.id}">
        <div class="product-img-wrapper" onclick="openProductDetail(${product.id})">
          <img class="product-img" src="${product.img}" alt="${product.name}" loading="eager" onerror="this.onerror=null; this.src='assets/banner_main.jpg';">
          <div class="product-badges">
            ${promoBadge}
            ${catalogBadge}
            <span class="badge" style="background: rgba(30,35,56,0.9); color: #ffffff; font-weight: 800; border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(4px);">🏷️ ${product.brand}</span>
            <span class="badge badge-blue">${categoryBadge}</span>
          </div>
          <button class="product-like-btn" onclick="event.stopPropagation(); toggleLike(${product.id})" aria-label="Agregar a favoritos">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
        <div class="product-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="product-cat">${product.brand}</span>
            <span class="stock-badge">📦 Stock: <b>${stockCount} u.</b></span>
          </div>
          ${(function() {
            if (window.COMPATIBILITY_ENGINE && window.COMPATIBILITY_ENGINE.activeVehicleFilter) {
              const compatibleSkus = window.COMPATIBILITY_ENGINE.getCompatibleSKUs();
              if (compatibleSkus && compatibleSkus.includes(product.sku)) {
                return `
                  <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; color: #10b981; font-size: 0.72rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: #10b981; flex-shrink: 0;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    <span>Compatible con: <strong>${window.COMPATIBILITY_ENGINE.activeVehicleFilter.displayName}</strong></span>
                  </div>
                `;
              }
            }
            return '';
          })()}
          <h3 class="product-title" onclick="openProductDetail(${product.id})">${product.name}</h3>
          <p class="product-desc">${product.desc}</p>

          ${mlPurchaseBoxHtml}

          <div class="product-footer">
            <div class="product-price-box">
              ${oldPriceHtml}
              <span class="product-price">${formattedPrice}</span>
            </div>
            <button class="product-add-cart-btn" onclick="addToCart(${product.id})" aria-label="Añadir al carrito">
              <svg viewBox="0 0 24 24"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-6.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.8-6.9-1.73-1.02-3.8 6.9H8.1L7 6.27l-.03-.02-1-2.1H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  });
  
  gridContainer.innerHTML = html;
}

function setCatalogCategory(category) {
  state.filters.category = category;
  
  const sidebarItems = document.querySelectorAll("#category-filter-list .filter-item");
  sidebarItems.forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-value") === category) {
      item.classList.add("active");
    }
  });

  const vehicleSec = document.getElementById("vehicle-filter-section");
  if (category === "repuestos" || category === "todos") {
    vehicleSec.style.display = "block";
  } else {
    vehicleSec.style.display = "none";
    state.filters.vehicle = "todos";
    document.querySelectorAll("#vehicle-filter-list .filter-item").forEach(i => {
      i.classList.remove("active");
      if (i.getAttribute("data-vehicle") === "todos") i.classList.add("active");
    });
  }
  
  renderCatalog();
}

// Export setting category for footer links
window.catalogApp = {
  setCategory: (category) => {
    setCatalogCategory(category);
    setTimeout(() => {
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
};

// ==========================================
// CART FUNCTIONALITIES & CALCULATIONS
// ==========================================
function loadCartFromStorage() {
  const saved = localStorage.getItem("albarracin-cart");
  if (saved) {
    try {
      state.cart = JSON.parse(saved);
    } catch (e) {
      state.cart = [];
    }
  }
  updateCartUI();
}

function saveCartToStorage() {
  localStorage.setItem("albarracin-cart", JSON.stringify(state.cart));
  updateCartUI();
}

function addToCart(productId, qty = 1) {
  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (product) {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: qty
      });
    }
  }
  saveCartToStorage();
  
  const badge = document.getElementById("cart-counter");
  badge.style.transform = "scale(1.3)";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 300);

  openCartDrawer();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
  }
  saveCartToStorage();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCartToStorage();
}

function updateCartUI() {
  const counter = document.getElementById("cart-counter");
  const cartList = document.getElementById("cart-items-list");
  const summaryBox = document.getElementById("cart-summary-box");
  
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  counter.textContent = totalItems;
  
  if (state.cart.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty-state">
        <svg class="cart-empty-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
        <h3 class="cart-empty-title">Tu carrito está vacío</h3>
        <p class="cart-empty-desc">Explora el catálogo y añade repuestos o accesorios para verlos aquí.</p>
      </div>
    `;
    summaryBox.style.display = "none";
    return;
  }
  
  summaryBox.style.display = "flex";
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById("cart-subtotal-price").textContent = formatCurrency(subtotal);
  document.getElementById("cart-total-price").textContent = formatCurrency(subtotal);
  
  let html = "";
  state.cart.forEach(item => {
    html += `
      <div class="cart-item">
        <div class="cart-item-img-wrapper">
          <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100/12141c/f5f6f9?text=Repuesto'">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-details">
            <span class="cart-item-price">${formatCurrency(item.price)}</span>
            <div class="cart-qty-control">
              <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, -1)">
                <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
              </button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
            </div>
            <button class="cart-item-remove-btn" onclick="removeFromCart(${item.id})" aria-label="Eliminar item">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  cartList.innerHTML = html;
}

function openCartDrawer() {
  document.getElementById("cart-drawer-panel").classList.add("open");
  document.getElementById("cart-drawer-overlay").classList.add("open");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer-panel").classList.remove("open");
  document.getElementById("cart-drawer-overlay").classList.remove("open");
}

// ==========================================
// MODAL: PRODUCT DETAIL VIEW WITH ML & COMPATIBILITY
// ==========================================
function openProductDetail(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.getElementById("product-detail-modal");
  const modalContent = document.getElementById("modal-product-detail-content");
  
  const formattedPrice = formatCurrency(product.price);
  const oldPriceHtml = product.oldPrice ? `<span class="detail-old-price">${formatCurrency(product.oldPrice)}</span>` : "";
  
  // Checking active compatibility to display validation badge in modal
  let compatibilityBadgeHtml = "";
  if (state.filters.compBrand !== "") {
    let matches = false;
    if (!product.compatibilities || product.compatibilities.length === 0) {
      matches = true; // Universal products are compatible
    } else {
      matches = product.compatibilities.some(c => {
        if (c.brand !== state.filters.compBrand) return false;
        if (state.filters.compModel !== "" && c.model !== state.filters.compModel) return false;
        if (state.filters.compYear !== "") {
          const y = parseInt(state.filters.compYear);
          if (y < c.yearStart || y > c.yearEnd) return false;
        }
        return true;
      });
    }

    if (matches) {
      compatibilityBadgeHtml = `
        <div style="background: rgba(0, 230, 118, 0.12); border: 1px solid #00e676; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #00e676; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; font-weight: 600;">
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          Compatible con tu ${state.filters.compBrand} ${state.filters.compModel} ${state.filters.compYear ? `(${state.filters.compYear})` : ""}
        </div>
      `;
    }
  }

  // Render specs table
  let specsHtml = "";
  for (const [key, value] of Object.entries(product.specs)) {
    specsHtml += `
      <tr>
        <td class="detail-specs-label">${key}</td>
        <td class="detail-specs-val">${value}</td>
      </tr>
    `;
  }
  
  const tableContent = specsHtml !== "" ? `
    <table class="detail-specs-table">
      <tbody>${specsHtml}</tbody>
    </table>
  ` : "";
  
  const mlUrl = product.mlLink || "https://listado.mercadolibre.com.ar/_CustId_3530277724";
  const statusText = product.channelStatus || "Disponible en Showroom";
  const stockCount = product.stock || 5;

  modalContent.innerHTML = `
    <div class="detail-img-box">
      <img class="detail-img" src="${product.img}" alt="${product.name}" loading="eager" onerror="this.onerror=null; this.src='assets/banner_main.jpg';">
    </div>
    <div class="detail-info-box">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="detail-cat">${product.brand}</span>
          <span class="stock-badge" style="font-size: 0.8rem;">📦 Stock Disponible: <b>${stockCount} u.</b></span>
        </div>
        <h2 class="detail-title">${product.name}</h2>
        <div style="margin: 6px 0 10px 0;">
          <span class="official-catalog-tag" style="background: rgba(255, 230, 0, 0.15); border-color: #ffe600; color: var(--text-primary); font-weight: 700;">
            📍 <strong>Disponibilidad:</strong> ${statusText}
          </span>
        </div>
        <div class="detail-price-box">
          ${oldPriceHtml}
          <span class="detail-price">${formattedPrice}</span>
        </div>
      </div>
      
      ${compatibilityBadgeHtml}
      
      <p class="detail-desc">${product.desc}</p>
      
      ${tableContent}
      
      ${isMLAvailable ? `
        <div style="background: linear-gradient(135deg, rgba(255, 230, 0, 0.15), rgba(45, 50, 119, 0.08)); border: 1.5px solid #ffe600; padding: 16px; border-radius: 10px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="background: #ffe600; color: #2d3277; font-weight: 900; padding: 4px 10px; border-radius: 4px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(255, 230, 0, 0.4);">
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #2d3277;"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-6.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.8-6.9-1.73-1.02-3.8 6.9H8.1L7 6.27l-.03-.02-1-2.1H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
              TIENDA OFICIAL MERCADOLIBRE
            </span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">CustId: 3530277724</span>
          </div>
          <p style="font-size: 0.83rem; color: var(--text-primary); margin-bottom: 12px; line-height: 1.4;">
            ✅ <strong>Producto Publicado con Stock Vivo:</strong> Envíos a todo el país y financiamiento en cuotas.
          </p>
          <a href="${mlUrl}" target="_blank" rel="noopener noreferrer" class="ml-btn-link" style="height: 44px; font-size: 0.9rem; font-weight: 800; text-decoration: none; border-radius: 6px;">
            <svg viewBox="0 0 24 24" class="ml-icon" style="width: 20px; height: 20px;"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-6.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.8-6.9-1.73-1.02-3.8 6.9H8.1L7 6.27l-.03-.02-1-2.1H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
            Comprar en MercadoLibre ↗
          </a>
        </div>
      ` : `
        <div style="background: rgba(0, 230, 118, 0.08); border: 1.5px solid #00e676; padding: 16px; border-radius: 10px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
            <span style="background: #00e676; color: #0a0b0e; font-weight: 900; padding: 4px 10px; border-radius: 4px; font-size: 0.78rem;">
              DISPONIBLE EN SHOWROOM / LOCAL
            </span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">Chabás, Santa Fe</span>
          </div>
          <p style="font-size: 0.83rem; color: var(--text-primary); margin-bottom: 12px; line-height: 1.4;">
            🏬 <strong>Venta Directa sin Comisión:</strong> Retirá o coordiná la instalación directamente en Pellegrini 1320.
          </p>
          <a href="https://wa.me/5493464685338?text=${encodeURIComponent('Hola Albarracín, consulto por disponibilidad en Showroom de: ' + product.name)}" target="_blank" rel="noopener noreferrer" class="ml-btn-link" style="background:#00e676; color:#0a0b0e; height: 44px; font-size: 0.9rem; font-weight: 800; text-decoration: none; border-radius: 6px;">
            <svg viewBox="0 0 24 24" class="ml-icon" style="width: 20px; height: 20px; fill:#0a0b0e;"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.9 5.86L2.5 22l4.31-1.37C8.4 21.46 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
            Consultar por WhatsApp / Showroom 💬
          </a>
        </div>
      `}

        <div class="detail-qty" style="height: 48px;">
          <button class="detail-qty-btn" id="modal-qty-minus">
            <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
          </button>
          <span class="detail-qty-val" id="modal-qty-val">1</span>
          <button class="detail-qty-btn" id="modal-qty-plus">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>

        <button class="btn btn-primary detail-add-btn" id="modal-add-to-cart-btn" style="height: 48px;">
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-6.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.8-6.9-1.73-1.02-3.8 6.9H8.1L7 6.27l-.03-.02-1-2.1H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
          Encargar por WhatsApp
        </button>
      </div>
    </div>
  `;
  
  let currentQty = 1;
  const qtyVal = document.getElementById("modal-qty-val");
  
  document.getElementById("modal-qty-minus").addEventListener("click", () => {
    if (currentQty > 1) {
      currentQty--;
      qtyVal.textContent = currentQty;
    }
  });
  
  document.getElementById("modal-qty-plus").addEventListener("click", () => {
    currentQty++;
    qtyVal.textContent = currentQty;
  });
  
  document.getElementById("modal-add-to-cart-btn").addEventListener("click", () => {
    addToCart(product.id, currentQty);
    closeProductDetailModal();
  });
  
  modal.classList.add("open");
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").classList.remove("open");
}

function toggleLike(productId) {
  let favs = JSON.parse(localStorage.getItem("albarracin-favs") || "[]");
  if (favs.includes(productId)) {
    favs = favs.filter(id => id !== productId);
  } else {
    favs.push(productId);
  }
  localStorage.setItem("albarracin-favs", JSON.stringify(favs));
  
  const p = PRODUCTS_DATA.find(p => p.id === productId);
  showToast(favs.includes(productId) ? `Añadido a favoritos: ${p.name}` : `Quitado de favoritos: ${p.name}`);
}

// ==========================================
// FORM CHECKOUT & BOOKING (WHATSAPP INTEGRATION)
// ==========================================
function handleCartCheckout() {
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
  msg += `*Detalle del Pedido:*\n`;
  
  let total = 0;
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    msg += `• ${item.quantity}x ${item.name} (${formatCurrency(item.price)} c/u) = *${formatCurrency(itemTotal)}*\n`;
  });
  
  msg += `\n*Total Estimado:* ${formatCurrency(total)}\n\n`;
  msg += `Quedo a la espera de su confirmación para coordinar el retiro/envío. ¡Gracias!`;
  
  const whatsappUrl = `https://wa.me/5493464685338?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");
}

function handleWorkshopBooking(event) {
  event.preventDefault();
  
  const name = document.getElementById("booking-name").value.trim();
  const phone = document.getElementById("booking-phone").value.trim();
  const vehicle = document.getElementById("booking-vehicle").value;
  const service = document.getElementById("booking-service").value;
  const notes = document.getElementById("booking-notes").value.trim();
  
  const vehiclesMap = {
    moto: "Motocicleta",
    auto: "Automóvil",
    pickup: "Pick-up / 4x4",
    camion: "Camión / Acoplado",
    agricola: "Maquinaria Agrícola"
  };
  
  const servicesMap = {
    "vigia-motor": "Instalación/Service Vigia Protector de Motor",
    "vigia-neumaticos": "Instalación/Service Calibrador Neumáticos",
    "viesa-climatizador": "Instalación/Service Climatizador Viesa",
    "taller-electricidad": "Electricidad en General / Baterías",
    "alarma-cierre": "Instalación de Alarma / Cierre Centralizado",
    "otro": "Otro Diagnóstico / Consulta"
  };
  
  let msg = `*Hola Albarracín! Quisiera solicitar un turno para el Taller:*\n\n`;
  msg += `*Cliente:* ${name}\n`;
  msg += `*WhatsApp:* ${phone}\n`;
  msg += `*Vehículo:* ${vehiclesMap[vehicle] || vehicle}\n`;
  msg += `*Servicio:* ${servicesMap[service] || service}\n`;
  
  if (notes !== "") {
    msg += `\n*Detalles del Vehículo y Consulta:*\n_${notes}_\n`;
  }
  
  msg += `\nQuedo a la espera de la confirmación de fecha y hora disponible. ¡Muchas gracias!`;
  
  const whatsappUrl = `https://wa.me/5493464685338?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");
}

// ==========================================
// UI EVENT BINDINGS
// ==========================================
function bindUIEvents() {
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("cart-trigger-btn").addEventListener("click", openCartDrawer);
  document.getElementById("cart-close-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);
  
  const categoryItems = document.querySelectorAll("#category-filter-list .filter-item");
  categoryItems.forEach(item => {
    item.addEventListener("click", () => {
      categoryItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const val = item.getAttribute("data-value");
      setCatalogCategory(val);
    });
  });

  const vehicleItems = document.querySelectorAll("#vehicle-filter-list .filter-item");
  vehicleItems.forEach(item => {
    item.addEventListener("click", () => {
      vehicleItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      state.filters.vehicle = item.getAttribute("data-vehicle");
      renderCatalog();
    });
  });

  const priceMinInput = document.getElementById("price-min");
  const priceMaxInput = document.getElementById("price-max");
  
  const handlePriceChange = () => {
    const minVal = parseFloat(priceMinInput.value);
    const maxVal = parseFloat(priceMaxInput.value);
    
    state.filters.priceMin = !isNaN(minVal) ? minVal : null;
    state.filters.priceMax = !isNaN(maxVal) ? maxVal : null;
    renderCatalog();
  };
  
  priceMinInput.addEventListener("input", handlePriceChange);
  priceMaxInput.addEventListener("input", handlePriceChange);
  
  const searchBar = document.getElementById("catalog-search");
  searchBar.addEventListener("input", () => {
    state.filters.search = searchBar.value;
    renderCatalog();
  });

  const sortSelect = document.getElementById("catalog-sort");
  sortSelect.addEventListener("change", () => {
    state.sorting = sortSelect.value;
    renderCatalog();
  });

  document.getElementById("modal-close-btn").addEventListener("click", closeProductDetailModal);
  document.getElementById("modal-backdrop-btn").addEventListener("click", closeProductDetailModal);
  document.getElementById("cart-checkout-btn").addEventListener("click", handleCartCheckout);
  document.getElementById("booking-form-element").addEventListener("submit", handleWorkshopBooking);

  const openFiltersBtn = document.getElementById("open-filters-btn");
  const closeFiltersBtn = document.getElementById("close-filters-btn");
  const catalogAside = document.getElementById("catalog-aside");
  const filtersOverlay = document.getElementById("filters-overlay");

  if (openFiltersBtn && catalogAside && filtersOverlay) {
    openFiltersBtn.addEventListener("click", () => {
      catalogAside.classList.add("open");
      filtersOverlay.classList.add("open");
    });
  }

  if (closeFiltersBtn && catalogAside && filtersOverlay) {
    closeFiltersBtn.addEventListener("click", () => {
      catalogAside.classList.remove("open");
      filtersOverlay.classList.remove("open");
    });
  }

  if (filtersOverlay && catalogAside) {
    filtersOverlay.addEventListener("click", () => {
      catalogAside.classList.remove("open");
      filtersOverlay.classList.remove("open");
    });
  }
}

// ==========================================
// HELPERS
// ==========================================
function formatCurrency(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "glass-panel";
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%) translateY(100px)";
  toast.style.padding = "12px 24px";
  toast.style.zIndex = "1300";
  toast.style.color = "var(--text-primary)";
  toast.style.border = "1px solid var(--accent-orange)";
  toast.style.boxShadow = "var(--neon-orange-shadow)";
  toast.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  toast.style.fontSize = "0.95rem";
  toast.style.fontWeight = "600";
  toast.style.textAlign = "center";
  toast.style.backdropFilter = "blur(12px)";
  toast.style.borderRadius = "var(--border-radius-sm)";
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
  }, 100);
  
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(100px)";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}
