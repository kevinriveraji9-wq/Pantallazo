# -*- coding: utf-8 -*-
"""
Genera todo lo de redes de una sola pasada:

  python generar.py

  redes/imagenes/perfil-facebook.png      foto de perfil (verde)
  redes/imagenes/perfil-alterno.png       foto de perfil (oscura)
  redes/imagenes/portada-facebook.png     portada 1640 x 624
  redes/imagenes/dia-01-....png  ... x30  las publicaciones
  redes/calendario-mes-1.md               que se publica cada dia

Los textos y los precios estan en contenido.py. Esto solo los dibuja.
"""

import os
import sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, RAIZ)

import contenido as c
import plantillas as pl
import marca as m


def imagenes():
    hechas = []

    pl.foto_perfil_verde().save(
        os.path.join(RAIZ, "imagenes", "perfil-facebook.png"), optimize=True)
    pl.foto_perfil_oscura().save(
        os.path.join(RAIZ, "imagenes", "perfil-alterno.png"), optimize=True)
    pl.portada(c.PORTADA).save(
        os.path.join(RAIZ, "imagenes", "portada-facebook.png"), optimize=True)
    hechas += ["perfil-facebook.png", "perfil-alterno.png",
               "portada-facebook.png"]

    for p in c.PUBLICACIONES:
        dibuja = pl.PLANTILLAS[p["plantilla"]]
        img = dibuja(p["datos"])
        nombre = c.nombre_archivo(p)
        m.guardar(img, nombre)
        hechas.append(nombre)

    return hechas


CABEZA = """# Calendario de publicaciones · mes 1

Treinta publicaciones, una por día. El día 1 cae lunes, así que si empiezas
un lunes la semana te queda cuadrada; si empiezas otro día tampoco pasa nada,
el orden funciona igual.

**Cómo publicar cada día**

1. Abre la imagen de `redes/imagenes/` que dice la publicación.
2. Copia el texto completo del recuadro y pégalo en Facebook.
3. Súbelo. El mejor momento en Colombia es entre 7 y 9 de la noche.

**Si no puedes todos los días**, publica lunes, miércoles, viernes y sábado:
son los días donde está el contenido que más vende. El resto lo dejas para
el mes siguiente y el calendario te dura dos meses.

**Antes de publicar algo con precios**, míralos en el panel. Si cambiaron,
edítalos en `redes/contenido.py` y vuelve a correr `python generar.py` para
que las imágenes queden iguales a la tienda.

**Las recomendaciones de series** (días 6, 13 y 27) dicen en qué plataforma
está cada título. Los catálogos cambian; dale una mirada rápida antes de
publicar.

**Los hashtags no llevan nombres de marca** a propósito: `#Netflix` o
`#DisneyPlus` te hacen ver como página oficial de ellos y son lo que
rastrean los equipos de protección de marca. En el texto sí se nombran las
plataformas, que es legítimo y necesario. Si quieres hashtags que traigan
gente, agrégale el de tu ciudad (`#Medellín`, `#Cali`, el que sea): esos
sirven mucho más que los de marca.

---

"""

PIE = """
---

## Cómo repetir el mes

El mes dos no se escribe de cero. Esto es lo que funciona:

- **Deja igual** los días de precios, los educativos y los de confianza.
  Esos son los que traen clientes nuevos, y la gente que ya te sigue no se
  acuerda de que los viste el mes pasado.
- **Cambia** las recomendaciones de series y las preguntas a la comunidad.
  Ahí sí se nota la repetición.
- **Agrega** lo que haya pasado: una plataforma nueva, un cliente que te
  dejó un comentario bueno (pide permiso antes de mostrarlo), un cambio de
  precio.

Para regenerar: editas `redes/contenido.py` y corres `python generar.py`.
"""


def calendario(hechas):
    out = [CABEZA]
    semana = 0
    for p in c.PUBLICACIONES:
        if (p["dia"] - 1) % 7 == 0:
            semana += 1
            out.append("## Semana %d\n\n" % semana)

        out.append("### Día %d · %s · %s\n\n"
                   % (p["dia"], c.dia_semana(p["dia"]), p["pilar"]))
        out.append("**Imagen:** `redes/imagenes/%s`\n\n" % c.nombre_archivo(p))
        out.append("**Texto para publicar:**\n\n```\n")
        out.append(p["texto"] + "\n\n" + c.etiquetas(p) + "\n")
        out.append("```\n\n")
    out.append(PIE)

    ruta = os.path.join(RAIZ, "calendario-mes-1.md")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write("".join(out))
    return ruta


if __name__ == "__main__":
    os.makedirs(os.path.join(RAIZ, "imagenes"), exist_ok=True)
    hechas = imagenes()
    ruta = calendario(hechas)
    print("Imagenes generadas: %d" % len(hechas))
    print("Calendario: %s" % os.path.basename(ruta))
