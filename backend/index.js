const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Lista ampliada de tipos de eventos (singular y plural)
const tiposEvento = [
  // Sociales
  'evento social', 'eventos sociales', 'boda', 'bodas', 'cumpleaños', 'aniversario', 'aniversarios', 'baby shower', 'baby showers', 'fiesta de compromiso', 'fiestas de compromiso', 'reunión familiar', 'reuniones familiares', 'despedida de soltero', 'despedidas de soltero', 'despedida de soltera', 'despedidas de soltera', 'fiesta de graduación', 'fiestas de graduación', 'bautizo', 'bautizos', 'quinceañera', 'quinceañeras', 'sweet 16', 'fiesta temática', 'fiestas temáticas', 'reunión de exalumnos', 'reuniones de exalumnos',
  // Corporativos
  'evento corporativo', 'eventos corporativos', 'conferencia', 'conferencias', 'seminario', 'seminarios', 'taller', 'talleres', 'congreso', 'congresos', 'feria comercial', 'ferias comerciales', 'expo', 'lanzamiento de producto', 'lanzamientos de productos', 'reunión ejecutiva', 'reuniones ejecutivas', 'retiro empresarial', 'retiros empresariales', 'team building', 'presentación de resultados', 'presentaciones de resultados', 'capacitación interna', 'capacitaciones internas', 'cóctel corporativo', 'cócteles corporativos', 'cena de gala empresarial', 'cenas de gala empresariales',
  // Culturales y artísticos
  'evento cultural', 'eventos culturales', 'evento artístico', 'eventos artísticos', 'concierto', 'conciertos', 'obra de teatro', 'obras de teatro', 'festival de música', 'festivales de música', 'exposición de arte', 'exposiciones de arte', 'proyección de cine', 'proyecciones de cine', 'recital de poesía', 'recitales de poesía', 'lectura de libro', 'lecturas de libros', 'feria del libro', 'ferias del libro', 'danza folclórica', 'danzas folclóricas', 'gala cultural', 'galas culturales',
  // Deportivos
  'evento deportivo', 'eventos deportivos', 'torneo', 'torneos', 'campeonato', 'campeonatos', 'carrera', 'carreras', 'maratón', 'maratones', 'ciclismo', 'exhibición deportiva', 'exhibiciones deportivas', 'clase abierta de deporte', 'clases abiertas de deporte', 'juego escolar', 'juegos escolares', 'juego universitario', 'juegos universitarios', 'partido de exhibición', 'partidos de exhibición', 'lanzamiento de liga', 'lanzamientos de ligas',
  // Comunitarios o públicos
  'evento comunitario', 'eventos comunitarios', 'evento público', 'eventos públicos', 'feria barrial', 'ferias barriales', 'evento benéfico', 'eventos benéficos', 'marcha', 'marchas', 'protesta', 'protestas', 'limpieza comunitaria', 'limpiezas comunitarias', 'asamblea vecinal', 'asambleas vecinales', 'celebración patria', 'celebraciones patrias', 'actividad de voluntariado', 'actividades de voluntariado', 'inauguración pública', 'inauguraciones públicas', 'festival gastronómico', 'festivales gastronómicos',
  // Educativos
  'evento educativo', 'eventos educativos', 'clase magistral', 'clases magistrales', 'charla', 'charlas', 'panel', 'paneles', 'olimpiada del conocimiento', 'olimpiadas del conocimiento', 'feria científica', 'ferias científicas', 'jornada académica', 'jornadas académicas', 'simposio', 'simposios', 'ceremonia de graduación', 'ceremonias de graduación', 'actividad de orientación vocacional', 'actividades de orientación vocacional',
  // Religiosos
  'evento religioso', 'eventos religiosos', 'misa especial', 'misas especiales', 'confirmación', 'confirmaciones', 'bar mitzvah', 'bat mitzvah', 'funeral', 'funerales', 'peregrinación', 'peregrinaciones', 'retiro espiritual', 'retiros espirituales', 'fiesta patronal', 'fiestas patronales', 'ceremonia de iniciación', 'ceremonias de iniciación',
  // Virtuales / híbridos
  'evento virtual', 'eventos virtuales', 'evento híbrido', 'eventos híbridos', 'webinar', 'webinars', 'transmisión en vivo', 'transmisiones en vivo', 'streaming', 'streamings', 'conferencia virtual', 'conferencias virtuales', 'clase online', 'clases online', 'meetup digital', 'meetups digitales', 'foro en línea', 'foros en línea',
  // Entretenimiento y ocio
  'evento de entretenimiento', 'eventos de entretenimiento', 'evento de ocio', 'eventos de ocio', 'torneo de videojuegos', 'torneos de videojuegos', 'escape room', 'escape rooms', 'noche de trivia', 'noches de trivia', 'estreno de película', 'estrenos de películas', 'noche de karaoke', 'noches de karaoke', 'evento de cosplay', 'eventos de cosplay', 'convención', 'convenciones', 'anime', 'cómics', 'actividad en parque temático', 'actividades en parques temáticos'
];

