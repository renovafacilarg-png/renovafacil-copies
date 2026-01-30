import type { FunnelConfig } from '@/types';

export const funnelConfig: Record<string, FunnelConfig> = {
  tof: {
    name: 'TOF — Prospección',
    desc: '<strong>TOF (Top of Funnel):</strong> Audiencia fría. Hook de dolor fuerte, awareness, mostrar el problema. <strong>20-30 seg · 60-90 palabras · MÁXIMO 100</strong>',
    targetWords: [60, 90],
    maxWords: 100,
    targetTime: [20, 30],
    color: '#ff6b35',
    instructions: 'Audiencia FRÍA que no conoce el producto. Hook de dolor MUY fuerte en los primeros 5 segundos. Mostrar el problema, generar identificación. No dar demasiados specs, enfocarse en el dolor y la promesa de solución. CORTO Y DIRECTO.'
  },
  
  mof: {
    name: 'MOF — Consideración',
    desc: '<strong>MOF (Middle of Funnel):</strong> Ya vieron algo. Diferenciación, specs que destruyen objeciones, por qué RenovaFácil. <strong>25-35 seg · 70-100 palabras · MÁXIMO 110</strong>',
    targetWords: [70, 100],
    maxWords: 110,
    targetTime: [25, 35],
    color: '#ffd700',
    instructions: 'Audiencia TIBIA que ya vio algo del producto. Diferenciación: por qué RenovaFácil es mejor. Specs que destruyen objeciones (4.5mm de espesor, adhesivo premium, etc). MANTENÉ EL TEXTO CORTO Y DIRECTO.'
  },
  
  bof: {
    name: 'BOF — Retargeting',
    desc: '<strong>BOF (Bottom of Funnel):</strong> Ya conocen el producto. Urgencia, ofertas, empujón final. <strong>15-25 seg · 45-70 palabras · MÁXIMO 80</strong>',
    targetWords: [45, 70],
    maxWords: 80,
    targetTime: [15, 25],
    color: '#4ade80',
    instructions: 'Audiencia CALIENTE que ya conoce el producto y consideró comprar. Urgencia y empujón final. Ofertas (envío gratis, cuotas sin interés). Frases cortas, directas. MUY BREVE.'
  },
  
  metralleta: {
    name: 'METRALLETA — Directo',
    desc: '<strong>METRALLETA:</strong> Estilo Vayzen: frases de 3-6 palabras, una por línea, ritmo de balas. <strong>20-30 seg · 60-90 palabras · MÁXIMO 100</strong>',
    targetWords: [60, 90],
    maxWords: 100,
    targetTime: [20, 30],
    color: '#ec4899',
    instructions: `ESTILO METRALLETA - COPIA EXACTA DEL ESTILO VAYZEN:

REGLAS ESTRICTAS:
1. MÁXIMO 6 PALABRAS POR LÍNEA - esto es innegociable
2. Cada línea es UNA idea, UN golpe
3. NO uses comas para conectar ideas - usá punto y nueva línea
4. Tono INFORMATIVO, no emocional
5. Sin storytelling, sin "imaginá", sin escenas
6. Cierre con TAGLINE MEMORABLE (no "comprá ahora")

ESTRUCTURA EXACTA:
1. HOOK NEGADOR (1 línea): "No hace falta X para Y"
2. PRODUCTO (2 líneas): Qué es, qué hace
3. RÁFAGA DE SPECS (8-10 líneas de 3-6 palabras cada una)
4. RESULTADO (2 líneas): Look, textura
5. OBJECIONES (3 líneas cortas): Resiste, no daña, etc
6. OFERTA (2 líneas): Envío gratis. Tres cuotas.
7. TAGLINE CIERRE (2 líneas punch): Frase memorable

IMPORTANTE: Cada línea va en renglón separado, NO escribas párrafos`
  },
  
  hibrido: {
    name: 'HÍBRIDO — Emoción + Ritmo',
    desc: '<strong>HÍBRIDO:</strong> Lo mejor de ambos: hook emocional + ráfaga de beneficios + specs con contexto emocional. <strong>20-30 seg · 60-90 palabras · MÁXIMO 100</strong>',
    targetWords: [60, 90],
    maxWords: 100,
    targetTime: [20, 30],
    color: '#8b5cf6',
    instructions: `ESTILO HÍBRIDO - LO MEJOR DE AMBOS MUNDOS:

COMBINA:
- Hook emocional tipo ganadores ("¿Querés ese look de Pinterest?", "¿Te da pánico que miren esa pared?")
- Ritmo rápido de la competencia (frases cortas, una idea por línea)
- Specs CON emoción (no "4.5mm de espesor" sino "el relieve de 4.5mm crea un juego de luces y sombras")
- Cierre memorable y aspiracional

ESTRUCTURA:
1. HOOK EMOCIONAL (1-2 líneas): Pregunta suave tipo copies ganadores
2. PROBLEMA RÁPIDO (2 líneas): Identificación express
3. SOLUCIÓN + SPECS EMOCIONALES (4-5 líneas): Ritmo rápido pero con alma
4. RÁFAGA DE BENEFICIOS (3-4 líneas cortas): Sin obra. Sin ensuciar. Sin ayuda.
5. TRANSFORMACIÓN + CTA (2-3 líneas): De vergüenza a orgullo. Hacé clic ahora.

TONO: Aspiracional y cálido, pero con ritmo punchy. Como hablarle a una amiga que querés ayudar.`
  }
};
