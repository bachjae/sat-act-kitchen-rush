import { create } from 'zustand';

export type Screen = 'main-menu' | 'session-select' | 'playing' | 'recap' | 'settings' | 'loading';
export type SessionType = 'quick' | 'standard' | 'practice' | null;

interface NavigationState {
  screen: Screen;
  sessionType: SessionType;
  navigateTo: (screen: Screen) => void;
  startSession: (type: SessionType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  screen: 'main-menu',
  sessionType: null,
  navigateTo: (screen) => set({ screen }),
  startSession: (type) => set({ screen: 'playing', sessionType: type }),
}));
