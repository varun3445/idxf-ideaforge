
/**
 * Utility functions for project operations
 */

import { Project, ProjectCollaborator } from '../contexts/ProjectContext';

export const debugProjectStorage = () => {
  try {
    const projects = localStorage.getItem('userProjects');
    console.log('Current projects in localStorage:', projects ? JSON.parse(projects) : 'No projects found');
    
    const backingProjects = localStorage.getItem('backingProjects');
    console.log('Current backing projects in localStorage:', backingProjects ? JSON.parse(backingProjects) : 'No backing projects found');
    
    return true;
  } catch (error) {
    console.error('Error debugging project storage:', error);
    return false;
  }
};

export const createLocalProject = (title: string, description: string, ownerId: string): Project => {
  try {
    // Generate a unique project ID using crypto.randomUUID if available, otherwise use a fallback
    const projectId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    
    // Create the new project object that matches the Project interface
    const newProject: Project = {
      id: projectId,
      title,
      description,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: false,
      share_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      current_step_id: null,
      collaborators: [], // Empty array of ProjectCollaborator
      backersCount: 0, // Using backersCount instead of backers_count to match the interface
      // Optional fields with proper types as defined in the Project interface
      skills: [],
      goals: "",
      challenges: "",
      overview: "",
      imageUrl: "https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop"
    };
    
    // Get existing projects
    const existingProjectsJSON = localStorage.getItem('userProjects');
    const existingProjects: Project[] = existingProjectsJSON ? JSON.parse(existingProjectsJSON) : [];
    
    // Add the new project
    const updatedProjects = [...existingProjects, newProject];
    
    // Save back to localStorage
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
    // Initialize empty collections for the project
    localStorage.setItem(`projectSteps-${newProject.id}`, JSON.stringify([]));
    localStorage.setItem(`projectCollaborators-${newProject.id}`, JSON.stringify([]));
    
    console.log(`Project "${title}" created successfully:`, newProject);
    console.log('Updated projects list:', updatedProjects);
    
    return newProject;
  } catch (error) {
    console.error('Error creating local project:', error);
    throw error;
  }
};
