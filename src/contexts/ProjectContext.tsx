import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { ProjectData } from '../services/projectService';

export interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  owner_id: string;
  is_published: boolean;
  share_code: string;
  current_step_id: string | null;
  backers_count: number;
  overview?: string;
  goals?: string;
  challenges?: string;
  skills?: string[];
}

export interface ProjectStep {
  id: string;
  created_at: string;
  project_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  order_index: number;
  parent_step_id: string | null;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
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
  currentProject: Project | null;
  projects: Project[];
  projectSteps: ProjectStep[];
  currentStep: ProjectStep | null;
  collaborators: ProjectCollaborator[];
  stepAssignments: StepAssignment[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  
  // Loading and fetch methods
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  
  // Project methods
  createProject: (title: string, description: string, skills?: string[]) => Promise<Project | null>;
  updateProject: (project: Partial<Project>) => Promise<void>;
  publishProject: (projectId: string, isPublished: boolean) => Promise<void>;
  
  // Project step methods
  createStep: (stepData: { title: string; description?: string; parent_step_id?: string | null; order_index: number }) => Promise<boolean>;
  createProjectStep: (step: Omit<ProjectStep, 'id' | 'created_at'>) => Promise<void>;
  updateProjectStep: (step: Partial<ProjectStep> & { id: string }) => Promise<void>;
  deleteStep: (stepId: string) => Promise<boolean>;
  deleteProjectStep: (stepId: string) => Promise<void>;
  completeStep: (stepId: string, isCompleted: boolean) => Promise<boolean>;
  reorderProjectSteps: (steps: ProjectStep[]) => Promise<void>;
  
  // Collaborator methods
  addCollaborator: (email: string) => Promise<boolean>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  
  // Assignment methods
  assignStep: (stepId: string, userId: string) => Promise<void>;
  unassignStep: (assignmentId: string) => Promise<void>;
  
  // Notification methods
  respondToCollaboration: (collaborationId: string, accept: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // State methods
  setCurrentStep: (step: ProjectStep | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      setProjects(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProjectDetails = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      // Fetch project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw new Error(projectError.message);
      }

      setCurrentProject(project as Project);

      // Fetch project steps
      const { data: steps, error: stepsError } = await supabase
        .from('project_steps')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (stepsError) {
        throw new Error(stepsError.message);
      }

      setProjectSteps(steps || []);

      // Set current step
      if (project?.current_step_id) {
        const current = steps?.find(step => step.id === project.current_step_id) || null;
        setCurrentStep(current);
      } else {
        setCurrentStep(null);
      }
      
      // Load collaborators (mock data for now)
      setCollaborators([]);
      
      // Load step assignments (mock data for now)
      setStepAssignments([]);
      
      // Load notifications (mock data for now)
      setNotifications([]);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (title: string, description: string, skills?: string[]) => {
    setLoading(true);
    try {
      const shareCode = uuidv4();
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title,
          description,
          owner_id: 'user-1', // Replace with actual user ID later
          is_published: false,
          share_code: shareCode,
          backers_count: 0,
          skills: skills || []
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      // Add the new project to the projects array
      setProjects(prev => [data as Project, ...prev]);

      return data as Project;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (project: Partial<Project>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', project.id);

      if (error) {
        throw new Error(error.message);
      }

      setCurrentProject(prev => prev ? { ...prev, ...project } : null);
      
      // Update in projects array too
      setProjects(prev => 
        prev.map(p => p.id === project.id ? { ...p, ...project } : p)
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStep = useCallback(async (stepData: {
    title: string;
    description?: string;
    parent_step_id?: string | null;
    order_index: number;
  }): Promise<boolean> => {
    if (!currentProject) return false;
    
    try {
      const newStep = {
        project_id: currentProject.id,
        title: stepData.title,
        description: stepData.description || '',
        parent_step_id: stepData.parent_step_id || null,
        order_index: stepData.order_index,
        is_completed: false
      };
      
      const { data, error } = await supabase
        .from('project_steps')
        .insert([newStep])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setProjectSteps(prev => [...prev, data as ProjectStep]);
      return true;
    } catch (error) {
      console.error('Error creating step:', error);
      return false;
    }
  }, [currentProject]);

  const createProjectStep = useCallback(async (step: Omit<ProjectStep, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_steps')
        .insert([{ ...step, is_completed: false }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProjectSteps(prev => [...prev, data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectStep = useCallback(async (step: Partial<ProjectStep> & { id: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_steps')
        .update(step)
        .eq('id', step.id);

      if (error) {
        throw new Error(error.message);
      }

      setProjectSteps(prev =>
        prev.map(s => (s.id === step.id ? { ...s, ...step } : s))
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStep = useCallback(async (stepId: string) => {
    try {
      // Find all child steps recursively
      const findAllChildSteps = (parentId: string): string[] => {
        const childSteps = projectSteps.filter(s => s.parent_step_id === parentId);
        const childIds = childSteps.map(s => s.id);
        
        // Recursively find grandchildren
        const grandChildIds = childIds.flatMap(childId => findAllChildSteps(childId));
        
        return [...childIds, ...grandChildIds];
      };
      
      const childStepIds = findAllChildSteps(stepId);
      const allStepIds = [stepId, ...childStepIds];
      
      // Delete all steps in one operation
      const { error } = await supabase
        .from('project_steps')
        .delete()
        .in('id', allStepIds);
        
      if (error) {
        throw error;
      }
      
      // Update state
      setProjectSteps(prev => prev.filter(s => !allStepIds.includes(s.id)));
      
      return true;
    } catch (error) {
      console.error('Error deleting step:', error);
      return false;
    }
  }, [projectSteps]);

  const deleteProjectStep = useCallback(async (stepId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        throw new Error(error.message);
      }

      setProjectSteps(prev => prev.filter(s => s.id !== stepId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const completeStep = useCallback(async (stepId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('project_steps')
        .update({ is_completed: isCompleted })
        .eq('id', stepId);
        
      if (error) {
        throw error;
      }
      
      // Update state
      setProjectSteps(prev => 
        prev.map(step => step.id === stepId ? { ...step, is_completed: isCompleted } : step)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating step completion:', error);
      return false;
    }
  }, []);

  const reorderProjectSteps = useCallback(async (steps: ProjectStep[]) => {
    setLoading(true);
    try {
      // Optimistically update the local state
      setProjectSteps(steps);
  
      // Prepare updates for Supabase
      const updates = steps.map(step => ({
        id: step.id,
        order_index: step.order_index,
        project_id: step.project_id,
        title: step.title
      }));
  
      // Execute batch update in Supabase
      const { error } = await supabase.from('project_steps').upsert(updates);
  
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      setError(error.message);
      // If there's an error, revert to the previous state
      // loadProjectDetails(currentProject?.id || '');
    } finally {
      setLoading(false);
    }
  }, []);

  const publishProject = useCallback(async (projectId: string, isPublished: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_published: isPublished })
        .eq('id', projectId);

      if (error) {
        throw new Error(error.message);
      }

      setCurrentProject(prev => prev ? { ...prev, is_published: isPublished } : null);
      
      // Update in projects array too
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, is_published: isPublished } : p)
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Mock implementations for collaborator methods
  const addCollaborator = useCallback(async (email: string): Promise<boolean> => {
    console.log('Adding collaborator with email:', email);
    // Mock implementation - would integrate with Supabase
    return true;
  }, []);
  
  const removeCollaborator = useCallback(async (collaboratorId: string): Promise<void> => {
    console.log('Removing collaborator with ID:', collaboratorId);
    // Mock implementation - would integrate with Supabase
  }, []);
  
  // Mock implementations for step assignment methods
  const assignStep = useCallback(async (stepId: string, userId: string): Promise<void> => {
    console.log('Assigning step', stepId, 'to user', userId);
    // Mock implementation - would integrate with Supabase
  }, []);
  
  const unassignStep = useCallback(async (assignmentId: string): Promise<void> => {
    console.log('Removing assignment with ID:', assignmentId);
    // Mock implementation - would integrate with Supabase
  }, []);
  
  // Mock implementations for notification methods
  const respondToCollaboration = useCallback(async (collaborationId: string, accept: boolean): Promise<void> => {
    console.log('Responding to collaboration', collaborationId, 'with', accept ? 'accept' : 'reject');
    // Mock implementation - would integrate with Supabase
  }, []);
  
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    console.log('Marking notification as read:', notificationId);
    // Mock implementation - would integrate with Supabase
  }, []);

  // Load projects on initial render
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value: ProjectContextType = {
    currentProject,
    projects,
    projectSteps,
    currentStep,
    collaborators,
    stepAssignments,
    notifications,
    loading,
    error,
    loadProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    createStep,
    createProjectStep,
    updateProjectStep,
    deleteStep,
    deleteProjectStep,
    completeStep,
    reorderProjectSteps,
    publishProject,
    addCollaborator,
    removeCollaborator,
    assignStep,
    unassignStep,
    respondToCollaboration,
    markNotificationAsRead,
    setCurrentStep
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
