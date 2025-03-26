import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../AuthContext';
import { User } from '../types/auth.types';

export interface ProjectCollaborator {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  permissions: string[];
  status: 'pending' | 'accepted' | 'rejected';
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ProjectStep {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  parent_step_id: string | null;
  order_index: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  image_url?: string;
}

export interface StepAssignment {
  id: string;
  step_id: string;
  user_id: string;
  assigned_at: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  current_step_id: string | null;
  is_published: boolean;
  share_code?: string;
  overview?: string;
  goals?: string;
  challenges?: string;
  imageUrl?: string;
  skills?: string[];
  collaborators?: ProjectCollaborator[];
  backersCount?: number;
}

export interface Notification {
  id: string;
  type: 'collaboration_invitation' | 'update' | 'message';
  project_id: string;
  read: boolean;
  created_at: string;
  data: {
    collaboration_id?: string;
    inviter_name?: string;
    project_title?: string;
    message?: string;
  };
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (title: string, description: string) => Promise<string | null>;
  getProjectById: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadUserProjects: () => void;
  addCollaborator: (email: string, projectId: string, role: string, permissions: string[]) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => void;
  getCollaborators: (projectId: string) => ProjectCollaborator[];
  toggleBackingProject: (projectId: string) => void;
  getBackingProjects: () => { [projectId: string]: boolean };
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  loadNotifications: () => void;
  projectSteps: ProjectStep[];
  currentProject: Project | null;
  currentStep: ProjectStep | null;
  setCurrentStep: (step: ProjectStep) => void;
  collaborators: ProjectCollaborator[];
  stepAssignments: StepAssignment[];
  loadProjectDetails: (projectId: string) => Promise<void>;
  createStep: (step: { title: string; description?: string; parent_step_id: string | null; order_index: number }) => Promise<string | null>;
  deleteStep: (stepId: string) => void;
  completeStep: (stepId: string, isCompleted: boolean) => void;
  assignStep: (stepId: string, userId: string) => void;
  unassignStep: (assignmentId: string) => void;
  publishProject: (projectId: string, isPublished: boolean) => Promise<{ success: boolean }>;
  publishProjectWithDetails: (projectId: string, isPublished: boolean, details: { overview: string; goals: string; challenges: string; image?: File | null }) => Promise<{ success: boolean }>;
  respondToCollaboration: (collaborationId: string, accept: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  loading: false,
  error: null,
  createProject: async () => null,
  getProjectById: () => undefined,
  updateProject: () => {},
  deleteProject: () => {},
  loadUserProjects: () => {},
  addCollaborator: async () => {},
  removeCollaborator: () => {},
  getCollaborators: () => [],
  toggleBackingProject: () => {},
  getBackingProjects: () => ({}),
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  loadNotifications: () => {},
  projectSteps: [],
  currentProject: null,
  currentStep: null,
  setCurrentStep: () => {},
  collaborators: [],
  stepAssignments: [],
  loadProjectDetails: async () => {},
  createStep: async () => null,
  deleteStep: () => {},
  completeStep: () => {},
  assignStep: () => {},
  unassignStep: () => {},
  publishProject: async () => {},
  publishProjectWithDetails: async () => {},
  respondToCollaboration: async () => {},
  markNotificationAsRead: async () => {}
});

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backingProjects, setBackingProjects] = useState<{ [projectId: string]: boolean }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [stepAssignments, setStepAssignments] = useState<StepAssignment[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUserProjects();
    loadNotifications();
    
    const savedBackingProjects = localStorage.getItem('backingProjects');
    if (savedBackingProjects) {
      setBackingProjects(JSON.parse(savedBackingProjects));
    }
  }, [user]);

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
    } else {
      setNotifications([]);
      localStorage.setItem('userNotifications', JSON.stringify([]));
    }
  };

  const respondToCollaboration = async (collaborationId: string, accept: boolean) => {
    console.log(`Responding to collaboration ${collaborationId}: ${accept ? 'accept' : 'reject'}`);
    return Promise.resolve();
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    localStorage.setItem('userNotifications', JSON.stringify(
      notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    ));
    return Promise.resolve();
  };

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        
        const savedSteps = localStorage.getItem(`projectSteps-${projectId}`);
        if (savedSteps) {
          const parsedSteps = JSON.parse(savedSteps);
          setProjectSteps(parsedSteps);
          
          if (project.current_step_id) {
            const currentStep = parsedSteps.find((s: ProjectStep) => s.id === project.current_step_id);
            if (currentStep) {
              setCurrentStep(currentStep);
            }
          }
        } else {
          setProjectSteps([]);
        }
        
        const savedCollaborators = localStorage.getItem(`projectCollaborators-${projectId}`);
        if (savedCollaborators) {
          setCollaborators(JSON.parse(savedCollaborators));
        } else {
          setCollaborators([]);
        }
        
        const savedAssignments = localStorage.getItem(`stepAssignments-${projectId}`);
        if (savedAssignments) {
          setStepAssignments(JSON.parse(savedAssignments));
        } else {
          setStepAssignments([]);
        }
      } else {
        setError('Project not found');
      }
    } catch (error: any) {
      console.error('Error loading project details:', error);
      setError(error.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
    
    return Promise.resolve();
  };

  const createStep = async (step: { title: string; description?: string; parent_step_id: string | null; order_index: number }) => {
    if (!currentProject) return null;
    
    try {
      const newStep: ProjectStep = {
        id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        project_id: currentProject.id,
        title: step.title,
        description: step.description,
        parent_step_id: step.parent_step_id,
        order_index: step.order_index,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedSteps = [...projectSteps, newStep];
      setProjectSteps(updatedSteps);
      
      localStorage.setItem(`projectSteps-${currentProject.id}`, JSON.stringify(updatedSteps));
      
      if (projectSteps.length === 0 && !currentProject.current_step_id) {
        setCurrentStep(newStep);
        
        const updatedProject = { ...currentProject, current_step_id: newStep.id };
        setCurrentProject(updatedProject);
        
        const updatedProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
        setProjects(updatedProjects);
        
        localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      }
      
      return newStep.id;
    } catch (error) {
      console.error('Error creating step:', error);
      return null;
    }
  };

  const deleteStep = (stepId: string) => {
    if (!currentProject) return;
    
    const getAllChildStepIds = (parentId: string): string[] => {
      const directChildren = projectSteps.filter(s => s.parent_step_id === parentId);
      
      let allChildIds: string[] = directChildren.map(child => child.id);
      
      directChildren.forEach(child => {
        allChildIds = [...allChildIds, ...getAllChildStepIds(child.id)];
      });
      
      return allChildIds;
    };
    
    const childStepIds = getAllChildStepIds(stepId);
    const allStepIdsToRemove = [stepId, ...childStepIds];
    
    const remainingSteps = projectSteps.filter(step => !allStepIdsToRemove.includes(step.id));
    setProjectSteps(remainingSteps);
    
    localStorage.setItem(`projectSteps-${currentProject.id}`, JSON.stringify(remainingSteps));
    
    if (currentProject.current_step_id && allStepIdsToRemove.includes(currentProject.current_step_id)) {
      const updatedProject = { ...currentProject, current_step_id: null };
      setCurrentProject(updatedProject);
      setCurrentStep(null);
      
      const updatedProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
      setProjects(updatedProjects);
      
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    }
    
    const updatedAssignments = stepAssignments.filter(a => !allStepIdsToRemove.includes(a.step_id));
    setStepAssignments(updatedAssignments);
    
    localStorage.setItem(`stepAssignments-${currentProject.id}`, JSON.stringify(updatedAssignments));
  };

  const completeStep = (stepId: string, isCompleted: boolean) => {
    if (!currentProject) return;
    
    const updatedSteps = projectSteps.map(step => 
      step.id === stepId ? { ...step, is_completed: isCompleted } : step
    );
    
    setProjectSteps(updatedSteps);
    
    localStorage.setItem(`projectSteps-${currentProject.id}`, JSON.stringify(updatedSteps));
  };

  const assignStep = (stepId: string, userId: string) => {
    if (!currentProject) return;
    
    const existingAssignment = stepAssignments.find(a => a.step_id === stepId && a.user_id === userId);
    if (existingAssignment) return;
    
    const collaborator = collaborators.find(c => c.user_id === userId);
    
    const newAssignment: StepAssignment = {
      id: `assignment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      step_id: stepId,
      user_id: userId,
      assigned_at: new Date().toISOString(),
      user: collaborator?.user
    };
    
    const updatedAssignments = [...stepAssignments, newAssignment];
    setStepAssignments(updatedAssignments);
    
    localStorage.setItem(`stepAssignments-${currentProject.id}`, JSON.stringify(updatedAssignments));
  };

  const unassignStep = (assignmentId: string) => {
    if (!currentProject) return;
    
    const updatedAssignments = stepAssignments.filter(a => a.id !== assignmentId);
    setStepAssignments(updatedAssignments);
    
    localStorage.setItem(`stepAssignments-${currentProject.id}`, JSON.stringify(updatedAssignments));
  };

  const publishProject = async (projectId: string, isPublished: boolean): Promise<{ success: boolean }> => {
    try {
      const projectsString = localStorage.getItem("userProjects");
      const projects = projectsString ? JSON.parse(projectsString) : [];
      
      const updatedProjects = projects.map((project: Project) => {
        if (project.id === projectId) {
          return {
            ...project,
            is_published: isPublished
          };
        }
        return project;
      });
      
      localStorage.setItem("userProjects", JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      
      console.log(`Project ${projectId} publishing status changed to ${isPublished}`);
      return { success: true };
    } catch (error) {
      console.error("Error publishing project:", error);
      throw error;
    }
  };

  const publishProjectWithDetails = async (
    projectId: string, 
    isPublished: boolean,
    details: { 
      overview: string; 
      goals: string; 
      challenges: string; 
      image?: File | null 
    }
  ): Promise<{ success: boolean }> => {
    try {
      const projectsString = localStorage.getItem("userProjects");
      const projects = projectsString ? JSON.parse(projectsString) : [];
      
      const updatedProjects = projects.map((project: Project) => {
        if (project.id === projectId) {
          return {
            ...project,
            is_published: isPublished,
            overview: details.overview,
            goals: details.goals,
            challenges: details.challenges
          };
        }
        return project;
      });
      
      localStorage.setItem("userProjects", JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      
      console.log(`Project ${projectId} published with details:`, details);
      return { success: true };
    } catch (error) {
      console.error("Error publishing project with details:", error);
      throw error;
    }
  };

  const loadUserProjects = () => {
    setLoading(true);
    setError(null);
    try {
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        console.log("Loaded projects from localStorage:", parsedProjects);
        setProjects(parsedProjects);
      } else {
        localStorage.setItem('userProjects', JSON.stringify([]));
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
    localStorage.setItem('userProjects', JSON.stringify(projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    )));
  };

  const deleteProject = (id: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    localStorage.setItem('userProjects', JSON.stringify(projects.filter(project => project.id !== id)));
  };

  const addCollaborator = async (email: string, projectId: string, role: string, permissions: string[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newCollaboratorId = `user-${Date.now()}`;
    
    const newCollaborator: ProjectCollaborator = {
      id: uuidv4(),
      user_id: newCollaboratorId,
      project_id: projectId,
      role: role || 'collaborator',
      permissions: permissions || ['view', 'edit'],
      status: 'pending',
      user: {
        name: email.split('@')[0],
        email: email,
        avatar: undefined
      }
    };
    
    let projectCollaborators: ProjectCollaborator[] = [];
    const savedCollaborators = localStorage.getItem(`projectCollaborators-${projectId}`);
    if (savedCollaborators) {
      projectCollaborators = JSON.parse(savedCollaborators);
    }
    
    projectCollaborators.push(newCollaborator);
    localStorage.setItem(`projectCollaborators-${projectId}`, JSON.stringify(projectCollaborators));
    
    if (currentProject && currentProject.id === projectId) {
      setCollaborators([...collaborators, newCollaborator]);
    }
    
    const notification: Notification = {
      id: uuidv4(),
      type: 'collaboration_invitation',
      project_id: projectId,
      read: false,
      created_at: new Date().toISOString(),
      data: {
        collaboration_id: newCollaborator.id,
        inviter_name: user?.name || 'A user',
        project_title: project.title
      }
    };
    
    const savedNotifications = localStorage.getItem('userNotifications');
    let allNotifications: Notification[] = [];
    if (savedNotifications) {
      allNotifications = JSON.parse(savedNotifications);
    }
    
    allNotifications.push(notification);
    localStorage.setItem('userNotifications', JSON.stringify(allNotifications));
    
    setNotifications([...notifications, notification]);
  };

  const removeCollaborator = (collaboratorId: string) => {
    if (!currentProject) return;
    
    const updatedCollaborators = collaborators.filter(c => c.id !== collaboratorId);
    setCollaborators(updatedCollaborators);
    
    localStorage.setItem(`projectCollaborators-${currentProject.id}`, JSON.stringify(updatedCollaborators));
  };

  const getCollaborators = (projectId: string): ProjectCollaborator[] => {
    const savedCollaborators = localStorage.getItem(`projectCollaborators-${projectId}`);
    return savedCollaborators ? JSON.parse(savedCollaborators) : [];
  };

  const toggleBackingProject = (projectId: string) => {
    const updatedBackingProjects = {
      ...backingProjects,
      [projectId]: !backingProjects[projectId],
    };
    
    setBackingProjects(updatedBackingProjects);
  
    localStorage.setItem('backingProjects', JSON.stringify(updatedBackingProjects));
    
    console.log("Updated backing projects:", updatedBackingProjects);
  };
  
  const getBackingProjects = () => {
    const savedBackingProjects = localStorage.getItem('backingProjects');
    if (savedBackingProjects) {
      return JSON.parse(savedBackingProjects);
    }
    return {};
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
    localStorage.setItem('userNotifications', JSON.stringify([...notifications, notification]));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    localStorage.setItem('userNotifications', JSON.stringify(notifications.filter(notification => notification.id !== notificationId)));
  };

  const createProject = async (title: string, description: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentUserId = user?.id || 'user-1';
      
      const newProject: Project = {
        id: uuidv4(),
        title,
        description,
        owner_id: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_step_id: null,
        share_code: `SHARE${Math.floor(Math.random() * 90000) + 10000}`,
        backersCount: 0,
        is_published: false
      };
      
      console.log("Creating new project with owner_id:", currentUserId);
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      
      localStorage.setItem(`projectSteps-${newProject.id}`, JSON.stringify([]));
      
      localStorage.setItem(`projectCollaborators-${newProject.id}`, JSON.stringify([]));
      
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      
      return newProject.id;
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || "Failed to create project");
      
      toast({
        variant: "destructive",
        title: "Project creation failed",
        description: error.message || "An error occurred while creating your project.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    projects,
    loading,
    error,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    loadUserProjects,
    addCollaborator,
    removeCollaborator,
    getCollaborators,
    toggleBackingProject,
    getBackingProjects,
    notifications,
    addNotification,
    removeNotification,
    loadNotifications,
    projectSteps,
    currentProject,
    currentStep,
    setCurrentStep,
    collaborators,
    stepAssignments,
    loadProjectDetails,
    createStep,
    deleteStep,
    completeStep,
    assignStep,
    unassignStep,
    publishProject,
    publishProjectWithDetails,
    respondToCollaboration,
    markNotificationAsRead
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  return useContext(ProjectContext);
};
