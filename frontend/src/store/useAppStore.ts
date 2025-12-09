import { create } from 'zustand';

interface AppState {
    isFormal: boolean;
    toggleMode: () => void;
    setMode: (isFormal: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isFormal: false, // Default to informal (party mode)
    toggleMode: () => set((state) => ({ isFormal: !state.isFormal })),
    setMode: (isFormal) => set({ isFormal }),
}));
