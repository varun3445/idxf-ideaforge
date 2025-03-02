
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (name: string, email: string, password: string, location: string, skills: string[]) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, email, location')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }
          
          // Get user skills
          const { data: skillsData, error: skillsError } = await supabase
            .from('user_skills')
            .select('skills(name)')
            .eq('user_id', session.user.id);
            
          if (skillsError) {
            console.error('Error fetching skills:', skillsError);
          }
          
          const skills = skillsData?.map(item => item.skills.name) || [];
          
          setUser({
            id: session.user.id,
            name: profileData.name,
            email: profileData.email,
            location: profileData.location,
            skills: skills
          });
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
        if (event === 'SIGNED_IN' && session) {
          // Get user profile after sign-in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, email, location')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }
          
          // Get user skills
          const { data: skillsData, error: skillsError } = await supabase
            .from('user_skills')
            .select('skills(name)')
            .eq('user_id', session.user.id);
            
          if (skillsError) {
            console.error('Error fetching skills:', skillsError);
          }
          
          const skills = skillsData?.map(item => item.skills.name) || [];
          
          setUser({
            id: session.user.id,
            name: profileData.name,
            email: profileData.email,
            location: profileData.location,
            skills: skills
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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
      
      if (!error) {
        navigate('/explore');
      }
      
      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    }
  };
  
  const signup = async (name: string, email: string, password: string, location: string, skills: string[]) => {
    try {
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        return { error: authError };
      }
      
      if (authData.user) {
        // Insert user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name,
            email,
            location,
          });
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
        
        // Insert user skills
        for (const skillName of skills) {
          // Get skill ID
          const { data: skillData } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skillName)
            .single();
            
          if (skillData) {
            // Insert user-skill association
            const { error: skillError } = await supabase
              .from('user_skills')
              .insert({
                user_id: authData.user.id,
                skill_id: skillData.id,
              });
              
            if (skillError) {
              console.error(`Error adding skill ${skillName}:`, skillError);
            }
          }
        }
        
        // Navigate to explore page
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
  
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
