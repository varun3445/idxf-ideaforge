
/**
 * Utility functions for project operations
 */

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

export const createLocalProject = (title: string, description: string, ownerId: string) => {
  try {
    // Generate a unique project ID (normally this would come from the server)
    const projectId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    
    // Create the new project object
    const newProject = {
      id: projectId,
      title,
      description,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: false,
      share_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      current_step_id: null,
      backers_count: 0
    };
    
    // Get existing projects
    const existingProjectsJSON = localStorage.getItem('userProjects');
    const existingProjects = existingProjectsJSON ? JSON.parse(existingProjectsJSON) : [];
    
    // Add the new project
    const updatedProjects = [...existingProjects, newProject];
    
    // Save back to localStorage
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
    console.log(`Project "${title}" created successfully:`, newProject);
    console.log('Updated projects list:', updatedProjects);
    
    return newProject;
  } catch (error) {
    console.error('Error creating local project:', error);
    throw error;
  }
};
