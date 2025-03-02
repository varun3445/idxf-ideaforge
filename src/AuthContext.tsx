
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  sex: string; // Add sex field to interface
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
            .select('name, email, location, sex')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
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
            sex: profileData.sex || 'male', // Set default if missing
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
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setLoading(true);
          // Get user profile after sign-in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, email, location, sex')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
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
            sex: profileData.sex || 'male', // Set default if missing
            skills: skills
          });
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
      console.log('Login attempt for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        // Navigation is handled by auth state change listener
        console.log('Login successful, auth state change should trigger');
      } else {
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
          // First check if the skill exists
          const { data: existingSkill, error: skillFetchError } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skillName)
            .single();
          
          if (skillFetchError && skillFetchError.code !== 'PGRST116') {
            console.error(`Error checking skill ${skillName}:`, skillFetchError);
            continue;
          }
          
          let skillId;
          if (existingSkill) {
            skillId = existingSkill.id;
          } else {
            // If the skill doesn't exist, we need to create it with a default color
            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            const { data: newSkill, error: newSkillError } = await supabase
              .from('skills')
              .insert({
                name: skillName,
                color: randomColor
              })
              .select('id')
              .single();
              
            if (newSkillError) {
              console.error(`Error creating skill ${skillName}:`, newSkillError);
              continue;
            }
            
            skillId = newSkill.id;
          }
          
          // Now insert the user-skill association
          const { error: userSkillError } = await supabase
            .from('user_skills')
            .insert({
              user_id: authData.user.id,
              skill_id: skillId,
            });
            
          if (userSkillError) {
            console.error(`Error adding skill ${skillName}:`, userSkillError);
          }
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
