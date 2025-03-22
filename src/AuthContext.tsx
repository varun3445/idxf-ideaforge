
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { AuthContextType } from './types/auth.types';
import { useAuthProvider } from './hooks/useAuthProvider';
import { supabase } from './integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthProvider();
  
  // Track auth state changes globally
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
    });
    
    return () => {
      console.log('Cleaning up auth state listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
