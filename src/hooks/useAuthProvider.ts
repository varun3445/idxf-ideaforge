
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, AuthContextType } from '../types/auth.types';

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('skills(name, color)')
        .eq('user_id', userId);

      if (skillsError) throw skillsError;

      const skills = skillsData.map(item => item.skills.name);

      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        location: profileData.location,
        skills,
        avatar: profileData.avatar,
      };

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setError('Failed to fetch user data');
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserData]);

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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('skills(name)')
          .eq('user_id', data.user.id);
          
        if (skillsError) {
          console.error('Error fetching skills:', skillsError);
        }
        
        const skills = skillsData?.map(item => item.skills.name) || [];
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || '',
          location: profile?.location || '',
          skills,
          avatar: profile?.avatar || null,
        });
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

  const signup = async (name: string, email: string, password: string, location: string, skills: string[] = [], avatar: string | null = null) => {
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            location,
            avatar
          });
          
        if (profileError) {
          setError(profileError.message);
          return { error: profileError };
        }
        
        for (const skill of skills) {
          let skillId;
          let { data: existingSkill } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skill)
            .single();
          
          if (!existingSkill) {
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
    loading,
    error,
    signUp,
    signIn,
    logout,
    isAuthenticated,
    login,
    signup
  };
};
