import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface PrebookingState {
  prebooking: any | null;
  loading: boolean;
  error: string | null;
  setPrebooking: (prebooking: any) => void;
  clearPrebooking: () => void;
  createPrebooking: (data: any) => Promise<void>;
  getPrebooking: () => Promise<void>;
}

const usePrebookingStore = create<PrebookingState>()(
  persist(
    (set, get) => ({
      prebooking: null,
      loading: false,
      error: null,

      setPrebooking: (prebooking) => set({ prebooking }),

      clearPrebooking: () => set({ prebooking: null, error: null }),

      createPrebooking: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/prebooking', data);
          set({ prebooking: response.data, loading: false });
        } catch (error: any) {
          console.error('Prebooking creation error:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to create prebooking', 
            loading: false 
          });
          throw error;
        }
      },

      getPrebooking: async () => {
        try {
          set({ loading: true, error: null });
          const response = await api.get('/prebooking');
          set({ prebooking: response.data, loading: false });
        } catch (error: any) {
          console.error('Prebooking fetch error:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to fetch prebooking', 
            loading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'asr-prebooking-storage',
      partialize: (state) => ({ prebooking: state.prebooking }),
    }
  )
);

export default usePrebookingStore; 
