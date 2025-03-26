import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

export interface ProjectStep {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  parent_step_id: string | null;
  image_url?: string | null;
  notes?: string | null;
}

export interface StepAssignment {
  id: string;
  step_id: string;
  user_id: string;
  assigned_at: string;
  user?: {
    name: string;
    avatar: string | null;
  };
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    name: string;
    avatar: string | null;
    email: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  current_step_id: string | null;
  share_code: string | null;
  backers_count?: number;
  is_published?: boolean;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projectSteps: ProjectStep[];
  currentStep: ProjectStep | null;
  setCurrentStep: (step: ProjectStep | null) => void;
  collaborators: ProjectCollaborator[];
  stepAssignments: StepAssignment[];
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  createProject: (title: string, description: string) => Promise<Project | null>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
  createStep: (data: { title: string; description?: string; parent_step_id?: string | null }) => Promise<ProjectStep | null>;
  updateStep: (stepId: string, data: Partial<Omit<ProjectStep, 'id'>>) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  completeStep: (stepId: string, isCompleted: boolean) => Promise<void>;
  addCollaborator: (email: string) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  assignStep: (stepId: string, userId: string) => Promise<void>;
  unassignStep: (assignmentId: string) => Promise<void>;
  publishProject: (projectId: string, isPublished: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'AI-Powered Visual Design Assistant',
          description: 'An intelligent design assistant that provides real-time feedback and suggestions as designers work on their projects.',
          owner_id: 'user-1',
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          current_step_id: null,
          share_code: 'DESIGN1',
          backers_count: 24,
          is_published: true
        },
        {
          id: '2',
          title: 'Decentralized Creative Marketplace',
          description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
          owner_id: 'user-1',
          created_at: '2023-09-23T00:00:00Z',
          updated_at: '2023-09-23T00:00:00Z',
          current_step_id: null,
          share_code: 'BLOCK1',
          backers_count: 18,
          is_published: false
        }
      ];

      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects([...mockProjects, ...parsedProjects]);
      } else {
        setProjects(mockProjects);
      }
      
      console.log('Projects loaded successfully');
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const savedProjects = localStorage.getItem('userProjects');
      let allProjects = [...projects];
      
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        allProjects = [...projects, ...parsedProjects];
      }
      
      const project = allProjects.find(p => p.id === projectId);
      
      if (project) {
        setCurrentProject(project);
      } else {
        const mockProject = {
          id: projectId,
          title: 'Mock Project',
          description: 'This is a mock project for development',
          owner_id: 'user-1',
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          current_step_id: null,
          share_code: `MOCK1`,
          backers_count: 0,
          is_published: false
        };
        
        setCurrentProject(mockProject);
      }
      
      const mockSteps: ProjectStep[] = [
        {
          id: 'step-1',
          project_id: projectId,
          title: 'Research and Planning',
          description: 'Define project scope and research similar solutions',
          is_completed: true,
          order_index: 0,
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          parent_step_id: null
        },
        {
          id: 'step-2',
          project_id: projectId,
          title: 'Design Phase',
          description: 'Create wireframes and design mockups',
          is_completed: false,
          order_index: 1,
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          parent_step_id: null
        },
        {
          id: 'step-3',
          project_id: projectId,
          title: 'Development',
          description: 'Build the application',
          is_completed: false,
          order_index: 2,
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          parent_step_id: null
        }
      ];
      
      setProjectSteps(mockSteps);
      
      const mockCollaborators: ProjectCollaborator[] = [
        {
          id: 'collab-1',
          project_id: projectId,
          user_id: 'user-2',
          joined_at: '2023-11-15T00:00:00Z',
          user: {
            name: 'Jane Smith',
            avatar: null,
            email: 'jane@example.com'
          }
        },
        {
          id: 'collab-2',
          project_id: projectId,
          user_id: 'user-3',
          joined_at: '2023-11-15T00:00:00Z',
          user: {
            name: 'Bob Johnson',
            avatar: null,
            email: 'bob@example.com'
          }
        }
      ];
      
      setCollaborators(mockCollaborators);
      
      if (project?.current_step_id) {
        const currentStep = mockSteps.find(step => step.id === project.current_step_id) || null;
        setCurrentStep(currentStep);
      } else {
        setCurrentStep(null);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
      setError('Failed to load project details. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load project details. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (title: string, description: string): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title,
        description,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_step_id: null,
        share_code: `SHARE${Math.floor(Math.random() * 10000)}`,
        backers_count: 0,
        is_published: false
      };
      
      setProjects(prev => [...prev, newProject]);
      
      const savedProjects = localStorage.getItem('userProjects');
      let projects = [];
      
      if (savedProjects) {
        projects = JSON.parse(savedProjects);
      }
      
      projects.push(newProject);
      localStorage.setItem('userProjects', JSON.stringify(projects));
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
        variant: 'default'
      });
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again later.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectData: Partial<Project> & { id: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const savedProjects = localStorage.getItem('userProjects');
      let projects = [];
      
      if (savedProjects) {
        projects = JSON.parse(savedProjects);
        projects = projects.map((project: Project) => 
          project.id === projectData.id 
            ? { ...project, ...projectData, updated_at: new Date().toISOString() } 
            : project
        );
        localStorage.setItem('userProjects', JSON.stringify(projects));
      }
      
      setProjects(prev => 
        prev.map(project => 
          project.id === projectData.id 
            ? { ...project, ...projectData, updated_at: new Date().toISOString() } 
            : project
        )
      );
      
      if (currentProject?.id === projectData.id) {
        setCurrentProject(prev => prev ? { ...prev, ...projectData, updated_at: new Date().toISOString() } : prev);
      }
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const publishProject = async (projectId: string, isPublished: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const savedProjects = localStorage.getItem('userProjects');
      let projects = [];
      
      if (savedProjects) {
        projects = JSON.parse(savedProjects);
        projects = projects.map((project: Project) => 
          project.id === projectId 
            ? { ...project, is_published: isPublished, updated_at: new Date().toISOString() } 
            : project
        );
        localStorage.setItem('userProjects', JSON.stringify(projects));
      }
      
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, is_published: isPublished, updated_at: new Date().toISOString() } 
            : project
        )
      );
      
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, is_published: isPublished, updated_at: new Date().toISOString() } : prev);
      }
      
      toast({
        title: 'Success',
        description: isPublished ? 'Project published successfully' : 'Project unpublished successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating project publish status:', error);
      setError('Failed to update project. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        projectSteps,
        currentStep,
        setCurrentStep,
        collaborators,
        stepAssignments,
        loadProjects,
        loadProjectDetails,
        createProject,
        updateProject,
        createStep: async () => null,
        updateStep: async () => {},
        deleteStep: async () => {},
        completeStep: async () => {},
        addCollaborator: async () => {},
        removeCollaborator: async () => {},
        assignStep: async () => {},
        unassignStep: async () => {},
        publishProject,
        loading,
        error
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
