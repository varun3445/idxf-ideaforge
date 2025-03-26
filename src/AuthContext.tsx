
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from './types/auth.types';
import { useAuthProvider } from './hooks/useAuthProvider';

// Create a default auth context with authentication disabled
const defaultAuthContext: AuthContextType = {
  user: null,
  setUser: () => {},
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  signIn: async () => {},
  signUp: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the actual auth provider hook instead of mock data
  const auth = useAuthProvider();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
