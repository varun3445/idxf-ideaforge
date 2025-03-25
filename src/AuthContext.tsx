
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from './types/auth.types';
import { useAuthProvider } from './hooks/useAuthProvider';
import { supabase } from './integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthProvider();
  
  // Mock authentication (temporarily)
  const mockAuth: AuthContextType = {
    ...auth,
    isAuthenticated: true,
    loading: false,
    user: {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Demo User',
      location: 'San Francisco, CA',
      skills: ['React', 'TypeScript', 'UI/UX'],
      avatar: null
    }
  };
  
  return <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
