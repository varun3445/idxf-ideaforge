
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
  status: 'pending' | 'accepted' | 'declined';
  user?: {
    name: string;
    avatar: string | null;
    email: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string;
  type: 'collaboration_invitation';
  created_at: string;
  read: boolean;
  data: {
    project_title: string;
    inviter_name: string;
    collaboration_id: string;
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
  image_url?: string | null;
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
  notifications: Notification[];
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  createProject: (title: string, description: string) => Promise<Project | null>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<void>;
  createStep: (data: { title: string; description?: string; parent_step_id?: string | null; order_index: number }) => Promise<ProjectStep | null>;
  updateStep: (stepId: string, data: Partial<Omit<ProjectStep, 'id'>>) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  completeStep: (stepId: string, isCompleted: boolean) => Promise<void>;
  addCollaborator: (email: string) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  respondToCollaboration: (collaborationId: string, accept: boolean) => Promise<void>;
  assignStep: (stepId: string, userId: string) => Promise<void>;
  unassignStep: (assignmentId: string) => Promise<void>;
  publishProject: (projectId: string, isPublished: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load notifications for the current user
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock data for notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        user_id: 'user-1',
        project_id: '1',
        type: 'collaboration_invitation',
        created_at: new Date().toISOString(),
        read: false,
        data: {
          project_title: 'AI-Powered Visual Design Assistant',
          inviter_name: 'Alice Wonderland',
          collaboration_id: 'collab-mock-1'
        }
      }
    ];

    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications([...mockNotifications, ...parsedNotifications]);
    } else {
      setNotifications(mockNotifications);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );

    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      const updatedNotifications = parsedNotifications.map((notification: Notification) => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    }
  };

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
          is_published: true,
          image_url: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop'
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
          is_published: false,
          image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1064&auto=format&fit=crop'
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
      
      // Load project steps from localStorage
      const savedSteps = localStorage.getItem(`projectSteps-${projectId}`);
      if (savedSteps) {
        setProjectSteps(JSON.parse(savedSteps));
      } else {
        // Use mock steps only if there are no saved steps
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
        localStorage.setItem(`projectSteps-${projectId}`, JSON.stringify(mockSteps));
      }
      
      // Load project collaborators from localStorage
      const savedCollaborators = localStorage.getItem(`projectCollaborators-${projectId}`);
      if (savedCollaborators) {
        setCollaborators(JSON.parse(savedCollaborators));
      } else {
        // Only use mock collaborators for mock project IDs (1, 2), not for new projects
        if (projectId === '1' || projectId === '2') {
          const mockCollaborators: ProjectCollaborator[] = [
            {
              id: 'collab-1',
              project_id: projectId,
              user_id: 'user-2',
              joined_at: '2023-11-15T00:00:00Z',
              status: 'accepted',
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
              status: 'accepted',
              user: {
                name: 'Bob Johnson',
                avatar: null,
                email: 'bob@example.com'
              }
            }
          ];
          
          setCollaborators(mockCollaborators);
          localStorage.setItem(`projectCollaborators-${projectId}`, JSON.stringify(mockCollaborators));
        } else {
          // For new projects, start with an empty collaborators list
          setCollaborators([]);
          localStorage.setItem(`projectCollaborators-${projectId}`, JSON.stringify([]));
        }
      }
      
      if (project?.current_step_id) {
        const currentStep = projectSteps.find(step => step.id === project.current_step_id) || null;
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
      
      // Initialize empty steps for the new project
      localStorage.setItem(`projectSteps-${newProject.id}`, JSON.stringify([]));
      
      // Initialize empty collaborators for the new project
      localStorage.setItem(`projectCollaborators-${newProject.id}`, JSON.stringify([]));
      
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

  const createStep = async (data: { 
    title: string; 
    description?: string; 
    parent_step_id?: string | null;
    order_index: number;
  }): Promise<ProjectStep | null> => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const newStep: ProjectStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        project_id: currentProject.id,
        title: data.title,
        description: data.description || null,
        is_completed: false,
        order_index: data.order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_step_id: data.parent_step_id || null
      };

      const updatedSteps = [...projectSteps, newStep];
      setProjectSteps(updatedSteps);
      
      // Save to localStorage
      localStorage.setItem(`projectSteps-${currentProject.id}`, JSON.stringify(updatedSteps));

      return newStep;
    } catch (error) {
      console.error('Error creating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to create step',
        variant: 'destructive'
      });
      return null;
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

    try {
      // Check if the collaborator already exists
      const existingCollaborator = collaborators.find(c => c.user?.email === email);
      if (existingCollaborator) {
        toast({
          title: 'Already invited',
          description: `${email} has already been invited to this project`,
          variant: 'destructive'
        });
        return;
      }

      // Create a new collaboration request
      const newCollaborator: ProjectCollaborator = {
        id: `collab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        project_id: currentProject.id,
        user_id: `user-${Math.random().toString(36).substring(2, 9)}`,
        joined_at: new Date().toISOString(),
        status: 'pending',
        user: {
          name: email.split('@')[0],
          avatar: null,
          email: email
        }
      };

      const updatedCollaborators = [...collaborators, newCollaborator];
      setCollaborators(updatedCollaborators);
      
      // Save to localStorage
      localStorage.setItem(`projectCollaborators-${currentProject.id}`, JSON.stringify(updatedCollaborators));

      // Create a notification for the invited user
      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user_id: newCollaborator.user_id,
        project_id: currentProject.id,
        type: 'collaboration_invitation',
        created_at: new Date().toISOString(),
        read: false,
        data: {
          project_title: currentProject.title,
          inviter_name: 'Current User',
          collaboration_id: newCollaborator.id
        }
      };

      const savedNotifications = localStorage.getItem('userNotifications');
      let notificationsList = [];
      
      if (savedNotifications) {
        notificationsList = JSON.parse(savedNotifications);
      }
      
      notificationsList.push(newNotification);
      localStorage.setItem('userNotifications', JSON.stringify(notificationsList));
      
      setNotifications(prev => [...prev, newNotification]);

      toast({
        title: 'Invitation sent',
        description: `Collaboration invitation sent to ${email}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive'
      });
      return;
    }

    try {
      const updatedCollaborators = collaborators.filter(c => c.id !== collaboratorId);
      setCollaborators(updatedCollaborators);
      
      // Save to localStorage
      localStorage.setItem(`projectCollaborators-${currentProject.id}`, JSON.stringify(updatedCollaborators));

      toast({
        title: 'Collaborator removed',
        description: 'Collaborator has been removed from the project',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove collaborator',
        variant: 'destructive'
      });
    }
  };

  const respondToCollaboration = async (collaborationId: string, accept: boolean) => {
    try {
      // Find the collaboration in all project collaborations
      let projectId = '';
      let updatedCollaborator: ProjectCollaborator | null = null;
      
      // Find the project with this collaboration
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        
        for (const project of [...projects, ...parsedProjects]) {
          // Check if there are saved collaborators for this project
          const savedCollaborators = localStorage.getItem(`projectCollaborators-${project.id}`);
          if (savedCollaborators) {
            const parsedCollaborators = JSON.parse(savedCollaborators);
            const collaboration = parsedCollaborators.find((c: ProjectCollaborator) => c.id === collaborationId);
            
            if (collaboration) {
              projectId = project.id;
              
              // Update the collaborator status
              const updatedCollaborators = parsedCollaborators.map((c: ProjectCollaborator) => 
                c.id === collaborationId 
                  ? { ...c, status: accept ? 'accepted' : 'declined' } 
                  : c
              );
              
              updatedCollaborator = updatedCollaborators.find((c: ProjectCollaborator) => c.id === collaborationId);
              
              // Save updated collaborators
              localStorage.setItem(`projectCollaborators-${project.id}`, JSON.stringify(updatedCollaborators));
              
              // If this is the current project, update the collaborators state
              if (currentProject?.id === project.id) {
                setCollaborators(updatedCollaborators);
              }
              
              break;
            }
          }
        }
      }
      
      if (!updatedCollaborator || !projectId) {
        throw new Error('Collaboration not found');
      }
      
      // Mark the notification as read
      const notificationToUpdate = notifications.find(n => 
        n.type === 'collaboration_invitation' && 
        n.data.collaboration_id === collaborationId
      );
      
      if (notificationToUpdate) {
        await markNotificationAsRead(notificationToUpdate.id);
      }
      
      toast({
        title: accept ? 'Invitation accepted' : 'Invitation declined',
        description: accept 
          ? 'You are now a collaborator on this project' 
          : 'You have declined the collaboration invitation',
        variant: accept ? 'default' : 'destructive'
      });
      
      return true;
    } catch (error) {
      console.error('Error responding to collaboration:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the invitation response',
        variant: 'destructive'
      });
      return false;
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
        notifications,
        loadProjects,
        loadProjectDetails,
        createProject,
        updateProject,
        createStep,
        updateStep: async () => {},
        deleteStep: async () => {},
        completeStep: async () => {},
        addCollaborator,
        removeCollaborator,
        respondToCollaboration,
        assignStep: async () => {},
        unassignStep: async () => {},
        publishProject,
        markNotificationAsRead,
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
