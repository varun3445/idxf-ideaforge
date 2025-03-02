import { useState, useEffect } from 'react';
import { AuthContextType, User } from '../types/auth.types';
import { supabase } from '../integrations/supabase/client';

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
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
            email: session.user.email || '',
            name: profile?.name || '',
            location: profile?.location || '',
            sex: profile?.sex || 'male',
            skills,
            avatar: profile?.avatar || null,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session error:', err);
        setError((err as Error).message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
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
            email: session.user.email || '',
            name: profile?.name || '',
            location: profile?.location || '',
            sex: profile?.sex || 'male',
            skills,
            avatar: profile?.avatar || null,
        });
      } else {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            location: '',
            sex: 'male',
          });
          
        if (profileError) {
          throw profileError;
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { };
    } catch (err) {
      console.error('Login error:', err);
      setError((err as Error).message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, password: string, location: string, skills: string[] = []) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            location,
            sex: 'male',
            avatar: null
          });
          
        if (profileError) {
          setError(profileError.message);
          return { error: profileError };
        }
        
        // Add skills
        for (const skill of skills) {
          // Check if skill exists
          let skillId;
          let { data: existingSkill } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skill)
            .single();
          
          if (!existingSkill) {
            // Create skill
            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const { data: newSkill, error: newSkillError } = await supabase
              .from('skills')
              .insert({
                name: skill,
                color: randomColor
              })
              .select('id')
              .single();
              
            if (newSkillError) {
              console.error(`Error creating skill ${skill}:`, newSkillError);
              continue;
            }
            
            skillId = newSkill.id;
          } else {
            skillId = existingSkill.id;
          }
          
          // Add user-skill association
          const { error: skillAssocError } = await supabase
            .from('user_skills')
            .insert({
              user_id: data.user.id,
              skill_id: skillId
            });
            
          if (skillAssocError) {
            console.error(`Error adding skill ${skill}:`, skillAssocError);
          }
        }
      }
      
      return { };
    } catch (err) {
      console.error('Signup error:', err);
      setError((err as Error).message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    user, 
    signUp, 
    signIn, 
    logout, 
    loading, 
    error, 
    isAuthenticated, 
    login, 
    signup 
  };
};
