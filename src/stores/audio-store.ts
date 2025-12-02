import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AudioState {
  // Settings
  isMuted: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  
  // Haptic feedback
  hapticEnabled: boolean;
}

interface AudioActions {
  // Volume controls
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  
  // Haptic
  setHapticEnabled: (enabled: boolean) => void;
  toggleHaptic: () => void;
  
  // Trigger haptic feedback
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

type AudioStore = AudioState & AudioActions;

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isMuted: false,
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      hapticEnabled: true,

      // Volume controls
      setMuted: (muted) => set({ isMuted: muted }),
      
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),
      
      setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
      
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),

      // Haptic
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),

      // Trigger haptic feedback
      triggerHaptic: (type) => {
        const { hapticEnabled } = get();
        
        if (!hapticEnabled || typeof navigator === 'undefined') return;
        
        // Check if vibration API is supported
        if ('vibrate' in navigator) {
          const patterns: Record<typeof type, number | number[]> = {
            light: 10,
            medium: 25,
            heavy: 50,
            success: [10, 50, 10],
            error: [50, 30, 50, 30, 50],
          };
          
          navigator.vibrate(patterns[type]);
        }
      },
    }),
    {
      name: 'board-battle-audio',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Sound effect helper (to be used with actual audio files)
export const playSound = (soundName: string) => {
  const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
  
  if (isMuted) return;
  
  const volume = masterVolume * sfxVolume;
  
  // In production, you'd load and play actual audio files
  // For now, this is a placeholder for the audio system
  if (typeof window !== 'undefined' && 'Audio' in window) {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = volume;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Ignore audio errors
    }
  }
};
