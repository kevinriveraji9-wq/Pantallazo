<?php
/*
 * Pantallazo · API para hosting PHP (DoWeb / cPanel).
 * Rutas: api.php?r=salud | catalogo | login | logout | cuentas
 * Requiere config.php (copia config.ejemplo.php y pon tu clave).
 * Compatible con PHP 7.4 o superior. No usa base de datos: guarda JSON en la carpeta de datos.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');

if (!function_exists('mb_substr')) { function mb_substr($s, $a, $l = null) { return $l === null ? substr($s, $a) : substr($s, $a, $l); } }
if (!function_exists('mb_strtolower')) { function mb_strtolower($s) { return strtolower($s); } }

function responder($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fallar($code, $msg) { responder($code, ['error' => $msg]); }

/* config.php is looked for next to api.php, or (safer) in a "pantallazo-datos" folder outside the web root */
$CONFIG = null;
foreach ([__DIR__ . '/config.php', dirname(__DIR__) . '/pantallazo-datos/config.php', dirname(__DIR__, 2) . '/pantallazo-datos/config.php'] as $c) {
  if (is_file($c)) { $CONFIG = $c; break; }
}
if (!$CONFIG) fallar(500, 'Falta el archivo config.php en el servidor. Cópialo desde config.ejemplo.php y pon tu clave.');
require $CONFIG;

/* data folder: DATA_DIR, or the folder that holds config.php when it lives outside the web, or ./data */
$porDefecto = basename(dirname($CONFIG)) === 'pantallazo-datos' ? dirname($CONFIG) : __DIR__ . '/data';
$DATA = rtrim(defined('DATA_DIR') && DATA_DIR ? DATA_DIR : $porDefecto, '/\\');
$CATALOGO = $DATA . '/catalogo.json';
$CUENTAS = $DATA . '/cuentas.json';
$SESIONES = $DATA . '/sesiones.json';
$INTENTOS = $DATA . '/intentos.json';
$RESPALDOS = $DATA . '/respaldos';
$HORAS = defined('SESION_HORAS') ? (int) SESION_HORAS : 12;

