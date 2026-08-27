/**
 * =============================================================================
 * MOTOR DE COMPATIBILIDAD VEHICULAR REAL & LOOKUP POR PATENTE
 * Albarracín Motos y Repuestos (Chabás, Santa Fe)
 * =============================================================================
 */

(function () {
  "use strict";

  // Base de datos relacional integrada en memoria (Autónoma y resiliente a file:// y http://)
  const RELATIONAL_DB = {
  "vehicle_types": [
    {
      "id": 1,
      "name": "Motos",
      "slug": "motos"
    },
    {
      "id": 2,
      "name": "Autos",
      "slug": "autos"
    },
    {
      "id": 3,
      "name": "Pick-ups y 4x4",
      "slug": "pickups"
    },
    {
      "id": 4,
      "name": "Camiones y Acoplados",
      "slug": "camiones"
    }
  ],
  "vehicle_makes": [
    {
      "id": 1,
      "vehicle_type_id": 1,
      "name": "Honda",
      "slug": "honda",
      "country": "Japón",
      "is_active": true
    },
    {
      "id": 2,
      "vehicle_type_id": 1,
      "name": "Yamaha",
      "slug": "yamaha",
      "country": "Japón",
      "is_active": true
    },
    {
      "id": 3,
      "vehicle_type_id": 1,
      "name": "Motomel",
      "slug": "motomel",
      "country": "Argentina",
      "is_active": true
    },
    {
      "id": 4,
      "vehicle_type_id": 1,
      "name": "Corven",
      "slug": "corven",
      "country": "Argentina",
      "is_active": true
    },
    {
      "id": 5,
      "vehicle_type_id": 2,
      "name": "Volkswagen",
      "slug": "volkswagen",
      "country": "Alemania",
      "is_active": true
    },
    {
      "id": 6,
      "vehicle_type_id": 2,
      "name": "Chevrolet",
      "slug": "chevrolet",
      "country": "EEUU",
      "is_active": true
    },
    {
      "id": 7,
      "vehicle_type_id": 2,
      "name": "Ford",
      "slug": "ford",
      "country": "EEUU",
      "is_active": true
    },
    {
      "id": 8,
      "vehicle_type_id": 2,
      "name": "Fiat",
      "slug": "fiat",
      "country": "Italia",
      "is_active": true
    },
    {
      "id": 9,
      "vehicle_type_id": 3,
      "name": "Toyota",
      "slug": "toyota",
      "country": "Japón",
      "is_active": true
    },
    {
      "id": 10,
      "vehicle_type_id": 2,
      "name": "Renault",
      "slug": "renault",
      "country": "Internacional",
      "is_active": true
    },
    {
      "id": 11,
      "vehicle_type_id": 2,
      "name": "Peugeot",
      "slug": "peugeot",
      "country": "Internacional",
      "is_active": true
    }
  ],
  "vehicle_models": [
    {
      "id": 1,
      "vehicle_make_id": 1,
      "name": "CG Titan",
      "slug": "cg-titan",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 2,
      "vehicle_make_id": 1,
      "name": "XR Tornado",
      "slug": "xr-tornado",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 3,
      "vehicle_make_id": 2,
      "name": "YZF-R3",
      "slug": "yzf-r3",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 4,
      "vehicle_make_id": 3,
      "name": "Blitz",
      "slug": "blitz",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 5,
      "vehicle_make_id": 4,
      "name": "Triax",
      "slug": "triax",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 6,
      "vehicle_make_id": 5,
      "name": "Gol Trend",
      "slug": "gol-trend",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 7,
      "vehicle_make_id": 5,
      "name": "Voyage",
      "slug": "voyage",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 8,
      "vehicle_make_id": 5,
      "name": "Fox",
      "slug": "fox",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 9,
      "vehicle_make_id": 5,
      "name": "Suran",
      "slug": "suran",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 10,
      "vehicle_make_id": 6,
      "name": "Corsa",
      "slug": "corsa",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 11,
      "vehicle_make_id": 6,
      "name": "Classic",
      "slug": "classic",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 12,
      "vehicle_make_id": 6,
      "name": "Agile",
      "slug": "agile",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 13,
      "vehicle_make_id": 7,
      "name": "Ecosport",
      "slug": "ecosport",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 14,
      "vehicle_make_id": 7,
      "name": "Fiesta",
      "slug": "fiesta",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 15,
      "vehicle_make_id": 9,
      "name": "Hilux",
      "slug": "hilux",
      "vehicle_type_id": 3,
      "is_active": true
    },
    {
      "id": 16,
      "vehicle_make_id": 8,
      "name": "Palio",
      "slug": "palio",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 17,
      "vehicle_make_id": 8,
      "name": "Siena",
      "slug": "siena",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 18,
      "vehicle_make_id": 8,
      "name": "Uno",
      "slug": "uno",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 19,
      "vehicle_make_id": 6,
      "name": "Onix",
      "slug": "onix",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 20,
      "vehicle_make_id": 6,
      "name": "Prisma",
      "slug": "prisma",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 21,
      "vehicle_make_id": 8,
      "name": "Cronos",
      "slug": "cronos",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 22,
      "vehicle_make_id": 6,
      "name": "Cruze",
      "slug": "cruze",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 23,
      "vehicle_make_id": 6,
      "name": "Tracker",
      "slug": "tracker",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 24,
      "vehicle_make_id": 8,
      "name": "Pulse",
      "slug": "pulse",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 25,
      "vehicle_make_id": 8,
      "name": "Strada",
      "slug": "strada",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 26,
      "vehicle_make_id": 8,
      "name": "Toro",
      "slug": "toro",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 27,
      "vehicle_make_id": 5,
      "name": "Amarok",
      "slug": "amarok",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 28,
      "vehicle_make_id": 5,
      "name": "Polo",
      "slug": "polo",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 29,
      "vehicle_make_id": 5,
      "name": "Taos",
      "slug": "taos",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 30,
      "vehicle_make_id": 9,
      "name": "Corolla",
      "slug": "corolla",
      "vehicle_type_id": 3,
      "is_active": true
    },
    {
      "id": 31,
      "vehicle_make_id": 9,
      "name": "Yaris",
      "slug": "yaris",
      "vehicle_type_id": 3,
      "is_active": true
    },
    {
      "id": 32,
      "vehicle_make_id": 9,
      "name": "Etios",
      "slug": "etios",
      "vehicle_type_id": 3,
      "is_active": true
    },
    {
      "id": 33,
      "vehicle_make_id": 7,
      "name": "Ranger",
      "slug": "ranger",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 34,
      "vehicle_make_id": 7,
      "name": "Focus",
      "slug": "focus",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 35,
      "vehicle_make_id": 10,
      "name": "Kangoo",
      "slug": "kangoo",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 36,
      "vehicle_make_id": 10,
      "name": "Sandero",
      "slug": "sandero",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 37,
      "vehicle_make_id": 11,
      "name": "208",
      "slug": "208",
      "vehicle_type_id": 2,
      "is_active": true
    },
    {
      "id": 38,
      "vehicle_make_id": 1,
      "name": "Wave",
      "slug": "wave",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 39,
      "vehicle_make_id": 1,
      "name": "Xr",
      "slug": "xr",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 40,
      "vehicle_make_id": 1,
      "name": "Cb",
      "slug": "cb",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 41,
      "vehicle_make_id": 2,
      "name": "Fz",
      "slug": "fz",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 42,
      "vehicle_make_id": 2,
      "name": "Ybr",
      "slug": "ybr",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 43,
      "vehicle_make_id": 3,
      "name": "Skua",
      "slug": "skua",
      "vehicle_type_id": 1,
      "is_active": true
    },
    {
      "id": 44,
      "vehicle_make_id": 4,
      "name": "Energy",
      "slug": "energy",
      "vehicle_type_id": 1,
      "is_active": true
    }
  ],
  "vehicle_versions": [
    {
      "id": 1,
      "vehicle_model_id": 1,
      "name": "150 ESD / KS / ESDI",
      "year_from": 2004,
      "year_to": 2016,
      "engine_code": "OHC-149",
      "engine_displacement": "149.2 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 2,
      "vehicle_model_id": 2,
      "name": "250 DOHC",
      "year_from": 2001,
      "year_to": 2026,
      "engine_code": "DOHC-249",
      "engine_displacement": "249 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 6v"
    },
    {
      "id": 3,
      "vehicle_model_id": 3,
      "name": "321cc ABS",
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "DOHC-321",
      "engine_displacement": "321 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 6v"
    },
    {
      "id": 4,
      "vehicle_model_id": 4,
      "name": "110 V8 / B1",
      "year_from": 2010,
      "year_to": 2026,
      "engine_code": "110-CUB",
      "engine_displacement": "108 cc",
      "fuel_type": "Nafta",
      "transmission": "Semiautomática 4v"
    },
    {
      "id": 5,
      "vehicle_model_id": 5,
      "name": "150 R3 / TX",
      "year_from": 2012,
      "year_to": 2026,
      "engine_code": "OHV-149",
      "engine_displacement": "149 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 6,
      "vehicle_model_id": 6,
      "name": "1.6 8V MSI / VHT",
      "year_from": 2008,
      "year_to": 2024,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 7,
      "vehicle_model_id": 7,
      "name": "1.6 8V MSI / VHT",
      "year_from": 2008,
      "year_to": 2024,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 8,
      "vehicle_model_id": 8,
      "name": "1.6 8V VHT",
      "year_from": 2004,
      "year_to": 2022,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 9,
      "vehicle_model_id": 9,
      "name": "1.6 8V VHT",
      "year_from": 2006,
      "year_to": 2020,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 10,
      "vehicle_model_id": 10,
      "name": "1.4 8V Econoflex / 1.6 MPFI",
      "year_from": 1994,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 11,
      "vehicle_model_id": 11,
      "name": "1.4 8V Econoflex",
      "year_from": 2010,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 12,
      "vehicle_model_id": 12,
      "name": "1.4 8V Econoflex",
      "year_from": 2009,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 13,
      "vehicle_model_id": 13,
      "name": "1.6 16V Sigma / Duratec",
      "year_from": 2003,
      "year_to": 2020,
      "engine_code": "SIGMA-16",
      "engine_displacement": "1596 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 14,
      "vehicle_model_id": 14,
      "name": "1.6 16V Sigma",
      "year_from": 2010,
      "year_to": 2020,
      "engine_code": "SIGMA-16",
      "engine_displacement": "1596 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 15,
      "vehicle_model_id": 15,
      "name": "2.5 D-4D Turbo Diesel (2KD-FTV)",
      "year_from": 2005,
      "year_to": 2015,
      "engine_code": "2KD-FTV",
      "engine_displacement": "2494 cc",
      "fuel_type": "Diesel",
      "transmission": "Manual 5v 4x2/4x4"
    },
    {
      "id": 16,
      "vehicle_model_id": 15,
      "name": "3.0 D-4D Turbo Intercooler (1KD-FTV)",
      "year_from": 2005,
      "year_to": 2015,
      "engine_code": "1KD-FTV",
      "engine_displacement": "2982 cc",
      "fuel_type": "Diesel",
      "transmission": "Manual/Automática 4x4"
    },
    {
      "id": 17,
      "vehicle_model_id": 16,
      "name": "1.4 8V Fire / Fire Top / Attractive",
      "year_from": 2004,
      "year_to": 2018,
      "engine_code": "FIRE-1.4",
      "engine_displacement": "1368 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 18,
      "vehicle_model_id": 16,
      "name": "1.6 16V E.torQ",
      "year_from": 2011,
      "year_to": 2018,
      "engine_code": "ETORQ-1.6",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 19,
      "vehicle_model_id": 19,
      "name": "1.2 / 1.4 LT / LTZ / Joy",
      "year_from": 2012,
      "year_to": 2026,
      "engine_code": "SPE-4",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta",
      "transmission": "Manual 5v"
    },
    {
      "id": 20,
      "vehicle_model_id": 19,
      "name": "1.4 LT 5P MANUAL 2015-2025",
      "year_from": 2015,
      "year_to": 2025,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 21,
      "vehicle_model_id": 19,
      "name": "1.0T PREMIER AT 2020-2026",
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-10",
      "engine_displacement": "1.0",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 22,
      "vehicle_model_id": 22,
      "name": "1.4T LT / LTZ 2016-2024",
      "year_from": 2016,
      "year_to": 2024,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 23,
      "vehicle_model_id": 23,
      "name": "1.2T TURBO AT 2020-2026",
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-12",
      "engine_displacement": "1.2",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 24,
      "vehicle_model_id": 21,
      "name": "1.3 8V GSE DRIVE / PRECISION 2018-2026",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-138V",
      "engine_displacement": "1.3 8V",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 25,
      "vehicle_model_id": 24,
      "name": "1.3 GSE DRIVE 2022-2026",
      "year_from": 2022,
      "year_to": 2026,
      "engine_code": "ACARA-13",
      "engine_displacement": "1.3 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 26,
      "vehicle_model_id": 25,
      "name": "1.3 VOLCANO CD 2020-2026",
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-13",
      "engine_displacement": "1.3 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 27,
      "vehicle_model_id": 26,
      "name": "2.0 16V MULTIJET 4X4 2016-2025",
      "year_from": 2016,
      "year_to": 2025,
      "engine_code": "ACARA-2016V",
      "engine_displacement": "2.0 16V",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 28,
      "vehicle_model_id": 27,
      "name": "2.0 TDI HIGHLINE 4X4 2010-2026",
      "year_from": 2010,
      "year_to": 2026,
      "engine_code": "ACARA-20TDI",
      "engine_displacement": "2.0 TDI",
      "fuel_type": "Diesel",
      "transmission": "Manual"
    },
    {
      "id": 29,
      "vehicle_model_id": 28,
      "name": "1.6 MSI TRACK / COMFORTLINE 2018-2026",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-16MSI",
      "engine_displacement": "1.6 MSI",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 30,
      "vehicle_model_id": 29,
      "name": "1.4 250 TSI 2021-2026",
      "year_from": 2021,
      "year_to": 2026,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 31,
      "vehicle_model_id": 30,
      "name": "2.0 SEG CVT 2020-2026",
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 32,
      "vehicle_model_id": 31,
      "name": "1.5 XLS 5P 2018-2026",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-15",
      "engine_displacement": "1.5 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 33,
      "vehicle_model_id": 32,
      "name": "1.5 X / XLS 2013-2024",
      "year_from": 2013,
      "year_to": 2024,
      "engine_code": "ACARA-15",
      "engine_displacement": "1.5 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 34,
      "vehicle_model_id": 33,
      "name": "2.0 BI-TURBO 4X4 2023-2026",
      "year_from": 2023,
      "year_to": 2026,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 35,
      "vehicle_model_id": 34,
      "name": "2.0 SE PLUS 2014-2020",
      "year_from": 2014,
      "year_to": 2020,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 36,
      "vehicle_model_id": 35,
      "name": "II 1.6 SCE EXPRESS 2018-2026",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-16",
      "engine_displacement": "1.6 ",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 37,
      "vehicle_model_id": 36,
      "name": "1.6 16V LIFE / INTENS 2015-2026",
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "ACARA-1616V",
      "engine_displacement": "1.6 16V",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 38,
      "vehicle_model_id": 37,
      "name": "1.6 16V ALLURE / FELINE 2020-2026",
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-1616V",
      "engine_displacement": "1.6 16V",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 39,
      "vehicle_model_id": 38,
      "name": "110 S 2018-2026 110 CC",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-110CC",
      "engine_displacement": "110 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 40,
      "vehicle_model_id": 39,
      "name": "150 L 2015-2026 150 CC",
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "ACARA-150CC",
      "engine_displacement": "150 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 41,
      "vehicle_model_id": 40,
      "name": "300 F TWISTER 2023-2026 300 CC",
      "year_from": 2023,
      "year_to": 2026,
      "engine_code": "ACARA-300CC",
      "engine_displacement": "300 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 42,
      "vehicle_model_id": 41,
      "name": "25 2018-2026 250 CC",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-250CC",
      "engine_displacement": "250 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 43,
      "vehicle_model_id": 42,
      "name": "125 Z 2017-2026 125 CC",
      "year_from": 2017,
      "year_to": 2026,
      "engine_code": "ACARA-125CC",
      "engine_displacement": "125 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 44,
      "vehicle_model_id": 43,
      "name": "150 V6 2018-2026 150 CC",
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-150CC",
      "engine_displacement": "150 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    },
    {
      "id": 45,
      "vehicle_model_id": 44,
      "name": "110 R2 2019-2026 110 CC",
      "year_from": 2019,
      "year_to": 2026,
      "engine_code": "ACARA-110CC",
      "engine_displacement": "110 CC",
      "fuel_type": "Nafta",
      "transmission": "Manual"
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "vehicle_type_id": 1,
      "make_id": 1,
      "model_id": 1,
      "version_id": 1,
      "year_from": 2004,
      "year_to": 2016,
      "engine_code": "OHC-149",
      "engine_displacement": "149 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 2,
      "vehicle_type_id": 1,
      "make_id": 1,
      "model_id": 2,
      "version_id": 2,
      "year_from": 2001,
      "year_to": 2026,
      "engine_code": "DOHC-249",
      "engine_displacement": "249 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 3,
      "vehicle_type_id": 1,
      "make_id": 2,
      "model_id": 3,
      "version_id": 3,
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "DOHC-321",
      "engine_displacement": "321 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 4,
      "vehicle_type_id": 1,
      "make_id": 3,
      "model_id": 4,
      "version_id": 4,
      "year_from": 2010,
      "year_to": 2026,
      "engine_code": "110-CUB",
      "engine_displacement": "108 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 5,
      "vehicle_type_id": 1,
      "make_id": 4,
      "model_id": 5,
      "version_id": 5,
      "year_from": 2012,
      "year_to": 2026,
      "engine_code": "OHV-149",
      "engine_displacement": "149 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 6,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 6,
      "version_id": 6,
      "year_from": 2008,
      "year_to": 2024,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 7,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 7,
      "version_id": 7,
      "year_from": 2008,
      "year_to": 2024,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 8,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 8,
      "version_id": 8,
      "year_from": 2004,
      "year_to": 2022,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 9,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 9,
      "version_id": 9,
      "year_from": 2006,
      "year_to": 2020,
      "engine_code": "EA111",
      "engine_displacement": "1598 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 10,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 10,
      "version_id": 10,
      "year_from": 1994,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 11,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 11,
      "version_id": 11,
      "year_from": 2010,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 12,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 12,
      "version_id": 12,
      "year_from": 2009,
      "year_to": 2016,
      "engine_code": "GM-FAM1",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 13,
      "vehicle_type_id": 2,
      "make_id": 7,
      "model_id": 13,
      "version_id": 13,
      "year_from": 2003,
      "year_to": 2020,
      "engine_code": "SIGMA-16",
      "engine_displacement": "1596 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 14,
      "vehicle_type_id": 2,
      "make_id": 7,
      "model_id": 14,
      "version_id": 14,
      "year_from": 2010,
      "year_to": 2020,
      "engine_code": "SIGMA-16",
      "engine_displacement": "1596 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 15,
      "vehicle_type_id": 3,
      "make_id": 9,
      "model_id": 15,
      "version_id": 15,
      "year_from": 2005,
      "year_to": 2015,
      "engine_code": "2KD-FTV",
      "engine_displacement": "2494 cc",
      "fuel_type": "Diesel"
    },
    {
      "id": 16,
      "vehicle_type_id": 3,
      "make_id": 9,
      "model_id": 15,
      "version_id": 16,
      "year_from": 2005,
      "year_to": 2015,
      "engine_code": "1KD-FTV",
      "engine_displacement": "2982 cc",
      "fuel_type": "Diesel"
    },
    {
      "id": 17,
      "vehicle_type_id": 2,
      "make_id": 8,
      "model_id": 16,
      "version_id": 17,
      "year_from": 2004,
      "year_to": 2018,
      "engine_code": "FIRE-1.4",
      "engine_displacement": "1368 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 18,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 19,
      "version_id": 19,
      "year_from": 2012,
      "year_to": 2026,
      "engine_code": "SPE-4",
      "engine_displacement": "1389 cc",
      "fuel_type": "Nafta"
    },
    {
      "id": 19,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 19,
      "version_id": 20,
      "year_from": 2015,
      "year_to": 2025,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 20,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 19,
      "version_id": 21,
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-10",
      "engine_displacement": "1.0",
      "fuel_type": "Nafta"
    },
    {
      "id": 21,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 22,
      "version_id": 22,
      "year_from": 2016,
      "year_to": 2024,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4",
      "fuel_type": "Nafta"
    },
    {
      "id": 22,
      "vehicle_type_id": 2,
      "make_id": 6,
      "model_id": 23,
      "version_id": 23,
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-12",
      "engine_displacement": "1.2",
      "fuel_type": "Nafta"
    },
    {
      "id": 23,
      "vehicle_type_id": 2,
      "make_id": 8,
      "model_id": 21,
      "version_id": 24,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-138V",
      "engine_displacement": "1.3 8V",
      "fuel_type": "Nafta"
    },
    {
      "id": 24,
      "vehicle_type_id": 2,
      "make_id": 8,
      "model_id": 24,
      "version_id": 25,
      "year_from": 2022,
      "year_to": 2026,
      "engine_code": "ACARA-13",
      "engine_displacement": "1.3 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 25,
      "vehicle_type_id": 2,
      "make_id": 8,
      "model_id": 25,
      "version_id": 26,
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-13",
      "engine_displacement": "1.3 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 26,
      "vehicle_type_id": 2,
      "make_id": 8,
      "model_id": 26,
      "version_id": 27,
      "year_from": 2016,
      "year_to": 2025,
      "engine_code": "ACARA-2016V",
      "engine_displacement": "2.0 16V",
      "fuel_type": "Nafta"
    },
    {
      "id": 27,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 27,
      "version_id": 28,
      "year_from": 2010,
      "year_to": 2026,
      "engine_code": "ACARA-20TDI",
      "engine_displacement": "2.0 TDI",
      "fuel_type": "Diesel"
    },
    {
      "id": 28,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 28,
      "version_id": 29,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-16MSI",
      "engine_displacement": "1.6 MSI",
      "fuel_type": "Nafta"
    },
    {
      "id": 29,
      "vehicle_type_id": 2,
      "make_id": 5,
      "model_id": 29,
      "version_id": 30,
      "year_from": 2021,
      "year_to": 2026,
      "engine_code": "ACARA-14",
      "engine_displacement": "1.4 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 30,
      "vehicle_type_id": 3,
      "make_id": 9,
      "model_id": 30,
      "version_id": 31,
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 31,
      "vehicle_type_id": 3,
      "make_id": 9,
      "model_id": 31,
      "version_id": 32,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-15",
      "engine_displacement": "1.5 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 32,
      "vehicle_type_id": 3,
      "make_id": 9,
      "model_id": 32,
      "version_id": 33,
      "year_from": 2013,
      "year_to": 2024,
      "engine_code": "ACARA-15",
      "engine_displacement": "1.5 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 33,
      "vehicle_type_id": 2,
      "make_id": 7,
      "model_id": 33,
      "version_id": 34,
      "year_from": 2023,
      "year_to": 2026,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 34,
      "vehicle_type_id": 2,
      "make_id": 7,
      "model_id": 34,
      "version_id": 35,
      "year_from": 2014,
      "year_to": 2020,
      "engine_code": "ACARA-20",
      "engine_displacement": "2.0 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 35,
      "vehicle_type_id": 2,
      "make_id": 10,
      "model_id": 35,
      "version_id": 36,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-16",
      "engine_displacement": "1.6 ",
      "fuel_type": "Nafta"
    },
    {
      "id": 36,
      "vehicle_type_id": 2,
      "make_id": 10,
      "model_id": 36,
      "version_id": 37,
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "ACARA-1616V",
      "engine_displacement": "1.6 16V",
      "fuel_type": "Nafta"
    },
    {
      "id": 37,
      "vehicle_type_id": 2,
      "make_id": 11,
      "model_id": 37,
      "version_id": 38,
      "year_from": 2020,
      "year_to": 2026,
      "engine_code": "ACARA-1616V",
      "engine_displacement": "1.6 16V",
      "fuel_type": "Nafta"
    },
    {
      "id": 38,
      "vehicle_type_id": 1,
      "make_id": 1,
      "model_id": 38,
      "version_id": 39,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-110CC",
      "engine_displacement": "110 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 39,
      "vehicle_type_id": 1,
      "make_id": 1,
      "model_id": 39,
      "version_id": 40,
      "year_from": 2015,
      "year_to": 2026,
      "engine_code": "ACARA-150CC",
      "engine_displacement": "150 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 40,
      "vehicle_type_id": 1,
      "make_id": 1,
      "model_id": 40,
      "version_id": 41,
      "year_from": 2023,
      "year_to": 2026,
      "engine_code": "ACARA-300CC",
      "engine_displacement": "300 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 41,
      "vehicle_type_id": 1,
      "make_id": 2,
      "model_id": 41,
      "version_id": 42,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-250CC",
      "engine_displacement": "250 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 42,
      "vehicle_type_id": 1,
      "make_id": 2,
      "model_id": 42,
      "version_id": 43,
      "year_from": 2017,
      "year_to": 2026,
      "engine_code": "ACARA-125CC",
      "engine_displacement": "125 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 43,
      "vehicle_type_id": 1,
      "make_id": 3,
      "model_id": 43,
      "version_id": 44,
      "year_from": 2018,
      "year_to": 2026,
      "engine_code": "ACARA-150CC",
      "engine_displacement": "150 CC",
      "fuel_type": "Nafta"
    },
    {
      "id": 44,
      "vehicle_type_id": 1,
      "make_id": 4,
      "model_id": 44,
      "version_id": 45,
      "year_from": 2019,
      "year_to": 2026,
      "engine_code": "ACARA-110CC",
      "engine_displacement": "110 CC",
      "fuel_type": "Nafta"
    }
  ],
  "product_vehicle_compatibility": [
    {
      "id": 1,
      "product_id": 1,
      "product_sku": "ACARA-HONDA-TORNADO",
      "vehicle_id": 2,
      "compatibility_type": "EXACTA",
      "position": "Completo",
      "notes": "Moto enduro 250cc DOHC",
      "source": "FABRICANTE",
      "source_reference": "Honda Guía ACARA 2026",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 2,
      "product_id": 2,
      "product_sku": "ACARA-YAMAHA-R3",
      "vehicle_id": 3,
      "compatibility_type": "EXACTA",
      "position": "Completo",
      "notes": "Deportiva 321cc bicilíndrico",
      "source": "FABRICANTE",
      "source_reference": "Yamaha Manual Oficial",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 3,
      "product_id": 3,
      "product_sku": "ACARA-MOTOMEL-BLITZ",
      "vehicle_id": 4,
      "compatibility_type": "EXACTA",
      "position": "Completo",
      "notes": "CUB 110cc 4T",
      "source": "FABRICANTE",
      "source_reference": "Motomel Ficha Técnica",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 4,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 6,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba completa 4.2 Bar para motor 1.6 8V EA111",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 5,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 7,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba completa 4.2 Bar para motor 1.6 8V EA111",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 6,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 8,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba completa 4.2 Bar para motor 1.6 8V EA111",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 7,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 9,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba completa 4.2 Bar para motor 1.6 8V EA111",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 8,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 17,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba de nafta universal / multimarca 4.2 Bar",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 9,
      "product_id": 5,
      "product_sku": "INJ-20045",
      "vehicle_id": 10,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bobina 4 pines encendido directo motor 1.4 8V",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 20045",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 10,
      "product_id": 5,
      "product_sku": "INJ-20045",
      "vehicle_id": 11,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bobina 4 pines encendido directo motor 1.4 8V",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 20045",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 11,
      "product_id": 5,
      "product_sku": "INJ-20045",
      "vehicle_id": 12,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bobina 4 pines encendido directo motor 1.4 8V",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 20045",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 12,
      "product_id": 5,
      "product_sku": "INJ-20045",
      "vehicle_id": 17,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bobina de encendido sistema estático motor 1.4 Fire",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 20045",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 13,
      "product_id": 6,
      "product_sku": "INJ-103001",
      "vehicle_id": 6,
      "compatibility_type": "EXACTA",
      "position": "Múltiple Admisión",
      "notes": "Sensor MAP de presión colector 10 - 115 kPa",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Bosch / Fispa 103001",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 14,
      "product_id": 6,
      "product_sku": "INJ-103001",
      "vehicle_id": 10,
      "compatibility_type": "EXACTA",
      "position": "Múltiple Admisión",
      "notes": "Sensor MAP de presión colector 10 - 115 kPa",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Bosch / Fispa 103001",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 15,
      "product_id": 6,
      "product_sku": "INJ-103001",
      "vehicle_id": 17,
      "compatibility_type": "EXACTA",
      "position": "Múltiple Admisión",
      "notes": "Sensor MAP de presión colector motor 1.4 Fire",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Bosch / Fispa 103001",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 16,
      "product_id": 7,
      "product_sku": "INJ-104012",
      "vehicle_id": 13,
      "compatibility_type": "EXACTA",
      "position": "Block de Motor",
      "notes": "Sensor CKP de cigüeñal inductivo motor Sigma 1.6",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa OEM 104012",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 17,
      "product_id": 7,
      "product_sku": "INJ-104012",
      "vehicle_id": 14,
      "compatibility_type": "EXACTA",
      "position": "Block de Motor",
      "notes": "Sensor CKP de cigüeñal inductivo motor Sigma 1.6",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa OEM 104012",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 18,
      "product_id": 8,
      "product_sku": "AUTOCENTRAL-DIST-GATES",
      "vehicle_id": 6,
      "compatibility_type": "EXACTA",
      "position": "Distribución Motor",
      "notes": "Correa HNBR + Tensor Litens motor 1.6 8V EA111",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Gates AutoCentral KS-101",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 19,
      "product_id": 8,
      "product_sku": "AUTOCENTRAL-DIST-GATES",
      "vehicle_id": 7,
      "compatibility_type": "EXACTA",
      "position": "Distribución Motor",
      "notes": "Correa HNBR + Tensor Litens motor 1.6 8V EA111",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Gates AutoCentral KS-101",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 20,
      "product_id": 8,
      "product_sku": "AUTOCENTRAL-DIST-GATES",
      "vehicle_id": 8,
      "compatibility_type": "EXACTA",
      "position": "Distribución Motor",
      "notes": "Correa HNBR + Tensor Litens motor 1.6 8V EA111",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Gates AutoCentral KS-101",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 21,
      "product_id": 9,
      "product_sku": "AUTOCENTRAL-PAST-BOSCH",
      "vehicle_id": 10,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Juego 4 pastillas cerámicas mordaza delantera",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Bosch Catálogo 0986BB0789",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 22,
      "product_id": 9,
      "product_sku": "AUTOCENTRAL-PAST-BOSCH",
      "vehicle_id": 11,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Juego 4 pastillas cerámicas mordaza delantera",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Bosch Catálogo 0986BB0789",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 23,
      "product_id": 9,
      "product_sku": "AUTOCENTRAL-PAST-BOSCH",
      "vehicle_id": 17,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Juego 4 pastillas de freno sistema Teves / Bendix",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Bosch Catálogo 0986BB0789",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 24,
      "product_id": 10,
      "product_sku": "AUTOCENTRAL-NGK-IRIDIUM",
      "vehicle_id": 1,
      "compatibility_type": "EXACTA",
      "position": "Culata / Tapa de Cilindro",
      "notes": "Bujía electrodo fino iridio CR9EIX / BKR6EIX",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "NGK Spark Plug Guide 2026",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 25,
      "product_id": 10,
      "product_sku": "AUTOCENTRAL-NGK-IRIDIUM",
      "vehicle_id": 15,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bujía alto rendimiento para motores compatibles",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "NGK Spark Plug Guide 2026",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 26,
      "product_id": 10,
      "product_sku": "AUTOCENTRAL-NGK-IRIDIUM",
      "vehicle_id": 17,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bujía iridio BKR6EIX motor 1.4 Fire 8V",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "NGK Spark Plug Guide 2026",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 27,
      "product_id": 11,
      "product_sku": "ALMA-EMB-SACHS",
      "vehicle_id": 6,
      "compatibility_type": "EXACTA",
      "position": "Caja / Transmisión",
      "notes": "Kit 190mm placa, disco 28 estrías y crapodina",
      "source": "FABRICANTE",
      "source_reference": "ZF Sachs 3000951088",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 28,
      "product_id": 11,
      "product_sku": "ALMA-EMB-SACHS",
      "vehicle_id": 7,
      "compatibility_type": "EXACTA",
      "position": "Caja / Transmisión",
      "notes": "Kit 190mm placa, disco 28 estrías y crapodina",
      "source": "FABRICANTE",
      "source_reference": "ZF Sachs 3000951088",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 29,
      "product_id": 11,
      "product_sku": "ALMA-EMB-SACHS",
      "vehicle_id": 8,
      "compatibility_type": "EXACTA",
      "position": "Caja / Transmisión",
      "notes": "Kit 190mm placa, disco 28 estrías y crapodina",
      "source": "FABRICANTE",
      "source_reference": "ZF Sachs 3000951088",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 30,
      "product_id": 12,
      "product_sku": "ALMA-DISCOS-CORVEN",
      "vehicle_id": 15,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Par de discos ventilados aleación fundición gris",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Corven Hi-Tech 2DF0520",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 31,
      "product_id": 12,
      "product_sku": "ALMA-DISCOS-CORVEN",
      "vehicle_id": 16,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Par de discos ventilados aleación fundición gris",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Corven Hi-Tech 2DF0520",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 32,
      "product_id": 13,
      "product_sku": "ALMA-BOMBA-DOLZ",
      "vehicle_id": 10,
      "compatibility_type": "EXACTA",
      "position": "Circuito Refrigeración",
      "notes": "Bomba de agua turbina aluminio 19 dientes",
      "source": "FABRICANTE",
      "source_reference": "Dolz España O-108",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 33,
      "product_id": 13,
      "product_sku": "ALMA-BOMBA-DOLZ",
      "vehicle_id": 11,
      "compatibility_type": "EXACTA",
      "position": "Circuito Refrigeración",
      "notes": "Bomba de agua turbina aluminio 19 dientes",
      "source": "FABRICANTE",
      "source_reference": "Dolz España O-108",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 34,
      "product_id": 14,
      "product_sku": "DID-CG150-KIT",
      "vehicle_id": 1,
      "compatibility_type": "EXACTA",
      "position": "Transmisión Secundaria",
      "notes": "Cadena reforzada 428H x 118L, corona 43D, piñón 16D",
      "source": "FABRICANTE",
      "source_reference": "DID Japan Kit-CG150",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 35,
      "product_id": 15,
      "product_sku": "FRASLE-HILUX-PAST",
      "vehicle_id": 15,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Juego 4 pastillas semimetálicas libres de asbesto",
      "source": "FABRICANTE",
      "source_reference": "Fras-le PD/528",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 36,
      "product_id": 15,
      "product_sku": "FRASLE-HILUX-PAST",
      "vehicle_id": 16,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Juego 4 pastillas semimetálicas libres de asbesto",
      "source": "FABRICANTE",
      "source_reference": "Fras-le PD/528",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 37,
      "product_id": 16,
      "product_sku": "PIRELLI-SUPER-CITY",
      "vehicle_id": 1,
      "compatibility_type": "EXACTA",
      "position": "Rueda Trasera / Delantera 18 pulgadas",
      "notes": "Cubierta 2.75-18 42P urbana piso mojado",
      "source": "FABRICANTE",
      "source_reference": "Pirelli Moto SuperCity",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 38,
      "product_id": 16,
      "product_sku": "PIRELLI-SUPER-CITY",
      "vehicle_id": 4,
      "compatibility_type": "EXACTA",
      "position": "Rueda Trasera 18 pulgadas",
      "notes": "Cubierta 2.75-18 42P urbana",
      "source": "FABRICANTE",
      "source_reference": "Pirelli Moto SuperCity",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 39,
      "product_id": 17,
      "product_sku": "VIESA-INTELLIGENT",
      "vehicle_id": 15,
      "compatibility_type": "UNIVERSAL",
      "position": "Techo Cabina",
      "notes": "Climatizador ecológico para cabinas 12V/24V",
      "source": "FABRICANTE",
      "source_reference": "Italbo VIESA v11",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 40,
      "product_id": 4,
      "product_sku": "INJ-70014",
      "vehicle_id": 18,
      "compatibility_type": "EXACTA",
      "position": "Tanque Combustible",
      "notes": "Bomba de combustible eléctrica 4.2 Bar",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 70014",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 41,
      "product_id": 5,
      "product_sku": "INJ-20045",
      "vehicle_id": 18,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bobina encendido 4 pines",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Fispa Catálogo OEM 20045",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 42,
      "product_id": 6,
      "product_sku": "INJ-103001",
      "vehicle_id": 18,
      "compatibility_type": "EXACTA",
      "position": "Múltiple Admisión",
      "notes": "Sensor MAP presión colector",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "Bosch / Fispa 103001",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 43,
      "product_id": 9,
      "product_sku": "AUTOCENTRAL-PAST-BOSCH",
      "vehicle_id": 18,
      "compatibility_type": "EXACTA",
      "position": "Freno Delantero",
      "notes": "Pastillas cerámicas mordaza delantera",
      "source": "DISTRIBUIDOR_OFICIAL",
      "source_reference": "Bosch Catálogo 0986BB0789",
      "confidence": 1.0,
      "verified": true
    },
    {
      "id": 44,
      "product_id": 10,
      "product_sku": "AUTOCENTRAL-NGK-IRIDIUM",
      "vehicle_id": 18,
      "compatibility_type": "EXACTA",
      "position": "Motor",
      "notes": "Bujías electrodo fino iridio",
      "source": "CATÁLOGO_TÉCNICO",
      "source_reference": "NGK Spark Plug Guide 2026",
      "confidence": 1.0,
      "verified": true
    }
  ],
  "product_oem_references": [
    {
      "id": 1,
      "product_id": 4,
      "manufacturer": "Volkswagen",
      "reference_type": "OEM",
      "reference_code": "5U0919051",
      "source": "CATÁLOGO_TÉCNICO",
      "verified": true
    },
    {
      "id": 2,
      "product_id": 5,
      "manufacturer": "Chevrolet",
      "reference_type": "OEM",
      "reference_code": "93363483",
      "source": "CATÁLOGO_TÉCNICO",
      "verified": true
    },
    {
      "id": 3,
      "product_id": 7,
      "manufacturer": "Ford",
      "reference_type": "OEM",
      "reference_code": "7S65-6C315-AA",
      "source": "CATÁLOGO_TÉCNICO",
      "verified": true
    },
    {
      "id": 4,
      "product_id": 8,
      "manufacturer": "Volkswagen",
      "reference_type": "OEM",
      "reference_code": "030109119AB",
      "source": "DISTRIBUIDOR_OFICIAL",
      "verified": true
    },
    {
      "id": 5,
      "product_id": 9,
      "manufacturer": "Bosch",
      "reference_type": "PART_NUMBER",
      "reference_code": "0986BB0789",
      "source": "DISTRIBUIDOR_OFICIAL",
      "verified": true
    },
    {
      "id": 6,
      "product_id": 11,
      "manufacturer": "ZF Sachs",
      "reference_type": "PART_NUMBER",
      "reference_code": "3000 951 088",
      "source": "FABRICANTE",
      "verified": true
    },
    {
      "id": 7,
      "product_id": 12,
      "manufacturer": "Toyota",
      "reference_type": "OEM",
      "reference_code": "43512-0K060",
      "source": "DISTRIBUIDOR_OFICIAL",
      "verified": true
    },
    {
      "id": 8,
      "product_id": 13,
      "manufacturer": "Dolz",
      "reference_type": "PART_NUMBER",
      "reference_code": "O-108",
      "source": "FABRICANTE",
      "verified": true
    },
    {
      "id": 9,
      "product_id": 15,
      "manufacturer": "Fras-le",
      "reference_type": "PART_NUMBER",
      "reference_code": "PD/528",
      "source": "FABRICANTE",
      "verified": true
    }
  ],
  "sample_plates": [
    {
      "plate": "AH114CQ",
      "make_id": 6,
      "model_id": 19,
      "version_id": 19,
      "year": 2025,
      "engine": "1.4 LT",
      "fuel_type": "Nafta",
      "make_name": "Chevrolet",
      "model_name": "Onix",
      "version_name": "1.4 LT"
    },
    {
      "plate": "PAV832",
      "make_id": 8,
      "model_id": 16,
      "version_id": 17,
      "year": 2015,
      "engine": "1.4 8V Fire",
      "fuel_type": "Nafta",
      "make_name": "Fiat",
      "model_name": "Palio",
      "version_name": "1.4 8V Fire Top"
    },
    {
      "plate": "AB123CD",
      "make_id": 9,
      "model_id": 15,
      "version_id": 16,
      "year": 2017,
      "engine": "3.0 D-4D",
      "fuel_type": "Diesel",
      "make_name": "Toyota",
      "model_name": "Hilux",
      "version_name": "3.0 D-4D Turbo Intercooler"
    },
    {
      "plate": "OOT554",
      "make_id": 5,
      "model_id": 6,
      "version_id": 6,
      "year": 2015,
      "engine": "1.6 8V VHT",
      "fuel_type": "Nafta",
      "make_name": "Volkswagen",
      "model_name": "Gol Trend",
      "version_name": "1.6 8V MSI / VHT"
    },
    {
      "plate": "AA987ZZ",
      "make_id": 6,
      "model_id": 10,
      "version_id": 10,
      "year": 2016,
      "engine": "1.4 8V",
      "fuel_type": "Nafta",
      "make_name": "Chevrolet",
      "model_name": "Corsa",
      "version_name": "1.4 8V Econoflex"
    },
    {
      "plate": "A123BCD",
      "make_id": 1,
      "model_id": 1,
      "version_id": 1,
      "year": 2018,
      "engine": "150 cc OHC",
      "fuel_type": "Nafta",
      "make_name": "Honda",
      "model_name": "CG Titan",
      "version_name": "150 ESD / KS / ESDI"
    }
  ]
};

  // Motor principal
  window.COMPATIBILITY_ENGINE = {
    db: RELATIONAL_DB,
    activeVehicleFilter: null,

    init: async function () {
      // Intentar sincronizar si hay un servidor backend activo
      try {
        const res = await fetch("compatibility_db.json");
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.vehicle_makes) {
            this.db = remoteData;
          }
        }
      } catch (err) {
        // En entorno local o sin servidor HTTP, RELATIONAL_DB funciona al 100% de forma autónoma
      }

      this.bindUI();
      this.populateTypes();
      this.populateMakes();
    },

    getMakes: function (typeId) {
      if (!this.db || !this.db.vehicle_makes) return [];
      if (!typeId) return this.db.vehicle_makes;
      return this.db.vehicle_makes.filter(m => m.vehicle_type_id == typeId && m.is_active);
    },

    getModels: function (makeId) {
      if (!this.db || !this.db.vehicle_models) return [];
      if (!makeId) return [];
      return this.db.vehicle_models.filter(m => m.vehicle_make_id == makeId && m.is_active);
    },

    getVersions: function (modelId) {
      if (!this.db || !this.db.vehicle_versions) return [];
      if (!modelId) return [];
      return this.db.vehicle_versions.filter(v => v.vehicle_model_id == modelId && v.is_active);
    },

    getYears: function (versionId) {
      if (!this.db || !this.db.vehicle_versions) return [];
      const v = this.db.vehicle_versions.find(x => x.id == versionId);
      if (!v) return [];
      const years = [];
      for (let y = v.year_to; y >= v.year_from; y--) {
        years.push(y);
      }
      return years;
    },

    populateTypes: function () {
      const typeSelect = document.getElementById("comp-type-select");
      if (!typeSelect || !this.db) return;
      typeSelect.innerHTML = '<option value="">Todos los Tipos (Motos, Autos, Pick-ups)</option>';
      this.db.vehicle_types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        typeSelect.appendChild(opt);
      });
    },

    populateMakes: function () {
      const makeSelect = document.getElementById("vehicle-brand-select");
      if (!makeSelect) return;
      makeSelect.innerHTML = '<option value="">1. Seleccioná la Marca...</option>';
      
      const typeId = document.getElementById("comp-type-select")?.value;
      const makes = this.getMakes(typeId);
      makes.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        makeSelect.appendChild(opt);
      });
      this.resetDropdowns(["vehicle-model-select", "vehicle-version-select", "vehicle-year-select"]);
    },

    populateModels: function (makeId) {
      const modelSelect = document.getElementById("vehicle-model-select");
      if (!modelSelect) return;
      modelSelect.innerHTML = '<option value="">2. Seleccioná el Modelo...</option>';
      modelSelect.disabled = !makeId;

      if (!makeId) {
        this.resetDropdowns(["vehicle-version-select", "vehicle-year-select"]);
        return;
      }

      const models = this.getModels(makeId);
      models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        modelSelect.appendChild(opt);
      });
      this.resetDropdowns(["vehicle-version-select", "vehicle-year-select"]);
    },

    populateVersions: function (modelId) {
      const versionSelect = document.getElementById("vehicle-version-select");
      if (!versionSelect) return;
      versionSelect.innerHTML = '<option value="">3. Motorización / Versión...</option>';
      versionSelect.disabled = !modelId;

      if (!modelId) {
        this.resetDropdowns(["vehicle-year-select"]);
        return;
      }

      const versions = this.getVersions(modelId);
      versions.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = `${v.name} (${v.year_from} - ${v.year_to}) - ${v.engine_displacement || ''}`;
        versionSelect.appendChild(opt);
      });
      this.resetDropdowns(["vehicle-year-select"]);
    },

    populateYears: function (versionId) {
      const yearSelect = document.getElementById("vehicle-year-select");
      if (!yearSelect) return;
      yearSelect.innerHTML = '<option value="">4. Año Exacto (Opcional)...</option>';
      yearSelect.disabled = !versionId;

      if (!versionId) return;

      const years = this.getYears(versionId);
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
    },

    resetDropdowns: function (ids) {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = '<option value="">Seleccionar...</option>';
          el.disabled = true;
        }
      });
    },

    bindUI: function () {
      const tabVehiculo = document.getElementById("tab-btn-vehiculo");
      const tabPatente = document.getElementById("tab-btn-patente");
      const containerDropdowns = document.getElementById("comp-dropdowns-container");
      const containerPatente = document.getElementById("comp-patente-container");

      if (tabVehiculo && tabPatente) {
        tabVehiculo.onclick = () => {
          tabVehiculo.classList.add("active");
          tabPatente.classList.remove("active");
          if (containerDropdowns) containerDropdowns.style.display = "block";
          if (containerPatente) containerPatente.style.display = "none";
        };
        tabPatente.onclick = () => {
          tabPatente.classList.add("active");
          tabVehiculo.classList.remove("active");
          if (containerDropdowns) containerDropdowns.style.display = "none";
          if (containerPatente) containerPatente.style.display = "block";
        };
      }

      const makeSelect = document.getElementById("vehicle-brand-select");
      const modelSelect = document.getElementById("vehicle-model-select");
      const versionSelect = document.getElementById("vehicle-version-select");
      const filterBtn = document.getElementById("comp-filter-btn");
      const resetBtn = document.getElementById("comp-reset-btn");

      if (makeSelect) {
        makeSelect.onchange = (e) => this.populateModels(e.target.value);
      }
      if (modelSelect) {
        modelSelect.onchange = (e) => this.populateVersions(e.target.value);
      }
      if (versionSelect) {
        versionSelect.onchange = (e) => this.populateYears(e.target.value);
      }
      if (filterBtn) {
        filterBtn.onclick = () => this.applyVehicleSearch();
      }
      if (resetBtn) {
        resetBtn.onclick = () => this.clearFilter();
      }

      // Patente
      const plateBtn = document.getElementById("patente-search-btn");
      const plateInput = document.getElementById("patente-input");

      if (plateBtn && plateInput) {
        plateBtn.onclick = () => this.searchByPlate(plateInput.value);
        plateInput.onkeypress = (e) => {
          if (e.key === "Enter") this.searchByPlate(plateInput.value);
        };
      }
    },

    normalizePlate: function (raw) {
      return (raw || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    },

    // Búsqueda inteligente por dominio con conexión a backend oficial DNRPA y Base Maestra
    searchByPlate: async function (rawPlate, selectedVersionId) {
      const plate = this.normalizePlate(rawPlate);
      const statusEl = document.getElementById("patente-status-msg");

      if (!plate || plate.length < 6 || plate.length > 8) {
        if (statusEl) {
          statusEl.innerHTML = '<span style="color: #ef4444; font-weight: 700;">⚠ Ingresá una patente válida (Ej: PAV832, AB123CD o A123BCD).</span>';
        }
        return;
      }

      if (statusEl) {
        statusEl.innerHTML = '<span style="color: var(--accent-orange); font-weight: 600;">🔍 Consultando registro vehicular y base maestra sincronizada...</span>';
      }

      try {
        // 1. Intentar resolver a través del backend oficial / API REST
        let backendResult = null;
        try {
          const res = await fetch("/api/vehicles/lookup-by-plate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plate: plate, version_id: selectedVersionId })
          });
          if (res.ok) {
            backendResult = await res.json();
          } else {
            backendResult = await res.json().catch(() => null);
          }
        } catch (netErr) {
          backendResult = null;
        }

        // Si el backend retornó desambiguación requerida (FASE 15)
        if (backendResult && backendResult.needs_disambiguation) {
          if (statusEl) {
            let verOptionsHtml = backendResult.available_versions.map(v => 
              `<button onclick="window.COMPATIBILITY_ENGINE.searchByPlate('${plate}', ${v.id})" style="display: block; width: 100%; text-align: left; padding: 6px 10px; margin-top: 5px; background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-primary); cursor: pointer; font-size: 0.76rem;">
                👉 <strong>${v.name}</strong> ${v.engine ? '(' + v.engine + ')' : ''}
              </button>`
            ).join("");

            statusEl.innerHTML = `
              <div style="background: rgba(245,158,11,0.12); border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin-top: 6px; color: #f59e0b; font-size: 0.78rem; line-height: 1.35;">
                <strong style="display: block; margin-bottom: 4px;">ℹ ${backendResult.message}</strong>
                ${verOptionsHtml}
              </div>
            `;
          }
          return;
        }

        // Si el backend resolvió con éxito
        if (backendResult && backendResult.success && backendResult.vehicle) {
          const v = backendResult.vehicle;
          this.activeVehicleFilter = {
            makeId: v.make_id,
            modelId: v.model_id,
            versionId: v.version_id,
            year: v.year,
            displayName: v.displayName || `${v.make} ${v.model} ${v.version} (${v.year})`,
            provider: v.provider
          };

          if (statusEl) {
            statusEl.innerHTML = `
              <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 8px 10px; border-radius: 4px; margin-top: 6px; color: #10b981; font-weight: 800; font-size: 0.8rem;">
                ✓ Vehículo identificado (${v.provider}): ${this.activeVehicleFilter.displayName}
              </div>
            `;
          }

          const resetBtn = document.getElementById("comp-reset-btn");
          if (resetBtn) resetBtn.style.display = "block";
          this.updateCatalogView();
          return;
        }

        // 2. Fallback resiliente a base local en memoria (si el servidor no está corriendo o es modo estático)
        const samples = (this.db && this.db.sample_plates) || [];
        const match = samples.find(s => this.normalizePlate(s.plate) === plate);

        if (match) {
          this.activeVehicleFilter = {
            makeId: match.make_id,
            modelId: match.model_id,
            versionId: selectedVersionId || match.version_id,
            year: match.year,
            displayName: `${match.make_name} ${match.model_name} ${match.version_name} (${match.year})`,
            provider: "BASE_LOCAL_VERIFICADA"
          };

          if (statusEl) {
            statusEl.innerHTML = `<div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 8px 10px; border-radius: 4px; margin-top: 6px; color: #10b981; font-weight: 800; font-size: 0.8rem;">✓ Vehículo identificado (Base Local): ${this.activeVehicleFilter.displayName}</div>`;
          }

          const resetBtn = document.getElementById("comp-reset-btn");
          if (resetBtn) resetBtn.style.display = "block";

          this.updateCatalogView();
        } else {
          if (statusEl) {
            const providerStatusBadge = backendResult?.provider_badge || "~ PENDIENTE DE CREDENCIALES / CONVENIO";
            statusEl.innerHTML = `
              <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 10px; border-radius: 4px; margin-top: 6px; color: #f87171; font-size: 0.78rem; line-height: 1.4;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <strong style="color: #ef4444;">⚠ Dominio sin coincidencia en base local</strong>
                  <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; color: #e2e8f0;">DNRPA: ${providerStatusBadge}</span>
                </div>
                Para evitar sugerir repuestos incompatibles, las consultas en vivo requieren credenciales oficiales habilitadas.
                <br><br>
                👉 <strong>Seleccioná tu vehículo en la pestaña "Por Vehículo"</strong> para ver exactamente los repuestos que le corresponden.
              </div>
            `;
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.innerHTML = `<span style="color: #ef4444; font-size: 0.75rem;">Error en la verificación de patente: ${err.message}</span>`;
        }
      }
    },

    applyVehicleSearch: function () {
      const makeSelect = document.getElementById("vehicle-brand-select");
      const modelSelect = document.getElementById("vehicle-model-select");
      const versionSelect = document.getElementById("vehicle-version-select");
      const yearSelect = document.getElementById("vehicle-year-select");

      const makeId = makeSelect ? parseInt(makeSelect.value) : null;
      const modelId = modelSelect && modelSelect.value ? parseInt(modelSelect.value) : null;
      const versionId = versionSelect && versionSelect.value ? parseInt(versionSelect.value) : null;
      const year = yearSelect && yearSelect.value ? parseInt(yearSelect.value) : null;

      if (!makeId) {
        alert("Por favor seleccioná al menos una Marca para buscar repuestos compatibles.");
        return;
      }

      const makeObj = this.db.vehicle_makes.find(m => m.id === makeId);
      const modelObj = modelId ? this.db.vehicle_models.find(m => m.id === modelId) : null;
      const versionObj = versionId ? this.db.vehicle_versions.find(v => v.id === versionId) : null;

      let nameParts = [makeObj?.name];
      if (modelObj) nameParts.push(modelObj.name);
      if (versionObj) nameParts.push(versionObj.name);
      if (year) nameParts.push(`(${year})`);

      this.activeVehicleFilter = {
        makeId,
        modelId,
        versionId,
        year,
        displayName: nameParts.join(" ")
      };

      const resetBtn = document.getElementById("comp-reset-btn");
      if (resetBtn) resetBtn.style.display = "block";

      this.updateCatalogView();
    },

    clearFilter: function () {
      this.activeVehicleFilter = null;
      const makeSelect = document.getElementById("vehicle-brand-select");
      if (makeSelect) makeSelect.value = "";
      this.resetDropdowns(["vehicle-model-select", "vehicle-version-select", "vehicle-year-select"]);

      const plateInput = document.getElementById("patente-input");
      if (plateInput) plateInput.value = "";
      const statusEl = document.getElementById("patente-status-msg");
      if (statusEl) statusEl.innerHTML = "";

      const resetBtn = document.getElementById("comp-reset-btn");
      if (resetBtn) resetBtn.style.display = "none";

      const activeBadge = document.getElementById("active-vehicle-badge");
      if (activeBadge) activeBadge.style.display = "none";

      if (typeof window.renderCatalog === "function") {
        window.renderCatalog();
      }
    },

    getCompatibleSKUs: function () {
      if (!this.activeVehicleFilter || !this.db) return null;

      const { makeId, modelId, versionId, year } = this.activeVehicleFilter;
      const vehicles = this.db.vehicles || [];

      const matchingVehicles = vehicles.filter(v => {
        if (makeId && v.make_id !== makeId) return false;
        if (modelId && v.model_id !== modelId) return false;
        if (versionId && v.version_id !== versionId) return false;
        if (year && (year < v.year_from || year > v.year_to)) return false;
        return true;
      });

      const matchingVIds = matchingVehicles.map(v => v.id);

      const compatibilities = (this.db.product_vehicle_compatibility || []).filter(c => {
        const isVerified = (c.verification_status === "VERIFIED") || (c.verified === true && c.verification_status !== "PENDING" && c.verification_status !== "REJECTED");
        return matchingVIds.includes(c.vehicle_id) && isVerified;
      });

      return compatibilities.map(c => c.product_sku);
    },

    updateCatalogView: function () {
      const activeBadge = document.getElementById("active-vehicle-badge");
      if (activeBadge && this.activeVehicleFilter) {
        activeBadge.style.display = "flex";
        activeBadge.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: #10b981; color: white; border-radius: 4px; padding: 2px 6px; font-weight: 800; font-size: 0.72rem;">✓ FILTRO ACTIVO</span>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${this.activeVehicleFilter.displayName}</strong>
            </div>
            <button onclick="window.COMPATIBILITY_ENGINE.clearFilter()" style="background: transparent; border: none; color: #ef4444; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              ✕ Quitar
            </button>
          </div>
        `;
      }

      if (typeof window.renderCatalog === "function") {
        window.renderCatalog();
      }

      const catalogoSection = document.getElementById("catalogo");
      if (catalogoSection) {
        catalogoSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Inicializar
  document.addEventListener("DOMContentLoaded", () => {
    window.COMPATIBILITY_ENGINE.init();
  });

})();
