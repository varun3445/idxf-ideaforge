
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from './types/auth.types';

// Create a mock authenticated user
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  location: 'Somewhere, World',
  skills: ['JavaScript', 'React', 'Design'],
  avatar: null
};

// Create a default auth context with authentication disabled
const defaultAuthContext: AuthContextType = {
  user: mockUser,
  setUser: () => {},
  loading: false,
  error: null,
  isAuthenticated: true, // Always authenticated
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  signIn: async () => {},
  signUp: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContext.Provider value={defaultAuthContext}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
