# -*- coding: utf-8 -*-
"""
Dibujo de la marca Pantallazo con PIL.

Aqui vive todo lo visual: la paleta, la fuente, el logo y las piezas
sueltas (titulos, listas, pastillas). Las plantillas de cada tipo de
publicacion estan en plantillas.py y el contenido en contenido.py.

No se toca nada de aqui para cambiar textos ni precios.
"""

import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

RAIZ = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(RAIZ, "fuente", "PlusJakartaSans.ttf")

# ---------------------------------------------------------------- paleta
# Los mismos valores que :root en index.html. Si cambia la web, cambia aqui.
FONDO = "#07100c"
FONDO_2 = "#0d1a14"
TARJETA = "#122219"
TARJETA_2 = "#1b2f23"
LINEA = "#27412f"
TEXTO = "#eef7f1"
APAGADO = "#a7c0b2"
TENUE = "#7e9889"
VERDE = "#1DB954"
VERDE_CLARO = "#27cf64"
MENTA = "#8BE8AC"
TINTA = "#04230f"
ROSA = "#ff8fa3"

WEB = "pantallazo.site"
WHATSAPP = "+57 310 707 5235"

_cache_fuente = {}


def f(tamano, peso="Bold"):
    """Fuente Plus Jakarta Sans en el tamano y peso pedidos."""
    clave = (tamano, peso)
    if clave not in _cache_fuente:
        fuente = ImageFont.truetype(FUENTE, tamano)
        fuente.set_variation_by_name(peso)
        _cache_fuente[clave] = fuente
    return _cache_fuente[clave]


def ancho(d, texto, fuente):
    caja = d.textbbox((0, 0), texto, font=fuente)
    return caja[2] - caja[0]


def alto(d, texto, fuente):
    caja = d.textbbox((0, 0), texto, font=fuente)
    return caja[3] - caja[1]


def espaciado(d, xy, texto, fuente, fill, track=0, anclaje="la"):
    """Escribe con separacion extra entre letras (para los antetitulos)."""
    if track == 0:
        d.text(xy, texto, font=fuente, fill=fill, anchor=anclaje)
        return ancho(d, texto, fuente)
    total = sum(ancho(d, c, fuente) + track for c in texto) - track
    x, y = xy
    if anclaje[0] == "m":
        x -= total / 2
    for c in texto:
        d.text((x, y), c, font=fuente, fill=fill, anchor="l" + anclaje[1])
        x += ancho(d, c, fuente) + track
    return total


def ajustar(d, texto, fuente_peso, maximo, limite, minimo=28):
    """Baja el tamano de letra hasta que el texto quepa en `limite` px."""
    t = maximo
    while t > minimo and ancho(d, texto, f(t, fuente_peso)) > limite:
        t -= 2
    return f(t, fuente_peso)


def envolver(d, texto, fuente, limite):
    """Parte el texto en lineas que no pasen de `limite` px."""
    palabras = texto.split()
    lineas, actual = [], ""
    for p in palabras:
        prueba = (actual + " " + p).strip()
        if ancho(d, prueba, fuente) <= limite or not actual:
            actual = prueba
        else:
            lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


