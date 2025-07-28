// stores/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
   companyId: string; 
  email: string;
  company: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    email: string | null;
    signatureUrl: string | null;
    stampUrl: string | null;
  };
  role: string | null;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      loading: false,
      error: null,
      hydrated: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Erreur de connexion');
          }

          // Sauvegarder le token et l'utilisateur
          set({
            user: data.user,
            token: data.token,
            loading: false,
            error: null,
          });

          // Sauvegarder aussi dans localStorage comme fallback
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', data.token);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
          set({
            loading: false,
            error: errorMessage,
            user: null,
            token: null,
          });

          // Nettoyer localStorage en cas d'erreur
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
          }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
          loading: false,
        });

        // Nettoyer localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setHydrated: () => {
        set({ hydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Vérifier si nous sommes côté client
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Retourner un storage factice côté serveur
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        // Marquer comme hydraté après la rehydratation
        if (state) {
          state.setHydrated();
        }
      },
      // Ne persister que les données essentielles
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);