
import { useState, useEffect } from "react";
import { User } from "../types/auth.types";
import { supabase } from "../integrations/supabase/client";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          if (profileData) {
            // Fetch user skills
            const { data: userSkills, error: skillsError } = await supabase
              .from('user_skills')
              .select('skills(name)')
              .eq('user_id', session.user.id);
              
            if (skillsError) {
              console.error('Error fetching user skills:', skillsError);
            }
            
            const skills = userSkills?.map(item => item.skills.name) || [];
            
            const userData: User = {
              id: profileData.id,
              email: profileData.email,
              name: profileData.name,
              location: profileData.location,
              skills,
              avatar: profileData.avatar
            };
            
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.error('Auth provider error:', err);
        setError(err.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile on auth change:', profileError);
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          if (profileData) {
            // Fetch user skills
            const { data: userSkills, error: skillsError } = await supabase
              .from('user_skills')
              .select('skills(name)')
              .eq('user_id', session.user.id);
              
            if (skillsError) {
              console.error('Error fetching user skills on auth change:', skillsError);
            }
            
            const skills = userSkills?.map(item => item.skills.name) || [];
            
            const userData: User = {
              id: profileData.id,
              email: profileData.email,
              name: profileData.name,
              location: profileData.location,
              skills,
              avatar: profileData.avatar
            };
            
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        return { error: null };
      }
      
      return { error: new Error('Login failed') };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error };
    }
  };

  // This is an alias for login to maintain compatibility
  const signIn = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error('SignIn error:', error);
      setError(error.message);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    location: string, 
    skills: string[] = [],
    avatar: string | null = null
  ) => {
    try {
      // 1. Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }
      
      // 2. Create the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name,
          email,
          location,
          avatar
        });
        
      if (profileError) throw profileError;
      
      // 3. Add user skills if provided
      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          // Find or create the skill
          let skillId;
          
          // Check if skill exists
          const { data: existingSkill } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skillName)
            .single();
            
          if (existingSkill) {
            skillId = existingSkill.id;
          } else {
            // Create new skill with random color
            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const { data: newSkill, error: skillError } = await supabase
              .from('skills')
              .insert({
                name: skillName,
                color: randomColor
              })
              .select('id')
              .single();
              
            if (skillError) {
              console.error(`Error creating skill ${skillName}:`, skillError);
              continue;
            }
            
            skillId = newSkill.id;
          }
          
          // Associate skill with user
          const { error: userSkillError } = await supabase
            .from('user_skills')
            .insert({
              user_id: data.user.id,
              skill_id: skillId
            });
            
          if (userSkillError) {
            console.error(`Error associating skill ${skillName} with user:`, userSkillError);
          }
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  // This is an alias for signup to maintain compatibility
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signup(name, email, password, "");
      if (result.error) throw result.error;
    } catch (error: any) {
      console.error('SignUp error:', error);
      setError(error.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  return {
    user,
    setUser,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    signIn,  // Add the alias
    signUp,  // Add the alias
  };
};
