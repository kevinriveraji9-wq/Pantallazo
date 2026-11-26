# -*- coding: utf-8 -*-
"""
El contenido de un mes: 30 publicaciones.

Esto es lo UNICO que hay que editar para cambiar textos o precios.
De aquí salen las imágenes y el archivo calendario-mes-1.md, así que
lo que se cambie aquí queda igual en los dos.

Cada publicación tiene:
  dia       número del 1 al 30 (el día 1 cae lunes)
  pilar     de qué tipo es, para que la semana no sea toda igual
  plantilla cuál diseño usa (ver plantillas.py)
  datos     los textos que van dentro de la imagen
  texto     lo que se copia y pega en Facebook
  etiquetas los hashtags

PRECIOS: tomados del catálogo en vivo el 25 de noviembre de 2026.
Si cambian en el panel, cámbialos aquí antes de volver a generar.
"""

WA = "https://wa.me/573107075235"
SITIO = "https://pantallazo.site"

# Colores de cada plataforma, los mismos del catálogo.
C = {
    "netflix": "#e50914", "disney": "#156fe5", "max": "#002be7",
    "prime": "#00a8e1", "paramount": "#0064ff", "universal": "#5b3fd9",
    "crunchy": "#f47521", "dgo": "#00a6eb", "spotify": "#1db954",
    "youtube": "#ff0033", "canva": "#00c4cc", "gemini": "#4285f4",
    "duolingo": "#58cc02",
}

H_BASE = "#Pantallazo #Streaming #Colombia"
H_SERIES = H_BASE + " #Series #Películas #QuéVer"
H_PRECIO = H_BASE + " #Entretenimiento #PreciosJustos"
H_AYUDA = H_BASE + " #ComprasSeguras #AtenciónAlCliente"


PORTADA = {
    "titulo": "Tus plataformas, en un solo lugar",
    "sub": "Lo pides por WhatsApp y recibes el acceso en minutos",
    "sello": "Desde $7.000 al mes",
}


