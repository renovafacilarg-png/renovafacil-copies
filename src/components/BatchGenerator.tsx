import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Copy, Volume2, FileText, Check, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWeightedRandomPersona } from '@/data/personas';
import { funnelConfig } from '@/data/funnels';
import { useGemini } from '@/hooks/useGemini';
import { useAudio } from '@/hooks/useAudio';
import { useExport } from '@/hooks/useExport';
import { useHistory } from '@/hooks/useHistory';
import type { GeneratedCopy } from '@/types';

export function BatchGenerator() {
  const [count, setCount] = useState(6);
  const [style, setStyle] = useState('uno-cada-uno');
  const [batchResults, setBatchResults] = useState<GeneratedCopy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [failedIndices, setFailedIndices] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<{status: 'idle' | 'testing' | 'success' | 'error', message: string}>({status: 'idle', message: ''});
  
  const { generateMultipleCopies } = useGemini();
  const { generateSpeech, play, pause, isPlaying } = useAudio();
  const { exportToHTML, exportBatchForEditor, exportBatchForAudioGeneration } = useExport();
  const { addBatch } = useHistory();

  const generateBatch = async () => {
    console.log('[DEBUG] generateBatch started');
    setIsGenerating(true);
    setProgress(0);
    setBatchResults([]);
    setFailedIndices([]);
    setErrors([]);
    
    try {
      const allFunnels = ['tof', 'mof', 'bof', 'metralleta', 'hibrido'];
      let funnelList: string[] = [];
      
      if (style === 'uno-cada-uno') {
        funnelList = [...allFunnels];
        for (let i = 5; i < count; i++) {
          funnelList.push(allFunnels[Math.floor(Math.random() * allFunnels.length)]);
        }
        funnelList = funnelList.slice(0, count);
      } else if (style === 'mixto') {
        for (let i = 0; i < count; i++) {
          funnelList.push(['tof', 'mof', 'bof'][i % 3]);
        }
      } else {
        for (let i = 0; i < count; i++) {
          funnelList.push(style);
        }
      }

      // Preparar configs para generar todos de una vez
      const configs = funnelList.map(funnel => ({
        persona: getWeightedRandomPersona(),
        funnel,
        funnelConfig: funnelConfig[funnel]
      }));

      console.log('[DEBUG] About to call generateMultipleCopies with', configs.length, 'configs');
      
      // Generar todos los copies en UNA SOLA llamada a la API
      const copies = await generateMultipleCopies(configs);
      
      console.log('[DEBUG] Received', copies.length, 'copies');
      
      if (!copies || copies.length === 0) {
        throw new Error('No se recibieron copies de Gemini. Verificá tu API key y cuota.');
      }
      
      setBatchResults(copies);
      setProgress(100);
      
      // Guardar en historial como un lote
      addBatch(copies, style);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error generando batch:', err);
      setErrors([errorMsg]);
      setFailedIndices(Array.from({length: count}, (_, i) => i));
    }
    
    setIsGenerating(false);
    setProgress(0);
  };

  const handlePlayAudio = async (copy: GeneratedCopy, index: number) => {
    if (playingIndex === index && isPlaying) {
      pause();
      setPlayingIndex(null);
      return;
    }
    
    setPlayingIndex(index);
    const url = await generateSpeech(copy.fullText, {
      languageCode: 'es-AR',
      name: 'es-AR-Neural2-B',
      ssmlGender: 'MALE',
      speakingRate: 1.1
    });
    
    if (url) {
      await play(url);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    if (batchResults.length === 0) return;
    exportToHTML(batchResults, 'planilla_editora');
  };

  const handleExportForEditor = () => {
    if (batchResults.length === 0) return;
    exportBatchForEditor(batchResults, 'guia_audio_editora');
  };

  const handleExportForAudio = () => {
    if (batchResults.length === 0) return;
    exportBatchForAudioGeneration(batchResults, 'copies_para_audio');
  };

  const runDiagnostic = async () => {
    setDiagnosticResult({status: 'testing', message: 'Verificando conexión con Gemini...'});
    
    try {
      // Verificar si hay API key
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        setDiagnosticResult({status: 'error', message: '❌ No se encontró API key. Pegala en la sección de arriba y hacé clic en "Probar".'});
        return;
      }

      // Limpiar la key (por si tiene comillas)
      let cleanKey = apiKey;
      try {
        cleanKey = JSON.parse(apiKey);
      } catch {
        cleanKey = apiKey.replace(/^"|"$/g, '');
      }

      // Hacer un test simple
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Decime "OK"' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (response.ok) {
        setDiagnosticResult({status: 'success', message: '✅ Todo funciona correctamente. Podés generar copies.'});
      } else if (response.status === 429) {
        setDiagnosticResult({status: 'error', message: '❌ Límite de cuota excedido (429). Esperá unos minutos o usá otra API key.'});
      } else if (response.status === 400) {
        setDiagnosticResult({status: 'error', message: '❌ API key inválida. Verificá que la copiaste bien desde Google AI Studio.'});
      } else {
        setDiagnosticResult({status: 'error', message: `❌ Error ${response.status}. Intentá de nuevo más tarde.`});
      }
    } catch (err) {
      setDiagnosticResult({status: 'error', message: `❌ Error de conexión: ${err instanceof Error ? err.message : 'Desconocido'}`});
    }
  };

  const funnelColors: Record<string, string> = {
    tof: '#ff6b35',
    mof: '#ffd700',
    bof: '#4ade80',
    metralleta: '#ec4899',
    hibrido: '#8b5cf6'
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Cantidad</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 6)}
            className="bg-background/50"
          />
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <Label>Estilo de Lote</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uno-cada-uno">🎯 1 de cada + random (recomendado)</SelectItem>
              <SelectItem value="mixto">🎲 Mixto clásico (TOF/MOF/BOF)</SelectItem>
              <SelectItem value="tof">🎯 Solo TOF</SelectItem>
              <SelectItem value="mof">🔍 Solo MOF</SelectItem>
              <SelectItem value="bof">🔥 Solo BOF</SelectItem>
              <SelectItem value="metralleta">⚡ Solo METRALLETA</SelectItem>
              <SelectItem value="hibrido">💫 Solo HÍBRIDO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Diagnostic Button */}
      <div className="flex justify-center">
        <Button 
          onClick={runDiagnostic} 
          variant="outline" 
          size="sm"
          className="text-xs border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400"
          disabled={diagnosticResult.status === 'testing'}
        >
          {diagnosticResult.status === 'testing' ? (
            <>
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 mr-2" />
              🔍 Verificar conexión antes de generar
            </>
          )}
        </Button>
      </div>

      {diagnosticResult.status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            diagnosticResult.status === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
              : diagnosticResult.status === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {diagnosticResult.status === 'success' ? <Check className="w-4 h-4" /> :
             diagnosticResult.status === 'error' ? <AlertCircle className="w-4 h-4" /> :
             <Activity className="w-4 h-4 animate-pulse" />}
            {diagnosticResult.message}
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      <Button
        onClick={generateBatch}
        disabled={isGenerating}
        className="w-full h-12 bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:from-[#9333ea] hover:to-[#a855f7]"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generando {currentIndex} de {count}...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Generar Lote con IA
          </span>
        )}
      </Button>

      {/* Progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Generando copy {currentIndex} de {count}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {batchResults.length > 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Export Buttons */}
            <div className="flex justify-end gap-2 flex-wrap">
              <Button onClick={handleExportForAudio} variant="outline" className="border-[#a855f7]/30 hover:bg-[#a855f7]/10">
                <Volume2 className="w-4 h-4 mr-2 text-[#a855f7]" />
                🎙️ Solo Copies (para audio)
              </Button>
              <Button onClick={handleExportForEditor} variant="outline" className="border-[#4ade80]/30 hover:bg-[#4ade80]/10">
                <FileText className="w-4 h-4 mr-2 text-[#4ade80]" />
                📄 Guía Completa (TXT)
              </Button>
              <Button onClick={handleExport} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                🎨 Planilla Visual (HTML)
              </Button>
            </div>

            {/* Batch Items */}
            <div className="space-y-3">
              {batchResults.map((copy, i) => (
                <motion.div
                  key={copy.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-white/10 bg-card/30 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">#{i + 1}</span>
                      <Badge style={{ backgroundColor: funnelColors[copy.funnel] }}>
                        {copy.funnel.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {copy.persona.emoji} {copy.persona.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {copy.words} pal · ~{copy.time}s
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[#ff6b35] font-semibold">A:</span> {copy.atencion.substring(0, 60)}...
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[#2D8BC9] font-semibold">I:</span> {copy.interes.substring(0, 60)}...
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[#ffd700] font-semibold">D:</span> {copy.deseo.substring(0, 60)}...
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <span className="text-[#4ade80] font-semibold">A:</span> {copy.accion.substring(0, 60)}...
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(copy.fullText, i)}
                    >
                      {copiedIndex === i ? (
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      Copiar
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayAudio(copy, i)}
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Escuchar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Errores */}
            {(failedIndices.length > 0 || errors.length > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl border border-red-500/30 bg-red-500/10"
              >
                <h4 className="text-sm font-semibold text-red-400 mb-2">
                  ⚠️ Error al generar copies:
                </h4>
                <ul className="text-xs text-red-300/80 space-y-1">
                  {errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Probablemente por límite de cuota de Gemini (20 requests/día en tier gratuito). Intentá de nuevo en unos minutos o con otra API key.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
