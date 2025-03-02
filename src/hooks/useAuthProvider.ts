import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User } from '../types/auth.types';
import { fetchUserProfile, createUserSkill } from '../utils/auth.utils';

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use useCallback to memoize these functions and prevent unnecessary recreations
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Trying to login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return { error };
      }
      
      console.log('Login successful, user data:', data);
      
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          navigate('/explore');
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  const signup = useCallback(async (name: string, email: string, password: string, location: string, skills: string[]) => {
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
          } as any);
          
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
  }, [navigate]);
  
  const logout = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    navigate('/');
  }, [navigate]);
  
  useEffect(() => {
    // Check the current session when the component mounts
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('Found existing session for user:', session.user.id);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
          try {
            console.log('User signed in:', session.user.id);
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
              navigate('/explore');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setLoading(false);
          navigate('/');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  return {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  };
}
