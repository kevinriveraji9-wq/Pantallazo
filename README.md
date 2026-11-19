# Pantallazo

Tienda de pantallas y cuentas de streaming con pedido por WhatsApp, panel de administración e inventario de cuentas. Funciona en cualquier hosting con **PHP 7.4 o superior** (DoWeb, cPanel) y **no necesita base de datos**: guarda todo en archivos JSON.

## Qué hay en el proyecto

| Archivo o carpeta | Para qué sirve |
|---|---|
| `index.html`, `app.js` | La tienda que ven tus clientes |
| `admin.html`, `admin.js` | El panel de administración (`tudominio.com/admin`) |
| `api.php` | El servidor: une la tienda con el panel y guarda los datos |
| `config.ejemplo.php` | Plantilla de configuración. En el hosting se copia como `config.php` |
| `.htaccess` | Seguridad y rutas para Apache / LiteSpeed |
| `data/catalogo.json` | Catálogo inicial: productos, categorías, precios y ajustes |
| `marca/` | Logo e imágenes de la marca |
| `plantillas/plantilla-inventario.csv` | Plantilla para cargar el inventario desde Excel |
| `router.php` | Solo para probar en tu computador |
| `version-anterior/` | Primer diseño. No se publica |

## Cómo está instalado en DonWeb (pantallazo.site)

- Tienda: **https://pantallazo.site**
- Panel: **https://pantallazo.site/admin**

Certificado SSL de Let's Encrypt incluido en el plan, con renovación automática. El paso de `http` a `https` lo hace el `.htaccess` de la raíz; por eso el de la tienda lo tiene desactivado.


La tienda comparte el hosting *Web Hosting Plan Full* con Costruker, sin afectarlo:

| Qué | Dónde |
|---|---|
| Código de la tienda | `/public_html/pantallazo/`, desplegado desde este repositorio con **Ferozo > Mi Sitio Web > GIT** |
| Clave y datos privados | `/pantallazo-datos/` (fuera de la web): `config.php`, `catalogo.json`, `cuentas.json`, `respaldos/` |
| Dominio | `pantallazo.site` agregado en *Mi Cuenta > Web Hosting > Dominios configurados* |
| Enrutamiento | 3 reglas al inicio del `.htaccess` del repositorio de Costruker (`yo`) que mandan `pantallazo.site` a `/pantallazo/` |

**Para actualizar la tienda:** sube los cambios a este repositorio y en Ferozo > GIT pulsa *Desplegar* en la fila de Pantallazo. Tus datos no se tocan porque viven en `/pantallazo-datos/`.

**Para cambiar la clave del panel:** Ferozo > Administrador de archivos > `pantallazo-datos/config.php` > editar `ADMIN_PASSWORD`.

**Si quitas las 3 reglas del `.htaccess` de Costruker**, pantallazo.site deja de mostrar la tienda (la tienda sigue en `/public_html/pantallazo/`).

## Subirlo a otro hosting PHP (cPanel)

### 1. Prepara el hosting

1. Entra a tu cPanel de DoWeb.
2. En **Seleccionar versión de PHP** (o *MultiPHP Manager*) elige **PHP 8.1 o superior** para tu dominio.
3. En **SSL/TLS Status** activa el certificado gratuito (AutoSSL) para tu dominio.

### 2. Crea la carpeta de datos fuera de la web (recomendado)

En el **Administrador de archivos**, fuera de `public_html` (en la carpeta de tu usuario, por ejemplo `/home/tuusuario/`), crea una carpeta llamada `pantallazo-datos`. Ahí se guardarán tus cuentas, clientes y respaldos, y así nadie puede descargarlos aunque falle una regla del servidor.

Anota la ruta completa que muestra el Administrador de archivos, por ejemplo `/home/tuusuario/pantallazo-datos`.

### 3. Sube los archivos

**Opción A — ZIP (más fácil):**
1. Descarga este repositorio como ZIP (botón verde *Code > Download ZIP* en GitHub) o usa `pantallazo-doweb.zip`.
2. En el Administrador de archivos entra a `public_html` (o a la carpeta del dominio), pulsa **Cargar** y sube el ZIP.
3. Clic derecho sobre el ZIP > **Extraer**. Si se crea una subcarpeta (por ejemplo `Pantallazo-main`), mueve su contenido a `public_html`.
4. Verifica que estén `index.html`, `api.php` y `.htaccess` directamente en `public_html`. Para ver `.htaccess`, activa *Configuración > Mostrar archivos ocultos*.

