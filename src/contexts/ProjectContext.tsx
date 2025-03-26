// Only modifying the createProject function and loadNotifications function
// in ProjectContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../hooks/use-toast';
import { User } from '../types/auth.types';

interface ProjectCollaborator {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  permissions: string[];
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

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (title: string, description: string) => Promise<string | null>;
  getProjectById: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadUserProjects: () => void;
  addCollaborator: (projectId: string, userId: string, role: string, permissions: string[]) => void;
  removeCollaborator: (projectId: string, collaboratorId: string) => void;
  getCollaborators: (projectId: string) => ProjectCollaborator[];
  toggleBackingProject: (projectId: string) => void;
  getBackingProjects: () => { [projectId: string]: boolean };
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  loadNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'invite' | 'update' | 'message';
  projectId: string;
  projectName: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
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
  addCollaborator: () => {},
  removeCollaborator: () => {},
  getCollaborators: () => [],
  toggleBackingProject: () => {},
  getBackingProjects: () => ({}),
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  loadNotifications: () => {},
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backingProjects, setBackingProjects] = useState<{ [projectId: string]: boolean }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUserProjects();
    loadNotifications();
  }, [user]);

  const loadNotifications = () => {
    // Remove mock notifications to fix the issue
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
    } else {
      // Initialize with empty array instead of mock data
      setNotifications([]);
      // Save empty array to localStorage
      localStorage.setItem('userNotifications', JSON.stringify([]));
    }
  };

  const loadUserProjects = () => {
    setLoading(true);
    setError(null);
    try {
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
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
    // Save to localStorage
    localStorage.setItem('userProjects', JSON.stringify(projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    )));
  };

  const deleteProject = (id: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    // Remove from localStorage
    localStorage.setItem('userProjects', JSON.stringify(projects.filter(project => project.id !== id)));
  };

  const addCollaborator = (projectId: string, userId: string, role: string, permissions: string[]) => {
    const newCollaborator: ProjectCollaborator = {
      id: uuidv4(),
      user_id: userId,
      project_id: projectId,
      role: role,
      permissions: permissions,
    };

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, collaborators: [...(project.collaborators || []), newCollaborator] }
          : project
      )
    );

    // Save to localStorage
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, collaborators: [...(project.collaborators || []), newCollaborator] }
        : project
    );
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
  };

  const removeCollaborator = (projectId: string, collaboratorId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, collaborators: (project.collaborators || []).filter(c => c.id !== collaboratorId) }
          : project
      )
    );

    // Save to localStorage
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, collaborators: (project.collaborators || []).filter(c => c.id !== collaboratorId) }
        : project
    );
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
  };

  const getCollaborators = (projectId: string): ProjectCollaborator[] => {
    const project = projects.find(p => p.id === projectId);
    return project?.collaborators || [];
  };

  const toggleBackingProject = (projectId: string) => {
    setBackingProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  
    // Save to localStorage
    localStorage.setItem('backingProjects', JSON.stringify({
      ...backingProjects,
      [projectId]: !backingProjects[projectId],
    }));
  };
  
  const getBackingProjects = () => {
    const savedBackingProjects = localStorage.getItem('backingProjects');
    return savedBackingProjects ? JSON.parse(savedBackingProjects) : {};
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
      // Get the current user ID
      const currentUserId = user?.id || 'user-1';
      
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title,
        description,
        owner_id: currentUserId, // Use the current user's ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_step_id: null,
        share_code: `SHARE${Math.floor(Math.random() * 90000) + 10000}`,
        backersCount: 0,
        is_published: false
      };
      
      console.log("Creating new project with owner_id:", currentUserId);
      
      // Update projects array with the new project
      setProjects(prev => [...prev, newProject]);
      
      // Save to localStorage
      const savedProjects = localStorage.getItem('userProjects');
      let updatedProjects = [];
      
      if (savedProjects) {
        updatedProjects = [...JSON.parse(savedProjects), newProject];
      } else {
        updatedProjects = [newProject];
      }
      
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      
      // Initialize project steps as empty array
      localStorage.setItem(`projectSteps-${newProject.id}`, JSON.stringify([]));
      
      // Initialize collaborators as empty array
      const initialCollaborators: ProjectCollaborator[] = [];
      localStorage.setItem(`projectCollaborators-${newProject.id}`, JSON.stringify(initialCollaborators));
      
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

  return (
    <ProjectContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

const useProject = () => {
  return useContext(ProjectContext);
};

export { ProjectProvider, useProject };