PUBLICACIONES = [
    # ---------------------------------------------------------- semana 1
    {
        "dia": 1, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "Lunes de precios",
            "titulo": "Lo que cuesta una pantalla",
            "filas": [
                ("Netflix", "$14.000", "Pantalla con tu perfil y tu PIN"),
                ("Max", "$9.000", "Pantalla"),
                ("Disney+", "$8.000", "Pantalla"),
                ("Prime Video", "$8.000", "Pantalla"),
                ("Paramount+", "$7.000", "Pantalla"),
                ("Crunchyroll", "$7.000", "Pantalla"),
            ],
            "nota": "Precios por mes. Catálogo completo en pantallazo.site",
        },
        "texto": (
            "Arrancamos la semana con los precios al día.\n\n"
            "Una pantalla es un perfil tuyo, con tu nombre y tu PIN, dentro de "
            "una cuenta compartida. Ves en un dispositivo a la vez y no tienes "
            "que cambiarle la clave a nadie.\n\n"
            "Netflix $14.000 · Max $9.000 · Disney+ $8.000 · Prime Video $8.000 "
            "· Paramount+ $7.000 · Crunchyroll $7.000\n\n"
            "Armas tu pedido en " + SITIO + " y te sale el total solo. "
            "Si prefieres, escríbenos directo: " + WA
        ),
        "etiquetas": H_PRECIO,
    },
    {
        "dia": 2, "pilar": "Educativo", "plantilla": "declaracion",
        "datos": {
            "ante": "La pregunta de siempre",
            "titulo": "Una pantalla es tu perfil, no la cuenta de otro.",
            "texto": "Tiene tu nombre, tu PIN y tu propio historial. Nadie te "
                     "borra la lista ni te saca a mitad de capítulo.",
            "sello": "Con PIN tuyo",
            "tamano": 80,
        },
        "texto": (
            "Nos lo preguntan todos los días: ¿y eso de la pantalla qué es?\n\n"
            "Es un perfil tuyo dentro de una cuenta que se comparte entre varias "
            "personas. Lleva tu nombre, tu PIN y tus recomendaciones. Ves en un "
            "dispositivo a la vez y la clave de la cuenta no se toca, ni tú ni "
            "nadie más.\n\n"
            "Si quieres los perfiles para toda la casa, eso es la cuenta "
            "completa y también la tenemos.\n\n"
            "¿Dudas? Escríbenos sin compromiso: " + WA
        ),
        "etiquetas": H_AYUDA,
    },
    {
        "dia": 3, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "Series y películas",
            "plataforma": "Netflix",
            "color": C["netflix"],
            "precio": "$14.000",
            "unidad": "una pantalla, un dispositivo a la vez",
            "segundo": "Cuenta completa (4 perfiles): $50.000",
            "nota": "Con tu perfil y tu PIN. Funciona en Smart TV, celular, "
                    "tableta, computador y consola.",
            "sello": "Garantía todo el mes",
        },
        "texto": (
            "Netflix a $14.000 el mes.\n\n"
            "Es una pantalla: tu perfil, tu PIN, tu historial. La ves donde "
            "funcione la app oficial, que es prácticamente en todo: Smart TV, "
            "celular, tableta, computador, consola o TV Box.\n\n"
            "Si en tu casa son varios, la cuenta completa con los 4 perfiles "
            "queda en $50.000.\n\n"
            "Lo pides aquí: " + WA
        ),
        "etiquetas": H_BASE + " #Series #Entretenimiento",
    },
    {
        "dia": 4, "pilar": "Confianza", "plantilla": "declaracion",
        "datos": {
            "ante": "Nuestra garantía",
            "titulo": "Si tu pantalla falla, te la reponemos.",
            "texto": "Y si no podemos reponerla, te devolvemos los días que te "
                     "queden. Todo el periodo que pagaste, no solo los "
                     "primeros días.",
            "sello": "Soporte al mismo número",
            "tamano": 86,
        },
        "texto": (
            "Lo que más nos preguntan antes de pagar: ¿y si deja de funcionar?\n\n"
            "Te la reponemos. Escribes al mismo número por donde compraste y lo "
            "resolvemos. Si no logramos reponerla, te devolvemos los días que "
            "te queden del periodo que pagaste.\n\n"
            "No es garantía de tres días. Es todo el tiempo que pagaste.\n\n"
            "Cualquier cosa, aquí estamos: " + WA
        ),
        "etiquetas": H_AYUDA + " #Garantía",
    },
    {
        "dia": 5, "pilar": "Oferta", "plantilla": "numero",
        "datos": {
            "ante": "Descuento por combo",
            "numero": "10%",
            "titulo": "menos si llevas 2 o más plataformas",
            "texto": "Se descuenta del total, sin códigos ni promociones por "
                     "tiempo limitado. Es así siempre: mezclas las que quieras "
                     "y el precio baja.",
        },
        "texto": (
            "Viernes. Si vas a llenar el fin de semana, llévalo en combo.\n\n"
            "Cuando tu pedido tiene 2 o más plataformas distintas, te "
            "descontamos 10% del total. No hay código ni fecha límite: funciona "
            "así siempre.\n\n"
            "Ejemplo: Netflix más Disney+ serían $22.000; con el descuento "
            "quedan en $19.800.\n\n"
            "Ármalo en " + SITIO + " y el total se calcula solo."
        ),
        "etiquetas": H_PRECIO + " #Combo #Descuento",
    },
    {
        "dia": 6, "pilar": "Recomendación", "plantilla": "que_ver",
        "datos": {
            "ante": "Para este fin de semana",
            "titulo": "Cuatro para empezar hoy",
            "items": [
                ("Stranger Things", "Netflix", C["netflix"]),
                ("The Last of Us", "Max", C["max"]),
                ("The Mandalorian", "Disney+", C["disney"]),
                ("The Boys", "Prime Video", C["prime"]),
            ],
            "nota": "Pantallas desde $7.000 al mes en pantallazo.site",
        },
        "texto": (
            "Sábado de maratón. Cuatro que valen la pena y dónde están:\n\n"
            "Stranger Things — Netflix\n"
            "The Last of Us — Max\n"
            "The Mandalorian — Disney+\n"
            "The Boys — Prime Video\n\n"
            "Si te falta alguna de esas plataformas, la pantalla arranca en "
            "$7.000 al mes y la entrega es en minutos.\n\n"
            "¿Cuál vas a ver? Cuéntanos en los comentarios."
        ),
        "etiquetas": H_SERIES + " #QuéVer",
    },
    {
        "dia": 7, "pilar": "Cómo funciona", "plantilla": "pasos",
        "datos": {
            "ante": "Así se compra",
            "titulo": "Cuatro pasos y ya estás viendo",
            "pasos": [
                ("Arma tu pedido",
                 "Entras a pantallazo.site, agregas las plataformas y los meses. "
                 "El total se calcula solo."),
                ("Envíalo por WhatsApp",
                 "El botón abre el chat con tu pedido ya escrito. Solo le das "
                 "enviar."),
                ("Paga",
                 "Te confirmamos que hay disponible y pagas por transferencia o "
                 "billetera digital."),
                ("Recibe el acceso",
                 "Te llega el correo, la clave y tu perfil con PIN en el mismo "
                 "chat."),
            ],
        },
        "texto": (
            "Para los que nos acaban de encontrar: así funciona.\n\n"
            "1. Armas tu pedido en " + SITIO + ". Agregas plataformas y meses, "
            "y el total se calcula solo.\n"
            "2. Le das al botón de WhatsApp. El chat se abre con tu pedido ya "
            "escrito.\n"
            "3. Te confirmamos disponibilidad y pagas por transferencia o "
            "billetera digital.\n"
            "4. Te llega el acceso en el mismo chat, normalmente entre 5 y 30 "
            "minutos.\n\n"
            "Nunca te pedimos claves ni datos de tarjeta."
        ),
        "etiquetas": H_AYUDA,
    },

    # ---------------------------------------------------------- semana 2
    {
        "dia": 8, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "Series y películas",
            "plataforma": "Disney+",
            "color": C["disney"],
            "precio": "$8.000",
            "unidad": "una pantalla, un dispositivo a la vez",
            "segundo": "Cuenta completa (4 perfiles): $35.000",
            "nota": "Trae Disney, Pixar, Marvel, Star Wars y National "
                    "Geographic en el mismo sitio.",
            "sello": "Garantía todo el mes",
        },
        "texto": (
            "Disney+ a $8.000 el mes.\n\n"
            "En una sola app tienes Disney, Pixar, Marvel, Star Wars y National "
            "Geographic. Es la que mejor funciona si en la casa hay niños y "
            "adultos peleando por el control.\n\n"
            "Pantalla $8.000. Cuenta completa con los 4 perfiles $35.000.\n\n"
            "Lo pides aquí: " + WA
        ),
        "etiquetas": H_BASE + " #Series #Películas #Familia",
    },
    {
        "dia": 9, "pilar": "Educativo", "plantilla": "declaracion",
        "datos": {
            "ante": "Pantalla o cuenta completa",
            "titulo": "Si eres uno, pantalla. Si son varios, cuenta completa.",
            "texto": "La pantalla es un perfil para ti. La cuenta completa trae "
                     "todos los perfiles para repartir en tu casa y te sale "
                     "mejor por persona.",
            "tamano": 74,
        },
        "texto": (
            "¿Pantalla o cuenta completa? Depende de cuántos sean.\n\n"
            "PANTALLA: un perfil tuyo, con tu PIN. Ves en un dispositivo a la "
            "vez. Desde $7.000.\n\n"
            "CUENTA COMPLETA: todos los perfiles son tuyos para repartir en tu "
            "casa o tu familia. Por persona sale más barato. Netflix $50.000, "
            "Disney+ $35.000, Max $24.000.\n\n"
            "Si no sabes cuál te conviene, escríbenos y lo miramos juntos: " + WA
        ),
        "etiquetas": H_AYUDA + " #Streaming",
    },
    {
        "dia": 10, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "Series y películas",
            "plataforma": "Max",
            "color": C["max"],
            "precio": "$9.000",
            "unidad": "una pantalla, un dispositivo a la vez",
            "segundo": "Cuenta completa (3 perfiles): $24.000",
            "nota": "HBO, Warner, DC y Cartoon Network en la misma app.",
            "sello": "Garantía todo el mes",
        },
        "texto": (
            "Max a $9.000 el mes.\n\n"
            "Aquí está todo lo de HBO y Warner: las series que todo el mundo "
            "comenta, el cine de DC y, de paso, Cartoon Network para los "
            "pequeños.\n\n"
            "Pantalla $9.000. Cuenta completa con 3 perfiles $24.000, que son "
            "$8.000 por persona.\n\n"
            "Lo pides aquí: " + WA
        ),
        "etiquetas": H_BASE + " #Series #Películas",
    },
    {
        "dia": 11, "pilar": "Confianza", "plantilla": "numero",
        "datos": {
            "ante": "Tiempo de entrega",
            "numero": "5 a 30",
            "titulo": "minutos desde que confirmas el pago",
            "texto": "Dentro del horario de atención: todos los días de 8:00 "
                     "a. m. a 9:00 p. m. No te dejamos esperando al otro día.",
        },
        "texto": (
            "¿Cuánto tarda? Entre 5 y 30 minutos después de que confirmas el "
            "pago.\n\n"
            "Atendemos todos los días de 8:00 a. m. a 9:00 p. m. Si escribes "
            "dentro de ese horario, no te toca esperar hasta mañana.\n\n"
            "Te responde una persona, no un robot.\n\n" + WA
        ),
        "etiquetas": H_AYUDA + " #EntregaInmediata",
    },
    {
        "dia": 12, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "No solo series",
            "titulo": "Música, diseño y estudio",
            "filas": [
                ("Gemini 3 Pro", "$25.000", "Plan Google AI Pro, cuenta tuya"),
                ("YouTube Premium", "$12.000", "Sin anuncios y con YouTube Music"),
                ("Spotify Premium", "$11.000", "Cuenta individual"),
                ("Canva Pro", "$10.000", "Se activa en tu propio correo"),
                ("Duolingo Super", "$7.000", "Cupo familiar, sin anuncios"),
            ],
            "nota": "Precios por mes. Todo en pantallazo.site",
        },
        "texto": (
            "Mucha gente llega buscando Netflix y se va con Canva. También "
            "tenemos esto:\n\n"
            "Gemini 3 Pro $25.000 — el plan Google AI Pro\n"
            "YouTube Premium $12.000 — sin anuncios, con YouTube Music\n"
            "Spotify Premium $11.000 — cuenta individual\n"
            "Canva Pro $10.000 — se activa en tu propio correo\n"
            "Duolingo Super $7.000 — sin anuncios y con vidas ilimitadas\n\n"
            "Si llevas 2 o más, 10% de descuento en el total.\n\n" + WA
        ),
        "etiquetas": H_BASE + " #Música #Diseño #Estudio",
    },
    {
        "dia": 13, "pilar": "Recomendación", "plantilla": "que_ver",
        "datos": {
            "ante": "Para los de anime",
            "titulo": "Tres que no se discuten",
            "items": [
                ("One Piece", "Crunchyroll", C["crunchy"]),
                ("Jujutsu Kaisen", "Crunchyroll", C["crunchy"]),
                ("Demon Slayer", "Crunchyroll", C["crunchy"]),
            ],
            "nota": "Pantalla de Crunchyroll: $7.000 al mes",
        },
        "texto": (
            "Para los que viven el anime: Crunchyroll tiene el catálogo más "
            "grande y los episodios salen casi al tiempo que en Japón.\n\n"
            "One Piece, Jujutsu Kaisen, Demon Slayer y miles más, subtitulados "
            "y muchos doblados.\n\n"
            "Pantalla $7.000 al mes. Cuenta completa con 4 perfiles $18.000.\n\n"
            "¿Cuál es tu favorito? Lo discutimos en los comentarios."
        ),
        "etiquetas": H_BASE + " #Anime #Otaku",
    },
    {
        "dia": 14, "pilar": "Confianza", "plantilla": "declaracion",
        "datos": {
            "ante": "Antes de que se venza",
            "titulo": "Te avisamos nosotros, no te dejamos sin servicio.",
            "texto": "Renuevas con un mensaje y conservas tu perfil, tu historial "
                     "y tu lista de pendientes. No empiezas de cero cada mes.",
            "sello": "Mismo perfil, mismo PIN",
            "tamano": 78,
        },
        "texto": (
            "¿Odias que se te venza y darte cuenta a mitad de capítulo? "
            "Nosotros también.\n\n"
            "Te escribimos antes de que se termine tu periodo. Renuevas con un "
            "mensaje y sigues con el mismo perfil, el mismo PIN, tu historial y "
            "tu lista de pendientes intactos.\n\n"
            "Nada de empezar de cero cada mes.\n\n" + WA
        ),
        "etiquetas": H_AYUDA + " #Renovación",
    },

    # ---------------------------------------------------------- semana 3
    {
        "dia": 15, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "Catálogo de series",
            "titulo": "Todas las pantallas que tenemos",
            "filas": [
                ("Netflix", "$14.000", ""),
                ("Max", "$9.000", ""),
                ("Disney+", "$8.000", ""),
                ("Prime Video", "$8.000", ""),
                ("Paramount+", "$7.000", ""),
                ("Universal+", "$7.000", ""),
                ("Crunchyroll", "$7.000", ""),
            ],
            "nota": "Precio por mes. También hay cuentas completas.",
        },
        "texto": (
            "El catálogo de series y películas, completo y al día:\n\n"
            "Netflix $14.000\n"
            "Max $9.000\n"
            "Disney+ $8.000\n"
            "Prime Video $8.000\n"
            "Paramount+ $7.000\n"
            "Universal+ $7.000\n"
            "Crunchyroll $7.000\n\n"
            "Todas son pantallas con tu perfil y tu PIN. Si llevas 2 o más, "
            "10% menos en el total. Y pagando 3 o 6 meses baja todavía más.\n\n"
            "Ármalo en " + SITIO
        ),
        "etiquetas": H_PRECIO,
    },
    {
        "dia": 16, "pilar": "Confianza", "plantilla": "declaracion",
        "datos": {
            "ante": "Cómo se paga",
            "titulo": "Nunca te pedimos claves ni datos de tarjeta.",
            "texto": "Pagas por transferencia o billetera digital, nos mandas el "
                     "comprobante y listo. Si alguien te pide la clave de tu "
                     "banco, no somos nosotros.",
            "sello": "Transferencia o billetera",
            "tamano": 80,
        },
        "texto": (
            "Algo importante y lo decimos claro: nunca te vamos a pedir la "
            "clave de tu banco, el código de tu tarjeta ni un código que te "
            "llegue por mensaje.\n\n"
            "Cómo se paga: transferencia bancaria o billetera digital. Te "
            "mandamos los datos en el chat, nos envías el comprobante y te "
            "llega el acceso.\n\n"
            "Si alguien te escribe pidiéndote eso y dice que es de Pantallazo, "
            "no le respondas y avísanos.\n\n"
            "Nuestro único número: " + WA
        ),
        "etiquetas": H_AYUDA + " #ComprasSeguras",
    },
    {
        "dia": 17, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "Inteligencia artificial",
            "plataforma": "Gemini 3 Pro",
            "color": C["gemini"],
            "precio": "$25.000",
            "unidad": "cuenta individual, el plan Google AI Pro",
            "segundo": "",
            "nota": "El modelo más potente de Google, más almacenamiento y las "
                    "funciones de IA dentro de Gmail, Docs y Drive.",
            "sello": "Cuenta a tu nombre",
        },
        "texto": (
            "Gemini 3 Pro a $25.000 el mes: el plan Google AI Pro completo.\n\n"
            "Es el modelo más potente de Google. Sirve para estudiar, redactar, "
            "programar, resumir documentos largos y generar imágenes. Además "
            "trae las funciones de IA dentro de Gmail, Docs y Drive, y "
            "almacenamiento extra.\n\n"
            "La cuenta queda a tu nombre.\n\n" + WA
        ),
        "etiquetas": H_BASE + " #InteligenciaArtificial #IA #Productividad",
    },
    {
        "dia": 18, "pilar": "Confianza", "plantilla": "declaracion",
        "datos": {
            "ante": "Atención",
            "titulo": "Todos los días, de 8 de la mañana a 9 de la noche.",
            "texto": "Incluidos sábados, domingos y festivos. Y te responde una "
                     "persona, no un contestador automático.",
            "sello": "También festivos",
            "tamano": 78,
        },
        "texto": (
            "Atendemos todos los días de 8:00 a. m. a 9:00 p. m. Sábados, "
            "domingos y festivos incluidos.\n\n"
            "No tenemos bots respondiendo. Escribes y te contesta una persona "
            "que sabe de tu pedido.\n\n"
            "Si tienes una duda antes de comprar, escríbenos sin compromiso. "
            "Preferimos explicarte bien y que compres tranquilo.\n\n" + WA
        ),
        "etiquetas": H_AYUDA,
    },
    {
        "dia": 19, "pilar": "Oferta", "plantilla": "numero",
        "datos": {
            "ante": "Pagando por adelantado",
            "numero": "3 y 6",
            "titulo": "meses con precio rebajado",
            "texto": "Tres meses tienen 5% menos y seis meses 10% menos. Se "
                     "suma al descuento por llevar varias plataformas, y de "
                     "paso te olvidas de renovar.",
        },
        "texto": (
            "Si ya sabes que lo vas a tener todo el año, págalo por adelantado "
            "y te sale más barato.\n\n"
            "3 meses: 5% menos\n"
            "6 meses: 10% menos\n\n"
            "Y eso se suma al 10% por llevar 2 o más plataformas. De paso te "
            "quitas el recordatorio de renovar cada mes.\n\n"
            "Mira cuánto te queda en " + SITIO + " — el total se calcula solo."
        ),
        "etiquetas": H_PRECIO + " #Descuento",
    },
    {
        "dia": 20, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "TV en vivo y deportes",
            "plataforma": "DGO",
            "color": C["dgo"],
            "precio": "$16.000",
            "unidad": "una pantalla, un dispositivo a la vez",
            "segundo": "Cuenta completa: $45.000",
            "nota": "Canales en vivo y deportes sin tener que instalar antena "
                    "ni firmar contrato con nadie.",
            "sello": "Televisión en vivo",
        },
        "texto": (
            "DGO a $16.000 el mes: televisión en vivo y deportes.\n\n"
            "Canales en directo desde el celular, el computador o la Smart TV. "
            "Sin instalaciones, sin técnico y sin contrato de dos años.\n\n"
            "Pantalla $16.000. Cuenta completa $45.000.\n\n"
            "Pregúntanos por disponibilidad antes de pagar: " + WA
        ),
        "etiquetas": H_BASE + " #Deportes #TVenVivo",
    },
    {
        "dia": 21, "pilar": "Comunidad", "plantilla": "pregunta",
        "datos": {
            "ante": "Cuéntanos",
            "titulo": "¿Qué estás viendo esta semana?",
            "texto": "Déjalo en los comentarios. Nos sirve para saber qué "
                     "plataformas conseguir más.",
            "tamano": 82,
        },
        "texto": (
            "Domingo de preguntas: ¿qué estás viendo esta semana?\n\n"
            "Déjalo en los comentarios con la plataforma donde está. Nos sirve "
            "de verdad: así sabemos qué conseguir más y qué recomendarle al que "
            "llega perdido.\n\n"
            "Y si lo que quieres ver está en una plataforma que no tienes, "
            "mírala en " + SITIO + " — hay pantallas desde $7.000."
        ),
        "etiquetas": H_SERIES + " #QuéVer",
    },

    # ---------------------------------------------------------- semana 4
    {
        "dia": 22, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "Las más económicas",
            "titulo": "Todo esto por $7.000 o menos",
            "filas": [
                ("Paramount+", "$7.000", "Pantalla"),
                ("Universal+", "$7.000", "Pantalla"),
                ("Crunchyroll", "$7.000", "Pantalla, anime"),
                ("Duolingo Super", "$7.000", "Cupo familiar"),
            ],
            "nota": "Por mes. Llevando 2 o más, 10% menos en el total.",
        },
        "texto": (
            "Si el presupuesto está corto, por $7.000 al mes ya tienes algo "
            "bueno:\n\n"
            "Paramount+ $7.000\n"
            "Universal+ $7.000\n"
            "Crunchyroll $7.000 (anime)\n"
            "Duolingo Super $7.000 (sin anuncios y con vidas ilimitadas)\n\n"
            "Son menos de lo que cuesta un almuerzo corriente y te duran todo "
            "el mes. Y si llevas 2 o más, te quitamos 10% del total.\n\n" + WA
        ),
        "etiquetas": H_PRECIO + " #Económico",
    },
    {
        "dia": 23, "pilar": "Educativo", "plantilla": "declaracion",
        "datos": {
            "ante": "Dónde se puede ver",
            "titulo": "Smart TV, celular, tableta, computador o consola.",
            "texto": "Donde funcione la app oficial, funciona tu pantalla. No "
                     "necesitas instalar nada raro ni conectar cables de más.",
            "sello": "También en TV Box",
            "tamano": 74,
        },
        "texto": (
            "¿En qué puedo verlo? En lo que ya tienes.\n\n"
            "Smart TV, celular, tableta, computador, consola o TV Box: donde "
            "funcione la app oficial de la plataforma, funciona tu pantalla. "
            "Entras con el correo y la clave que te damos, eliges tu perfil, "
            "pones tu PIN y listo.\n\n"
            "No hay que instalar aplicaciones raras ni conectar nada extra.\n\n"
            "Si tu TV es viejito y no sabes si sirve, escríbenos y lo "
            "revisamos: " + WA
        ),
        "etiquetas": H_AYUDA + " #SmartTV",
    },
    {
        "dia": 24, "pilar": "Plataforma", "plantilla": "precio",
        "datos": {
            "ante": "Música",
            "plataforma": "Spotify",
            "color": C["spotify"],
            "precio": "$11.000",
            "unidad": "cuenta individual a tu nombre",
            "segundo": "",
            "nota": "Sin anuncios, con descargas para escuchar sin datos y "
                    "saltos ilimitados. Conservas tus playlists.",
            "sello": "Cuenta a tu nombre",
        },
        "texto": (
            "Spotify Premium a $11.000 el mes.\n\n"
            "Sin anuncios cortándote la canción, con descargas para escuchar en "
            "el bus sin gastar datos y saltos ilimitados.\n\n"
            "Es una cuenta individual a tu nombre, así que tus playlists y tu "
            "historial siguen siendo tuyos.\n\n"
            "Si también quieres YouTube Premium, los dos juntos te salen con "
            "10% de descuento.\n\n" + WA
        ),
        "etiquetas": H_BASE + " #Música #SinAnuncios",
    },
    {
        "dia": 25, "pilar": "Confianza", "plantilla": "declaracion",
        "datos": {
            "ante": "Quiénes somos",
            "titulo": "Del otro lado del chat hay una persona.",
            "texto": "No un formulario ni un bot. Preguntas lo que necesites "
                     "antes de pagar, y si no es para ti, te lo decimos.",
            "tamano": 84,
        },
        "texto": (
            "Comprar por internet da miedo, y con razón.\n\n"
            "Por eso: del otro lado del chat hay una persona. Puedes preguntar "
            "todo lo que necesites antes de pagar un peso. Si lo que buscas no "
            "te sirve o no lo tenemos disponible, te lo decimos de frente en "
            "vez de venderte otra cosa.\n\n"
            "También puedes ver el catálogo y los precios completos, sin que "
            "nadie te escriba, en " + SITIO + "\n\n"
            "Y cuando quieras: " + WA
        ),
        "etiquetas": H_AYUDA,
    },
    {
        "dia": 26, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "Para toda la casa",
            "titulo": "Todos los perfiles para tu casa",
            "filas": [
                ("Netflix", "$50.000", "4 perfiles, $12.500 cada uno"),
                ("DGO", "$45.000", "TV en vivo y deportes"),
                ("Disney+", "$35.000", "4 perfiles, $8.750 cada uno"),
                ("Max", "$24.000", "3 perfiles, $8.000 cada uno"),
                ("Prime Video", "$22.000", "3 perfiles"),
                ("Crunchyroll", "$18.000", "4 perfiles"),
            ],
            "nota": "Todos los perfiles son tuyos para repartir.",
        },
        "texto": (
            "Si son varios en la casa, la cuenta completa sale mejor: todos los "
            "perfiles son tuyos para repartir.\n\n"
            "Netflix $50.000 — 4 perfiles, o sea $12.500 cada uno\n"
            "DGO $45.000 — TV en vivo\n"
            "Disney+ $35.000 — 4 perfiles, $8.750 cada uno\n"
            "Max $24.000 — 3 perfiles, $8.000 cada uno\n"
            "Prime Video $22.000 — 3 perfiles\n"
            "Crunchyroll $18.000 — 4 perfiles\n\n"
            "Solo te pedimos no cambiar el correo ni la clave sin avisarnos, "
            "para poder darte soporte.\n\n" + WA
        ),
        "etiquetas": H_PRECIO + " #Familia",
    },
    {
        "dia": 27, "pilar": "Recomendación", "plantilla": "que_ver",
        "datos": {
            "ante": "Con los niños en casa",
            "titulo": "Para ver en familia",
            "items": [
                ("Bluey", "Disney+", C["disney"]),
                ("Toy Story", "Disney+", C["disney"]),
                ("Encanto", "Disney+", C["disney"]),
                ("Cartoon Network", "Max", C["max"]),
            ],
            "nota": "Disney+ desde $8.000 · Max desde $9.000",
        },
        "texto": (
            "¿Fin de semana con los niños en casa? Estas no fallan:\n\n"
            "Bluey — Disney+\n"
            "Toy Story — Disney+\n"
            "Encanto — Disney+\n"
            "Todo Cartoon Network — Max\n\n"
            "Disney+ desde $8.000 y Max desde $9.000. Y en Disney+ puedes "
            "poner el perfil de niño, que filtra solo lo que les sirve.\n\n"
            "¿Qué ven en tu casa? Cuéntanos."
        ),
        "etiquetas": H_BASE + " #Familia #ParaNiños",
    },
    {
        "dia": 28, "pilar": "Cómo funciona", "plantilla": "pasos",
        "datos": {
            "ante": "Cuando se te vence",
            "titulo": "Renovar son tres pasos",
            "pasos": [
                ("Te avisamos",
                 "Antes de que se termine tu periodo te escribimos al mismo "
                 "chat. No te enteras cuando ya no funciona."),
                ("Respondes que sí",
                 "Un mensaje basta. Si quieres cambiar de plataforma o agregar "
                 "otra, se puede en el mismo momento."),
                ("Sigues igual",
                 "Mismo perfil, mismo PIN, tu historial y tu lista intactos. No "
                 "empiezas de cero."),
            ],
        },
        "texto": (
            "Renovar con nosotros es fácil a propósito.\n\n"
            "1. Te avisamos antes de que se te venza, al mismo chat.\n"
            "2. Respondes que sí. Si quieres cambiar o agregar plataforma, se "
            "hace ahí mismo.\n"
            "3. Sigues con tu mismo perfil, tu PIN, tu historial y tu lista de "
            "pendientes.\n\n"
            "Y si pagas 3 o 6 meses de una, te sale con descuento y ni te "
            "acuerdas del tema.\n\n" + WA
        ),
        "etiquetas": H_AYUDA + " #Renovación",
    },
    {
        "dia": 29, "pilar": "Precios", "plantilla": "lista",
        "datos": {
            "ante": "Cierre de mes",
            "titulo": "Lo más pedido y su precio",
            "filas": [
                ("Netflix", "$14.000", "Pantalla"),
                ("Gemini 3 Pro", "$25.000", "Cuenta individual"),
                ("Spotify Premium", "$11.000", "Cuenta individual"),
                ("Max", "$9.000", "Pantalla"),
                ("Disney+", "$8.000", "Pantalla"),
            ],
            "nota": "Entrega entre 5 y 30 minutos. Garantía todo el periodo.",
        },
        "texto": (
            "Lo que más nos pidieron este mes:\n\n"
            "Netflix $14.000\n"
            "Gemini 3 Pro $25.000\n"
            "Spotify Premium $11.000\n"
            "Max $9.000\n"
            "Disney+ $8.000\n\n"
            "Gracias a todos los que compraron y a los que preguntaron sin "
            "comprar, que también cuenta.\n\n"
            "El mes que entra seguimos con los mismos precios y la misma "
            "garantía: todo el periodo que pagues.\n\n" + SITIO
        ),
        "etiquetas": H_PRECIO,
    },
    {
        "dia": 30, "pilar": "Comunidad", "plantilla": "pregunta",
        "datos": {
            "ante": "Ayúdanos a decidir",
            "titulo": "¿Qué plataforma te hace falta aquí?",
            "texto": "Escríbela en los comentarios. Las que más se repitan son "
                     "las que vamos a conseguir.",
            "tamano": 80,
        },
        "texto": (
            "Pregunta de verdad, no de relleno: ¿qué plataforma te gustaría que "
            "tuviéramos y todavía no está?\n\n"
            "Escríbela en los comentarios. Las que más se repitan son las que "
            "vamos a buscar primero. Así fue como entraron Gemini y Duolingo.\n\n"
            "Y si ya la tenemos y no te habías dado cuenta, te lo decimos ahí "
            "mismo. El catálogo completo está en " + SITIO
        ),
        "etiquetas": H_BASE + " #Comunidad",
    },
]

DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

_LIMPIA = str.maketrans({
    "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ñ": "n",
    "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U", "Ñ": "N", " ": "-",
})


def nombre_archivo(p):
    pilar = p["pilar"].lower().translate(_LIMPIA)
    return "dia-%02d-%s.png" % (p["dia"], pilar)


def dia_semana(n):
    return DIAS[(n - 1) % 7]


def etiquetas(p):
    """
    Los hashtags sin repetidos: varias publicaciones le suman uno propio
    a un juego base que ya lo traia, y publicar dos veces el mismo se ve mal.
    """
    vistas, limpias = set(), []
    for h in p["etiquetas"].split():
        clave = h.lower()
        if clave not in vistas:
            vistas.add(clave)
            limpias.append(h)
    return " ".join(limpias)
