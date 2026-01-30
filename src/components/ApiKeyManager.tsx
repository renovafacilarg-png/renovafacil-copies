import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Eye, EyeOff, ExternalLink, Check, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VOICE_GUIDE_TEXT } from '@/data/prompts';
import { Copy, CheckCheck } from 'lucide-react';

export function ApiKeyManager() {
  const [geminiKey, setGeminiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [googleTtsKey, setGoogleTtsKey] = useLocalStorage<string>('google_tts_api_key', '');
  const [showGemini, setShowGemini] = useState(false);
  const [showTts, setShowTts] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTtsInstructions, setShowTtsInstructions] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const listAvailableModels = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      const data = await response.json();
      console.log('[DEBUG] Available models:', data);
      if (data.models) {
        const modelNames = data.models.map((m: any) => m.name);
        console.log('[DEBUG] Model names:', modelNames);
      }
    } catch (e) {
      console.log('[DEBUG] Error listing models:', e);
    }
  };

  const testGeminiKey = async () => {
    if (!geminiKey) return;
    
    console.log('[DEBUG] =======================================');
    console.log('[DEBUG] Testing Gemini API');
    console.log('[DEBUG] Key length:', geminiKey.length);
    console.log('[DEBUG] Key starts with:', geminiKey.substring(0, 15));
    console.log('[DEBUG] Key ends with:', geminiKey.substring(geminiKey.length - 5));
    console.log('[DEBUG] Full key:', geminiKey);
    
    // Primero listamos los modelos disponibles
    await listAvailableModels();
    
    setTestStatus('testing');
    try {
      // Usamos gemini-2.5-flash que tiene mejor disponibilidad en el tier gratuito
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      console.log('[DEBUG] URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "OK"' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      
      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response ok:', response.ok);
      
      // Si da 429, intentamos con gemini-2.0-flash-lite
      if (response.status === 429) {
        console.log('[DEBUG] Got 429, trying with gemini-2.0-flash-lite...');
        const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "OK"' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });
        console.log('[DEBUG] Fallback response status:', fallbackResponse.status);
        if (fallbackResponse.ok) {
          console.log('[DEBUG] Fallback worked!');
          setTestStatus('success');
          setTimeout(() => setTestStatus('idle'), 3000);
          return;
        }
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Success! Response:', data);
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        const errorText = await response.text();
        console.log('[DEBUG] Error status:', response.status);
        console.log('[DEBUG] Error text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.log('[DEBUG] Parsed error:', errorData);
        } catch (e) {
          console.log('[DEBUG] Could not parse error as JSON');
        }
        setTestStatus('error');
        setTimeout(() => setTestStatus('idle'), 3000);
      }
    } catch (err) {
      console.log('[DEBUG] Fetch threw exception:', err);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(66,133,244,0.15)] to-[rgba(52,168,83,0.15)] border border-[rgba(66,133,244,0.3)] rounded-xl p-4 mb-6"
    >
      <div className="space-y-4">
        {/* Gemini API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Key className="w-4 h-4" />
              API Key de Gemini (Generación de Copies) <span className="text-xs text-muted-foreground ml-1">v4.3</span>
            </Label>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#4285f4] hover:underline flex items-center gap-1"
            >
              Obtener gratis <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value.trim().replace(/\s/g, ''))}
                placeholder="Pegá tu API Key de Gemini aquí..."
                className="pr-10 font-mono text-sm bg-background/50 border-white/20"
              />
              <button
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testGeminiKey}
              disabled={!geminiKey || testStatus === 'testing'}
              className="whitespace-nowrap"
            >
              <AnimatePresence mode="wait">
                {testStatus === 'testing' ? (
                  <motion.span
                    key="testing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Probando...
                  </motion.span>
                ) : testStatus === 'success' ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-green-500"
                  >
                    <Check className="w-4 h-4" />
                    OK
                  </motion.span>
                ) : testStatus === 'error' ? (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-red-500"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </motion.span>
                ) : (
                  <motion.span
                    key="test"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Probar
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          
          {/* Instrucciones para obtener API Key */}
          <div className="mt-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              ¿Cómo obtener tu API Key?
              <ChevronDown className={`w-3 h-3 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
            </button>
            
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-background/50 rounded-lg text-xs space-y-2 border border-white/10"
              >
                <p className="font-medium text-foreground/80">Pasos para obtener tu API Key gratis:</p>
                <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
                  <li>Andá a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#4285f4] hover:underline">Google AI Studio</a></li>
                  <li>Iniciá sesión con tu cuenta de Google</li>
                  <li>Hacé clic en <strong>"Create API Key"</strong></li>
                  <li>Seleccioná un proyecto (o creá uno nuevo)</li>
                  <li>Copiá la key y pegala arriba ☝️</li>
                </ol>
                <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-white/10 mt-2">
                  💡 La API Key es gratuita con límites. Si te da error 429, esperá unos minutos o creá una nueva key.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Google Cloud TTS API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Key className="w-4 h-4" />
              API Key de Google Cloud Text-to-Speech (Audio)
            </Label>
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#4285f4] hover:underline flex items-center gap-1"
            >
              Obtener <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showTts ? 'text' : 'password'}
                value={googleTtsKey}
                onChange={(e) => setGoogleTtsKey(e.target.value)}
                placeholder="Pegá tu API Key de Google Cloud TTS aquí..."
                className="pr-10 font-mono text-sm bg-background/50 border-white/20"
              />
              <button
                onClick={() => setShowTts(!showTts)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showTts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Opcional. Solo necesaria si querés generar audio directamente desde la app.
          </p>
          
          {/* Instrucciones para obtener API Key de TTS */}
          <div className="mt-2">
            <button
              onClick={() => setShowTtsInstructions(!showTtsInstructions)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              ¿Cómo obtener tu API Key de Google Cloud?
              <ChevronDown className={`w-3 h-3 transition-transform ${showTtsInstructions ? 'rotate-180' : ''}`} />
            </button>
            
            {showTtsInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-background/50 rounded-lg text-xs space-y-2 border border-white/10"
              >
                <p className="font-medium text-foreground/80">Pasos para obtener tu API Key (requiere tarjeta):</p>
                <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
                  <li>Andá a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[#4285f4] hover:underline">Google Cloud Console</a></li>
                  <li>Creá un proyecto nuevo (o usá uno existente)</li>
                  <li>Activá la API <strong>"Cloud Text-to-Speech"</strong></li>
                  <li>Andá a <strong>Credentials → Create Credentials → API Key</strong></li>
                  <li>Copiá la key y pegala arriba ☝️</li>
                </ol>
                <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-white/10 mt-2">
                  ⚠️ Requiere configurar una cuenta de facturación. Tenés crédito gratis mensual.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Voice Prompt for ElevenLabs / Google AI Studio */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <span className="text-lg">🎙️</span>
              Prompt de Voz (ElevenLabs / AI Studio)
            </Label>
            <button
              onClick={() => setShowVoicePrompt(!showVoicePrompt)}
              className="text-xs text-[#4285f4] hover:underline flex items-center gap-1"
            >
              {showVoicePrompt ? 'Ocultar' : 'Ver prompt'}
              <ChevronDown className={`w-3 h-3 transition-transform ${showVoicePrompt ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showVoicePrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="relative">
                <pre className="p-3 bg-background/50 rounded-lg text-[10px] text-muted-foreground whitespace-pre-wrap border border-white/10 max-h-60 overflow-y-auto font-mono leading-relaxed">
                  {VOICE_GUIDE_TEXT}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 h-7 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(VOICE_GUIDE_TEXT);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                💡 Usá este prompt en ElevenLabs (Voice Settings → Prompt) o Google AI Studio para obtener una voz estilo "Lalo Mir meets locutor de fútbol".
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
