
import { supabase } from '../integrations/supabase/client';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  overview?: string;
  goals?: string;
  challenges?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_published: boolean;
  share_code: string;
  backers_count: number;
  current_step_id?: string | null;
}

export const createProjectWithSkills = async (
  title: string, 
  description: string, 
  skills: string[] = []
): Promise<ProjectData | null> => {
  try {
    // First create the project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([
        { 
          title, 
          description,
          owner_id: 'user-1', // Using default user for now
          is_published: false,
          skills
        }
      ])
      .select()
      .single();
    
    if (projectError) {
      throw projectError;
    }
    
    if (!projectData) {
      throw new Error('No project data returned after creation');
    }
    
    return projectData;
  } catch (error) {
    console.error('Error in createProjectWithSkills:', error);
    return null;
  }
};

export const publishProjectWithDetails = async (
  projectId: string,
  details: {
    overview: string;
    goals?: string;
    challenges?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        ...details,
        is_published: true
      })
      .eq('id', projectId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error publishing project with details:', error);
    return false;
  }
};

// Add more project-related service functions as needed
