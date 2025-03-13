
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { AuthContextType } from './types/auth.types';
import { updateSupabaseAuth, syncUserProfile } from './integrations/clerk/clerkToSupabase';
import { supabase } from './integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded: clerkLoaded, userId, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync Clerk user with Supabase
  useEffect(() => {
    if (!clerkLoaded || !userLoaded) return;

    const syncAuth = async () => {
      setLoading(true);
      try {
        if (clerkUser) {
          await updateSupabaseAuth(clerkUser);
          const userData = await syncUserProfile(clerkUser);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await updateSupabaseAuth(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setError("Failed to sync authentication");
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, [clerkLoaded, userLoaded, clerkUser, userId]);

  // Track Supabase auth state changes for debugging
  useEffect(() => {
    console.log('Setting up Supabase auth state listener');
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event, session ? 'session exists' : 'no session');
    });
    
    return () => {
      console.log('Cleaning up Supabase auth state listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Placeholder functions that will delegate to Clerk
  const signUp = async () => {
    setError("Please use Clerk UI components for signup");
  };

  const signIn = async () => {
    setError("Please use Clerk UI components for signin");
  };

  const login = async () => {
    return { error: new Error("Please use Clerk UI components for login") };
  };

  const signup = async () => {
    return { error: new Error("Please use Clerk UI components for signup") };
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (signOut) {
        await signOut();
      }
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        logout,
        isAuthenticated,
        login,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
