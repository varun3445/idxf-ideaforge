
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User } from '../types/auth.types';
import { fetchUserProfile, createUserSkill } from '../utils/auth.utils';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setLoading(true);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    }
  };
  
  const signup = async (name: string, email: string, password: string, location: string, skills: string[]) => {
    try {
      console.log("Starting signup process", { name, email, location });
      
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError };
      }
      
      if (authData.user) {
        console.log("User created successfully with ID:", authData.user.id);
        
        // After successful signup, we need to insert the profile using the authenticated user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name,
            email,
            location,
            sex: 'male'
          });
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Attempt to delete the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          return { error: profileError };
        }
        
        console.log("Profile created successfully");
        
        // Insert user skills
        for (const skillName of skills) {
          await createUserSkill(authData.user.id, skillName);
        }
        
        // Navigate to explore page after successful signup
        navigate('/explore');
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  };
}
