import { useState, useCallback } from 'react';
import { SYSTEM_PROMPT } from '@/data/prompts';
import type { GeneratedCopy, BuyerPersona } from '@/types';

interface GeminiState {
  isLoading: boolean;
  error: string | null;
}

interface GeminiResponse {
  atencion: string;
  interes: string;
  deseo: string;
  accion: string;
  visual_atencion?: string;
  visual_interes?: string;
  visual_deseo?: string;
  visual_accion?: string;
}

export function useGemini() {
  const [state, setState] = useState<GeminiState>({
    isLoading: false,
    error: null
  });

  const getApiKey = useCallback((): string | null => {
    const stored = localStorage.getItem('gemini_api_key');
    console.log('[DEBUG] Raw stored value:', stored);
    if (!stored) return null;
    try {
      // El hook useLocalStorage guarda con JSON.stringify, así que parseamos
      const parsed = JSON.parse(stored);
      console.log('[DEBUG] Parsed value:', parsed);
      return parsed;
    } catch {
      // Si no es JSON válido, devolvemos el valor crudo (compatibilidad)
      console.log('[DEBUG] Not JSON, returning raw:', stored);
      return stored;
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    // Guardamos con JSON.stringify para ser consistentes con useLocalStorage
    localStorage.setItem('gemini_api_key', JSON.stringify(key));
  }, []);

  const buildPrompt = useCallback((persona: BuyerPersona, _funnel: string, funnelConfig: any): string => {
    return `Generá un copy para video ad con estas especificaciones:

PRODUCTO: Placas 3D autoadhesivas RenovaFácil
SITIO WEB: renovafacil.store (NUNCA uses .com ni .com.ar - el dominio es .store)
INSTAGRAM: @renova.facil.arg

BUYER PERSONA: ${persona.name}
- Descripción: ${persona.desc}
- Dolor principal: ${persona.dolor}
- Motivador de compra: ${persona.motivador}

ETAPA DEL FUNNEL: ${funnelConfig.name}
- ${funnelConfig.instructions}

DURACIÓN OBJETIVO: ${funnelConfig.targetTime[0]}-${funnelConfig.targetTime[1]} segundos
RANGO DE PALABRAS: ${funnelConfig.targetWords[0]}-${funnelConfig.targetWords[1]} palabras (ideal)
⚠️ LÍMITE MÁXIMO ABSOLUTO: ${funnelConfig.maxWords} palabras — NO TE PASES DE ESTE NÚMERO BAJO NINGUNA CIRCUNSTANCIA.

REGLAS IMPORTANTES:
- El dominio es renovafacil.store (NO .com, NO .com.ar)
- Es DIY: el cliente lo instala solo, NUNCA mencionar instaladores/colocadores
- Envío gratis a todo el país
- 3 cuotas sin interés

Generá un copy ÚNICO y FRESCO. No repitas fórmulas. Sorprendeme con un enfoque creativo pero que respete el framework AIDA + Big Mario.

RESPONDE SOLO CON JSON: {"atencion": "...", "visual_atencion": "...", "interes": "...", "visual_interes": "...", "deseo": "...", "visual_deseo": "...", "accion": "...", "visual_accion": "..."}`;
  }, []);

  const callGeminiAPI = useCallback(async (prompt: string, maxOutputTokens = 4000, maxRetries = 3): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log('[DEBUG] Calling Gemini API with key:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: maxOutputTokens,
              responseMimeType: 'application/json',
            }
          })
        });

        if (!response.ok) {
          // Si da 429, intentamos con gemini-2.5-flash
          if (response.status === 429) {
            console.log('[DEBUG] Got 429, trying with gemini-2.5-flash...');
            const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: maxOutputTokens, responseMimeType: 'application/json' }
              })
            });
            
            if (fallbackResponse.ok) {
              console.log('[DEBUG] Fallback worked!');
              const data = await fallbackResponse.json();
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                let text = data.candidates[0].content.parts[0].text;
                text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                return text;
              }
            }
            
            const fallbackError = await fallbackResponse.json().catch(() => ({}));
            console.log('[DEBUG] Fallback also failed:', fallbackError);
          }
          
          const errorData = await response.json().catch(() => ({}));
          console.log('[DEBUG] API Error Response:', errorData);
          if (response.status === 400 && errorData.error?.message?.includes('API key')) {
            throw new Error('API_KEY_INVALID');
          }
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown'}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          throw new Error('Respuesta vacía de Gemini');
        }
        
        let text = data.candidates[0].content.parts[0].text;
        
        // Clean markdown if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Remove any non-JSON content before or after the JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          text = jsonMatch[0];
        }
        
        console.log('[DEBUG] Cleaned text for parsing:', text);
        
        return text;
      } catch (err) {
        if (err instanceof Error && (err.message === 'API_KEY_MISSING' || err.message === 'API_KEY_INVALID')) {
          throw err;
        }
        if (attempt === maxRetries) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }, [getApiKey]);

  const generateCopy = useCallback(async (
    persona: BuyerPersona, 
    funnel: string, 
    funnelConfig: any
  ): Promise<GeneratedCopy> => {
    setState({ isLoading: true, error: null });

    try {
      const prompt = buildPrompt(persona, funnel, funnelConfig);
      const response = await callGeminiAPI(prompt);
      
      console.log('[DEBUG] Raw response to parse:', response);
      let parsed: GeminiResponse;
      try {
        parsed = JSON.parse(response.trim());
      } catch (parseErr) {
        console.error('[DEBUG] JSON Parse Error. Response was:', response);
        console.error('[DEBUG] Parse error:', parseErr);
        throw new Error('La respuesta de Gemini no es JSON válido. Intentá de nuevo.');
      }
      
      console.log('[DEBUG] Parsed response:', parsed);
      const fullText = `${parsed.atencion} ${parsed.interes} ${parsed.deseo} ${parsed.accion}`;
      const words = fullText.split(/\s+/).length;
      const time = Math.round(words / 2.7);

      const generatedCopy: GeneratedCopy = {
        id: Date.now().toString(),
        ...parsed,
        fullText,
        words,
        time,
        persona,
        funnel,
        timestamp: Date.now()
      };

      setState({ isLoading: false, error: null });
      return generatedCopy;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setState({ isLoading: false, error: errorMessage });
      throw err;
    }
  }, [buildPrompt, callGeminiAPI]);

  const generateMultipleCopies = useCallback(async (
    configs: { persona: BuyerPersona; funnel: string; funnelConfig: any }[]
  ): Promise<GeneratedCopy[]> => {
    setState({ isLoading: true, error: null });

    try {
      // Crear un prompt que pida múltiples copies
      const copiesPrompt = configs.map((config, i) => `
COPY ${i + 1}:
- Buyer Persona: ${config.persona.name}
- Funnel: ${config.funnel}
- Instrucciones: ${config.funnelConfig.instructions}
- Duración: ${config.funnelConfig.targetTime[0]}-${config.funnelConfig.targetTime[1]} segundos
- Máximo ${config.funnelConfig.maxWords} palabras
`).join('\n');

      const fullPrompt = `Generá ${configs.length} copies para video ads de RenovaFácil (placas 3D autoadhesivas). Cada copy debe seguir el framework AIDA + Big Mario.

${copiesPrompt}

PRODUCTO: Placas 3D autoadhesivas RenovaFácil
SITIO WEB: renovafacil.store
INSTAGRAM: @renova.facil.arg
REGLAS:
- Dominio es .store (NO .com)
- DIY: el cliente lo instala solo
- Envío gratis, 3 cuotas sin interés

IMPORTANTE: Respondé SOLO con un array JSON válido. Cada elemento del array debe ser un objeto con esta estructura:
{"atencion": "...", "visual_atencion": "...", "interes": "...", "visual_interes": "...", "deseo": "...", "visual_deseo": "...", "accion": "...", "visual_accion": "..."}

El array debe tener exactamente ${configs.length} elementos.`;

      const response = await callGeminiAPI(fullPrompt, 8000);
      
      console.log('[DEBUG] Raw multi-response:', response);
      
      // Si la respuesta está vacía o muy corta, hay un problema
      if (!response || response.length < 100) {
        throw new Error('La respuesta de Gemini está vacía o incompleta. Probablemente límite de cuota excedido.');
      }
      
      let parsed: any;
      try {
        // Limpiar la respuesta
        let cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        // Extraer solo el array JSON
        const arrayMatch = cleanResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanResponse = arrayMatch[0];
        }
        parsed = JSON.parse(cleanResponse);
      } catch (parseErr) {
        console.error('[DEBUG] JSON Parse Error. Response was:', response);
        throw new Error('La respuesta no es un array JSON válido. Intentá de nuevo.');
      }
      
      if (!Array.isArray(parsed)) {
        throw new Error('La respuesta no es un array');
      }

      // Convertir cada elemento a GeneratedCopy
      const copies: GeneratedCopy[] = parsed.map((item, i) => {
        const fullText = `${item.atencion} ${item.interes} ${item.deseo} ${item.accion}`;
        const words = fullText.split(/\s+/).length;
        const time = Math.round(words / 2.7);

        return {
          id: `${Date.now()}_${i}`,
          ...item,
          fullText,
          words,
          time,
          persona: configs[i].persona,
          funnel: configs[i].funnel,
          timestamp: Date.now()
        };
      });

      setState({ isLoading: false, error: null });
      return copies;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[DEBUG] Error en generateMultipleCopies:', errorMessage);
      setState({ isLoading: false, error: errorMessage });
      throw err;
    }
  }, [callGeminiAPI]);

  return {
    ...state,
    getApiKey,
    saveApiKey,
    generateCopy,
    generateMultipleCopies
  };
}
