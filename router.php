<?php
/*
 * Solo para probar en tu computador (no se usa en DoWeb):
 *   php -S localhost:5173 router.php
 * Imita las reglas del .htaccess: /admin abre el panel y bloquea los archivos privados.
 */
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($path === '/admin' || $path === '/admin/') { readfile(__DIR__ . '/admin.html'); return true; }
if (preg_match('#^/(data|plantillas|\.git|\.claude)(/|$)#', $path)
  || preg_match('#(^|/)(config\.php|config\.ejemplo\.php|router\.php|\.htaccess|\.gitignore)$|\.(json|md|csv|lock|tmp|log|zip)$#', $path)) {
  http_response_code(403); echo 'Prohibido'; return true;
}
return false;
