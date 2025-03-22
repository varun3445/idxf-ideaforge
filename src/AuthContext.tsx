import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { AuthContextType } from './types/auth.types';
import { useAuthProvider } from './hooks/useAuthProvider';
import { supabase } from './integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthProvider();
  
  // Override the authentication state to always return authenticated
  const bypassedAuth = {
    ...auth,
    isAuthenticated: true,
    loading: false,
    user: {
      id: 'temp-user-id',
      email: 'temp@example.com',
      name: 'Temporary User',
      location: 'Demo Location',
      skills: ['React', 'TypeScript', 'UI/UX'],
      avatar: null
    }
  };
  
  // Track auth state changes globally - keeping for when we re-enable
  useEffect(() => {
    console.log('Setting up auth state listener (currently bypassed)');
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed (bypassed):', event, session ? 'session exists' : 'no session');
    });
    
    return () => {
      console.log('Cleaning up auth state listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return <AuthContext.Provider value={bypassedAuth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
