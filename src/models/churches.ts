import catedral from "@/assets/iglesia.jpg";
import mejorada from "@/assets/iglesia-mejorada.jpg";
import santiago from "@/assets/iglesia-santiago.jpg";
import santaAna from "@/assets/iglesia-santa-ana.jpg";
import sanJuan from "@/assets/iglesia-san-juan.jpg";
import santaIsabel from "@/assets/iglesia-santa-isabel.jpg";
import sanCristobal from "@/assets/iglesia-san-cristobal.jpg";
import placeholder from "@/assets/iglesia-placeholder.svg";
import { additionalMeridaChurches } from "@/models/meridaChurches";
import { additionalYucatanChurches } from "@/models/yucatanChurches";

export interface Church {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  image: string;
  founded: string;
  mapQuery: string;
  history: string[];
  capillas: { name: string; note: string }[];
  horarios: { day: string; hours: string }[];
  contacto: { address: string; phone: string; email: string };
  objetos: { name: string; note: string }[];
  eventos: { name: string; note: string }[];
  libros: { title: string; note: string }[];
}

export const churches: Church[] = [
  {
    slug: "catedral-san-ildefonso",
    name: "Catedral de San Ildefonso",
    short: "Catedral",
    tagline: "La catedral más antigua de tierra firme en América.",
    image: catedral,
    founded: "1598",
    mapQuery: "Catedral de San Ildefonso, Mérida, Yucatán",
    history: [
      "La construcción de la Catedral de San Ildefonso comenzó en 1562 y concluyó en 1598, en el costado oriental de la Plaza Grande, dentro del trazado de la Mérida colonial erigida sobre la antigua ciudad maya de T’hó. Se reconoce como una de las catedrales más antiguas del continente americano.",
      "Su arquitectura renacentista de líneas austeras expresa la sobriedad de la primera época virreinal. En sus muros se reutilizaron piedras de edificaciones prehispánicas, huella material de las profundas transformaciones que dieron forma a la ciudad. El interior reúne distintas etapas de ornamentación y devoción, entre ellas el monumental Cristo de la Unidad, obra contemporánea que se convirtió en emblema de reconciliación.",
    ],
    capillas: [
      { name: "Capilla del Santísimo", note: "Espacio de oración silenciosa junto al altar mayor." },
      { name: "Capilla de San José", note: "Dedicada al patrono de las familias trabajadoras." },
    ],
    horarios: [
      { day: "Lunes a viernes", hours: "07:00, 08:15, 11:15, 17:15 y 18:30 h" },
      { day: "Sábado", hours: "07:00, 08:15, 11:15, 17:15 y 18:30 h" },
      { day: "Domingo", hours: "07:00, 08:15, 10:00, 11:00, 12:00, 17:00 y 18:30 h; misa en inglés a las 09:00 h en la Capilla del Divino Maestro" },
    ],
    contacto: {
      address: "Calle 60 s/n, Plaza Grande, Centro, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Cristo de la Unidad", note: "Crucifijo de caoba de más de 7 metros, símbolo de reconciliación." },
      { name: "Cúpulas y bóvedas", note: "Bóvedas de crucería del siglo XVI recién restauradas." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Apoya el mantenimiento de las urnas y candelabros del templo." },
      { name: "Visitas y actividades comunitarias", note: "Solicita misas de acción de gracias, difuntos o intenciones especiales." },
    ],
    libros: [
      { title: "Historia de la Catedral de Mérida", note: "PDF · 40 páginas" },
      { title: "Guía del visitante", note: "PDF · 12 páginas" },
    ],
  },
  {
    slug: "la-mejorada",
    name: "Iglesia de La Mejorada",
    short: "La Mejorada",
    tagline: "Antiguo convento franciscano del siglo XVII.",
    image: mejorada,
    founded: "1640",
    mapQuery: "Iglesia de la Mejorada, Mérida, Yucatán",
    history: [
      "El templo de La Mejorada formó parte del convento franciscano de Nuestra Señora del Tránsito, establecido en el siglo XVII en el límite oriental de la Mérida histórica. El conjunto tuvo funciones religiosas y educativas, y su historia quedó ligada a la expansión de los barrios más allá de la Plaza Grande.",
      "La fachada de mampostería, el volumen sencillo de la nave y el espacio abierto que la rodea conservan el carácter austero asociado a la tradición franciscana y a la arquitectura colonial yucateca. Las transformaciones posteriores del antiguo conjunto conventual permiten leer en el barrio las distintas etapas de la vida urbana meridana.",
    ],
    capillas: [
      { name: "Capilla del Tránsito", note: "Conserva la devoción original del convento franciscano." },
    ],
    horarios: [
      { day: "Lunes a sábado", hours: "07:30 y 19:00 h" },
      { day: "Domingo", hours: "09:00, 11:00, 12:00, 13:00 y 19:00 h" },
    ],
    contacto: {
      address: "Calle 50-A x 59, Barrio de La Mejorada, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Espadaña colonial", note: "Campanario de mampostería con sus campanas originales." },
      { name: "Retablo mayor", note: "Retablo de estilo sobrio con imaginería del siglo XVIII." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Contribuye al cuidado de las urnas procesionales del barrio." },
      { name: "Visitas y actividades comunitarias", note: "Misas de difuntos y acción de gracias durante todo el año." },
    ],
    libros: [
      { title: "El convento de La Mejorada", note: "PDF · 28 páginas" },
    ],
  },
  {
    slug: "santiago-apostol",
    name: "Iglesia de Santiago Apóstol",
    short: "Santiago",
    tagline: "El corazón del barrio de Santiago.",
    image: santiago,
    founded: "1637",
    mapQuery: "Iglesia de Santiago Apóstol, Mérida, Yucatán",
    history: [
      "El templo de Santiago se consolidó durante el siglo XVII como centro religioso de uno de los barrios históricos de Mérida, al poniente del núcleo fundacional. La parroquia y su plaza acompañaron el crecimiento de una comunidad diversa, en la que las tradiciones mayas y las prácticas de la ciudad colonial convivieron a lo largo de los siglos.",
      "Su fachada y sus campanarios dominan el parque de Santiago, lugar de encuentro que mantiene una intensa vida vecinal. La arquitectura, las celebraciones patronales y la música que anima la plaza enlazan el patrimonio construido con una cultura barrial que sigue siendo parte de la identidad meridana.",
    ],
    capillas: [
      { name: "Capilla de Santiago", note: "Altar dedicado al apóstol patrono del barrio." },
      { name: "Capilla del Perdón", note: "Espacio de confesión y reconciliación." },
    ],
    horarios: [
      { day: "Lunes a miércoles, viernes y sábado", hours: "07:00 y 19:00 h" },
      { day: "Jueves", hours: "07:00 y 18:15 h" },
      { day: "Domingo", hours: "07:00, 08:00 y 18:00 h" },
    ],
    contacto: {
      address: "Calle 59 x 72, Barrio de Santiago, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Torres gemelas", note: "Campanarios gemelos únicos en el centro histórico." },
      { name: "Imagen de Santiago Apóstol", note: "Talla colonial venerada cada 25 de julio." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Apoya las procesiones de la fiesta patronal de julio." },
      { name: "Visitas y actividades comunitarias", note: "Intenciones especiales y misas de aniversario." },
    ],
    libros: [
      { title: "Santiago, barrio de tradiciones", note: "PDF · 22 páginas" },
    ],
  },
  {
    slug: "santa-ana",
    name: "Iglesia de Santa Ana",
    short: "Santa Ana",
    tagline: "La capilla amarilla del barrio alegre.",
    image: santaAna,
    founded: "1729–1733",
    mapQuery: "Parque de Santa Ana, Mérida, Yucatán",
    history: [
      "La iglesia de Santa Ana se construyó hacia 1730 por iniciativa del gobernador Antonio de Figueroa y Silva. Situada al norte del centro, articuló el barrio que creció alrededor de su plaza y llegó a ser una de las parroquias históricas de Mérida.",
      "El templo, transformado en distintos momentos —incluidos cambios durante el Porfiriato—, conserva una escala cercana y una relación directa con el espacio público. Su historia reúne arquitectura colonial, devociones locales y la memoria cotidiana de un barrio que hoy mantiene mercados, cocinas y celebraciones tradicionales.",
    ],
    capillas: [
      { name: "Capilla de Santa Ana", note: "Dedicada a la abuela de Jesús, patrona de las madres." },
    ],
    horarios: [
      { day: "Martes a jueves", hours: "19:30 h" },
      { day: "Sábado", hours: "20:00 h" },
      { day: "Domingo", hours: "10:00, 12:00, 18:00 y 19:00 h" },
    ],
    contacto: {
      address: "Calle 47 x 60, Parque de Santa Ana, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Torre piramidal", note: "Campanario rematado en pirámide, único en la ciudad." },
      { name: "Pila bautismal", note: "Pila de piedra tallada del siglo XVIII." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Mantenimiento de urnas y andas de la fiesta de julio." },
      { name: "Visitas y actividades comunitarias", note: "Misas de salud, difuntos y acción de gracias." },
    ],
    libros: [
      { title: "Santa Ana y su barrio", note: "PDF · 18 páginas" },
    ],
  },
  {
    slug: "san-juan-bautista",
    name: "Iglesia de San Juan Bautista",
    short: "San Juan",
    tagline: "Junto al parque de la fuente y los laureles.",
    image: sanJuan,
    founded: "1729",
    mapQuery: "Iglesia de San Juan Bautista, Mérida, Yucatán",
    history: [
      "La actual iglesia parroquial de San Juan Bautista se levantó sobre una ermita anterior. El registro divulgativo del INAH señala que la construcción de la iglesia actual comenzó en 1689; en 1693 inició la edificación de la nueva parroquia y el templo fue consagrado el 25 de julio de 1729.",
      "El inmueble se describe como una construcción sólida y sobria, con amplias naves. Su relación con la plaza del barrio y con el cercano Arco de San Juan permite entender cómo los templos y espacios públicos articulaban las entradas y los barrios de la Mérida colonial.",
    ],
    capillas: [
      { name: "Capilla del Bautista", note: "Altar dedicado a San Juan, patrono del barrio." },
      { name: "Capilla de Guadalupe", note: "Devoción guadalupana del barrio." },
    ],
    horarios: [
      { day: "Lunes a viernes", hours: "08:00 y 19:00 h" },
      { day: "Sábado", hours: "08:00 y 19:00 h" },
      { day: "Domingo", hours: "08:00, 09:15, 18:00 y 20:00 h" },
    ],
    contacto: {
      address: "Calle 62 x 69, Parque de San Juan, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Portada barroca", note: "Fachada labrada en piedra con nichos y estípites." },
      { name: "Arco de San Juan", note: "Antiguo arco del camino real, hoy monumento del barrio." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Apoya las urnas de la procesión del 24 de junio." },
      { name: "Visitas y actividades comunitarias", note: "Misas de bautismo, aniversario y difuntos." },
    ],
    libros: [
      { title: "San Juan, cuatro siglos de fe", note: "PDF · 30 páginas" },
    ],
  },
  {
    slug: "ermita-santa-isabel",
    name: "Ermita de Santa Isabel",
    short: "Santa Isabel",
    tagline: "La ermita del jardín y las palmeras.",
    image: santaIsabel,
    founded: "1748",
    mapQuery: "Ermita de Santa Isabel, Mérida, Yucatán",
    history: [
      "La Ermita de Santa Isabel se levantó en el siglo XVIII en el extremo sur de la ciudad, junto al antiguo camino hacia Campeche. Su posición periférica y su jardín evocan el paisaje de las capillas que recibían a quienes llegaban a Mérida desde los caminos regionales.",
      "El edificio de escala modesta conserva una portada de arco y un atrio ajardinado que contrastan con la trama densa del centro. El conjunto, dedicado a Santa Isabel de Hungría, forma parte de la memoria del barrio de San Sebastián y de la historia de los accesos coloniales a la ciudad.",
    ],
    capillas: [
      { name: "Capilla de Santa Isabel", note: "Dedicada a Santa Isabel de Hungría, madre de los pobres." },
    ],
    horarios: [
      { day: "Jueves y sábado", hours: "19:00 h" },
      { day: "Domingo", hours: "09:00, 10:30, 18:00 y 19:00 h" },
    ],
    contacto: {
      address: "Calle 66 x 79, Barrio de San Sebastián, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Portada mudéjar", note: "Arco con influencia morisca, joya del barroco yucateco." },
      { name: "Jardín histórico", note: "Jardín de palmeras y buganvilias que rodea la ermita." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Cuidado de las urnas de la fiesta de noviembre." },
      { name: "Visitas y actividades comunitarias", note: "Intenciones y misas de acción de gracias." },
    ],
    libros: [
      { title: "La ermita del camino real", note: "PDF · 16 páginas" },
    ],
  },
  {
    slug: "san-cristobal",
    name: "Parroquia de Nuestra Señora de Guadalupe (San Cristóbal)",
    short: "San Cristóbal",
    tagline: "El templo del último barrio de la ciudad.",
    image: sanCristobal,
    founded: "1796",
    mapQuery: "Iglesia de San Cristóbal, Mérida, Yucatán",
    history: [
      "La parroquia de San Cristóbal, cuyo templo se concluyó hacia finales del siglo XVIII, se convirtió en referencia del barrio meridional de Mérida. Su establecimiento amplió la red parroquial de la ciudad y acompañó la consolidación de una zona habitada por familias de distintos orígenes.",
      "La fachada de composición marcada y el amplio espacio frontal se apartan de la escala de algunas capillas más antiguas y expresan otra etapa de la arquitectura religiosa local. La fiesta de la Candelaria, las procesiones y la vida del mercado cercano mantienen vivo el vínculo entre templo, plaza y comunidad.",
    ],
    capillas: [
      { name: "Capilla de San Cristóbal", note: "Dedicada al santo patrono de los viajeros." },
    ],
    horarios: [
      { day: "Festividad guadalupana · 12 de diciembre", hours: "En 2024 se anunciaron misas a las 18:00 y 20:00 h." },
    ],
    contacto: {
      address: "Calle 50 x 69, Barrio de San Cristóbal, Mérida, Yuc.",
      phone: "No publicado",
      email: "No publicado",
    },
    objetos: [
      { name: "Atrio amplio", note: "Uno de los atrios más grandes de las iglesias de barrio." },
      { name: "Imagen de San Cristóbal", note: "Talla venerada por los viajeros desde el siglo XIX." },
    ],
    eventos: [
      { name: "Celebraciones litúrgicas", note: "Apoya las procesiones de la fiesta patronal." },
      { name: "Visitas y actividades comunitarias", note: "Misas de salud, viajeros y difuntos." },
    ],
    libros: [
      { title: "San Cristóbal, el último barrio", note: "PDF · 20 páginas" },
    ],
  },
  {
    slug: "templo-tercera-orden",
    name: "Templo de la Tercera Orden",
    short: "Tercera Orden",
    tagline: "Barroco franciscano junto al corazón de la ciudad.",
    image: "/images/iglesias/templo-tercera-orden/fachada.jpg",
    founded: "siglo XVII",
    mapQuery: "Templo de la Tercera Orden, Mérida, Yucatán",
    history: [
      "El templo conocido como la Tercera Orden, o iglesia de Jesús, formó parte de un conjunto franciscano establecido en el centro de Mérida durante el periodo colonial. Su presencia recuerda la importancia de las órdenes religiosas en la organización urbana, educativa y espiritual de la ciudad.",
      "La fachada de piedra, el trabajo ornamental de la portada y los retablos interiores reflejan el desarrollo del barroco yucateco. Su emplazamiento próximo a la Plaza Grande sitúa al templo en una zona donde la arquitectura religiosa, las casas coloniales y los edificios civiles narran juntas la historia del centro histórico.",
    ],
    capillas: [{ name: "Nave y altares laterales", note: "Espacios de devoción integrados al conjunto histórico; la disposición puede variar según el uso litúrgico." }],
    horarios: [{ day: "Horarios publicados", hours: "El directorio consultado asocia horarios a la rectoría El Jesús, pero no permite confirmar que correspondan a este inmueble histórico." }],
    contacto: { address: "Calle 60 x 59, Centro, Mérida, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Portada barroca", note: "Cantería labrada y composición ornamental propia de la arquitectura religiosa virreinal." }, { name: "Retablos e imaginería", note: "Elementos devocionales que documentan las distintas etapas de uso y ornamentación del templo." }],
    eventos: [{ name: "Celebraciones litúrgicas", note: "La programación depende del calendario parroquial." }, { name: "Visitas patrimoniales", note: "Se recomienda confirmar disponibilidad y acceso antes de acudir." }],
    libros: [{ title: "El templo de Jesús y la Tercera Orden", note: "Referencia histórica · consultar archivo o guía local" }],
  },
  {
    slug: "santa-lucia",
    name: "Iglesia de Santa Lucía",
    short: "Santa Lucía",
    tagline: "Una capilla del siglo XVI en un barrio de música y memoria.",
    image: "/images/iglesias/santa-lucia/fachada.jpg",
    founded: "siglo XVI",
    mapQuery: "Iglesia de Santa Lucía, Mérida, Yucatán",
    history: [
      "La iglesia de Santa Lucía se remonta a las últimas décadas del siglo XVI y se cuenta entre los primeros templos levantados fuera del núcleo inmediato de la Plaza Grande. Su historia acompaña la formación de un barrio que con el tiempo quedó integrado al centro de Mérida.",
      "La capilla fue remodelada en diferentes periodos y conserva una escala recogida, vinculada a la plaza que hoy lleva el mismo nombre. El templo y su entorno reúnen patrimonio arquitectónico, devoción a Santa Lucía y una intensa vida cultural, reconocida por la trova y las reuniones comunitarias.",
    ],
    capillas: [{ name: "Altar de Santa Lucía", note: "Espacio dedicado a la mártir y patrona del barrio." }],
    horarios: [{ day: "Lunes", hours: "07:00 y 18:00 h" }, { day: "Martes y miércoles", hours: "07:00 y 19:00 h" }, { day: "Jueves", hours: "07:00 h" }, { day: "Domingo", hours: "18:00 h" }],
    contacto: { address: "Calle 60 x 55, Parque de Santa Lucía, Centro, Mérida, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Portada y nave histórica", note: "La construcción conserva la escala de una capilla barrial de origen colonial, modificada a través de los siglos." }, { name: "Plaza de Santa Lucía", note: "El espacio público asociado al templo es parte esencial del patrimonio cultural del barrio." }],
    eventos: [{ name: "Fiesta de Santa Lucía", note: "Celebración patronal sujeta al calendario de la comunidad." }, { name: "Actividades culturales del barrio", note: "La plaza mantiene una programación cultural que convive con el uso religioso del entorno." }],
    libros: [{ title: "Santa Lucía Mártir y su barrio", note: "Referencia histórica · consultar archivo o guía local" }],
  },
  {
    slug: "san-juan-de-dios",
    name: "Templo de San Juan de Dios",
    short: "San Juan de Dios",
    tagline: "Memoria de la primera asistencia hospitalaria de Mérida.",
    image: "/images/iglesias/san-juan-de-dios/fachada.jpg",
    founded: "siglo XVI",
    mapQuery: "Templo de San Juan de Dios, Mérida, Yucatán",
    history: [
      "El templo, conocido originalmente bajo la advocación de Nuestra Señora del Rosario, figura entre los edificios religiosos más antiguos de Mérida. A su historia quedó unido el hospital que atendieron los religiosos de San Juan de Dios durante el siglo XVII, formando uno de los primeros conjuntos de asistencia de la ciudad.",
      "Su arquitectura conserva elementos de distintas etapas y una portada con detalles de piedra asociados a la advocación original. El edificio permite acercarse a una dimensión menos visible de la ciudad colonial: la relación entre culto, cuidado de enfermos y organización de los servicios comunitarios.",
    ],
    capillas: [{ name: "Antigua capilla hospitalaria", note: "Vinculada históricamente al conjunto asistencial de Nuestra Señora del Rosario." }],
    horarios: [{ day: "Situación del inmueble", hours: "Templo histórico bajo resguardo patrimonial; no se publica un horario regular de culto en el directorio parroquial consultado." }],
    contacto: { address: "Calle 58 x 61, Centro, Mérida, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Portada de Nuestra Señora del Rosario", note: "La ornamentación pétrea conserva la memoria de la advocación antigua del templo." }, { name: "Conjunto hospitalario histórico", note: "El lugar se relacionó con uno de los hospitales más tempranos de la ciudad." }],
    eventos: [{ name: "Visitas patrimoniales", note: "Confirmar de antemano el acceso y las condiciones de visita." }, { name: "Memoria del hospital", note: "Un sitio clave para conocer la historia de la asistencia y la salud en Mérida." }],
    libros: [{ title: "Nuestra Señora del Rosario y San Juan de Dios", note: "Referencia histórica · consultar archivo o guía local" }],
  },
  {
    slug: "san-sebastian",
    name: "Parroquia de San Sebastián",
    short: "San Sebastián",
    tagline: "La iglesia de un barrio de tradición popular.",
    image: "/images/iglesias/san-sebastian/fachada.jpg",
    founded: "siglo XVIII",
    mapQuery: "Parroquia de San Sebastián, Mérida, Yucatán",
    history: [
      "La iglesia de San Sebastián fue centro religioso de uno de los barrios tradicionales del sur de Mérida. El asentamiento y su capilla crecieron al margen del núcleo fundacional, junto a caminos y espacios de trabajo que conectaban la ciudad con su entorno rural.",
      "El templo adquirió rango parroquial en 1889, reflejo del crecimiento de la comunidad y de su importancia en la vida urbana. Su arquitectura de mampostería y la plaza contigua forman el escenario de celebraciones populares, entre ellas las dedicadas a la Virgen de la Asunción, que mantienen la continuidad de las tradiciones del barrio.",
    ],
    capillas: [{ name: "Altar de San Sebastián", note: "Dedicado al santo que da nombre al barrio y a la parroquia." }],
    horarios: [{ day: "Lunes a sábado", hours: "07:00 y 19:00 h" }, { day: "Domingo", hours: "10:00, 18:00 y 19:30 h" }],
    contacto: { address: "Calle 72 x 75, Barrio de San Sebastián, Mérida, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Fachada parroquial", note: "Mampostería y composición de escala barrial, con intervenciones de distintas épocas." }, { name: "Plaza de San Sebastián", note: "Espacio de encuentro asociado a las fiestas tradicionales de la comunidad." }],
    eventos: [{ name: "Fiesta patronal", note: "Celebración en honor a San Sebastián según el calendario litúrgico." }, { name: "Fiesta de la Asunción", note: "Devoción popular destacada en la vida anual del barrio." }],
    libros: [{ title: "San Sebastián y los barrios del sur", note: "Referencia histórica · consultar archivo o guía local" }],
  },
  {
    slug: "itzimna-perpetuo-socorro",
    name: "Parroquia de Nuestra Señora del Perpetuo Socorro de Itzimná",
    short: "Itzimná",
    tagline: "Una parroquia histórica entre jardines y memoria maya.",
    image: "/images/iglesias/itzimna-perpetuo-socorro/fachada.jpg",
    founded: "1710",
    mapQuery: "Parroquia de Nuestra Señora del Perpetuo Socorro, Itzimná, Mérida, Yucatán",
    history: [
      "Itzimná fue un asentamiento vinculado a la memoria del antiguo centro ceremonial maya dedicado a Itzamná. En 1572 se levantó allí una capilla y, en 1710, se construyó el templo que dio forma al paisaje del poblado situado al norte de la Mérida colonial.",
      "El edificio estuvo dedicado a San Miguel Arcángel hasta 1944, cuando la comunidad adoptó la advocación de Nuestra Señora del Perpetuo Socorro. Su sobria fachada franciscana, la espadaña de tres vanos y la antigua pila bautismal evocan varias etapas de la historia local, hoy enmarcadas por la plaza arbolada de Itzimná.",
    ],
    capillas: [{ name: "Santuario de Nuestra Señora del Perpetuo Socorro", note: "Centro de la devoción mariana que identifica hoy a la parroquia." }],
    horarios: [{ day: "Lunes a viernes", hours: "07:00, 09:00 y 18:30 h" }, { day: "Sábado", hours: "07:00, 09:00, 17:00 y 18:00 h" }, { day: "Domingo", hours: "07:00, 09:00, 10:00, 12:00, 18:00, 19:00 y 20:00 h" }],
    contacto: { address: "Calle 20 x 19 y 29, Itzimná, Mérida, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Pila bautismal histórica", note: "Se conserva como vestigio de la primera capilla del siglo XVI." }, { name: "Espadaña de tres vanos", note: "Remate característico de la sencilla fachada de tradición franciscana." }],
    eventos: [{ name: "Fiesta de Nuestra Señora del Perpetuo Socorro", note: "Celebración mariana de la comunidad parroquial." }, { name: "Fiestas de Itzimná", note: "Las celebraciones del barrio conservan su vínculo con la plaza y el templo." }],
    libros: [{ title: "Itzimná: templo y barrio", note: "Referencia histórica · consultar archivo o guía local" }],
  },
  ...additionalMeridaChurches,
  {
    slug: "san-antonio-de-padua-izamal",
    name: "Ex Convento y Parroquia de San Antonio de Padua de Izamal",
    short: "San Antonio · Izamal",
    tagline: "El gran atrio franciscano levantado sobre la antigua ciudad maya.",
    image: placeholder,
    founded: "1549 · siglo XVI",
    mapQuery: "Ex Convento de San Antonio de Padua, Izamal, Yucatán",
    history: [
      "Los franciscanos establecieron en Izamal una casa conventual hacia 1549, en una población que había sido un importante centro ceremonial maya. El conjunto se levantó sobre la plataforma prehispánica conocida como Pap-Hol-Chac, reutilizando la piedra y transformando un paisaje sagrado anterior en un espacio de culto colonial.",
      "El templo, el convento de dos claustros y el amplio atrio cerrado con arquerías conforman uno de los conjuntos religiosos más reconocibles de Yucatán. La devoción a la Inmaculada Concepción y la imagen mariana vinculada a la tradición regional han hecho del santuario un lugar de peregrinación, mientras el color amarillo del conjunto identifica hoy el centro histórico de Izamal.",
    ],
    capillas: [{ name: "Camarín de la Virgen", note: "Espacio asociado a la veneración de la imagen de Nuestra Señora de Izamal." }, { name: "Capilla de la Tercera Orden", note: "Parte del conjunto conventual franciscano que rodea el atrio." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar con la parroquia; el acceso puede variar por culto y conservación" }],
    contacto: { address: "Calle 30 núm. 292, Centro, Izamal, Yucatán (conjunto frente al atrio y parque principal).", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Atrio cerrado con arquerías", note: "Gran espacio procesional enmarcado por una arcada de medio punto." }, { name: "Claustros conventuales", note: "Dos patios históricos integrados al conjunto franciscano virreinal." }],
    eventos: [{ name: "Fiesta de la Inmaculada Concepción", note: "Celebración patronal de gran arraigo regional en diciembre." }, { name: "Peregrinaciones marianas", note: "El santuario recibe visitas devocionales de comunidades de Yucatán." }],
    libros: [{ title: "El convento franciscano de Izamal", note: "Referencia histórica · consultar catálogo INAH y guías patrimoniales" }],
  },
  {
    slug: "san-servacio-valladolid",
    name: "Iglesia de San Servacio (San Gervasio)",
    short: "San Servacio",
    tagline: "La parroquia de la plaza mayor de Valladolid, reorientada en el siglo XVIII.",
    image: placeholder,
    founded: "1545 · reconstruida en 1706",
    mapQuery: "Iglesia de San Servacio, Valladolid, Yucatán",
    history: [
      "El templo parroquial de Valladolid fue mandado construir en 1545 por el sacerdote Francisco Hernández, poco después de la fundación de la ciudad. En 1705 el edificio fue demolido por orden episcopal tras el episodio conocido como el Crimen de los Alcaldes; su reconstrucción concluyó al año siguiente.",
      "La iglesia se reorientó durante la reconstrucción: su fachada mira al norte, hacia la plaza Francisco Cantón, en lugar de seguir la orientación habitual hacia poniente de muchos templos coloniales yucatecos. Las torres, el reloj público y el escudo de piedra con motivos franciscanos convierten el inmueble en un referente cívico y religioso del centro vallisoletano.",
    ],
    capillas: [{ name: "Capillas laterales", note: "Espacios devocionales integrados a la nave parroquial; su uso depende del calendario litúrgico." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar directamente con la parroquia" }],
    contacto: { address: "Calle 41 entre 40 y 42, frente al Parque Francisco Cantón Rosado, Centro, Valladolid, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Escudo de piedra", note: "Relieve de fachada con corona, cordón franciscano y símbolos heráldicos." }, { name: "Torres y reloj público", note: "Dos campanarios de cuerpos escalonados y el reloj histórico de la ciudad." }],
    eventos: [{ name: "Celebraciones parroquiales", note: "Programación sujeta al calendario de la comunidad de San Servacio." }, { name: "Recorridos por el centro histórico", note: "La iglesia forma parte del conjunto urbano patrimonial de Valladolid." }],
    libros: [{ title: "San Servacio y la historia de Valladolid", note: "Referencia histórica · consultar guía municipal y SEFOTUR" }],
  },
  {
    slug: "san-bernardino-siena-valladolid",
    name: "Ex Convento de San Bernardino de Siena",
    short: "San Bernardino · Valladolid",
    tagline: "Arquitectura franciscana del siglo XVI en el barrio de Sisal.",
    image: placeholder,
    founded: "1592 · siglo XVI",
    mapQuery: "Ex Convento de San Bernardino de Siena, Valladolid, Yucatán",
    history: [
      "El conjunto franciscano de San Bernardino se fundó en 1592 en el barrio de Sisal, al sur de Valladolid. La primera piedra del convento se colocó en 1595 y su dedicación tuvo lugar en 1627; desde allí los religiosos atendían a Valladolid y a poblaciones de la región.",
      "Iglesia, claustro, huerta y espacios de servicio forman un ejemplo destacado de convento mendicante yucateco. Bajo el conjunto se localiza el cenote Síis Já, relacionado históricamente con una noria que abastecía de agua al convento y regaba su huerta, evidencia de cómo la arquitectura franciscana se adaptó a las condiciones naturales de la península.",
    ],
    capillas: [{ name: "Capilla conventual", note: "Espacio de culto integrado a la iglesia del antiguo conjunto franciscano." }],
    horarios: [{ day: "Visita al conjunto", hours: "Confirmar horarios y áreas abiertas con la administración local" }],
    contacto: { address: "Parque de Sisal s/n, Barrio de Sisal, Valladolid, Yucatán.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Noria histórica", note: "Sistema hidráulico asociado al cenote y al abastecimiento de la huerta conventual." }, { name: "Claustro y atrio", note: "Elementos principales del conjunto franciscano reconocido como monumento histórico." }],
    eventos: [{ name: "Visitas patrimoniales", note: "El recorrido y el acceso pueden variar por labores de conservación." }, { name: "Actividades culturales", note: "El entorno del convento se integra a la vida cultural del barrio de Sisal." }],
    libros: [{ title: "San Bernardino de Siena en Valladolid", note: "Referencia histórica · consultar catálogo nacional del INAH" }],
  },
  {
    slug: "san-francisco-uman",
    name: "Parroquia de San Francisco de Asís de Umán",
    short: "San Francisco · Umán",
    tagline: "Un conjunto franciscano de grandes bóvedas y torres inconclusas.",
    image: placeholder,
    founded: "siglo XVIII",
    mapQuery: "Parroquia de San Francisco de Asís, Umán, Yucatán",
    history: [
      "La parroquia de Umán está dedicada a San Francisco de Asís y se formó como parte de la red de conjuntos religiosos que atendían las poblaciones cercanas a Mérida. El inmueble conserva restos del antiguo ex convento y de una capilla anexa, vestigios de una historia constructiva que se prolongó por distintas etapas.",
      "La amplia nave abovedada y la fachada monumental, con torres que quedaron sin concluir, dan al templo su perfil singular. Las modificaciones posteriores y las huellas del conjunto conventual muestran cómo las comunidades adaptaron edificios coloniales a nuevos usos, preservando la iglesia como centro de reunión y culto de Umán.",
    ],
    capillas: [{ name: "Capilla abierta", note: "Elemento asociado al conjunto religioso histórico y a las prácticas de culto comunitario." }],
    horarios: [{ day: "Lunes a domingo", hours: "Consultar horarios vigentes con la parroquia" }],
    contacto: { address: "Calle 20 por 21 y 23, Centro, Umán, Yucatán, C.P. 97390.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Bóvedas de la nave", note: "Cubiertas amplias que distinguen el espacio interior del templo." }, { name: "Fachada y torres inconclusas", note: "Composición monumental que conserva la huella de etapas de obra no concluidas." }],
    eventos: [{ name: "Fiesta de San Francisco de Asís", note: "Celebración patronal de la comunidad, sujeta a la agenda parroquial." }, { name: "Visita al ex convento", note: "Se recomienda confirmar acceso a las áreas históricas antes de acudir." }],
    libros: [{ title: "El conjunto franciscano de Umán", note: "Referencia histórica · consultar catálogo nacional de monumentos" }],
  },
  {
    slug: "san-miguel-arcangel-mani",
    name: "Ex Convento y Parroquia de San Miguel Arcángel",
    short: "San Miguel · Maní",
    tagline: "Convento mendicante del siglo XVI, memoria central de la historia maya yucateca.",
    image: placeholder,
    founded: "1549 · siglo XVI",
    mapQuery: "Ex Convento de San Miguel Arcángel, Maní, Yucatán",
    history: [
      "La construcción del convento franciscano de San Miguel Arcángel comenzó en Maní en 1549. Para 1588 ya estaban levantados sus principales espacios; el poblado, sede de los Xiu antes de la conquista, fue una cabecera importante para las comunidades mayas de la región.",
      "La iglesia, el claustro y la gran capilla abierta expresan el modelo mendicante de evangelización y la adaptación arquitectónica a las celebraciones al aire libre. El sitio también conserva una memoria histórica compleja: en 1562 fue escenario del auto de fe dirigido por Diego de Landa, episodio de destrucción de objetos y códices mayas que sigue siendo fundamental para comprender los efectos de la colonización.",
    ],
    capillas: [{ name: "Capilla abierta", note: "Espacio de culto hacia el atrio, característico de los conjuntos conventuales tempranos de Yucatán." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar con la parroquia y confirmar acceso al conjunto" }],
    contacto: { address: "Calle 25 núm. 200, Centro, Maní, Yucatán, C.P. 97850.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Retablos históricos", note: "La iglesia conserva retablos de tradición colonial, sujetos a conservación y culto." }, { name: "Claustro y noria", note: "Vestigios del uso conventual y del sistema de agua que abastecía patios y huerta." }],
    eventos: [{ name: "Fiesta de San Miguel Arcángel", note: "Celebración patronal conforme al calendario de la parroquia." }, { name: "Recorridos de memoria histórica", note: "El sitio permite abordar tanto la historia conventual como la memoria maya de Maní." }],
    libros: [{ title: "El convento de Maní en 1588", note: "Artículo académico · Boletín de Monumentos Históricos del INAH" }],
  },
  {
    slug: "san-antonio-de-padua-ticul",
    name: "Ex Convento y Parroquia de San Antonio de Padua de Ticul",
    short: "San Antonio · Ticul",
    tagline: "Conjunto franciscano de la Ruta de los Conventos, en el sur de Yucatán.",
    image: placeholder,
    founded: "1591 · siglo XVI",
    mapQuery: "Parroquia de San Antonio de Padua, Ticul, Yucatán",
    history: [
      "En el capítulo franciscano de 1591 se organizó la doctrina de San Antonio de Ticul, con pueblos de la región bajo su administración. El convento y la parroquia fueron centro religioso de una población maya yucateca cuya historia se extendió más allá del núcleo urbano.",
      "El conjunto atravesó daños y pérdida de bienes durante los conflictos del siglo XIX y las transformaciones del siglo XX. La iglesia conserva huellas de su origen conventual y forma, junto con capillas coloniales de los barrios, parte de la Ruta de los Conventos y de la memoria arquitectónica del sur del estado.",
    ],
    capillas: [{ name: "Capillas de barrio", note: "El municipio conserva capillas históricas asociadas a barrios como Santiago, San Román y San Ramón." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar directamente con la parroquia" }],
    contacto: { address: "Centro de Ticul, frente al parque principal, Ticul, Yucatán, C.P. 97860.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Restos del ex convento", note: "Muros y espacios asociados al antiguo conjunto franciscano." }, { name: "Imaginería y altares", note: "El patrimonio mueble del templo refleja cambios históricos; las piezas y su exhibición pueden variar." }],
    eventos: [{ name: "Fiestas patronales de Ticul", note: "El calendario local incluye celebraciones religiosas en diversos barrios y capillas." }, { name: "Ruta de los Conventos", note: "La parroquia forma parte del recorrido patrimonial por el sur de Yucatán." }],
    libros: [{ title: "San Antonio de Padua y el convento de Ticul", note: "Referencia histórica · consultar catálogo nacional del INAH" }],
  },
  {
    slug: "capilla-san-juan-bautista-ticul",
    name: "Capilla de San Juan Bautista de Ticul",
    short: "San Juan · Ticul",
    tagline: "Capilla histórica ligada al parque y a la memoria barrial de Ticul.",
    image: placeholder,
    founded: "Época colonial",
    mapQuery: "Capilla de San Juan Bautista, Ticul, Yucatán",
    history: [
      "La capilla de San Juan figura entre los inmuebles religiosos históricos de Ticul, junto con el ex convento de San Antonio y las capillas de los barrios de Santiago, Mejorada, Guadalupe, San Román y San Ramón. Estas construcciones muestran que la vida religiosa de la localidad se organizó en una red de templos de barrio además de la parroquia principal.",
      "El parque de San Juan y su capilla forman parte del paisaje urbano y de las celebraciones comunitarias de Ticul. Su escala menor respecto de la parroquia central permite reconocer el papel de las capillas como espacios de culto cercano y como referentes de la identidad barrial.",
    ],
    capillas: [{ name: "Nave de la capilla", note: "Templo de barrio dedicado a San Juan Bautista; la disposición interior depende de su uso actual." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar disponibilidad con la comunidad local" }],
    contacto: { address: "Parque de San Juan, Centro, Ticul, Yucatán, C.P. 97860.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Capilla histórica", note: "Inmueble colonial identificado entre los monumentos arquitectónicos de Ticul." }, { name: "Parque de San Juan", note: "Espacio público relacionado con las celebraciones del barrio." }],
    eventos: [{ name: "Fiesta de San Juan", note: "La programación y las celebraciones pueden variar cada año; confirmar localmente." }, { name: "Actividades del barrio", note: "La capilla forma parte del circuito de templos tradicionales de Ticul." }],
    libros: [{ title: "Capillas coloniales de Ticul", note: "Referencia patrimonial · consultar SEFOTUR Yucatán" }],
  },
  {
    slug: "san-francisco-de-asis-conkal",
    name: "Convento y Parroquia de San Francisco de Asís de Conkal",
    short: "San Francisco · Conkal",
    tagline: "Convento franciscano fundado en 1549 y templo concluido en el siglo XVII.",
    image: placeholder,
    founded: "1549 · templo concluido en 1674",
    mapQuery: "Parroquia de San Francisco de Asís, Conkal, Yucatán",
    history: [
      "La casa franciscana de Conkal se fundó en 1549 y pronto se convirtió en cabecera de doctrina para comunidades cercanas. En 1588 se describía como un conjunto de piedra y barro con claustro alto y bajo, dormitorios, huerta, noria, escuela y capilla para la población maya.",
      "La iglesia actual se desarrolló durante los siglos XVI y XVII; una inscripción citada en el catálogo histórico indica que su construcción se concluyó en 1674. El inmueble conserva una nave con capillas laterales, una fachada de espadañas y un antiguo cuadrante solar, y su convento está ligado a la estancia del cronista fray Diego López de Cogolludo.",
    ],
    capillas: [{ name: "Capillas laterales", note: "Espacios incorporados a los contrafuertes de la nave del templo." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar con la parroquia; las áreas de museo pueden tener horario propio" }],
    contacto: { address: "Calle 21 núm. 100-B, Centro, Conkal, Yucatán, C.P. 97345.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Cuadrante solar", note: "Elemento histórico asociado a la vida conventual y al registro del tiempo." }, { name: "Pila bautismal y capillas", note: "El conjunto conserva elementos litúrgicos y arquitectónicos de distintas etapas." }],
    eventos: [{ name: "Celebraciones de San Francisco", note: "La agenda litúrgica se confirma con la comunidad parroquial." }, { name: "Visita al Museo de Arte Sacro", note: "El antiguo convento alberga un espacio museístico con patrimonio religioso y regional." }],
    libros: [{ title: "San Francisco de Asís de Conkal", note: "Referencia histórica · consultar catálogo nacional y Museo de Arte Sacro" }],
  },
  {
    slug: "san-juan-bautista-tekax",
    name: "Ex Convento y Parroquia de San Juan Bautista",
    short: "San Juan · Tekax",
    tagline: "Conjunto franciscano del siglo XVII en la Sultana de la Sierra.",
    image: placeholder,
    founded: "1564 · siglo XVII",
    mapQuery: "Parroquia de San Juan Bautista, Tekax, Yucatán",
    history: [
      "La casa franciscana de Tekax se fundó en 1564. En las primeras décadas el asentamiento conventual fue modesto, con una enramada y habitaciones; el templo y el ex convento tomaron forma durante el periodo colonial y se consolidaron como centro religioso de la región serrana.",
      "La parroquia actual, de origen conventual, domina el centro histórico con una fachada de piedra y una nave amplia. Junto con la ermita de San Diego y las capillas de la ciudad, forma parte del patrimonio arquitectónico que conecta Tekax con las rutas religiosas y culturales del sur de Yucatán.",
    ],
    capillas: [{ name: "Capilla de San Diego", note: "Ermita histórica de Tekax, vinculada al circuito de templos de la ciudad." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar horarios vigentes con la parroquia" }],
    contacto: { address: "Calle 50 s/n, Centro, Tekax de Álvaro Obregón, Yucatán, C.P. 97970.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Portada de piedra", note: "Acceso principal del conjunto parroquial histórico." }, { name: "Antiguo conjunto conventual", note: "Vestigios de la casa franciscana que sirvió como centro religioso regional." }],
    eventos: [{ name: "Fiesta de San Juan Bautista", note: "Celebración patronal conforme al calendario parroquial." }, { name: "Ruta patrimonial de Tekax", note: "La parroquia se visita junto con la ermita de San Diego y otros inmuebles históricos." }],
    libros: [{ title: "San Juan Bautista y la historia de Tekax", note: "Referencia patrimonial · consultar expediente turístico municipal" }],
  },
  {
    slug: "san-francisco-oxkutzcab",
    name: "Ex Convento de San Francisco de Asís de Oxkutzcab",
    short: "San Francisco · Oxkutzcab",
    tagline: "Conjunto conventual franciscano entre los más antiguos del sur de Yucatán.",
    image: placeholder,
    founded: "siglo XVI · templo del siglo XVII",
    mapQuery: "Ex Convento de San Francisco de Asís, Oxkutzcab, Yucatán",
    history: [
      "Oxkutzcab fue una población maya de la región Puuc y durante la colonia se integró a la red de doctrinas franciscanas del sur de Yucatán. El ex convento de San Francisco de Asís se estableció en el siglo XVI; los registros de la visita de 1588 describen una casa sencilla, con celdas, huerta, noria y una ramada para el culto comunitario.",
      "La construcción de la iglesia y la ampliación del convento continuaron en el siglo XVII. El conjunto, junto con la ermita del Pilar y la capilla de San Esteban, constituye una parte importante del patrimonio religioso de Oxkutzcab y de la Ruta de los Conventos.",
    ],
    capillas: [{ name: "Capilla de San Esteban", note: "Templo histórico del municipio asociado a la red religiosa local." }, { name: "Ermita de la Virgen del Pilar", note: "Capilla histórica del siglo XVII incluida entre los atractivos arquitectónicos de Oxkutzcab." }],
    horarios: [{ day: "Visitas y celebraciones", hours: "Consultar con la parroquia; confirmar acceso al ex convento" }],
    contacto: { address: "Centro, junto a la plaza principal, Oxkutzcab, Yucatán, C.P. 97880.", phone: "No publicado", email: "No publicado" },
    objetos: [{ name: "Claustro y huerta", note: "Restos de la organización conventual franciscana y sus espacios de servicio." }, { name: "Noria histórica", note: "Sistema de agua documentado en la descripción del antiguo convento." }],
    eventos: [{ name: "Celebraciones de San Francisco", note: "La agenda litúrgica se confirma directamente con la parroquia." }, { name: "Ruta de los Conventos", note: "El templo se integra al recorrido patrimonial por las localidades del sur." }],
    libros: [{ title: "San Francisco de Asís en Oxkutzcab", note: "Referencia histórica · consultar Ayuntamiento e INAH" }],
  },
  ...additionalYucatanChurches,
];

export const getChurch = (slug: string) => churches.find((c) => c.slug === slug);
