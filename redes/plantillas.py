# -*- coding: utf-8 -*-
"""
Plantillas de las piezas para redes. Todas salen en 1080 x 1080,
que es el tamano que sirve igual en Facebook, Instagram y WhatsApp.

Cada funcion recibe un diccionario con los textos y devuelve la imagen.
Los textos viven en contenido.py.
"""

from PIL import Image, ImageDraw
import marca as m

L = 84                      # margen lateral
ANCHO_UTIL = 1080 - L * 2   # 912 px de texto


def _base(brillo=(0.78, 0.18)):
    img, d = m.nueva(1080, 1080, brillo)
    m.encabezado(d, L, L)
    return img, d


def precio_grande(p):
    """Una plataforma, su precio de pantalla y el de la cuenta completa."""
    img, d = _base()
    y = m.antetitulo(d, L, 232, p["ante"])

    fu = m.ajustar(d, p["plataforma"], "ExtraBold", 124, ANCHO_UTIL - 34)
    m.barra(d, L, y + 12, fu.size * 0.86, p.get("color", m.VERDE))
    d.text((L + 34, y), p["plataforma"], font=fu, fill=m.TEXTO)
    y += int(fu.size * 1.24)

    # Precio y "al mes" alineados por la base; la unidad va debajo, a lo ancho.
    fp = m.f(118, "ExtraBold")
    base = y + 112
    d.text((L, base), p["precio"], font=fp, fill=m.VERDE, anchor="ls")
    d.text((L + m.ancho(d, p["precio"], fp) + 20, base), "al mes",
           font=m.f(40, "Bold"), fill=m.APAGADO, anchor="ls")
    y = m.parrafo(d, L, base + 22, p["unidad"], ANCHO_UTIL, 29, m.TENUE, 1.34)

    y += 30
    d.line([L, y, 1080 - L, y], fill=m.LINEA, width=2)
    y += 40

    if p.get("segundo"):
        d.text((L, y), p["segundo"], font=m.f(37, "Bold"), fill=m.TEXTO)
        y += 60
    if p.get("nota"):
        y = m.parrafo(d, L, y, p["nota"], ANCHO_UTIL, 30, m.APAGADO)

    m.pastilla(d, L, max(826, y + 34), p.get("sello", "Garantia todo el periodo"))
    m.pie(d, 1080, 1080, L)
    return img


def lista_precios(p):
    """Varias plataformas con su precio, una por linea."""
    img, d = _base(brillo=(0.2, 0.12))
    y = m.antetitulo(d, L, 218, p["ante"])
    y = m.titular(d, L, y, p["titulo"], ANCHO_UTIL, 58)
    y += 24

    filas = p["filas"]
    paso = min(98, int((858 - y) / max(len(filas), 1)))
    # Si las filas quedan muy juntas, el detalle estorba mas de lo que aporta.
    con_detalle = paso >= 80
    for i, (nombre, precio, detalle) in enumerate(filas):
        cy = y + i * paso
        d.text((L, cy), nombre, font=m.f(37, "Bold"), fill=m.TEXTO)
        if detalle and con_detalle:
            d.text((L, cy + 42), detalle, font=m.f(21, "Medium"), fill=m.TENUE)
        d.text((1080 - L, cy + 2), precio, font=m.f(41, "ExtraBold"),
               fill=m.VERDE, anchor="ra")
        if i < len(filas) - 1:
            sy = cy + paso - 6
            d.line([L, sy, 1080 - L, sy], fill=m.LINEA, width=2)

    m.pie(d, 1080, 1080, L, p.get("nota"))
    return img


def declaracion(p):
    """Una idea sola, en letra grande. Para educar o dar confianza."""
    img, d = _base(brillo=(0.86, 0.82), )
    y = m.antetitulo(d, L, 268, p["ante"])
    fin = m.titular(d, L, y + 10, p["titulo"], ANCHO_UTIL,
                    p.get("tamano", 84), interlinea=1.12)
    if p.get("texto"):
        m.parrafo(d, L, fin + 44, p["texto"], ANCHO_UTIL - 40, 34, m.APAGADO)
    if p.get("sello"):
        m.pastilla(d, L, 826, p["sello"])
    m.pie(d, 1080, 1080, L)
    return img


def pasos(p):
    """Los pasos de la compra, numerados."""
    img, d = _base(brillo=(0.5, 0.1))
    y = m.antetitulo(d, L, 230, p["ante"])
    y = m.titular(d, L, y, p["titulo"], ANCHO_UTIL, 60)
    y += 34

    paso_alto = min(148, int((860 - y) / max(len(p["pasos"]), 1)))
    for i, (titulo, texto) in enumerate(p["pasos"]):
        cy = y + i * paso_alto
        d.ellipse([L, cy, L + 58, cy + 58], fill=m.VERDE)
        d.text((L + 29, cy + 30), str(i + 1), font=m.f(31, "ExtraBold"),
               fill=m.TINTA, anchor="mm")
        d.text((L + 88, cy - 2), titulo, font=m.f(38, "ExtraBold"), fill=m.TEXTO)
        m.parrafo(d, L + 88, cy + 48, texto, ANCHO_UTIL - 88, 27, m.APAGADO, 1.3)

    m.pie(d, 1080, 1080, L)
    return img


