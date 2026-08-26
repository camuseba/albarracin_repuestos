# Manual de Instalación y Arquitectura: Módulo de Fidelización (Club Albarracín)

Este manual proporciona una guía detallada para la integración, configuración y despliegue del nuevo módulo de fidelización **"Club Albarracín"** en la aplicación web estática (SPA) de Albarracín Repuestos.

El diseño se realizó bajo un enfoque **100% modular y no destructivo**, lo que significa que el código existente (`app.js` e `style.css`) no fue alterado estructuralmente, sino extendido dinámicamente en tiempo de ejecución.

---

## 1. Estructura de Archivos del Módulo

El módulo consta de los siguientes archivos:

*   **`loyalty.js`**: Contiene la lógica del negocio, el motor de recomendaciones heurísticas "IA", los minijuegos (Rueda de la Fortuna en Canvas), las misiones, insignias, la simulación de Apple/Google Wallet, la lógica de cupones de descuento, y la **Base de Datos local con el Panel de Administración**.
*   **`loyalty.css`**: Contiene la hoja de estilos de interfaz, animaciones fluidas de la rueda, efectos visuales de cristal (glassmorphism), confeti dinámico, la maquetación responsiva del panel lateral (drawer), la tarjeta digital Wallet y las vistas del **Panel de Administración**.
*   **`index.html`** *(Modificado)*: Solo incluye los tags necesarios para enlazar los nuevos estilos y scripts.

---

## 2. Instrucciones de Instalación (Paso a Paso)

Para activar el módulo en producción o en un nuevo entorno, siga estos pasos:

### Paso 1: Copiar los Archivos
Asegúrese de que los archivos `loyalty.js` y `loyalty.css` estén en el mismo directorio raíz que `index.html`.

### Paso 2: Vincular en `index.html`

1.  Abra `index.html` e inserte la hoja de estilos en la sección `<head>`, justo debajo de `style.css`:
    ```html
    <!-- Stylesheet -->
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="loyalty.css">
    ```

2.  Inserte la referencia al script de fidelización en la parte inferior del `<body>`, asegurándose de cargarlo **después** de `app.js` para que pueda interactuar con sus variables globales:
    ```html
    <!-- Scripts -->
    <script src="app.js"></script>
    <script src="loyalty.js"></script>
    ```

---

## 3. Arquitectura e Integración Técnica

El script `loyalty.js` actúa como un envoltorio (wrapper) de las funciones globales de `app.js`. A continuación se detalla cómo interactúan sin alterar el núcleo del proyecto:

### A. Intercepción del Checkout de WhatsApp y Log de Consultas
En `app.js`, la función `handleCartCheckout` gestiona el envío de la orden. Para integrar el descuento de cupones y la acumulación de puntos de fidelidad sin modificar `app.js`, `loyalty.js` ejecuta lo siguiente:
1.  Busca el botón `#cart-checkout-btn`.
2.  Elimina el listener por defecto: `checkoutBtn.removeEventListener("click", originalHandleCartCheckout)`.
3.  Asocia una nueva función controlada: `checkoutBtn.addEventListener("click", handleLoyaltyCheckout)`.
4.  La nueva función calcula el descuento, aplica los puntos acumulados por la compra actual (según el nivel del usuario), formatea el texto extendido para WhatsApp, procesa la transacción consumiendo el cupón del usuario y **guarda el contacto del cliente y el mensaje completo en la base de datos local** antes de redirigir a WhatsApp.

### B. Actualización del Carrito
Para reflejar el descuento en tiempo real dentro del carrito:
1.  Se intercepta la función global `window.updateCartUI`.
2.  `loyalty.js` redefine la función guardando una copia del original:
    ```javascript
    const originalUpdateCartUI = window.updateCartUI;
    window.updateCartUI = function() {
      originalUpdateCartUI(); // Ejecuta render básico
      updateCartDiscountUI(); // Inserta fila de descuento y recalcula el Gran Total
    }
    ```

### C. Personalización Basada en IA (Rastreo Heurístico)
El módulo escucha el ciclo de vida del catálogo:
*   Intercepta `window.openProductDetail` para registrar los productos y categorías vistas por el usuario.
*   Filtra `PRODUCTS_DATA` en tiempo real para encontrar productos compatibles con la marca de moto registrada por el usuario (o buscada recientemente).
*   Muestra un carrusel dinámico de 3 productos del catálogo (repuestos, partes y vehículos) directamente en el panel del Club para incentivar la compra personalizada.

---

## 4. Estructura del Estado Persistente (`localStorage`)

Los datos se guardan en el navegador bajo la clave `albarracin_loyalty` con el siguiente esquema JSON:

