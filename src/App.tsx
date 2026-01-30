import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, BarChart3, History, Moon, Sun, Monitor,
  Sparkles, Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Dashboard } from '@/components/Dashboard';
import { CopyGenerator } from '@/components/CopyGenerator';
import { BatchGenerator } from '@/components/BatchGenerator';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useTheme } from '@/hooks/useTheme';
import { useHistory } from '@/hooks/useHistory';
import type { GeneratedCopy } from '@/types';
import './App.css';

function App() {
  const { theme, setTheme } = useTheme();
  const { 
    history, 
    addCopy, 
    toggleFavoriteCopy, 
    toggleFavoriteImage,
    clearHistory,
    favoriteCopies,
    favoriteImages,
    stats 
  } = useHistory();
  
  const [activeTab, setActiveTab] = useState('voiceover');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + number to switch tabs
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabs = ['voiceover', 'batch', 'history', 'dashboard'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
      }
      
      // Ctrl/Cmd + K to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Escape to close shortcuts
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate weekly data for dashboard
  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = date.setHours(0, 0, 0, 0);
      const dayEnd = date.setHours(23, 59, 59, 999);
      
      const copiesCount = history.copies.filter(
        c => c.timestamp >= dayStart && c.timestamp <= dayEnd
      ).length;
      
      const imagesCount = history.images.filter(
        img => img.timestamp >= dayStart && img.timestamp <= dayEnd
      ).length;
      
      data.push({
        day: days[date.getDay()],
        copies: copiesCount,
        images: imagesCount
      });
    }
    
    return data;
  }, [history.copies, history.images]);

  // Generate funnel distribution for dashboard
  const funnelDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    history.copies.forEach(c => {
      distribution[c.funnel] = (distribution[c.funnel] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      tof: '#ff6b35',
      mof: '#ffd700',
      bof: '#4ade80',
      metralleta: '#ec4899',
      hibrido: '#8b5cf6'
    };
    
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: colors[name] || '#888'
    }));
  }, [history.copies]);

  const handleCopyGenerated = (copy: GeneratedCopy) => {
    addCopy(copy);
  };

  const favoritesList = useMemo(() => ({
    copies: favoriteCopies.map(c => c.id),
    images: favoriteImages.map(img => img.id)
  }), [favoriteCopies, favoriteImages]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a5a8a] border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  <span className="text-[#90EE90]">RENOVA</span>
                  <span className="text-[#87CEEB]">FÁCIL</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs text-white/70">Generador de Contenido con IA</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#a855f7] to-[#c084fc] rounded-full text-white">
                      V6.0 PRO
                    </span>
                    <span className="text-[10px] text-white/50">Google TTS + Gemini Flash</span>
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      {theme === 'light' ? <Sun className="w-4 h-4" /> : 
                       theme === 'dark' ? <Moon className="w-4 h-4" /> : 
                       <Monitor className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tema: {theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowShortcuts(true)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Keyboard className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Atajos de teclado (Ctrl+K)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* API Keys */}
          <ApiKeyManager />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-muted/50 p-1">
              <TabsTrigger value="voiceover" className="gap-2">
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voiceovers</span>
              </TabsTrigger>
              <TabsTrigger value="batch" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Lotes</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historial</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
            </TabsList>

            {/* Voiceover Generator */}
            <TabsContent value="voiceover" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#c084fc] flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Generador de Voiceovers</h2>
                    <p className="text-sm text-muted-foreground">Crea copies únicos con IA para tus videos</p>
                  </div>
                </div>
                
                <CopyGenerator 
                  onCopyGenerated={handleCopyGenerated}
                  onToggleFavorite={toggleFavoriteCopy}
                  favorites={favoritesList.copies}
                />
              </motion.div>
            </TabsContent>

            {/* Batch Generator */}
            <TabsContent value="batch" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Generador de Lotes</h2>
                    <p className="text-sm text-muted-foreground">Generá múltiples copies de una vez</p>
                  </div>
                </div>
                
                <BatchGenerator />
              </motion.div>
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D6B4B] to-[#4a8259] flex items-center justify-center">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Historial y Favoritos</h2>
                    <p className="text-sm text-muted-foreground">Tus copies e imágenes generados</p>
                  </div>
                </div>
                
                <HistoryPanel
                  copies={history.copies}
                  images={history.images}
                  favorites={favoritesList}
                  onToggleFavoriteCopy={toggleFavoriteCopy}
                  onToggleFavoriteImage={toggleFavoriteImage}
                  onClearHistory={clearHistory}
                />
              </motion.div>
            </TabsContent>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D8BC9] to-[#1a5a8a] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Estadísticas y métricas de uso</p>
                  </div>
                </div>
                
                <Dashboard 
                  stats={stats}
                  weeklyData={weeklyData}
                  funnelDistribution={funnelDistribution}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="text-2xl font-bold tracking-wider mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              <span className="text-[#90EE90]">RENOVA</span>
              <span className="text-[#87CEEB]">FÁCIL</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Generador v6.0 Pro — Voiceovers con Google TTS + Gemini Flash
            </p>
            <a 
              href="https://renovafacil.store" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#a855f7] hover:underline mt-1 inline-block"
            >
              renovafacil.store
            </a>
          </div>
        </footer>

        {/* Keyboard Shortcuts Modal */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowShortcuts(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-white/10 rounded-2xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Atajos de Teclado
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)}>
                    <span className="sr-only">Cerrar</span>
                    <span className="text-lg">&times;</span>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Cambiar pestaña</span>
                    <kbd className="px-2 py-1 text-xs bg-background rounded border">Ctrl + 1-4</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Mostrar atajos</span>
                    <kbd className="px-2 py-1 text-xs bg-background rounded border">Ctrl + K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Cerrar modal</span>
                    <kbd className="px-2 py-1 text-xs bg-background rounded border">Esc</kbd>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

export default App;
