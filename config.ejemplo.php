<?php
/*
 * CONFIGURACIÓN DEL SERVIDOR
 * 1. Copia este archivo y llámalo config.php. Lo más seguro es guardarlo en una carpeta
 *    "pantallazo-datos" FUERA de public_html (por ejemplo /home/usuario/pantallazo-datos/config.php):
 *    api.php lo encuentra solo y guarda ahí también el catálogo, las cuentas y los respaldos.
 *    También funciona junto a api.php.
 * 2. Cambia la clave. Nunca subas config.php a GitHub (ya está excluido).
 */

// Clave del panel de administración (mínimo 10 caracteres).
define('ADMIN_PASSWORD', 'CAMBIA-ESTA-CLAVE');

// Carpeta donde se guardan el catálogo, las cuentas y los respaldos.
// Lo más seguro es ponerla FUERA de public_html, por ejemplo:
//   define('DATA_DIR', '/home/TU_USUARIO_CPANEL/pantallazo-datos');
// Si la dejas vacía: usa la carpeta donde está este config.php cuando se llama "pantallazo-datos",
// o si no, la carpeta "data" junto a api.php (protegida con .htaccess).
define('DATA_DIR', '');

// Horas que dura la sesión del panel.
define('SESION_HORAS', 12);

// Pon true solo si tu hosting está detrás de Cloudflare u otro proxy.
define('CONFIAR_PROXY', false);
