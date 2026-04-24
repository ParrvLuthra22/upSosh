import { create } from 'zustand';

interface AppState {
    isFormal: boolean;
    toggleMode: () => void;
    setMode: (isFormal: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isFormal: false, 
    toggleMode: () => set((state) => ({ isFormal: !state.isFormal })),
    setMode: (isFormal) => set({ isFormal }),
}));
