import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Heart, Trash2, Copy, Search, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GeneratedCopy, ImageCombo } from '@/types';

interface HistoryPanelProps {
  copies: GeneratedCopy[];
  images: ImageCombo[];
  favorites: { copies: string[]; images: string[] };
  onToggleFavoriteCopy: (id: string) => void;
  onToggleFavoriteImage: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ 
  copies, 
  images, 
  favorites, 
  onToggleFavoriteCopy, 
  onToggleFavoriteImage,
  onClearHistory 
}: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');

  const filteredCopies = copies.filter(copy => 
    copy.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    copy.persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    copy.funnel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteCopiesList = copies.filter(c => favorites.copies.includes(c.id));
  const favoriteImagesList = images.filter(img => favorites.images.includes(img.id));

  const funnelColors: Record<string, string> = {
    tof: '#ff6b35',
    mof: '#ffd700',
    bof: '#4ade80',
    metralleta: '#ec4899',
    hibrido: '#8b5cf6'
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar en historial..."
          className="pl-10 bg-background/50"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="recent" className="text-xs">
            <History className="w-3 h-3 mr-1" />
            Recientes ({copies.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs">
            <Heart className="w-3 h-3 mr-1" />
            Favoritos ({favorites.copies.length + favorites.images.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="text-xs">
            <Image className="w-3 h-3 mr-1" />
            Imágenes ({images.length})
          </TabsTrigger>
        </TabsList>

        {/* Recent Copies */}
        <TabsContent value="recent" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredCopies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay copies en el historial</p>
                </div>
              ) : (
                filteredCopies.map((copy, i) => (
                  <motion.div
                    key={copy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg border border-white/10 bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            style={{ backgroundColor: funnelColors[copy.funnel] }}
                            className="text-[10px]"
                          >
                            {copy.funnel.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {copy.persona.emoji} {copy.persona.name}
                          </span>
                        </div>
                        <p className="text-xs line-clamp-2">{copy.fullText}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>{copy.words} pal</span>
                          <span>·</span>
                          <span>~{copy.time}s</span>
                          <span>·</span>
                          <span>{new Date(copy.timestamp).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => onToggleFavoriteCopy(copy.id)}
                        >
                          <Heart 
                            className={`w-3 h-3 ${favorites.copies.includes(copy.id) ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => handleCopy(copy.fullText)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {copies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="w-full mt-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Historial
            </Button>
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {/* Favorite Copies */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Copies Favoritos ({favoriteCopiesList.length})
                </h4>
                <div className="space-y-2">
                  {favoriteCopiesList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No hay copies favoritos
                    </p>
                  ) : (
                    favoriteCopiesList.map((copy) => (
                      <motion.div
                        key={copy.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-lg border border-red-500/30 bg-red-500/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge 
                              style={{ backgroundColor: funnelColors[copy.funnel] }}
                              className="text-[10px] mb-1"
                            >
                              {copy.funnel.toUpperCase()}
                            </Badge>
                            <p className="text-xs line-clamp-2">{copy.fullText}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() => onToggleFavoriteCopy(copy.id)}
                          >
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorite Images */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Imágenes Favoritas ({favoriteImagesList.length})
                </h4>
                <div className="space-y-2">
                  {favoriteImagesList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No hay imágenes favoritas
                    </p>
                  ) : (
                    favoriteImagesList.map((img) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-lg border border-red-500/30 bg-red-500/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">"{img.headline}"</p>
                            <p className="text-[10px] text-muted-foreground">{img.contexto}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() => onToggleFavoriteImage(img.id)}
                          >
                            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {images.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay imágenes generadas</p>
                </div>
              ) : (
                images.map((img, i) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-lg border border-white/10 bg-card/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold line-clamp-1">"{img.headline}"</p>
                        <p className="text-[10px] text-muted-foreground">{img.contexto}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>{new Date(img.timestamp).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => onToggleFavoriteImage(img.id)}
                      >
                        <Heart 
                          className={`w-3 h-3 ${favorites.images.includes(img.id) ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
