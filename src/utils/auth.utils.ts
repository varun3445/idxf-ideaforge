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
    // Create user profile
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        location,
        skills,
        avatar
      });

    if (error) throw error;
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
    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        location,
        skills,
      })
      .eq('id', userId);

    if (error) throw error;
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
