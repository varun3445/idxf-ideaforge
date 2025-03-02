
import { supabase } from '../integrations/supabase/client';
import { User } from '../types/auth.types';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log(`Fetching profile for user ${userId}`);
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, location, sex')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }
    
    console.log('Profile data retrieved:', profileData);
    
    // Get user skills
    const { data: skillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select('skills(name)')
      .eq('user_id', userId);
      
    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }
    
    const skills = skillsData?.map(item => item.skills.name) || [];
    console.log(`Retrieved ${skills.length} skills for user`);
    
    return {
      id: userId,
      name: profileData.name,
      email: profileData.email,
      location: profileData.location,
      sex: profileData.sex || 'male',
      skills: skills
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}

export async function createUserSkill(userId: string, skillName: string): Promise<boolean> {
  try {
    console.log(`Creating skill "${skillName}" for user ${userId}`);
    // First check if the skill exists
    const { data: existingSkill, error: skillFetchError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();
    
    if (skillFetchError && skillFetchError.code !== 'PGRST116') {
      console.error(`Error checking skill ${skillName}:`, skillFetchError);
      return false;
    }
    
    let skillId;
    if (existingSkill) {
      skillId = existingSkill.id;
      console.log(`Skill "${skillName}" already exists with ID ${skillId}`);
    } else {
      // If the skill doesn't exist, we need to create it with a default color
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
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
        return false;
      }
      
      skillId = newSkill.id;
      console.log(`Created new skill "${skillName}" with ID ${skillId}`);
    }
    
    // Check if this user-skill association already exists
    const { data: existingUserSkill, error: checkUserSkillError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .maybeSingle();
      
    if (checkUserSkillError) {
      console.error(`Error checking if user skill already exists:`, checkUserSkillError);
    }
    
    if (existingUserSkill) {
      console.log(`User already has skill "${skillName}"`);
      return true;
    }
    
    // Now insert the user-skill association
    const { error: userSkillError } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_id: skillId,
      });
      
    if (userSkillError) {
      console.error(`Error adding skill ${skillName}:`, userSkillError);
      return false;
    }
    
    console.log(`Successfully added skill "${skillName}" to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in createUserSkill:', error);
    return false;
  }
}
