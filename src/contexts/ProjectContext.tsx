import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';

export interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  owner_id: string;
  is_published: boolean;
  share_code: string;
  current_step_id: string | null;
  steps_order: string[];
  backers_count: number;
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

interface ProjectContextType {
  currentProject: Project | null;
  projectSteps: ProjectStep[];
  currentStep: ProjectStep | null;
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  createProject: (title: string, description: string, skills?: string[]) => Promise<Project | null>;
  updateProject: (project: Partial<Project>) => Promise<void>;
  createProjectStep: (step: Omit<ProjectStep, 'id' | 'created_at'>) => Promise<void>;
  updateProjectStep: (step: Partial<ProjectStep> & { id: string }) => Promise<void>;
  deleteProjectStep: (stepId: string) => Promise<void>;
  reorderProjectSteps: (steps: ProjectStep[]) => Promise<void>;
  publishProject: (projectId: string, isPublished: boolean) => Promise<void>;
  setCurrentStep: (step: ProjectStep | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
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

      // setProjects(data || []);
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

      setCurrentProject(project);

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
          steps_order: [],
          backers_count: 0,
          skills: skills || []
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const reorderProjectSteps = useCallback(async (steps: ProjectStep[]) => {
    setLoading(true);
    try {
      // Optimistically update the local state
      setProjectSteps(steps);
  
      // Prepare updates for Supabase
      const updates = steps.map(step => ({
        id: step.id,
        order_index: step.order_index,
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    currentProject,
    projectSteps,
    currentStep,
    loading,
    error,
    loadProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    createProjectStep,
    updateProjectStep,
    deleteProjectStep,
    reorderProjectSteps,
    publishProject,
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
