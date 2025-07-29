import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

// Helper functions for localStorage
const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.state?.user || null,
        token: parsed.state?.token || null,
        isAuthenticated: !!parsed.state?.token,
      };
    }
  } catch (error) {
    console.error('Error reading auth from localStorage:', error);
  }
  return null;
};

const setStoredAuth = (auth: { user: User | null; token: string | null; isAuthenticated: boolean }) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: auth,
      version: 0,
      lastUpdated: Date.now(),
    }));
  } catch (error) {
    console.error('Error writing auth to localStorage:', error);
  }
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('auth-storage');
  } catch (error) {
    console.error('Error clearing auth from localStorage:', error);
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    
    login: (user: User, token: string) => {
      const auth = { user, token, isAuthenticated: true };
      set(auth);
      setStoredAuth(auth);
    },
    
    logout: () => {
      const auth = { user: null, token: null, isAuthenticated: false };
      set(auth);
      clearStoredAuth();
    },
    
    updateUser: (user: User) => {
      const currentState = get();
      const auth = { ...currentState, user };
      set(auth);
      setStoredAuth(auth);
    },
    
    initializeAuth: () => {
      const storedAuth = getStoredAuth();
      if (storedAuth) {
        set(storedAuth);
      }
    },
  };
}); 