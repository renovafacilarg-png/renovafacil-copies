import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Volume2, Play, Pause, Heart, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { personas, getWeightedRandomPersona } from '@/data/personas';
import { funnelConfig } from '@/data/funnels';
import { useGemini } from '@/hooks/useGemini';
import { useAudio } from '@/hooks/useAudio';
import type { GeneratedCopy } from '@/types';

interface CopyGeneratorProps {
  onCopyGenerated: (copy: GeneratedCopy) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
}

export function CopyGenerator({ onCopyGenerated, onToggleFavorite, favorites }: CopyGeneratorProps) {
  const [selectedFunnel, setSelectedFunnel] = useState('tof');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const { isLoading, error, generateCopy } = useGemini();
  const { isLoading: isGeneratingAudio, generateSpeech, play, pause, isPlaying } = useAudio();

  const handleGenerate = async () => {
    const persona = selectedPersona 
      ? personas[selectedPersona] 
      : getWeightedRandomPersona();
    
    try {
      const copy = await generateCopy(persona, selectedFunnel, funnelConfig[selectedFunnel]);
      setGeneratedCopy(copy);
      onCopyGenerated(copy);
    } catch (err) {
      console.error('Error generating copy:', err);
    }
  };

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleGenerateAudio = async () => {
    if (!generatedCopy) return;
    await generateSpeech(generatedCopy.fullText, {
      languageCode: 'es-AR',
      name: 'es-AR-Neural2-B',
      ssmlGender: 'MALE',
      speakingRate: 1.1,
      pitch: 0
    });
  };

  const funnelColors: Record<string, string> = {
    tof: 'bg-[#ff6b35]',
    mof: 'bg-[#ffd700] text-black',
    bof: 'bg-[#4ade80] text-black',
    metralleta: 'bg-[#ec4899]',
    hibrido: 'bg-[#8b5cf6]'
  };

  const sections = [
    { key: 'atencion', label: '🎯 ATENCIÓN', time: '0-5 seg', color: '#ff6b35' },
    { key: 'interes', label: '🧲 INTERÉS', time: '5-15 seg', color: '#2D8BC9' },
    { key: 'deseo', label: '🔥 DESEO', time: '15-35 seg', color: '#ffd700' },
    { key: 'accion', label: '🚀 ACCIÓN', time: '35-45 seg', color: '#4ade80' }
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Etapa del Funnel</label>
        <Tabs value={selectedFunnel} onValueChange={setSelectedFunnel} className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-background/50">
            {Object.keys(funnelConfig).map((key) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {key.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <motion.p 
          key={selectedFunnel}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg"
          dangerouslySetInnerHTML={{ __html: funnelConfig[selectedFunnel].desc }}
        />
      </div>

      {/* Persona Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Buyer Persona</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPersona(null)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              selectedPersona === null 
                ? 'border-[#a855f7] bg-[#a855f7]/10' 
                : 'border-white/10 bg-card/30 hover:border-[#a855f7]/50'
            }`}
          >
            <div className="text-2xl mb-1">🎲</div>
            <div className="text-xs font-semibold">Aleatorio</div>
            <div className="text-[10px] text-muted-foreground">Ponderado por data</div>
          </motion.button>
          
          {Object.entries(personas).map(([key, persona]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersona(key)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                selectedPersona === key 
                  ? 'border-[#a855f7] bg-[#a855f7]/10' 
                  : 'border-white/10 bg-card/30 hover:border-[#a855f7]/50'
              }`}
            >
              <div className="text-2xl mb-1">{persona.emoji}</div>
              <div className="text-xs font-semibold truncate">{persona.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{persona.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:from-[#9333ea] hover:to-[#a855f7] transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generando con IA...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generar Copy con IA
            </span>
          )}
        </Button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm"
          >
            {error === 'API_KEY_MISSING' && '⚠️ Falta la API Key de Gemini. Configurala arriba.'}
            {error === 'API_KEY_INVALID' && '❌ API Key inválida. Verificá que sea correcta.'}
            {error !== 'API_KEY_MISSING' && error !== 'API_KEY_INVALID' && `Error: ${error}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Copy */}
      <AnimatePresence>
        {generatedCopy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${funnelColors[generatedCopy.funnel]}`}>
                {generatedCopy.funnel.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-[#2D8BC9]/50 text-[#2D8BC9]">
                {generatedCopy.persona.emoji} {generatedCopy.persona.name}
              </Badge>
              <Badge variant="outline" className="border-[#3D6B4B]/50 text-[#4ade80]">
                {generatedCopy.words} palabras · ~{generatedCopy.time}s
              </Badge>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(generatedCopy.id)}
                className={favorites.includes(generatedCopy.id) ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(generatedCopy.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* AIDA Sections */}
            <div className="space-y-3">
              {sections.map((section) => {
                const text = generatedCopy[section.key as keyof GeneratedCopy] as string;
                const visualText = generatedCopy[`visual_${section.key}` as keyof GeneratedCopy] as string;
                
                return (
                  <motion.div
                    key={section.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl overflow-hidden border border-white/10"
                  >
                    <div 
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between"
                      style={{ backgroundColor: `${section.color}20`, color: section.color }}
                    >
                      <span>{section.label}</span>
                      <span className="opacity-60">{section.time}</span>
                    </div>
                    <div className="p-4 bg-card/30 space-y-3">
                      <p className="text-sm leading-relaxed">{text}</p>
                      {visualText && (
                        <div className="p-3 rounded-lg bg-[#a855f7]/10 border border-dashed border-[#a855f7]/30">
                          <div className="text-xs text-[#a855f7] font-semibold mb-1">🎬 VISUAL</div>
                          <div className="text-xs text-muted-foreground italic">{visualText}</div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(text, section.key)}
                          className="text-xs"
                        >
                          {copiedSection === section.key ? (
                            <Check className="w-3 h-3 mr-1 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedSection === section.key ? 'Copiado' : 'Copiar'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full Copy & Actions */}
            <div className="p-4 rounded-xl bg-[#3D6B4B]/10 border border-[#3D6B4B]/30 space-y-3">
              <div className="text-xs text-[#4ade80] font-semibold uppercase tracking-wider">
                📝 Copy Completo para ElevenLabs
              </div>
              <p className="text-sm leading-relaxed">{generatedCopy.fullText}</p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(generatedCopy.fullText, 'full')}
                >
                  {copiedSection === 'full' ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copiar Todo
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                >
                  {isGeneratingAudio ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  Generar Audio
                </Button>
                
                {generatedCopy.audioUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isPlaying ? pause : () => play()}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? 'Pausar' : 'Escuchar'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generar Otro
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
