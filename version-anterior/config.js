/* =========================================================
   CONFIGURACIÓN DE LA TIENDA — edita solo este archivo
   ========================================================= */
window.CONFIG = {
  // Nombre que aparece en la página y en el mensaje de WhatsApp
  negocio: "Pantallazo",

  // Tu número de WhatsApp: código de país + número, solo dígitos (sin +, espacios ni guiones)
  whatsapp: "573000000000",
  // Cómo se muestra el número en la página
  whatsappVisible: "+57 300 000 0000",

  // Horario de atención (se muestra en la página)
  horario: "Todos los días, 8:00 a. m. a 10:00 p. m.",

  // Formato de moneda
  locale: "es-CO",
  moneda: "COP",

  // Duraciones y descuento por duración (0.05 = 5 %)
  meses: [
    { meses: 1, descuento: 0 },
    { meses: 3, descuento: 0.05 },
    { meses: 6, descuento: 0.10 }
  ],

  // Descuento extra si el pedido lleva 2 o más plataformas distintas (0 para desactivarlo)
  comboDescuento: 0.10,

  // Precio POR MES. Pon null si no vendes esa modalidad.
  // categoria: "video" o "musica" (sirve para los filtros del catálogo)
  // color: color de la tarjeta de la plataforma
  servicios: [
    { id: "netflix",     nombre: "Netflix",         categoria: "video",  color: "#E50914", texto: "#ffffff", nota: "Cuenta completa: 4 perfiles",   pantalla: 16000, cuenta: 52000, popular: true },
    { id: "disney",      nombre: "Disney+",         categoria: "video",  color: "#0E2A8C", texto: "#ffffff", nota: "Cuenta completa: 4 perfiles",   pantalla: 10000, cuenta: 30000 },
    { id: "max",         nombre: "Max",             categoria: "video",  color: "#002BE7", texto: "#ffffff", nota: "Cuenta completa: 3 perfiles",   pantalla: 9000,  cuenta: 26000, popular: true },
    { id: "prime",       nombre: "Prime Video",     categoria: "video",  color: "#00A8E1", texto: "#04121a", nota: "Cuenta completa: 3 perfiles",   pantalla: 8000,  cuenta: 22000 },
    { id: "paramount",   nombre: "Paramount+",      categoria: "video",  color: "#0064FF", texto: "#ffffff", nota: "Cuenta completa: 3 perfiles",   pantalla: 7000,  cuenta: 19000 },
    { id: "crunchyroll", nombre: "Crunchyroll",     categoria: "video",  color: "#F47521", texto: "#1a0d03", nota: "Cuenta completa: 4 perfiles",   pantalla: 7000,  cuenta: 18000 },
    { id: "spotify",     nombre: "Spotify Premium", categoria: "musica", color: "#1DB954", texto: "#04140a", nota: "Cuenta individual a tu nombre", pantalla: null,  cuenta: 11000 },
    { id: "youtube",     nombre: "YouTube Premium", categoria: "musica", color: "#FF0033", texto: "#ffffff", nota: "Cuenta individual a tu nombre", pantalla: null,  cuenta: 12000 }
  ]
};
