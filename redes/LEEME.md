# Redes de Pantallazo

Aquí está todo lo de Facebook: las imágenes de la marca, un mes de
publicaciones listas y el generador que las dibuja.

## Qué hay

| Archivo | Para qué |
|---|---|
| **`pagina-facebook.md`** | Empieza por aquí. Los textos de la página (nombre, descripción, botón de WhatsApp) y qué imagen va en cada sitio. |
| **`calendario-mes-1.md`** | Las 30 publicaciones. Para cada día: qué imagen subir y el texto exacto para copiar y pegar. |
| `imagenes/` | Las 33 imágenes ya hechas: perfil, portada y las 30 publicaciones. |
| `contenido.py` | **El único archivo que vas a editar.** Los textos y los precios. |
| `plantillas.py` | Los siete diseños de publicación. |
| `marca.py` | La paleta, el logo y la tipografía. |
| `generar.py` | El que dibuja todo. |
| `fuente/` | Plus Jakarta Sans, la misma letra de la web. Licencia OFL incluida. |

## Si cambian los precios

1. Abre `contenido.py` y busca el precio viejo.
2. Cámbialo. Ojo: cada precio aparece dos veces, en `datos` (lo que va
   dentro de la imagen) y en `texto` (lo que se publica).
3. Corre:

```powershell
python redes/generar.py
```

Eso vuelve a dibujar las 33 imágenes y a escribir `calendario-mes-1.md`,
así que la imagen y el texto nunca se desfasan.

Necesitas Python con Pillow y numpy, que ya los tienes instalados.

## Para el mes dos

No se escribe de cero. Al final de `calendario-mes-1.md` está explicado
qué conviene repetir tal cual y qué hay que cambiar.

## Los siete diseños

`precio` (una plataforma y su precio), `lista` (varias en columna),
`declaracion` (una frase grande), `pasos` (numerados), `numero` (una cifra
enorme), `que_ver` (recomendaciones) y `pregunta` (para que comenten).

Para una publicación suelta, agrega un bloque más a `PUBLICACIONES` en
`contenido.py` copiando uno parecido.

## Sobre las marcas de las plataformas

Tres decisiones que están tomadas a propósito, para no acabar con la
página bloqueada:

- **Nada de logotipos.** Las piezas usan el **nombre** de cada plataforma
  en su color, nunca su logo. Nombrarla para decir qué ofreces es
  legítimo; reproducir su logotipo en publicidad propia es el reclamo de
  marca más fácil de ganar que existe.
- **Nada de imágenes de las plataformas.** Ni carátulas, ni fotogramas, ni
  música. Todas las imágenes las dibuja el generador desde cero, así que
  no hay nada que un detector de contenido registrado pueda reclamar.
- **Nada de hashtags de marca.** `#Netflix`, `#DisneyPlus`, `#Marvel` y
  compañía quedaron fuera: dan a entender que eres página oficial y son lo
  que rastrean los equipos de protección de marca. Si quieres hashtags
  útiles, usa el de tu ciudad.

El texto de las publicaciones sí nombra las plataformas, que es necesario
para explicar qué vendes, y habla siempre de **acceso, pantallas y
perfiles** — nunca de "vender cuentas", que es la frase que marcan los
filtros de comercio de Meta.
