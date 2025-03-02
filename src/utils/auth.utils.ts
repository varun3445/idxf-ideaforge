
import { supabase } from '../integrations/supabase/client';

export const createUser = async (email: string, password?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password || Math.random().toString(36).slice(-8),
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    return { user: null, error };
  }
};

export const signInUser = async (email: string, password?: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password || Math.random().toString(36).slice(-8),
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing in user:', error.message);
    return { user: null, error };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out user:', error.message);
    return { error };
  }
};

export const createUserProfile = async (
  userId: string,
  name: string,
  location: string,
  skills: string[],
  avatar: string | null
) => {
  try {
    // Create user profile - Remove the skills property as it's not in the profiles table
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        location,
        email: '', // Adding this as it's required but will be updated later
        avatar
      });

    if (error) throw error;

    // Handle skills separately
    if (skills && skills.length > 0) {
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
            user_id: userId,
            skill_id: skillId
          });
          
        if (skillAssocError) {
          console.error(`Error adding skill ${skill}:`, skillAssocError);
        }
      }
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { error };
  }
};

export const updateUserProfile = async (
  userId: string,
  name: string,
  location: string,
  skills: string[]
) => {
  try {
    // Update user profile - Remove skills property as it's not in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        location,
      })
      .eq('id', userId);

    if (error) throw error;

    // Handle skills separately - first remove existing skills
    const { error: deleteError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing skills:', deleteError);
    }

    // Then add the new skills
    if (skills && skills.length > 0) {
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
            user_id: userId,
            skill_id: skillId
          });
          
        if (skillAssocError) {
          console.error(`Error adding skill ${skill}:`, skillAssocError);
        }
      }
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { profile: null, error };
  }
};