**Opción B — Git desde cPanel:** si tu plan tiene **Git Version Control**, clona `https://github.com/kevinriveraji9-wq/Pantallazo.git` dentro de `public_html`. Con la carpeta de datos fuera de la web (paso 2), las actualizaciones nunca pisan tu inventario.

### 4. Crea `config.php`

1. En `public_html`, copia `config.ejemplo.php` y nombra la copia `config.php`.
2. Edítalo y cambia:
   - `ADMIN_PASSWORD`: tu clave del panel (mínimo 10 caracteres, larga y única).
   - `DATA_DIR`: la ruta del paso 2, por ejemplo `'/home/tuusuario/pantallazo-datos'`.
3. Guarda. La primera vez que abras la tienda, `api.php` copia el catálogo inicial a esa carpeta.

### 5. Comprueba que todo funcione

| Abre | Debe pasar |
|---|---|
| `https://tudominio.com` | Se ve la tienda |
| `https://tudominio.com/api.php?r=salud` | Muestra `{"ok":true,...}` |
| `https://tudominio.com/admin` | Pide la clave y entra al panel |
| `https://tudominio.com/config.php` | Página en blanco o error 403 (nunca muestra la clave) |
| `https://tudominio.com/data/catalogo.json` | Error 403 |

Cuando el certificado SSL esté activo, abre `.htaccess` y quita el `#` de las dos líneas de *Forzar HTTPS*.

### 6. Configura la tienda desde el panel

1. **Ajustes:** tu número de WhatsApp real (con código de país, por ejemplo `573001234567`), el nombre y el horario. Guarda.
2. **Inventario:** revisa los precios.
3. **Cuentas y perfiles > Importar desde Excel:** carga tu inventario (ver abajo).

Al compartir el enlace por WhatsApp se muestra el logo si cambias en `index.html` la línea `og:image` por la dirección completa: `https://tudominio.com/marca/pantallazo-logo-fondo-oscuro.png`.

## Cargar el inventario

Todas las opciones de venta usan **stock automático**: la tienda solo muestra como disponible lo que registres en *Cuentas y perfiles*. Sin inventario, los productos salen como **Agotado** con un botón para preguntar por WhatsApp.

1. Panel > **Cuentas y perfiles** > **Importar desde Excel** > **Descargar plantilla**.
2. Llénala en Excel o Google Sheets:
   - **Una fila por cuenta:** `producto`, `correo`, `clave`, `vence_cuenta` (cuándo le pagas al proveedor) y `perfiles` (cuántos tiene).
   - Si ya vendiste perfiles, **una fila por perfil vendido** con el mismo `producto` y `correo`, más `perfil`, `pin`, `cliente`, `telefono`, `vence_cliente` y `precio`.
   - **Cuenta completa vendida:** `si` en `cuenta_completa` y los datos del cliente en esa fila.
   - `producto` acepta el nombre de la tienda (Netflix, Disney+, Prime Video, Canva Pro, Gemini 3 Pro…). Fechas como `18/12/2026` o `2026-12-18`.
3. Guárdala como **CSV** y súbela, o copia las filas en Excel y pégalas en el cuadro.
4. **Revisar** muestra cuántas cuentas entran y qué filas tienen errores. Luego **Importar**.

Cada venta que registres en el panel descuenta el stock de la tienda al instante. **Exportar** descarga todo el inventario en Excel.

## Probar en tu computador

Con PHP instalado, en la carpeta del proyecto:

```powershell
php -S localhost:5173 router.php
```

Tienda en http://localhost:5173 y panel en http://localhost:5173/admin. La clave local está en `config.php` (créalo desde `config.ejemplo.php` si no existe).

## Seguridad y respaldos

- `config.php`, las cuentas, las sesiones y los respaldos **no se suben a GitHub** (`.gitignore`).
- Las claves de tus cuentas se guardan **sin cifrar** en `cuentas.json`. Por eso la carpeta de datos debe ir fuera de `public_html`. Si la dejas en `public_html/data`, la protegen `.htaccess` y `data/.htaccess`; comprueba el error 403 del paso 5.
- Cada cambio guarda una copia anterior en `respaldos/` dentro de la carpeta de datos (últimas 40).
- Descarga con **Exportar** un respaldo semanal y guárdalo en un lugar seguro: incluye claves.
- Freno contra adivinar la clave: 5 fallos desde una misma conexión la bloquean 15 minutos, 20 fallos en total bloquean el panel 15 minutos, y cada intento fallido tarda medio segundo en responder. La sesión dura 12 horas.
- Al actualizar la web, sube solo los archivos de la tienda; **no reemplaces la carpeta de datos**.
