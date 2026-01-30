import type { BuyerPersona } from '@/types';

export const personas: Record<string, BuyerPersona> = {
  // ===== CORE: MUJERES 45-64 (mayor volumen y mejor ROAS) =====
  
  mamaRenovadora: {
    id: 'mamaRenovadora',
    name: 'Mujer 45-54 Renovadora',
    emoji: '👩',
    weight: 25,
    desc: 'Mujer 45-54, casa propia, hijos grandes, tiene tiempo y ganas de renovar',
    dolor: 'Llevo años mirando esa pared fea y diciéndome "algún día"',
    motivador: 'Hacerlo yo sola sin depender del marido ni de nadie, orgullo personal',
    tono: 'Empoderada, práctica, directa'
  },
  
  señora5564: {
    id: 'señora5564',
    name: 'Mujer 55-64 Activa',
    emoji: '👩‍🦰',
    weight: 20,
    desc: 'Mujer 55-64, nido vacío, quiere la casa impecable, recibe visitas',
    dolor: 'Me da cosa cuando vienen mis amigas y ven esa pared',
    motivador: 'Que la casa esté linda para cuando vienen los hijos/nietos, orgullo',
    tono: 'Cálido, familiar, aspiracional pero realista'
  },
  
  anfitriona: {
    id: 'anfitriona',
    name: 'Mujer 45-60 Anfitriona',
    emoji: '🥂',
    weight: 15,
    desc: 'Recibe familia y amigas seguido, le importa cómo se ve su casa',
    dolor: 'Siempre tapo esa pared con algo cuando viene gente',
    motivador: 'Orgullo social, que le pregunten dónde lo compró, sacar fotos',
    tono: 'Social, orgullosa, quiere presumir'
  },
  
  practica: {
    id: 'practica',
    name: 'Mujer 45-60 DIY',
    emoji: '🔧',
    weight: 10,
    desc: 'Mujer práctica que hace las cosas ella misma, no espera a nadie',
    dolor: 'No quiero esperar que alguien tenga tiempo de ayudarme',
    motivador: 'Autonomía, satisfacción de hacerlo sola, demostrar que puede',
    tono: 'Empoderada, resolutiva, sin vueltas'
  },
  
  // ===== SECUNDARIO: MUJERES 65+ (sorprendentemente buen ROAS 3.09) =====
  
  abuela: {
    id: 'abuela',
    name: 'Mujer 65+ Abuela',
    emoji: '👵',
    weight: 8,
    desc: 'Mujer 65+, vienen los nietos, quiere la casa presentable',
    dolor: 'Quiero que los nietos estén orgullosos de la casa de la abuela',
    motivador: 'Dejar todo lindo, que la familia disfrute, cuidar lo suyo',
    tono: 'Tierno pero decidido, matriarca orgullosa'
  },
  
  // ===== SECUNDARIO: HOMBRES 45-64 (convierten, pero menos) =====
  
  hombre4554: {
    id: 'hombre4554',
    name: 'Hombre 45-54 Hacedor',
    emoji: '👨',
    weight: 6,
    desc: 'Hombre que hace cosas en la casa los fines de semana',
    dolor: 'La patrona me tiene podrido con esa pared',
    motivador: 'Quedar bien con la familia, proyecto de finde, satisfacción',
    tono: 'Práctico, directo, un poco humorístico'
  },
  
  hombre5564: {
    id: 'hombre5564',
    name: 'Hombre 55-64 Resolutivo',
    emoji: '👴',
    weight: 4,
    desc: 'Hombre mayor que quiere solucionar sin complicarse',
    dolor: 'No quiero obra ni quilombo, algo simple que funcione',
    motivador: 'Resolver rápido, sin depender de terceros, tranquilidad',
    tono: 'Directo, anti-quilombo, práctico'
  },
  
  // ===== EXPLORACIÓN: SEGMENTOS MENORES (probar creativos diferentes) =====
  
  inquilina: {
    id: 'inquilina',
    name: 'Mujer 25-40 Inquilina',
    emoji: '🏠',
    weight: 5,
    desc: 'Mujer joven que alquila, no puede hacer obra pero quiere vivir lindo',
    dolor: 'No puedo hacer nada porque no es mío pero esa pared me deprime',
    motivador: 'Vivir lindo sin arriesgar el depósito, sentirse en casa propia',
    tono: 'Millennial/Gen-Z, relatable, un poco informal'
  },
  
  decoradora: {
    id: 'decoradora',
    name: 'Mujer 25-40 Estética',
    emoji: '🎨',
    weight: 4,
    desc: 'Le importa la estética, ve mucho Pinterest/Instagram/TikTok',
    dolor: 'Mi casa no se ve como las que veo en las redes',
    motivador: 'El look perfecto para sus fotos, que le pregunten dónde lo compró',
    tono: 'Trendy, visual, aspiracional'
  },
  
  emprendedor: {
    id: 'emprendedor',
    name: 'Emprendedor Local',
    emoji: '🏪',
    weight: 3,
    desc: 'Dueño/a de local pequeño, peluquería, consultorio, negocio',
    dolor: 'Mi local se ve viejo y no tengo presupuesto para obra',
    motivador: 'Que el local se vea profesional, atraer clientes, imagen',
    tono: 'Profesional pero accesible, inversión inteligente'
  }
};

// Función para elegir persona random ponderada según data real
export function getWeightedRandomPersona(): BuyerPersona {
  const entries = Object.entries(personas);
  const totalWeight = entries.reduce((sum, [_, p]) => sum + (p.weight || 10), 0);
  let random = Math.random() * totalWeight;
  
  for (const [_, persona] of entries) {
    random -= (persona.weight || 10);
    if (random <= 0) return persona;
  }
  return entries[0][1];
}
