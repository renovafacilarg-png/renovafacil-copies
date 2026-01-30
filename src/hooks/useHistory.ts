import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { GeneratedCopy, ImageCombo, HistoryItem, Batch } from '@/types';

interface HistoryState {
  copies: GeneratedCopy[];
  images: ImageCombo[];
  headlines: HistoryItem[];
  batches: Batch[];
  count: number;
  duplicatesAvoided: number;
}

const initialHistory: HistoryState = {
  copies: [],
  images: [],
  headlines: [],
  batches: [],
  count: 0,
  duplicatesAvoided: 0
};

export function useHistory() {
  const [history, setHistory] = useLocalStorage<HistoryState>('renovafacil-history', initialHistory);

  const addCopy = useCallback((copy: GeneratedCopy) => {
    setHistory(prev => ({
      ...prev,
      copies: [copy, ...prev.copies].slice(0, 500),
      count: prev.count + 1
    }));
  }, [setHistory]);

  const addImage = useCallback((image: ImageCombo) => {
    setHistory(prev => ({
      ...prev,
      images: [image, ...prev.images].slice(0, 500),
      count: prev.count + 1
    }));
  }, [setHistory]);

  const addHeadline = useCallback((headline: string) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      type: 'headline',
      content: headline,
      timestamp: Date.now()
    };
    setHistory(prev => ({
      ...prev,
      headlines: [item, ...prev.headlines].slice(0, 500),
      count: prev.count + 1
    }));
  }, [setHistory]);

  const addBatch = useCallback((copies: GeneratedCopy[], style: string) => {
    const batch: Batch = {
      id: Date.now().toString(),
      copies,
      timestamp: Date.now(),
      count: copies.length,
      style
    };
    setHistory(prev => ({
      ...prev,
      batches: [batch, ...prev.batches].slice(0, 100),
      copies: [...copies, ...prev.copies].slice(0, 500),
      count: prev.count + copies.length
    }));
  }, [setHistory]);

  const toggleFavoriteCopy = useCallback((id: string) => {
    setHistory(prev => ({
      ...prev,
      copies: prev.copies.map(c => 
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      )
    }));
  }, [setHistory]);

  const toggleFavoriteImage = useCallback((id: string) => {
    setHistory(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
      )
    }));
  }, [setHistory]);

  const incrementDuplicatesAvoided = useCallback(() => {
    setHistory(prev => ({
      ...prev,
      duplicatesAvoided: prev.duplicatesAvoided + 1
    }));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    if (confirm('¿Borrar todo el historial? Esto permitirá que se repitan copies anteriores.')) {
      setHistory(initialHistory);
    }
  }, [setHistory]);

  const favoriteCopies = useMemo(() => 
    history.copies.filter(c => c.isFavorite),
  [history.copies]);

  const favoriteImages = useMemo(() => 
    history.images.filter(img => img.isFavorite),
  [history.images]);

  const recentCopies = useMemo(() => 
    history.copies.slice(0, 20),
  [history.copies]);

  const recentImages = useMemo(() => 
    history.images.slice(0, 20),
  [history.images]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const copiesThisWeek = history.copies.filter(c => c.timestamp > oneWeekAgo).length;
    const imagesThisWeek = history.images.filter(img => img.timestamp > oneWeekAgo).length;
    
    // Find favorite funnel
    const funnelCounts: Record<string, number> = {};
    history.copies.forEach(c => {
      funnelCounts[c.funnel] = (funnelCounts[c.funnel] || 0) + 1;
    });
    const favoriteFunnel = Object.entries(funnelCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'tof';

    const averageWords = history.copies.length > 0
      ? Math.round(history.copies.reduce((sum, c) => sum + c.words, 0) / history.copies.length)
      : 0;

    return {
      totalGenerated: history.count,
      copiesThisWeek,
      imagesThisWeek,
      favoriteFunnel,
      averageWords,
      duplicatesAvoided: history.duplicatesAvoided
    };
  }, [history]);

  return {
    history,
    addCopy,
    addImage,
    addHeadline,
    addBatch,
    toggleFavoriteCopy,
    toggleFavoriteImage,
    incrementDuplicatesAvoided,
    clearHistory,
    favoriteCopies,
    favoriteImages,
    recentCopies,
    recentImages,
    stats
  };
}