if (!is_dir($DATA) && !@mkdir($DATA, 0750, true)) fallar(500, 'No se pudo crear la carpeta de datos. Revisa DATA_DIR en config.php.');
/* first run with a data folder outside public_html: copy the bundled catalog */
if (!is_file($CATALOGO) && is_file(__DIR__ . '/data/catalogo.json') && realpath(__DIR__ . '/data') !== realpath($DATA)) {
  @copy(__DIR__ . '/data/catalogo.json', $CATALOGO);
}
/* keep the data folder closed to the web even if someone points DATA_DIR inside public_html */
if (!is_file($DATA . '/.htaccess')) @file_put_contents($DATA . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
if (!is_file($DATA . '/index.html')) @file_put_contents($DATA . '/index.html', '');

/* ---------- files ---------- */
function leerJSON($file, $defecto) {
  if (!is_file($file)) return $defecto;
  $t = @file_get_contents($file);
  $d = json_decode((string) $t, true);
  return is_array($d) ? $d : $defecto;
}
function escribirJSON($file, $data, $prefijoRespaldo = null) {
  global $RESPALDOS;
  if ($prefijoRespaldo && is_file($file)) {
    if (!is_dir($RESPALDOS)) @mkdir($RESPALDOS, 0750, true);
    @copy($file, $RESPALDOS . '/' . $prefijoRespaldo . '-' . gmdate('Y-m-d\TH-i-s') . '-' . substr(md5(uniqid('', true)), 0, 4) . '.json');
    $viejos = glob($RESPALDOS . '/' . $prefijoRespaldo . '-*.json') ?: [];
    sort($viejos);
    while (count($viejos) > 40) @unlink(array_shift($viejos));
  }
  $tmp = $file . '.' . getmypid() . '.tmp';
  $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if ($json === false || @file_put_contents($tmp, $json, LOCK_EX) === false) fallar(500, 'No se pudo guardar. Revisa los permisos de la carpeta de datos.');
  if (!@rename($tmp, $file)) { @unlink($file); if (!@rename($tmp, $file)) fallar(500, 'No se pudo guardar el archivo.'); }
}
/* one writer at a time */
function bloquear() {
  global $DATA;
  $h = fopen($DATA . '/.lock', 'c');
  if ($h) flock($h, LOCK_EX);
  return $h;
}

/* ---------- helpers ---------- */
function txt($v, $max) { return is_string($v) ? mb_substr(trim($v), 0, $max) : ''; }
function num($v, $min, $max) { if (!is_numeric($v)) return null; $n = (float) $v; return max($min, min($max, $n)); }
function slug($v) {
  $v = mb_strtolower(txt((string) $v, 40));
  $v = strtr($v, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n', 'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u', 'ç' => 'c', 'ã' => 'a', 'õ' => 'o', 'â' => 'a', 'ê' => 'e', 'ô' => 'o']);
  return trim(preg_replace('/[^a-z0-9]+/', '-', $v), '-');
}
function hoy() { return date('Y-m-d'); }
function fecha($v) { return (is_string($v) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) ? $v : ''; }
function ipCliente() {
  if (defined('CONFIAR_PROXY') && CONFIAR_PROXY && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
  return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
}
function cuerpo() {
  $raw = file_get_contents('php://input', false, null, 0, 4 * 1024 * 1024 + 1);
  if (strlen((string) $raw) > 4 * 1024 * 1024) fallar(413, 'Los datos son demasiado grandes.');
  $d = json_decode((string) $raw, true);
  if (!is_array($d)) fallar(400, 'Datos inválidos.');
  return $d;
}

/* ---------- sessions (token files, hashed) ---------- */
function tokenRecibido() {
  foreach (['HTTP_X_TOKEN', 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $k) {
    if (!empty($_SERVER[$k])) { $v = trim($_SERVER[$k]); return stripos($v, 'Bearer ') === 0 ? substr($v, 7) : $v; }
  }
  return '';
}
function autenticado() {
  global $SESIONES;
  $t = tokenRecibido();
  if ($t === '') return false;
  $s = leerJSON($SESIONES, []);
  $k = hash('sha256', $t);
  return isset($s[$k]) && $s[$k] > time();
}
function exigirSesion() { if (!autenticado()) fallar(401, 'Tu sesión expiró. Vuelve a entrar.'); }

/* ---------- validation (same rules as the panel) ---------- */
function validarCatalogo($c) {
  if (!is_array($c)) fallar(400, 'Formato inválido');
  $out = [
    'negocio' => txt(isset($c['negocio']) ? $c['negocio'] : '', 60) ?: 'Mi tienda',
    'whatsapp' => substr(preg_replace('/\D/', '', (string) (isset($c['whatsapp']) ? $c['whatsapp'] : '')), 0, 15),
    'whatsappVisible' => txt(isset($c['whatsappVisible']) ? $c['whatsappVisible'] : '', 30),
    'horario' => txt(isset($c['horario']) ? $c['horario'] : '', 80),
    'locale' => (isset($c['locale']) && preg_match('/^[a-z]{2}-[A-Z]{2}$/', $c['locale'])) ? $c['locale'] : 'es-CO',
    'moneda' => (isset($c['moneda']) && preg_match('/^[A-Z]{3}$/', $c['moneda'])) ? $c['moneda'] : 'COP',
    'comboDescuento' => (float) (num(isset($c['comboDescuento']) ? $c['comboDescuento'] : 0, 0, 0.9) ?: 0),
    'meses' => [], 'categorias' => [], 'productos' => []
  ];
  if (strlen($out['whatsapp']) < 8) fallar(400, 'El número de WhatsApp no es válido');
  $vistos = [];
  foreach ((isset($c['meses']) && is_array($c['meses'])) ? $c['meses'] : [] as $m) {
    $n = (int) round((float) (num(isset($m['meses']) ? $m['meses'] : 0, 1, 36) ?: 0));
    if ($n && !isset($vistos[$n])) { $vistos[$n] = 1; $out['meses'][] = ['meses' => $n, 'descuento' => (float) (num(isset($m['descuento']) ? $m['descuento'] : 0, 0, 0.9) ?: 0)]; }
  }
  if (!$out['meses']) fallar(400, 'Debe haber al menos una duración');
  usort($out['meses'], function ($a, $b) { return $a['meses'] - $b['meses']; });

  $cats = [];
  foreach ((isset($c['categorias']) && is_array($c['categorias'])) ? $c['categorias'] : [] as $k) {
    $nombre = txt(isset($k['nombre']) ? $k['nombre'] : '', 40);
    $id = slug(isset($k['id']) && $k['id'] !== '' ? $k['id'] : $nombre);
    if ($id !== '' && $nombre !== '' && !isset($cats[$id])) { $cats[$id] = 1; $out['categorias'][] = ['id' => $id, 'nombre' => $nombre]; }
  }
  if (!$out['categorias']) fallar(400, 'Debe haber al menos una categoría');

  $prodIds = [];
  foreach ((isset($c['productos']) && is_array($c['productos'])) ? $c['productos'] : [] as $p) {
    if (!is_array($p)) continue;
    $nombre = txt(isset($p['nombre']) ? $p['nombre'] : '', 50);
    $id = slug(isset($p['id']) && $p['id'] !== '' ? $p['id'] : $nombre);
    if ($nombre === '' || $id === '') fallar(400, 'Hay un producto sin nombre');
    while (isset($prodIds[$id])) $id .= '-2';
    $prodIds[$id] = 1;
    $cat = isset($p['categoria']) ? (string) $p['categoria'] : '';
    if (!isset($cats[$cat])) fallar(400, 'La categoría de ' . $nombre . ' no existe');
    $opIds = []; $ops = [];
    foreach ((isset($p['opciones']) && is_array($p['opciones'])) ? $p['opciones'] : [] as $o) {
      $on = txt(isset($o['nombre']) ? $o['nombre'] : '', 40);
      $oid = slug(isset($o['id']) && $o['id'] !== '' ? $o['id'] : $on);
      if ($on === '' || $oid === '') fallar(400, 'Una opción de ' . $nombre . ' no tiene nombre');
      while (isset($opIds[$oid])) $oid .= '-2';
      $opIds[$oid] = 1;
      $precio = num(isset($o['precio']) ? $o['precio'] : null, 0, 1e9);
      if ($precio === null) fallar(400, 'El precio de ' . $nombre . ' / ' . $on . ' no es válido');
      $st = array_key_exists('stock', $o) ? $o['stock'] : null;
      $stock = ($st === null || $st === '') ? null : (int) round((float) (num($st, 0, 1e6) ?: 0));
      $tipo = (isset($o['tipo']) && in_array($o['tipo'], ['perfil', 'cuenta'], true)) ? $o['tipo'] : 'manual';
      $ops[] = ['id' => $oid, 'nombre' => $on, 'precio' => (int) round($precio), 'stock' => $stock, 'tipo' => $tipo];
    }
    if (!$ops) fallar(400, $nombre . ' necesita al menos una opción de venta');
    $out['productos'][] = [
      'id' => $id, 'nombre' => $nombre, 'categoria' => $cat,
      'color' => (isset($p['color']) && preg_match('/^#[0-9a-f]{6}$/i', $p['color'])) ? $p['color'] : '#FFC83D',
      'nota' => txt(isset($p['nota']) ? $p['nota'] : '', 80),
      'popular' => !empty($p['popular']), 'activo' => !(isset($p['activo']) && $p['activo'] === false),
      'opciones' => $ops
    ];
  }
  return $out;
}

function validarCuentas($c, $catalogo) {
  $productos = [];
  foreach ($catalogo['productos'] as $p) $productos[$p['id']] = 1;
  $ids = []; $cuentas = [];
  foreach ((isset($c['cuentas']) && is_array($c['cuentas'])) ? $c['cuentas'] : [] as $a) {
    if (!is_array($a) || !isset($productos[isset($a['producto']) ? $a['producto'] : ''])) fallar(400, 'Hay una cuenta con un producto que no existe');
    $id = preg_replace('/[^a-z0-9-]/i', '', txt(isset($a['id']) ? $a['id'] : '', 30)) ?: bin2hex(random_bytes(5));
    while (isset($ids[$id])) $id .= 'x';
    $ids[$id] = 1;
    $perfiles = [];
    foreach (array_slice((isset($a['perfiles']) && is_array($a['perfiles'])) ? $a['perfiles'] : [], 0, 20) as $i => $p) {
      $v = is_array($p) && isset($p['estado']) && $p['estado'] === 'vendido';
      $perfiles[] = [
        'id' => preg_replace('/[^a-z0-9-]/i', '', txt(isset($p['id']) ? $p['id'] : '', 30)) ?: 'p' . ($i + 1),
        'nombre' => txt(isset($p['nombre']) ? $p['nombre'] : '', 30) ?: 'Perfil ' . ($i + 1),
        'pin' => txt(isset($p['pin']) ? $p['pin'] : '', 10),
        'estado' => $v ? 'vendido' : 'libre',
        'cliente' => $v ? txt(isset($p['cliente']) ? $p['cliente'] : '', 60) : '',
        'telefono' => $v ? substr(preg_replace('/\D/', '', (string) (isset($p['telefono']) ? $p['telefono'] : '')), 0, 15) : '',
        'venta' => $v ? fecha(isset($p['venta']) ? $p['venta'] : '') : '',
        'vence' => $v ? fecha(isset($p['vence']) ? $p['vence'] : '') : '',
        'precio' => $v ? (int) round((float) (num(isset($p['precio']) ? $p['precio'] : 0, 0, 1e9) ?: 0)) : 0
      ];
    }
    if (!$perfiles) fallar(400, 'Cada cuenta necesita al menos un perfil');
    $cuentas[] = [
      'id' => $id, 'producto' => $a['producto'],
      'correo' => txt(isset($a['correo']) ? $a['correo'] : '', 120), 'clave' => txt(isset($a['clave']) ? $a['clave'] : '', 120),
      'vence' => fecha(isset($a['vence']) ? $a['vence'] : ''), 'costo' => (int) round((float) (num(isset($a['costo']) ? $a['costo'] : 0, 0, 1e9) ?: 0)),
      'notas' => txt(isset($a['notas']) ? $a['notas'] : '', 300), 'completa' => !empty($a['completa']), 'perfiles' => $perfiles
    ];
  }
  return ['cuentas' => $cuentas];
}

/* free stock per product from the accounts (expired accounts do not count) */
function catalogoPublico($cat, $cuentas) {
  $s = []; $t = hoy();
  foreach ($cuentas as $a) {
    if (!empty($a['vence']) && $a['vence'] < $t) continue;
    if (!isset($s[$a['producto']])) $s[$a['producto']] = ['perfil' => 0, 'cuenta' => 0];
    if (!empty($a['completa'])) continue;
    $libres = 0;
    foreach ($a['perfiles'] as $p) if ($p['estado'] === 'libre') $libres++;
    $s[$a['producto']]['perfil'] += $libres;
    if ($libres === count($a['perfiles'])) $s[$a['producto']]['cuenta'] += 1;
  }
  foreach ($cat['productos'] as &$p) {
    foreach ($p['opciones'] as &$o) {
      if (isset($o['tipo']) && ($o['tipo'] === 'perfil' || $o['tipo'] === 'cuenta')) $o['stock'] = isset($s[$p['id']]) ? $s[$p['id']][$o['tipo']] : 0;
    }
    unset($o);
  }
  unset($p);
  return $cat;
}

/* ---------- routes ---------- */
$r = isset($_GET['r']) ? $_GET['r'] : '';
$m = $_SERVER['REQUEST_METHOD'];
$guardar = ($m === 'POST' || $m === 'PUT');

if ($r === 'salud') responder(200, ['ok' => true, 'php' => PHP_VERSION]);

if ($r === 'catalogo' && $m === 'GET') {
  $cat = leerJSON($CATALOGO, null);
  if (!$cat) fallar(500, 'No se encontró el catálogo en la carpeta de datos.');
  if (isset($_GET['raw']) && $_GET['raw'] === '1' && autenticado()) responder(200, $cat);
  $cu = leerJSON($CUENTAS, ['cuentas' => []]);
  responder(200, catalogoPublico($cat, isset($cu['cuentas']) ? $cu['cuentas'] : []));
}

if ($r === 'login' && $m === 'POST') {
  /* La clave puede ser corta (un PIN), así que el freno por intentos es lo que la protege:
     5 fallos desde una IP la bloquean 15 minutos, y 20 fallos en total (vengan de donde vengan)
     bloquean el panel 15 minutos. Además cada fallo tarda medio segundo en responder. */
  $clave = defined('ADMIN_PASSWORD') ? (string) ADMIN_PASSWORD : '';
  if (strlen($clave) < 6 || $clave === 'CAMBIA-ESTA-CLAVE') fallar(500, 'Configura una clave de al menos 6 caracteres en config.php.');
  $lock = bloquear();
  $ip = ipCliente();
  $ahora = time();
  $est = leerJSON($INTENTOS, []);
  if (!isset($est['ips']) || !is_array($est['ips'])) $est = ['ips' => [], 'fallos' => [], 'hasta' => 0];
  if (!isset($est['fallos']) || !is_array($est['fallos'])) $est['fallos'] = [];
  if (!isset($est['hasta'])) $est['hasta'] = 0;
  foreach ($est['ips'] as $k => $v) if (!is_array($v) || (empty($v['n']) && (!isset($v['hasta']) || $v['hasta'] < $ahora))) unset($est['ips'][$k]);
  $est['fallos'] = array_values(array_filter($est['fallos'], function ($t) use ($ahora) { return is_numeric($t) && $t > $ahora - 900; }));
  $a = (isset($est['ips'][$ip]) && is_array($est['ips'][$ip])) ? $est['ips'][$ip] : ['n' => 0, 'hasta' => 0];
  if ($a['hasta'] > $ahora || $est['hasta'] > $ahora) fallar(429, 'Demasiados intentos. Espera 15 minutos.');
  $b = cuerpo();
  $pass = isset($b['password']) ? (string) $b['password'] : '';
  $ok = strpos($clave, '$2y$') === 0 ? password_verify($pass, $clave) : hash_equals(hash('sha256', $clave), hash('sha256', $pass));
  if (!$ok) {
    usleep(500000);
    $a['n']++;
    if ($a['n'] >= 5) $a = ['n' => 0, 'hasta' => $ahora + 900];
    $est['ips'][$ip] = $a;
    $est['fallos'][] = $ahora;
    if (count($est['fallos']) >= 20) { $est['hasta'] = $ahora + 900; $est['fallos'] = []; }
    escribirJSON($INTENTOS, $est);
    fallar(401, 'Clave incorrecta');
  }
  unset($est['ips'][$ip]);
  escribirJSON($INTENTOS, $est);
  $token = rtrim(strtr(base64_encode(random_bytes(24)), '+/', '-_'), '=');
  $s = leerJSON($SESIONES, []);
  foreach ($s as $k => $exp) if ($exp < time()) unset($s[$k]);
  $s[hash('sha256', $token)] = time() + $HORAS * 3600;
  escribirJSON($SESIONES, $s);
  responder(200, ['token' => $token]);
}

if ($r === 'logout' && $m === 'POST') {
  $lock = bloquear();
  $s = leerJSON($SESIONES, []);
  unset($s[hash('sha256', tokenRecibido())]);
  escribirJSON($SESIONES, $s);
  responder(200, ['ok' => true]);
}

if ($r === 'catalogo' && $guardar) {
  exigirSesion();
  $lock = bloquear();
  $limpio = validarCatalogo(cuerpo());
  escribirJSON($CATALOGO, $limpio, 'catalogo');
  responder(200, $limpio);
}

if ($r === 'cuentas' && $m === 'GET') {
  exigirSesion();
  responder(200, leerJSON($CUENTAS, ['cuentas' => []]));
}

if ($r === 'cuentas' && $guardar) {
  exigirSesion();
  $lock = bloquear();
  $cat = leerJSON($CATALOGO, ['productos' => []]);
  $limpio = validarCuentas(cuerpo(), $cat);
  escribirJSON($CUENTAS, $limpio, 'cuentas');
  responder(200, $limpio);
}

fallar(404, 'No existe');
