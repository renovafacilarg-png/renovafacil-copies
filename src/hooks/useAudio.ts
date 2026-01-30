import { useState, useCallback, useRef } from 'react';

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  audioUrl: string | null;
}

export function useAudio() {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    audioUrl: null
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeech = useCallback(async (text: string, voiceConfig?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
    speakingRate?: number;
    pitch?: number;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem('google_tts_api_key');
      
      if (!apiKey) {
        throw new Error('API_KEY_MISSING');
      }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig?.languageCode || 'es-AR',
            name: voiceConfig?.name || 'es-AR-Neural2-B',
            ssmlGender: voiceConfig?.ssmlGender || 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: voiceConfig?.speakingRate || 1.0,
            pitch: voiceConfig?.pitch || 0
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && errorData.error?.message?.includes('API key')) {
          throw new Error('API_KEY_INVALID');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to blob URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      setState(prev => ({ ...prev, audioUrl, isLoading: false }));
      return audioUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw err;
    }
  }, []);

  const play = useCallback(async (url?: string) => {
    const audioUrl = url || state.audioUrl;
    if (!audioUrl) return;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setState(prev => ({ ...prev, isPlaying: true }));
    audio.onended = () => setState(prev => ({ ...prev, isPlaying: false }));
    audio.onerror = () => setState(prev => ({ ...prev, isPlaying: false, error: 'Playback error' }));

    await audio.play();
  }, [state.audioUrl]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const clearAudio = useCallback(() => {
    stop();
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isPlaying: false,
      isLoading: false,
      error: null,
      audioUrl: null
    });
  }, [state.audioUrl, stop]);

  return {
    ...state,
    generateSpeech,
    play,
    pause,
    stop,
    clearAudio
  };
}
