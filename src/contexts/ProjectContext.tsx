import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';

export interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  created_at: string;
  share_code: string;
  is_published: boolean;
  current_step_id: string | null;
  backers_count: number;
  // Add the new fields
  overview?: string;
  goals?: string;
  challenges?: string;
  skills?: string[];
}

export interface ProjectStep {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: boolean;
  parent_step_id: string | null;
  created_at: string; // Adding the missing created_at property
}

// Add missing type definitions
export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface StepAssignment {
  id: string;
  step_id: string;
  user_id: string;
  assigned_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string;
  type: 'collaboration_invitation' | 'step_assignment' | 'project_update';
  read: boolean;
  created_at: string;
  data: any;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  projectSteps: ProjectStep[];
  currentStep: ProjectStep | null;
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  createProject: (title: string, description: string, skills?: string[]) => Promise<Project | null>;
  updateProject: (project: Partial<Project>) => Promise<void>;
  publishProject: (projectId: string, isPublished: boolean) => Promise<boolean>;
  addProjectStep: (
    title: string,
    description: string,
    parentStepId: string | null,
  ) => Promise<void>;
  updateProjectStep: (step: Partial<ProjectStep>) => Promise<void>;
  deleteProjectStep: (stepId: string) => Promise<void>;
  setCurrentStep: (step: ProjectStep | null) => void;
  // Add missing properties in ProjectContextType
  collaborators: ProjectCollaborator[];
  stepAssignments: StepAssignment[];
  notifications: Notification[];
  addCollaborator: (email: string) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  createStep: (step: { title: string; description?: string; parent_step_id?: string | null; order_index: number }) => Promise<boolean>;
  deleteStep: (stepId: string) => Promise<boolean>;
  completeStep: (stepId: string, isCompleted: boolean) => Promise<boolean>;
  assignStep: (stepId: string, userId: string) => Promise<void>;
  unassignStep: (assignmentId: string) => Promise<void>;
  respondToCollaboration: (collaborationId: string, accept: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const mockCurrentUserId = 'user-1';

const generateMockShareCode = () => {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const supabaseEnabled = !!supabase;

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      if (supabaseEnabled) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data || []);
      } else {
        // Mock implementation for when Supabase is not available
        const mockProjects: Project[] = [
          {
            id: '1',
            title: 'Mock Project 1',
            description: 'This is a mock project for testing purposes.',
            owner_id: mockCurrentUserId,
            created_at: new Date().toISOString(),
            share_code: generateMockShareCode(),
            is_published: false,
            current_step_id: null,
            backers_count: 5,
          },
          {
            id: '2',
            title: 'Mock Project 2',
            description: 'Another mock project for testing the UI.',
            owner_id: mockCurrentUserId,
            created_at: new Date().toISOString(),
            share_code: generateMockShareCode(),
            is_published: true,
            current_step_id: null,
            backers_count: 10,
          },
        ];
        setProjects(mockProjects);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (supabaseEnabled) {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) {
          throw projectError;
        }

        setCurrentProject(projectData);

        // Fetch project steps
        const { data: stepsData, error: stepsError } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true });

        if (stepsError) {
          throw stepsError;
        }

        setProjectSteps(stepsData || []);
        if (projectData?.current_step_id) {
          const currentStep = stepsData?.find(
            (step: ProjectStep) => step.id === projectData.current_step_id,
          );
          setCurrentStep(currentStep || null);
        } else {
          setCurrentStep(null);
        }
      } else {
        // Mock implementation for when Supabase is not available
        const mockProject = projects.find((p) => p.id === projectId);
        if (mockProject) {
          setCurrentProject(mockProject);
          const mockSteps: ProjectStep[] = [
            {
              id: 'step-1',
              project_id: projectId,
              title: 'Define Requirements',
              description: 'Gather and document project requirements.',
              order_index: 1,
              is_completed: false,
              parent_step_id: null,
              created_at: new Date().toISOString()
            },
            {
              id: 'step-2',
              project_id: projectId,
              title: 'Design UI',
              description: 'Create the user interface design.',
              order_index: 2,
              is_completed: false,
              parent_step_id: null,
              created_at: new Date().toISOString()
            },
          ];
          setProjectSteps(mockSteps);
          setCurrentStep(mockSteps[0]);
        } else {
          throw new Error('Project not found');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  // Update createProject to include skills
  const createProject = async (title: string, description: string, skills: string[] = []) => {
    try {
      const newProject = {
        title,
        description,
        owner_id: user?.id || mockCurrentUserId,
        skills
      };
      
      console.log("Creating project with data:", newProject);
      
      if (supabaseEnabled) {
        const { data, error } = await supabase
          .from('projects')
          .insert(newProject)
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        // Refresh the projects list
        loadProjects();
        return data;
      } else {
        // Mock implementation for when Supabase is not available
        const mockProject: Project = {
          id: `proj-${Date.now()}`,
          title,
          description,
          owner_id: mockCurrentUserId,
          created_at: new Date().toISOString(),
          share_code: generateMockShareCode(),
          is_published: false,
          current_step_id: null,
          backers_count: 0,
          skills
        };
        
        setProjects([...projects, mockProject]);
        return mockProject;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (project: Partial<Project>) => {
    try {
      if (!project.id) {
        throw new Error('Project ID is required to update a project');
      }

      if (supabaseEnabled) {
        const { error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', project.id);

        if (error) {
          throw error;
        }
      }

      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === project.id ? { ...p, ...project } : p)),
      );
      if (currentProject && currentProject.id === project.id) {
        setCurrentProject({ ...currentProject, ...project });
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      setError(error.message || 'Failed to update project');
    }
  };

  // Update the publishProject function to handle both publish and unpublish cases
  const publishProject = async (projectId: string, isPublished: boolean) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('projects')
          .update({ is_published: isPublished })
          .eq('id', projectId);
          
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      setProjects(prevProjects => prevProjects.map(p => 
        p.id === projectId ? { ...p, is_published: isPublished } : p
      ));
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({ ...currentProject, is_published: isPublished });
      }
      
      return true;
    } catch (error) {
      console.error('Error publishing project:', error);
      throw error;
    }
  };

  const addProjectStep = async (
    title: string,
    description: string,
    parentStepId: string | null,
  ) => {
    if (!currentProject) {
      console.error('No project is currently loaded.');
      return;
    }

    try {
      const newStep: Omit<ProjectStep, 'id'> = {
        project_id: currentProject.id,
        title,
        description,
        order_index: projectSteps.length + 1,
        is_completed: false,
        parent_step_id: parentStepId,
        created_at: new Date().toISOString(), // Adding the missing created_at property
      };

      if (supabaseEnabled) {
        const { data, error } = await supabase
          .from('project_steps')
          .insert(newStep)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProjectSteps([...projectSteps, data]);
      } else {
        // Mock implementation for when Supabase is not available
        const mockStep: ProjectStep = {
          id: uuidv4(),
          ...newStep,
        } as ProjectStep;
        setProjectSteps([...projectSteps, mockStep]);
      }
    } catch (error) {
      console.error('Error adding project step:', error);
      setError('Failed to add project step');
    }
  };

  const updateProjectStep = async (step: Partial<ProjectStep>) => {
    if (!step.id) {
      console.error('Step ID is required to update a step.');
      return;
    }

    try {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('project_steps')
          .update(step)
          .eq('id', step.id);

        if (error) {
          throw error;
        }
      }

      // Update local state
      setProjectSteps((prevSteps) =>
        prevSteps.map((s) => (s.id === step.id ? { ...s, ...step } : s)),
      );
    } catch (error) {
      console.error('Error updating project step:', error);
      setError('Failed to update project step');
    }
  };

  const deleteProjectStep = async (stepId: string) => {
    try {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('project_steps')
          .delete()
          .eq('id', stepId);

        if (error) {
          throw error;
        }
      }

      // Also remove any substeps
      const substeps = projectSteps.filter(s => s.parent_step_id === stepId);
      for (const substep of substeps) {
        await deleteStep(substep.id);
      }

      // Update local state
      setProjectSteps((prevSteps) => prevSteps.filter((s) => s.id !== stepId));
    } catch (error) {
      console.error('Error deleting project step:', error);
      setError('Failed to delete project step');
    }
  };

  // Implement the missing functions

  const createStep = async (step: { 
    title: string; 
    description?: string; 
    parent_step_id?: string | null; 
    order_index: number 
  }) => {
    if (!currentProject) {
      console.error('No project is currently loaded.');
      return false;
    }

    try {
      const newStep: Omit<ProjectStep, 'id'> = {
        project_id: currentProject.id,
        title: step.title,
        description: step.description || '',
        order_index: step.order_index,
        parent_step_id: step.parent_step_id || null,
        is_completed: false,
        created_at: new Date().toISOString(), // Adding the missing created_at property
      };

      if (supabaseEnabled) {
        const { data, error } = await supabase
          .from('project_steps')
          .insert(newStep)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProjectSteps([...projectSteps, data]);
        return true;
      } else {
        // Mock implementation for when Supabase is not available
        const mockStep: ProjectStep = {
          id: uuidv4(),
          ...newStep,
        };
        setProjectSteps([...projectSteps, mockStep]);
        return true;
      }
    } catch (error) {
      console.error('Error adding project step:', error);
      setError('Failed to add project step');
      return false;
    }
  };

  const deleteStep = async (stepId: string) => {
    try {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('project_steps')
          .delete()
          .eq('id', stepId);

        if (error) {
          throw error;
        }
      }

      // Also remove any substeps
      const substeps = projectSteps.filter(s => s.parent_step_id === stepId);
      for (const substep of substeps) {
        await deleteStep(substep.id);
      }

      // Update local state
      setProjectSteps((prevSteps) => prevSteps.filter((s) => s.id !== stepId));
      return true;
    } catch (error) {
      console.error('Error deleting project step:', error);
      setError('Failed to delete project step');
      return false;
    }
  };

  const completeStep = async (stepId: string, isCompleted: boolean) => {
    try {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('project_steps')
          .update({ is_completed: isCompleted })
          .eq('id', stepId);

        if (error) {
          throw error;
        }
      }

      // Update local state
      setProjectSteps((prevSteps) =>
        prevSteps.map((s) => (s.id === stepId ? { ...s, is_completed: isCompleted } : s))
      );
      return true;
    } catch (error) {
      console.error('Error completing project step:', error);
      setError('Failed to complete project step');
      return false;
    }
  };

  const addCollaborator = async (email: string) => {
    if (!currentProject) {
      console.error('No project is currently loaded.');
      return;
    }

    try {
      // In a real app, you would:
      // 1. Check if user exists
      // 2. Add to collaborators table
      // 3. Send invitation notification

      // Mock implementation
      const newCollaborator: ProjectCollaborator = {
        id: uuidv4(),
        project_id: currentProject.id,
        user_id: `user-${Date.now()}`,
        status: 'pending',
        user: {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email: email
        }
      };

      setCollaborators([...collaborators, newCollaborator]);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      setError('Failed to add collaborator');
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      // In a real app, you would delete from the database

      // Mock implementation
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError('Failed to remove collaborator');
    }
  };

  const assignStep = async (stepId: string, userId: string) => {
    try {
      // In a real app, you would add to assignments table

      // Mock implementation
      const newAssignment: StepAssignment = {
        id: uuidv4(),
        step_id: stepId,
        user_id: userId,
        assigned_at: new Date().toISOString(),
        user: collaborators.find(c => c.user_id === userId)?.user
      };

      setStepAssignments([...stepAssignments, newAssignment]);
    } catch (error) {
      console.error('Error assigning step:', error);
      setError('Failed to assign step');
    }
  };

  const unassignStep = async (assignmentId: string) => {
    try {
      // In a real app, you would delete from assignments table

      // Mock implementation
      setStepAssignments(stepAssignments.filter(a => a.id !== assignmentId));
    } catch (error) {
      console.error('Error unassigning step:', error);
      setError('Failed to unassign step');
    }
  };

  const respondToCollaboration = async (collaborationId: string, accept: boolean) => {
    try {
      // In a real app, you would update collaboration status in database

      // Mock implementation
      setCollaborators(collaborators.map(c => 
        c.id === collaborationId 
          ? { ...c, status: accept ? 'accepted' : 'rejected' } 
          : c
      ));

      // Mark related notifications as read
      setNotifications(notifications.map(n => 
        (n.type === 'collaboration_invitation' && n.data?.collaboration_id === collaborationId)
          ? { ...n, read: true }
          : n
      ));
    } catch (error) {
      console.error('Error responding to collaboration:', error);
      setError('Failed to respond to collaboration');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // In a real app, you would update notification in database

      // Mock implementation
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    projectSteps,
    currentStep,
    loading,
    error,
    loadProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    publishProject,
    addProjectStep,
    updateProjectStep,
    deleteProjectStep,
    setCurrentStep,
    // Add the missing functions and state to the context value
    collaborators,
    stepAssignments,
    notifications,
    addCollaborator,
    removeCollaborator,
    createStep,
    deleteStep,
    completeStep,
    assignStep,
    unassignStep,
    respondToCollaboration,
    markNotificationAsRead
  };
  
  return (
    <ProjectContext.Provider
      value={value}
    >
      {children}
    </ProjectContext.Provider>
  );
};
