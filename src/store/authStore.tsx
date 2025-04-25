import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginCredentials, AuthResponse, ApiErrorResponse } from '../types/auth';
import { useTaskStore } from './taskStore';

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading?: boolean;
  error?: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>; // Updated signature
  register: (userData: LoginCredentials) => Promise<boolean>; // Updated signature
  logout: () => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            let errorMsg = 'Error en el inicio de sesión.';
            try {
                const errorData: ApiErrorResponse = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {
            }
            throw new Error(errorMsg);
          }

          const data: AuthResponse = await response.json();
          set({ token: data.token, isAuthenticated: true, loading: false, error: null });
          return true; // Indicate success

        } catch (error: any) {
          console.error("Login API error:", error);
          set({ error: error.message || 'Ocurrió un error inesperado.', loading: false, isAuthenticated: false, token: null });
          return false; // Indicate failure
        }
      },

      // --- REGISTER ---
      register: async (userData) => {
         set({ loading: true, error: null });
         try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMsg = 'Error en el registro.';
                try {
                    const errorData: ApiErrorResponse = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // Ignore if response is not JSON
                }
                if (response.status === 409) {
                    errorMsg = 'El correo electrónico ya está registrado.';
                }
                throw new Error(errorMsg);
            }

            const data: AuthResponse = await response.json();
            set({ token: data.token, isAuthenticated: true, loading: false, error: null });
            return true;
         } catch (error: any) {
            console.error("Register API error:", error);
            set({ error: error.message || 'Ocurrió un error inesperado.', loading: false });
            return false;
         }
      },

      logout: () => {
        set({ token: null, isAuthenticated: false, error: null, loading: false });
        useTaskStore.setState({ tasks: [], loading: false, error: null });
      },

      setToken: (token) => {
         set({ token, isAuthenticated: !!token });
      },

      clearError: () => {
          set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ ...state }),

    }
  )
);

const initialToken = useAuthStore.getState().token;
if (initialToken) {
  useAuthStore.setState({ isAuthenticated: true });
}