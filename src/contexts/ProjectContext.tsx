import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
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
  note?: string | null;
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
}

export interface SuggestedStep {
  title: string;
  description: string;
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
  createProject: (title: string, description: string, suggestedSteps?: SuggestedStep[]) => Promise<Project | null>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
  createStep: (data: { 
    title: string; 
    description?: string; 
    parent_step_id?: string | null;
    image_url?: string;
    note?: string;
  }) => Promise<ProjectStep | null>;
  updateStep: (stepId: string, data: Partial<Omit<ProjectStep, 'id'>>) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  completeStep: (stepId: string, isCompleted: boolean) => Promise<void>;
  addCollaborator: (email: string) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  assignStep: (stepId: string, userId: string) => Promise<void>;
  unassignStep: (assignmentId: string) => Promise<void>;
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
          share_code: 'DESIGN1'
        },
        {
          id: '2',
          title: 'Decentralized Creative Marketplace',
          description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
          owner_id: 'user-1',
          created_at: '2023-09-23T00:00:00Z',
          updated_at: '2023-09-23T00:00:00Z',
          current_step_id: null,
          share_code: 'BLOCK1'
        }
      ];

      setProjects(mockProjects);
      console.log('Projects loaded:', mockProjects);
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
      const project = projects.find(p => p.id === projectId) || {
        id: projectId,
        title: 'Mock Project',
        description: 'This is a mock project for development',
        owner_id: 'user-1',
        created_at: '2023-11-15T00:00:00Z',
        updated_at: '2023-11-15T00:00:00Z',
        current_step_id: null,
        share_code: 'MOCK1'
      };
      
      setCurrentProject(project);
      
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
          parent_step_id: null,
          image_url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?q=80&w=1374&auto=format&fit=crop',
          note: 'We should focus on competitive analysis first'
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
          parent_step_id: null,
          image_url: null,
          note: null
        },
        {
          id: 'step-2-1',
          project_id: projectId,
          title: 'Wireframing',
          description: 'Create low-fidelity wireframes',
          is_completed: false,
          order_index: 0,
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          parent_step_id: 'step-2',
          image_url: null,
          note: null
        },
        {
          id: 'step-2-2',
          project_id: projectId,
          title: 'Visual Design',
          description: 'Create high-fidelity mockups',
          is_completed: false,
          order_index: 1,
          created_at: '2023-11-15T00:00:00Z',
          updated_at: '2023-11-15T00:00:00Z',
          parent_step_id: 'step-2',
          image_url: null,
          note: null
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
          parent_step_id: null,
          image_url: null,
          note: null
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
      
      const mockAssignments: StepAssignment[] = [
        {
          id: 'assign-1',
          step_id: 'step-2-1',
          user_id: 'user-2',
          assigned_at: '2023-11-15T00:00:00Z',
          user: {
            name: 'Jane Smith',
            avatar: null
          }
        },
        {
          id: 'assign-2',
          step_id: 'step-2-2',
          user_id: 'user-3',
          assigned_at: '2023-11-15T00:00:00Z',
          user: {
            name: 'Bob Johnson',
            avatar: null
          }
        }
      ];
      
      setStepAssignments(mockAssignments);
      
      if (project.current_step_id) {
        const currentStep = mockSteps.find(step => step.id === project.current_step_id) || null;
        setCurrentStep(currentStep);
      } else {
        setCurrentStep(null);
      }
      
      console.log('Project details loaded:', {
        project,
        steps: mockSteps,
        collaborators: mockCollaborators,
        assignments: mockAssignments
      });
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

  const createProject = async (title: string, description: string, suggestedSteps?: SuggestedStep[]): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!title.trim() || !description.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Project title and description are required.',
          variant: 'destructive'
        });
        return null;
      }
      
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title,
        description,
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_step_id: null,
        share_code: `SHARE${Math.floor(Math.random() * 10000)}`
      };
      
      setProjects(prev => [...prev, newProject]);
      
      if (suggestedSteps && suggestedSteps.length > 0) {
        const createdSteps: ProjectStep[] = [];
        
        for (let i = 0; i < suggestedSteps.length; i++) {
          const step = suggestedSteps[i];
          const newStep: ProjectStep = {
            id: `step-${Date.now()}-${i}`,
            project_id: newProject.id,
            title: step.title,
            description: step.description || null,
            is_completed: false,
            order_index: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            parent_step_id: null,
            image_url: null,
            note: null
          };
          
          createdSteps.push(newStep);
        }
        
        setProjectSteps(prev => [...prev, ...createdSteps]);
      }
      
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

  const createStep = async (data: { 
    title: string; 
    description?: string; 
    parent_step_id?: string | null;
    image_url?: string;
    note?: string;
  }): Promise<ProjectStep | null> => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive'
      });
      return null;
    }
    
    if (!data.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Step title is required.',
        variant: 'destructive'
      });
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newStep: ProjectStep = {
        id: `step-${Date.now()}`,
        project_id: currentProject.id,
        title: data.title,
        description: data.description || null,
        is_completed: false,
        order_index: projectSteps.filter(s => s.parent_step_id === data.parent_step_id).length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_step_id: data.parent_step_id || null,
        image_url: data.image_url || null,
        note: data.note || null
      };
      
      setProjectSteps(prev => [...prev, newStep]);
      
      toast({
        title: 'Success',
        description: 'Step created successfully',
        variant: 'default'
      });
      
      return newStep;
    } catch (error) {
      console.error('Error creating step:', error);
      setError('Failed to create step. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to create step. Please try again later.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (stepId: string, data: Partial<Omit<ProjectStep, 'id'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      setProjectSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, ...data, updated_at: new Date().toISOString() } 
            : step
        )
      );
      
      if (currentStep?.id === stepId) {
        setCurrentStep(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : prev);
      }
      
      toast({
        title: 'Success',
        description: 'Step updated successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating step:', error);
      setError('Failed to update step. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to update step. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStep = async (stepId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const stepToDelete = projectSteps.find(step => step.id === stepId);
      if (!stepToDelete) {
        throw new Error('Step not found');
      }
      
      const allStepIds = [stepId, ...projectSteps.filter(s => s.parent_step_id === stepId).map(s => s.id)];
      setProjectSteps(prev => prev.filter(step => !allStepIds.includes(step.id)));
      
      if (allStepIds.includes(currentStep?.id || '')) {
        setCurrentStep(null);
      }
      
      if (currentProject?.current_step_id && allStepIds.includes(currentProject.current_step_id)) {
        setCurrentProject(prev => prev ? { ...prev, current_step_id: null } : prev);
      }
      
      toast({
        title: 'Success',
        description: 'Step deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting step:', error);
      setError('Failed to delete step. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to delete step. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: string, isCompleted: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      setProjectSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, is_completed: isCompleted, updated_at: new Date().toISOString() } 
            : step
        )
      );
      
      if (currentStep?.id === stepId) {
        setCurrentStep(prev => prev ? { ...prev, is_completed: isCompleted, updated_at: new Date().toISOString() } : prev);
      }
      
      toast({
        title: 'Success',
        description: `Step marked as ${isCompleted ? 'completed' : 'incomplete'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error completing step:', error);
      setError(`Failed to mark step as ${isCompleted ? 'completed' : 'incomplete'}. Please try again later.`);
      toast({
        title: 'Error',
        description: `Failed to mark step as ${isCompleted ? 'completed' : 'incomplete'}. Please try again later.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addCollaborator = async (email: string) => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newCollaborator: ProjectCollaborator = {
        id: `collab-${Date.now()}`,
        project_id: currentProject.id,
        user_id: `user-${Math.floor(Math.random() * 1000)}`,
        joined_at: new Date().toISOString(),
        user: {
          name: email.split('@')[0],
          avatar: null,
          email
        }
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      setError('Failed to add collaborator. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to add collaborator. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const collaboratorToRemove = collaborators.find(c => c.id === collaboratorId);
      if (!collaboratorToRemove) {
        throw new Error('Collaborator not found');
      }
      
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      
      setStepAssignments(prev => prev.filter(a => a.user_id !== collaboratorToRemove.user_id));
      
      toast({
        title: 'Success',
        description: 'Collaborator removed successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError('Failed to remove collaborator. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to remove collaborator. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignStep = async (stepId: string, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const step = projectSteps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }
      
      const user = collaborators.find(c => c.user_id === userId)?.user;
      if (!user) {
        throw new Error('User not found');
      }
      
      const existingAssignment = stepAssignments.find(a => a.step_id === stepId && a.user_id === userId);
      if (existingAssignment) {
        toast({
          title: 'Info',
          description: 'This user is already assigned to this step',
          variant: 'default'
        });
        setLoading(false);
        return;
      }
      
      const newAssignment: StepAssignment = {
        id: `assign-${Date.now()}`,
        step_id: stepId,
        user_id: userId,
        assigned_at: new Date().toISOString(),
        user: {
          name: user.name,
          avatar: user.avatar
        }
      };
      
      setStepAssignments(prev => [...prev, newAssignment]);
      
      toast({
        title: 'Success',
        description: 'Step assigned successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error assigning step:', error);
      setError('Failed to assign step. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to assign step. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const unassignStep = async (assignmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      setStepAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      toast({
        title: 'Success',
        description: 'Assignment removed successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error unassigning step:', error);
      setError('Failed to remove assignment. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to remove assignment. Please try again later.',
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
        createStep,
        updateStep,
        deleteStep,
        completeStep,
        addCollaborator,
        removeCollaborator,
        assignStep,
        unassignStep,
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