// Lista de barrios de Buenos Aires
const barriosBA = [
  'agronomía', 'almagro', 'balvanera', 'barracas', 'belgrano', 'boedo', 'caballito', 'chacarita', 'coghlan', 'colegiales',
  'constitución', 'flores', 'floresta', 'la boca', 'la paternal', 'liniers', 'mataderos', 'monte castro', 'monserrat',
  'nueva pompeya', 'núñez', 'palermo', 'parque avellaneda', 'parque chacabuco', 'parque chas', 'parque patricios',
  'puerto madero', 'recoleta', 'retiro', 'saavedra', 'san cristóbal', 'san nicolás', 'san telmo', 'vélez sársfield',
  'versalles', 'villa crespo', 'villa del parque', 'villa devoto', 'villa general mitre', 'villa lugano', 'villa luro',
  'villa ortúzar', 'villa pueyrredón', 'villa real', 'villa riachuelo', 'villa santa rita', 'villa soldati', 'villa urquiza'
];

const removeAccents = s => s.normalize('NFD').replace(/[ -]/g, '').replace(/[\u0300-\u036f]/g, '');

// Diccionario de sinónimos y variantes para tipos de evento
const tipoEventoSinonimos = {
  'cumple': 'cumpleaños',
  'cumpleanos': 'cumpleaños',
  'fiesta': 'fiesta temática',
  'graduacion': 'graduación',
  'expo': 'feria comercial',
  'show': 'concierto',
  'recital': 'recital de poesía',
  'cine': 'proyecciones de cine',
  'anime': 'convención',
  'comic': 'convención',
  'comics': 'convención',
  'bautizo': 'bautizos',
  'bautismos': 'bautizos',
  'marcha': 'marchas',
  'protesta': 'protestas',
  'retiro': 'retiro espiritual',
  'retiros': 'retiro espiritual',
  'capacitacion': 'capacitaciones internas',
  'capacitaciones': 'capacitaciones internas',
  'panel': 'paneles',
  'charla': 'charlas',
  'taller': 'talleres',
  'seminario': 'seminarios',
  'congreso': 'congresos',
  'concierto': 'conciertos',
  'conferencias': 'conferencia',
  'conferencia': 'conferencias',
  'webinar': 'webinars',
  'streaming': 'transmisiones en vivo',
  'streamings': 'transmisiones en vivo',
  'torneo': 'torneos',
  'juego': 'juegos escolares',
  'juegos': 'juegos escolares',
  'clase': 'clases magistrales',
  'clases': 'clases magistrales',
  'danza': 'danzas folclóricas',
  'gala': 'galas culturales',
  'lectura': 'lecturas de libros',
  'lecturas': 'lecturas de libros',
  'estreno': 'estrenos de películas',
  'karaoke': 'noches de karaoke',
  'cosplay': 'evento de cosplay',
  'convencion': 'convención',
  'convenciones': 'convención',
  'parque': 'actividad en parque temático',
  'parques': 'actividad en parque temático',
  // ... puedes agregar más sinónimos aquí ...
};

function normalize(str) {
  return removeAccents(str.toLowerCase().trim());
}

function validateTipoEvento(tipos) {
  const validos = [];
  const noValidos = [];
  tipos.forEach(t => {
    if (tiposEvento.includes(t)) validos.push(t);
    else noValidos.push(t);
  });
  return { validos, noValidos };
}

function validateUbicacion(ubicaciones) {
  const validas = [];
  const noValidas = [];
  ubicaciones.forEach(u => {
    if (barriosBA.includes(u)) validas.push(u);
    else noValidas.push(u);
  });
  return { validas, noValidas };
}

function validatePrecio(precio) {
  if (!precio) return { valido: false, error: 'Por favor, ingresa el precio máximo usando el formato $1000 (signo de peso seguido del número).' };
  if (!/^\$[0-9]+([.,][0-9]+)?$/.test(precio)) return { valido: false, error: 'El precio debe tener el formato $1000 (signo de peso seguido del número).' };
  const val = parseFloat(precio.replace('$', '').replace(',', '.'));
  if (isNaN(val) || val < 0) return { valido: false, error: 'El precio debe ser un número mayor o igual a 0.' };
  return { valido: true };
}

function listTiposEventoEjemplo() {
  return tiposEvento.slice(0, 5);
}
function listBarriosEjemplo() {
  return barriosBA.slice(0, 5);
}