def numero(p):
    """Un numero muy grande: el descuento, el ahorro, el tiempo de entrega."""
    img, d = _base(brillo=(0.85, 0.2))
    y = m.antetitulo(d, L, 252, p["ante"])

    fn = m.ajustar(d, p["numero"], "ExtraBold", 290, ANCHO_UTIL)
    d.text((L, y + 6), p["numero"], font=fn, fill=m.VERDE)
    y += int(fn.size * 1.06)

    y = m.titular(d, L, y + 18, p["titulo"], ANCHO_UTIL, 64)
    if p.get("texto"):
        m.parrafo(d, L, y + 32, p["texto"], ANCHO_UTIL - 30, 33, m.APAGADO)
    m.pie(d, 1080, 1080, L)
    return img


def que_ver(p):
    """Recomendaciones: titulo de la serie y en que plataforma esta."""
    img, d = _base(brillo=(0.15, 0.15))
    y = m.antetitulo(d, L, 232, p["ante"])
    y = m.titular(d, L, y, p["titulo"], ANCHO_UTIL, 62)
    y += 30

    paso = max(112, min(152, int((842 - y) / max(len(p["items"]), 1))))
    for i, (titulo, donde, color) in enumerate(p["items"]):
        cy = y + i * paso
        fu = m.ajustar(d, titulo, "ExtraBold", 44, ANCHO_UTIL)
        d.text((L, cy), titulo, font=fu, fill=m.TEXTO)
        d.rounded_rectangle([L, cy + 56, L + 8, cy + 82], radius=4, fill=color)
        d.text((L + 24, cy + 56), donde, font=m.f(26, "SemiBold"), fill=m.APAGADO)

    m.pie(d, 1080, 1080, L, p.get("nota"))
    return img


def pregunta(p):
    """Para que la gente comente. Texto corto y centrado."""
    img, d = m.nueva(1080, 1080, (0.5, 0.5))
    m.encabezado(d, L, L)
    fu = m.f(26, "ExtraBold")
    m.espaciado(d, (540, 300), p["ante"].upper(), fu, m.MENTA, track=4, anclaje="ma")

    fug = m.f(p.get("tamano", 86), "ExtraBold")
    lineas = m.envolver(d, p["titulo"], fug, ANCHO_UTIL)
    paso = int(fug.size * 1.14)
    y0 = 540 - (len(lineas) * paso) / 2
    for i, ln in enumerate(lineas):
        d.text((540, y0 + i * paso), ln, font=fug, fill=m.TEXTO, anchor="ma")

    if p.get("texto"):
        fp = m.f(34, "Medium")
        for i, ln in enumerate(m.envolver(d, p["texto"], fp, ANCHO_UTIL - 80)):
            d.text((540, y0 + len(lineas) * paso + 36 + i * 48), ln,
                   font=fp, fill=m.APAGADO, anchor="ma")

    m.pie(d, 1080, 1080, L)
    return img


PLANTILLAS = {
    "precio": precio_grande,
    "lista": lista_precios,
    "declaracion": declaracion,
    "pasos": pasos,
    "numero": numero,
    "que_ver": que_ver,
    "pregunta": pregunta,
}


# ------------------------------------------------------- perfil y portada
def foto_perfil_verde():
    """Fondo verde con el rayo oscuro. Se lee bien aunque sea diminuta."""
    img = Image.new("RGB", (1080, 1080), m.VERDE)
    d = ImageDraw.Draw(img)
    m.rayo_solo(d, 540, 540, 470, m.FONDO)
    return img


def foto_perfil_oscura():
    """Fondo oscuro con el icono de pantalla verde. La otra opcion."""
    img, d = m.nueva(1080, 1080, (0.5, 0.35))
    m.marca_icono(d, 540 - 340, 540 - 320, 680, con_pie=True)
    return img


def portada(p):
    """
    1640 x 624. Facebook recorta a 16:9 en celular, asi que todo lo
    importante va en el centro y lejos del borde de abajo, donde se
    monta la foto de perfil y el nombre de la pagina.
    """
    img, d = m.nueva(1640, 624, (0.85, 0.15))
    cx = 820

    lado = 72
    total = lado + 24 + m.ancho(d, "PANTALLAZO", m.f(42, "ExtraBold")) + 6 * 10
    x0 = cx - total / 2
    m.marca_icono(d, x0, 96, lado, con_pie=False)
    m.espaciado(d, (x0 + lado + 24, 96 + lado * 0.42), "PANTALLAZO",
                m.f(42, "ExtraBold"), m.TEXTO, track=6, anclaje="lm")

    fu = m.f(60, "ExtraBold")
    d.text((cx, 232), p["titulo"], font=fu, fill=m.TEXTO, anchor="ma")
    d.text((cx, 312), p["sub"], font=m.f(36, "Medium"), fill=m.APAGADO, anchor="ma")

    fp = m.f(30, "ExtraBold")
    w = m.ancho(d, p["sello"], fp) + 52
    d.rounded_rectangle([cx - w / 2, 378, cx + w / 2, 440], radius=31, fill=m.VERDE)
    d.text((cx, 410), p["sello"], font=fp, fill=m.TINTA, anchor="mm")
    return img
