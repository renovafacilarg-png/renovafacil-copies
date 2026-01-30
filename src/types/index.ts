// Tipos para el generador de contenido Renovafácil

export interface BuyerPersona {
  id: string;
  name: string;
  emoji: string;
  weight: number;
  desc: string;
  dolor: string;
  motivador: string;
  tono: string;
}

export interface FunnelConfig {
  name: string;
  desc: string;
  targetWords: [number, number];
  maxWords: number;
  targetTime: [number, number];
  instructions: string;
  color: string;
}

export interface GeneratedCopy {
  id: string;
  atencion: string;
  interes: string;
  deseo: string;
  accion: string;
  visual_atencion?: string;
  visual_interes?: string;
  visual_deseo?: string;
  visual_accion?: string;
  fullText: string;
  words: number;
  time: number;
  persona: BuyerPersona;
  funnel: string;
  timestamp: number;
  isFavorite?: boolean;
  audioUrl?: string;
}

export interface ImageVariable {
  code: string;
  name: string;
  desc: string;
  technical?: string;
  style?: string;
}

export interface ImageCombo {
  id: string;
  selected: Record<string, ImageVariable | ImageVariable[]>;
  headline: string;
  contexto: string;
  comboCode: string;
  nanoBananaPrompt: string;
  veo3Prompt: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'copy' | 'image' | 'headline';
  content: string;
  timestamp: number;
  funnel?: string;
  persona?: string;
}

export interface Batch {
  id: string;
  copies: GeneratedCopy[];
  timestamp: number;
  count: number;
  style: string;
}

export interface DashboardStats {
  totalGenerated: number;
  copiesThisWeek: number;
  imagesThisWeek: number;
  favoriteFunnel: string;
  averageWords: number;
  duplicatesAvoided: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'copy' | 'image' | 'campaign';
  copies?: GeneratedCopy[];
  images?: ImageCombo[];
}

export interface VoiceSettings {
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate: number;
  pitch: number;
}

export type Theme = 'dark' | 'light' | 'system';

export type ExportFormat = 'html' | 'pdf' | 'csv' | 'json';
