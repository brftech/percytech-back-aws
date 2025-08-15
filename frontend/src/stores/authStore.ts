import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  initialize: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
          };
          const mockToken = 'mock-jwt-token';

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      register: async (userData: Omit<User, 'id'>) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual API call
          const mockUser: User = {
            id: '1',
            ...userData,
          };
          const mockToken = 'mock-jwt-token';

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      initialize: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
