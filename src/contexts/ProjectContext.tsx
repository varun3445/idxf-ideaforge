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
            },
            {
              id: 'step-2',
              project_id: projectId,
              title: 'Design UI',
              description: 'Create the user interface design.',
              order_index: 2,
              is_completed: false,
              parent_step_id: null,
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

      // Update local state
      setProjectSteps((prevSteps) => prevSteps.filter((s) => s.id !== stepId));
    } catch (error) {
      console.error('Error deleting project step:', error);
      setError('Failed to delete project step');
    }
  };

  const setCurrentStep = (step: ProjectStep | null) => {
    setCurrentStep(step);
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
  };
  
  return (
    <ProjectContext.Provider
      value={value}
    >
      {children}
    </ProjectContext.Provider>
  );
};