# ------------------------------------------------------------------ fondo
def _hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lienzo(w, h, brillo=(0.78, 0.18), fuerza=0.30):
    """
    Fondo de marca: verde muy oscuro con un resplandor suave.
    `brillo` es donde cae el resplandor en proporciones de 0 a 1.
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w * brillo[0], h * brillo[1]
    radio = max(w, h) * 0.78
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / radio
    halo = np.clip(1.0 - dist, 0.0, 1.0) ** 2.2 * fuerza

    base = np.array(_hex_rgb(FONDO), dtype=np.float32)
    luz = np.array(_hex_rgb(VERDE), dtype=np.float32)
    px = base[None, None, :] + (luz - base)[None, None, :] * halo[:, :, None]

    # Vineta inferior para que el pie de la pieza siempre tenga contraste.
    caida = np.clip((yy / h - 0.62) / 0.38, 0.0, 1.0) ** 1.6
    px *= (1.0 - caida * 0.35)[:, :, None]

    return Image.fromarray(np.clip(px, 0, 255).astype(np.uint8), "RGB")


# ------------------------------------------------------------------- logo
# El rayo del icono viene de marca/pantallazo-icono.svg (viewBox 48x48).
_RAYO = [(26.5, 11), (16, 25), (23, 25), (21, 34), (32, 20), (24.8, 20), (26.5, 11)]


def marca_icono(d, x, y, lado, color=VERDE, tinta=FONDO, con_pie=True):
    """Dibuja el icono (pantalla + rayo). `lado` es el ancho total."""
    e = lado / 48.0
    d.rounded_rectangle([x + 3 * e, y + 7 * e, x + 45 * e, y + 37 * e],
                        radius=7 * e, fill=color)
    d.polygon([(x + px * e, y + py * e) for px, py in _RAYO], fill=tinta)
    if con_pie:
        d.rounded_rectangle([x + 16 * e, y + 40 * e, x + 32 * e, y + 44 * e],
                            radius=2 * e, fill=color)
    return lado * (44.0 / 48.0)


def rayo_solo(d, cx, cy, altura, color):
    """Solo el rayo, centrado, para la foto de perfil."""
    e = altura / 23.0  # el rayo mide 23 unidades de alto (de y=11 a y=34)
    puntos = [(cx + (px - 24) * e, cy + (py - 22.5) * e) for px, py in _RAYO]
    d.polygon(puntos, fill=color)


def encabezado(d, x, y, escala=1.0):
    """Logo + palabra PANTALLAZO, arriba a la izquierda de cada pieza."""
    lado = int(58 * escala)
    marca_icono(d, x, y, lado, con_pie=False)
    fu = f(int(31 * escala), "ExtraBold")
    espaciado(d, (x + lado + int(20 * escala), y + lado * 0.42),
              "PANTALLAZO", fu, TEXTO, track=int(2 * escala), anclaje="lm")


def pie(d, w, h, margen, nota=None):
    """Web a la izquierda, WhatsApp a la derecha."""
    y = h - margen - 10
    d.text((margen, y), WEB, font=f(34, "ExtraBold"), fill=VERDE, anchor="ls")
    d.text((w - margen, y), "WhatsApp " + WHATSAPP, font=f(27, "Medium"),
           fill=APAGADO, anchor="rs")
    if nota:
        d.text((margen, y - 52), nota, font=f(25, "Medium"), fill=TENUE, anchor="ls")


# --------------------------------------------------------------- piezas
def antetitulo(d, x, y, texto, color=MENTA, tamano=26):
    espaciado(d, (x, y), texto.upper(), f(tamano, "ExtraBold"), color, track=4)
    return y + tamano + 26


def titular(d, x, y, texto, limite, tamano=78, color=TEXTO, interlinea=1.14):
    fu = f(tamano, "ExtraBold")
    lineas = envolver(d, texto, fu, limite)
    paso = int(tamano * interlinea)
    for i, ln in enumerate(lineas):
        d.text((x, y + i * paso), ln, font=fu, fill=color)
    return y + len(lineas) * paso


def parrafo(d, x, y, texto, limite, tamano=33, color=APAGADO, interlinea=1.42):
    fu = f(tamano, "Medium")
    lineas = envolver(d, texto, fu, limite)
    paso = int(tamano * interlinea)
    for i, ln in enumerate(lineas):
        d.text((x, y + i * paso), ln, font=fu, fill=color)
    return y + len(lineas) * paso


def pastilla(d, x, y, texto, fondo=VERDE, tinta=TINTA, tamano=27, alto_px=56):
    fu = f(tamano, "ExtraBold")
    w = ancho(d, texto, fu) + 44
    d.rounded_rectangle([x, y, x + w, y + alto_px], radius=alto_px // 2, fill=fondo)
    d.text((x + w / 2, y + alto_px / 2 + 1), texto, font=fu, fill=tinta, anchor="mm")
    return w


def barra(d, x, y, h, color=VERDE, grosor=9):
    d.rounded_rectangle([x, y, x + grosor, y + h], radius=grosor // 2, fill=color)


def nueva(w=1080, h=1080, brillo=(0.78, 0.18)):
    img = lienzo(w, h, brillo)
    return img, ImageDraw.Draw(img)


def guardar(img, nombre):
    ruta = os.path.join(RAIZ, "imagenes", nombre)
    img.save(ruta, "PNG", optimize=True)
    return ruta