function getNextQuestion(datos) {
  if (!datos.tipo.length) {
    return (
      '¿Qué tipo de evento te gustaría? Elige una de las siguientes opciones:\n' +
      tiposEvento.map((t, i) => `${i + 1}. ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n')
    );
  }
  if (!datos.ubicacion.length) {
    return (
      '¿En qué barrio de Buenos Aires te gustaría asistir al evento? Elige una de las siguientes opciones:\n' +
      barriosBA.map((b, i) => `${i + 1}. ${b.charAt(0).toUpperCase() + b.slice(1)}`).join('\n')
    );
  }
  if (!datos.fecha.length) return '¿Para qué fecha buscas el evento?';
  if (!datos.precio) return '¿Cuál es el precio máximo que estarías dispuesto a pagar por la entrada? (por favor, usa el formato $1000)';
  return null;
}

function resumen(datos) {
  return `Resumen de tu búsqueda:\n- Tipo de evento: ${datos.tipo.join(', ')}\n- Ubicación: ${datos.ubicacion.join(', ')}\n- Fecha: ${datos.fecha.join(', ')}\n- Precio máximo: ${datos.precio}`;
}

// EXTRACCIÓN Y FLUJO PRINCIPAL
function extraerDatos(messages) {
  let tipo = [], ubicacion = [], fecha = [], precio = null;
  for (const m of messages) {
    if (m.role !== 'user') continue;
    const txt = m.content.toLowerCase();
    // Tipos de evento
    tiposEvento.forEach(t => {
      const regex = new RegExp(`\\b${t.replace(/([.*+?^=!:${}()|[\]\\])/g, "\\$1")}\\b`, 'i');
      if (regex.test(txt) && !tipo.includes(t)) tipo.push(t);
    });
    // Ubicaciones
    barriosBA.forEach(barrio => {
      const regex = new RegExp(`\\b${barrio.replace(/([.*+?^=!:${}()|[\]\\])/g, "\\$1")}\\b`, 'i');
      if (regex.test(txt) && !ubicacion.includes(barrio)) ubicacion.push(barrio);
    });
    // Fechas
    const fechas = txt.match(/(\d{1,2} de [a-z]+|hoy|mañana|pasado mañana|\d{1,2}\/\d{1,2}(\/\d{2,4})?)/g);
    if (fechas) fechas.forEach(f => { if (!fecha.includes(f)) fecha.push(f); });
    // Precio (solo si tiene $)
    let match = txt.match(/\$\s*([0-9]+([.,][0-9]+)?)/);
    if (match) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(val) && val >= 0) {
        precio = '$' + val;
      }
    }
    if (txt.includes('mucho') || txt.includes('lo que sea') || txt.includes('cualquiera')) {
      precio = null;
    }
  }
  return { tipo, ubicacion, fecha, precio };
}

// Generar eventos: cada barrio tiene al menos un evento, con código único
const barrios = [
    "Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito",
    "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca",
    "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Monserrat", "Nueva Pompeya",
    "Núñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas",
    "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal",
    "San Nicolás", "San Telmo", "Vélez Sársfield", "Versalles", "Villa Crespo",
    "Villa del Parque", "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro",
    "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita",
    "Villa Soldati", "Villa Urquiza"
];
const tipos_evento = [
    "cumpleaños", "concierto", "fiesta temática", "feria gastronómica",
    "taller cultural", "evento deportivo", "exposición de arte"
];
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const fechas = Array.from({length: barrios.length}, () => `${randomInt(1,28)} de agosto`);
const precios = Array.from({length: barrios.length}, () => `$${randomInt(500, 5000)}`);
const eventosEjemplo = barrios.map((barrio, i) => {
    const tipo = tipos_evento[randomInt(0, tipos_evento.length - 1)];
    return {
        codigo: `EVT${i+1}`.padStart(6, '0'),
        tipo,
        barrio,
        fecha: fechas[i],
        precio: precios[i],
        nombre: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} en ${barrio}`,
        descripcion: `Vení a disfrutar de un ${tipo} inolvidable en ${barrio}.`
    };
});

function filtrarPorPrioridad(datos, prioridad) {
  let candidatos = eventosEjemplo;
  let explicacion = '';
  let usada = [];
  for (let i = 0; i < prioridad.length; i++) {
    let prevCandidatos = candidatos;
    if (prioridad[i] === 'tipo' && datos.tipo.length) {
      candidatos = candidatos.filter(e => datos.tipo.includes(e.tipo));
      usada.push('tipo de evento');
    } else if (prioridad[i] === 'barrio' && datos.ubicacion.length) {
      candidatos = candidatos.filter(e => datos.ubicacion.includes(e.barrio));
      usada.push('barrio');
    } else if (prioridad[i] === 'fecha' && datos.fecha.length) {
      candidatos = candidatos.filter(e => datos.fecha.includes(e.fecha));
      usada.push('fecha');
    } else if (prioridad[i] === 'precio') {
      candidatos = candidatos.filter(e => parseFloat(e.precio.replace('$','')) <= parseFloat(datos.precio.replace('$','')));
      usada.push('precio');
    }
    if (candidatos.length === 0) {
      candidatos = prevCandidatos; // revertir al último grupo válido
      break;
    }
  }
  if (candidatos.length === 0) candidatos = eventosEjemplo;
  return { candidatos, usada };
}

async function obtenerRecomendacionIA(datos, prioridad, eventos, usada, perfectMatch) {
  const prompt = `Eres un asistente experto en eventos. El usuario te dio estos datos:
- Tipo de evento: ${datos.tipo.join(', ')}
- Barrio: ${datos.ubicacion.join(', ')}
- Fecha: ${datos.fecha.join(', ')}
- Precio máximo: ${datos.precio}
- Prioridad: ${prioridad.join(' > ')}
- Filtros aplicados: ${usada.join(' > ')}

Tienes la siguiente lista de eventos candidatos:
${eventos.map((e, i) => `${i + 1}. ${e.nombre} | Tipo: ${e.tipo} | Barrio: ${e.barrio} | Fecha: ${e.fecha} | Precio: ${e.precio} | ${e.descripcion}`).join('\n')}

${perfectMatch ?
  'Elige el evento más adecuado para el usuario según los filtros aplicados y explica brevemente por qué lo elegiste y no otro. Responde en español, primero el nombre del evento recomendado, luego la explicación.' :
  'No hay un evento que cumpla perfectamente con todos los criterios del usuario. Elige el evento más similar posible, explica por qué lo elegiste y pregunta cordialmente al usuario si le interesa esa opción o quiere buscar otra.'}
`;

  const ollamaMessages = [
    { role: 'system', content: 'Eres un asistente experto en eventos y recomendaciones personalizadas.' },
    { role: 'user', content: prompt }
  ];

  const response = await axios.post('http://localhost:11434/api/chat', {
    model: 'llama3',
    messages: ollamaMessages
  });
  return response.data.message.content;
}

app.post('/chat', async (req, res) => {
  const { messages, prioridad } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const datos = extraerDatos(messages);
  // Validar tipo de evento
  const tipoVal = validateTipoEvento(datos.tipo);
  if (tipoVal.noValidos.length) {
    return res.json({ message: `No reconocí '${tipoVal.noValidos.join(', ')}' como tipo de evento válido. Ejemplos válidos: ${listTiposEventoEjemplo().join(', ')}...` });
  }
  datos.tipo = tipoVal.validos;
  // Validar ubicación
  const ubicVal = validateUbicacion(datos.ubicacion);
  if (ubicVal.noValidas.length) {
    return res.json({ message: `No reconocí '${ubicVal.noValidas.join(', ')}' como barrio válido. Ejemplos válidos: ${listBarriosEjemplo().join(', ')}...` });
  }
  datos.ubicacion = ubicVal.validas;
  // Validar precio
  const precioVal = validatePrecio(datos.precio);
  if (!precioVal.valido) {
    return res.json({ message: precioVal.error });
  }
  // Preguntar por lo que falta
  const pregunta = getNextQuestion(datos);
  if (pregunta) {
    return res.json({ message: pregunta });
  } else if (!prioridad) {
    return res.json({ message: '¿Qué es lo más importante para ti al elegir un evento? Elige y ordena tu prioridad entre: tipo de evento, barrio (o lugar), fecha, precio. Por ejemplo: ["fecha", "precio", "barrio"]' });
  } else {
    // Filtrar eventos según prioridad progresiva
    const { candidatos, usada } = filtrarPorPrioridad(datos, prioridad);
    const perfectMatch = candidatos.some(e =>
      datos.tipo.includes(e.tipo) &&
      datos.ubicacion.includes(e.barrio) &&
      datos.fecha.includes(e.fecha) &&
      parseFloat(e.precio.replace('$','')) <= parseFloat(datos.precio.replace('$',''))
    );
    try {
      const recomendacionIA = await obtenerRecomendacionIA(datos, prioridad, candidatos, usada, perfectMatch);
      return res.json({ message: resumen(datos) + `\n\n${recomendacionIA}` });
    } catch (err) {
      return res.json({ message: resumen(datos) + '\n\nNo se pudo obtener recomendación de la IA.' });
    }
  }
});

// Guardar la prioridad del usuario si responde (opcional, para compatibilidad)
app.post('/prioridad', (req, res) => {
  const { prioridad } = req.body;
  if (!prioridad || !Array.isArray(prioridad) || prioridad.length !== 3) {
    return res.status(400).json({ error: 'Debes enviar una prioridad como array de tres valores: ["fecha", "precio", "barrio"] en el orden deseado.' });
  }
  res.json({ ok: true });
});

app.get('/eventos', (req, res) => {
  res.json(eventosEjemplo);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 