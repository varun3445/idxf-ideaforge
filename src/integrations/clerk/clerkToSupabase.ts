
import { supabase } from '../supabase/client';
import type { User } from '../../types/auth.types';

export const updateSupabaseAuth = async (clerkUser: any | null): Promise<void> => {
  if (!clerkUser) {
    // Sign out from Supabase when Clerk user is null
    await supabase.auth.signOut();
    return;
  }
  
  try {
    // Get the JWT from Clerk
    const token = await clerkUser.getToken({ template: 'supabase' });
    
    if (!token) {
      console.error('No JWT token returned from Clerk');
      return;
    }
    
    // Authenticate with Supabase using the JWT
    const { error } = await supabase.auth.signInWithPassword({
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      password: token.substring(0, 20) // Using a part of the token as a virtual password
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
    }
  } catch (error) {
    console.error('Error syncing Clerk user with Supabase:', error);
  }
};

export const syncUserProfile = async (clerkUser: any): Promise<User | null> => {
  if (!clerkUser) return null;
  
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single();
    
    const userData = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      location: clerkUser.unsafeMetadata.location as string || '',
      skills: (clerkUser.unsafeMetadata.skills as string[] || []),
      avatar: clerkUser.imageUrl,
      plan: clerkUser.unsafeMetadata.plan as string || 'free'
    };
    
    if (!existingProfile) {
      // Create new profile
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          location: userData.location,
          avatar: userData.avatar
        });
      
      if (createError) console.error('Error creating profile:', createError);
      
      // Add user's skills
      if (userData.skills.length > 0) {
        for (const skill of userData.skills) {
          await addSkillToUser(userData.id, skill);
        }
      }
      
      // Create user plan
      const { error: planError } = await supabase
        .from('user_plans')
        .insert({
          user_id: userData.id,
          plan_type: userData.plan || 'free'
        });
      
      if (planError) console.error('Error creating user plan:', planError);
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: userData.email,
          name: userData.name,
          location: userData.location,
          avatar: userData.avatar
        })
        .eq('id', userData.id);
      
      if (updateError) console.error('Error updating profile:', updateError);
    }
    
    return userData;
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
};

const addSkillToUser = async (userId: string, skillName: string) => {
  try {
    // Check if skill exists
    let { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();
    
    let skillId;
    
    if (!existingSkill) {
      // Create skill
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
        return;
      }
      
      skillId = newSkill.id;
    } else {
      skillId = existingSkill.id;
    }
    
    // Associate skill with user
    const { error: skillAssocError } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_id: skillId
      });
    
    if (skillAssocError) {
      console.error(`Error adding skill ${skillName}:`, skillAssocError);
    }
  } catch (error) {
    console.error('Error in addSkillToUser:', error);
  }
};
