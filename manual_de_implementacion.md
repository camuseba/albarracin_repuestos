# 📘 Manual de Implementación Técnica - Ecommerce Albarracín

Este documento detalla la arquitectura, estructura de datos y puntos de extensión de la plataforma Single Page Application (SPA) para **Albarracín - Motos, Repuestos y Servicios**.

---

## 🏗️ 1. Arquitectura General
El proyecto está desarrollado utilizando tecnologías web nativas (Vanilla HTML5, CSS3 y JavaScript ES6) sin dependencias ni frameworks externos (React, Vue, jQuery, etc.), garantizando una carga instantánea y máxima compatibilidad móvil.

*   **`index.html`**: Estructura del DOM. Contiene los contenedores para el catálogo, el carrito lateral, el buscador de compatibilidad y los modales de detalle.
*   **`style.css`**: Sistema de diseño basado en variables CSS (Dark Mode por defecto con soporte para Light Mode). Usa Flexbox y Grid para el responsive, y aceleración por GPU en animaciones (`backdrop-filter`, transiciones).
*   **`app.js`**: Núcleo lógico del sistema. Administra el estado global, motor de filtrado, base de datos en memoria (productos y patentes), carrito de compras e integración con la API de WhatsApp.

---

## 🗄️ 2. Estructura y Modelo de Datos

### 📦 Catálogo de Productos (`PRODUCTS_DATA` en `app.js`)
Cada producto es un objeto con el siguiente formato:

```javascript
{
  id: 1,
  name: "Honda XR 250 Tornado 0km",
  brand: "Honda",
  category: "motos", // Categorías: motos, repuestos, equipos, alarmas
  price: 4800000,
  oldPrice: 5100000, // Opcional (para mostrar etiquetas de oferta)
  image: "assets/moto_honda_xr.jpg",
  badge: "Destacado", // Opcional (badge promocional superior)
  specs: { // Especificaciones para el modal de detalles
    "Motor": "249cc - DOHC 4 Válvulas",
    "Transmisión": "6 velocidades",
    "Garantía": "1 año oficial"
  },
  compatibility: [ // Array de vehículos compatibles (para el buscador)
    { brand: "Honda", model: "XR 250 Tornado", yearStart: 2010, yearEnd: 2026 }
  ]
}
```

### 🚗 Base de Datos de Patentes (`MOCK_PATENTES` en `app.js`)
Para la simulación del registro de patentes en el widget de compatibilidad:

```javascript
const MOCK_PATENTES = {
  "AB123CD": { brand: "Volkswagen", model: "Gol Trend", year: 2020 },
  "AAA123": { brand: "Honda", model: "Tornado 250", year: 2015 },
  // Agregar patentes adicionales aquí para pruebas
};
```

---

## ⚙️ 3. Motores de Lógica Clave

### 🔍 Buscador de Compatibilidad
El widget cuenta con dos modos:
1.  **Por Vehículo (Dropdowns):** Los selects de Marca, Modelo y Año se cargan dinámicamente y filtran en cascada basándose en las especificaciones del catálogo (`compatibility`).
2.  **Por Patente:** Valida la estructura mediante expresiones regulares (formatos Mercosur `AB123CD` y clásico `AAA123`). Si encuentra coincidencia en el diccionario `MOCK_PATENTES`, aplica automáticamente el filtro de compatibilidad correspondiente.

### 🛒 Carrito y Checkout de WhatsApp
*   **Persistencia:** La persistencia del carrito se gestiona mediante `localStorage` bajo la clave `albarracin_cart`.
*   **Integración WhatsApp:** La función `handleCartCheckout` recopila el contenido del carrito, genera una plantilla formateada con saltos de línea y redirige al usuario a `https://wa.me/5493464685338` (teléfono de Albarracín).

---

## 🚀 4. Guía de Despliegue en Servidores

Dado que el sitio es 100% estático, no requiere un backend Node.js, PHP ni base de datos SQL. 

### Opción A: Hosting Gratuito con Netlify (Recomendado)
1.  Ingresar a [Netlify Drop](https://app.netlify.com/drop).
2.  Arrastrar la carpeta contenedora del proyecto.
3.  Configurar el subdominio personalizado de forma gratuita en el panel.

### Opción B: OneDrive / Google Drive (vía DriveToWeb)
1.  Subir la carpeta al almacenamiento en la nube.
2.  Compartir la carpeta públicamente ("Cualquier persona con el enlace puede ver").
3.  Vincular la cuenta en [drv.tw](https://drv.tw) para obtener la URL pública con HTTPS.

---

## 🛠️ 5. Personalizaciones Comunes para el Programador

1.  **Cambiar Teléfono de WhatsApp:**
    Buscar en `app.js` la línea de redirección WhatsApp y modificar el número internacional (ej. `5493464685338`).
2.  **Integrar Base de Datos Real (API/Rest):**
    El método `renderCatalog` utiliza la variable global de estado. Para conectarlo a un backend, basta con reemplazar la constante local `PRODUCTS_DATA` por una llamada `fetch()` asíncrona al iniciar la app:
    ```javascript
    async function loadProducts() {
      const response = await fetch('https://api.tuempresa.com/products');
      PRODUCTS_DATA = await response.json();
      renderCatalog();
    }
    ```
3.  **Imágenes:**
    Asegurar que la carpeta `/assets` contenga todas las imágenes correspondientes declaradas en la propiedad `image` de cada producto. Si una imagen no existe, el sistema cuenta con un fallback automático a imágenes genéricas limpias (`placehold.co`).

---

## 🛍️ 6. Canal de Venta Directa por WhatsApp

La plataforma está optimizada para la venta directa y gestión de consultas a través de WhatsApp. El cliente puede agregar productos al carrito y coordinar la compra, retiro o envío directamente con el establecimiento sin comisiones de intermediarios.