```json
{
  "registered": true,
  "name": "Nombre de Usuario",
  "phone": "3464123456",
  "motorcycleBrand": "Honda",
  "motorcycleModel": "CG Titan 150",
  "points": 150,
  "tier": "Bronce",
  "memberId": "ALB-2026-8947",
  "lastCheckIn": 1783689400000,
  "consecutiveDays": 1,
  "missions": {
    "checkIn": true,
    "explorer": false,
    "rating": false
  },
  "badges": ["pionero", "motociclista"],
  "coupons": [
    {
      "id": "coupon_5_pct",
      "code": "ALBA-2K-R8FD",
      "name": "Cupón 5% de Descuento",
      "discountType": "percent",
      "amount": 5,
      "used": false
    }
  ],
  "history": [
    { "date": 1783689300000, "desc": "Bono de bienvenida", "amount": 100 },
    { "date": 1783689310000, "desc": "Bono Moto registrada: Honda", "amount": 50 }
  ]
}
```

---

## 5. Base de Datos Local y Panel de Control de Administración

El sistema incluye una base de datos local y autónoma de contactos y consultas que funciona de manera 100% estática a través del almacenamiento de cliente, permitiendo la gestión administrativa del negocio sin depender de servidores backend complejos.

### A. Colecciones de Datos
1.  **`albarracin_db_contacts`**: Almacena todos los clientes registrados en el Club, además de los datos de contacto capturados durante las compras de invitados.
2.  **`albarracin_db_messages`**: Guarda el registro histórico de todos los pedidos/consultas procesados que se redirigieron a WhatsApp, incluyendo subtotales, cupones de descuento aplicados y el texto íntegro del mensaje.

### B. Panel de Administración
*   **Acceso**: En la cabecera del panel deslizable del Club, a la izquierda del botón de cerrar (`✖`), se encuentra un icono de engranaje discreto (`⚙`).
*   **Credenciales**: Al hacer clic en el engranaje, el sistema solicitará una contraseña de acceso. La contraseña por defecto es **`admin`** (se puede cambiar desde la pestaña de **Seguridad** dentro del panel de administración, persistiendo en el LocalStorage del navegador).
*   **Características del Panel**:
    *   **Dashboard de Estadísticas**: Muestra indicadores de Clientes Totales, Total de Puntos Emitidos, Pedidos Recibidos y Facturación Estimada de Ventas.
    *   **Base de Contactos**: Listado de clientes registrados con ID, Nombre, Marca/Modelo de Moto, Nivel actual, Puntos, y un enlace directo a su chat de WhatsApp.
    *   **Historial de Consultas**: Registro cronológico de todos los pedidos, indicando montos, descuentos aplicados y un botón para abrir el modal con el detalle y mensaje completo del pedido.
    *   **Gestión de Puntos**: Formulario administrativo para sumar o restar puntos a cualquier cliente a través de su número de teléfono.
    *   **Exportación CSV**: Botones dedicados en cada pestaña que generan y descargan un archivo `.csv` compatible con Excel y codificado con BOM UTF-8 para evitar caracteres rotos, ideal para campañas de marketing en WhatsApp.

---

## 6. Guía de Pruebas y Validación (QA)

Para comprobar que la instalación fue exitosa:

1.  **Registro Rápido**: Verifique que aparezca el botón flotante del Club (FAB). Haga click, ingrese sus datos y seleccione una marca de moto. Al hacer submit, debe dispararse la animación de confeti en pantalla y sumarse 150 puntos de bienvenida.
2.  **Rueda de la Fortuna**: En la sección de la rueda, presione "Girar". Valide que la rueda dibuje los segmentos correctamente en el Canvas, que rote con deceleración suave y que al detenerse actualice el balance de puntos. El botón debe deshabilitarse hasta el día siguiente.
3.  **Recomendación de Moto**: En el panel del Club debe aparecer la sección "IA Recomendadora" mostrando productos de la marca que registró. Al hacer click en uno de ellos, debe abrirse el modal oficial con los detalles del producto.
4.  **Flujo de Canje y Carrito**:
    *   Simule tener suficientes puntos y canjee un cupón.
    *   Vaya a "Mis Cupones Activos" y haga click en "Aplicar".
    *   Abra el carrito de compras y verifique que aparezca la etiqueta verde del cupón aplicado y el total recalculado con descuento.
5.  **WhatsApp Checkout y Registro en DB**: Rellene los datos de envío en el carrito y haga click en "Confirmar e Ir a WhatsApp". El mensaje de texto generado debe incluir el descuento restado del total.
6.  **Panel Admin**: Abra el Club, haga clic en el engranaje (`⚙`), ingrese la clave `admin` y verifique que tanto su registro de cliente como la consulta realizada en el paso anterior figuren en las tablas del Panel Admin con opción de descarga CSV. Pruebe también a cambiar la clave desde la sección **Seguridad** para comprobar que se actualice correctamente.
