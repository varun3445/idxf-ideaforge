
import { supabase } from "../integrations/supabase/client";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  sex: string;
  skills: string[];
}

export const fetchProfiles = async (): Promise<ProfileData[]> => {
  try {
    // Fetch all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return [];
    }

    // For each profile, fetch their skills
    const profilesWithSkills = await Promise.all(
      profiles.map(async (profile) => {
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('skills(name)')
          .eq('user_id', profile.id);

        if (skillsError) {
          console.error(`Error fetching skills for profile ${profile.id}:`, skillsError);
          return {
            ...profile,
            sex: profile.sex || 'male', // Ensure sex field has a default value
            skills: []
          };
        }

        const skills = skillsData?.map(item => item.skills.name) || [];

        return {
          ...profile,
          sex: profile.sex || 'male', // Ensure sex field has a default value
          skills
        };
      })
    );

    return profilesWithSkills;
  } catch (error) {
    console.error('Error in fetchProfiles:', error);
    return [];
  }
};
