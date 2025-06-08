import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'user';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string, role?: string) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/login', {
            email,
            password,
            role
          });

          const { user, token } = response.data.data;
          
          set({ user, token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          toast.success(`Welcome back, ${user.name}!`);
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return false;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data.data;
          
          set({ user, token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          toast.success(`Welcome to ASR Parking, ${user.name}!`);
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          set({ isLoading: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/me');
          const { user } = response.data.data;
          
          set({ user, isLoading: false });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          delete api.defaults.headers.common['Authorization'];
        }
      }
    }),
    {
      name: 'asr-auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);

// Initialize auth check
useAuthStore.getState().checkAuth();