import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  step: number;
  name: string;
  photoUrl: string;
  bio: string;
  interests: string[];
  city: string;
  groupSize: 'intimate' | 'larger' | '';
  vibe: 'chill' | 'structured' | '';
  frequency: 'weekly' | 'occasional' | '';
  wantsToHost: boolean | null;
  setStep: (s: number) => void;
  update: (data: Partial<Omit<OnboardingState, 'setStep' | 'update' | 'reset'>>) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  name: '',
  photoUrl: '',
  bio: '',
  interests: [] as string[],
  city: '',
  groupSize: '' as 'intimate' | 'larger' | '',
  vibe: '' as 'chill' | 'structured' | '',
  frequency: '' as 'weekly' | 'occasional' | '',
  wantsToHost: null as boolean | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (s) => set({ step: s }),
      update: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set({ ...initialState }),
    }),
    { name: 'upsosh-onboarding' }
  )
);
