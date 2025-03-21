import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../AuthContext';

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
  publishProject: (projectId: string, isPublished: boolean) => Promise<void>;
  createStep: (data: { title: string; description?: string; parent_step_id?: string | null }) => Promise<ProjectStep | null>;
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
  const { user } = useAuth();

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      const { data: collaborations, error: collabError } = await supabase
        .from('project_collaborators')
        .select('project_id')
        .eq('user_id', user.id);

      if (collabError) throw collabError;

      let collaborativeProjects: any[] = [];
      if (collaborations && collaborations.length > 0) {
        const projectIds = collaborations.map(collab => collab.project_id);
        const { data: collabProjects, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);

        if (fetchError) throw fetchError;
        collaborativeProjects = collabProjects || [];
      }

      const allProjects = [...(ownedProjects || []), ...collaborativeProjects];
      setProjects(allProjects);
      console.log('Projects loaded:', allProjects);
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
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      setCurrentProject(project);
      
      const { data: steps, error: stepsError } = await supabase
        .from('project_steps')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (stepsError) throw stepsError;
      setProjectSteps(steps || []);
      
      const { data: collabs, error: collabsError } = await supabase
        .from('project_collaborators')
        .select('id, project_id, user_id, joined_at')
        .eq('project_id', projectId);

      if (collabsError) throw collabsError;

      const formattedCollabs: ProjectCollaborator[] = [];
      
      if (collabs && collabs.length > 0) {
        for (const collab of collabs) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar, email')
            .eq('id', collab.user_id)
            .single();
            
          if (!profileError && profileData) {
            formattedCollabs.push({
              ...collab,
              user: {
                name: profileData.name,
                avatar: profileData.avatar,
                email: profileData.email
              }
            });
          } else {
            formattedCollabs.push({
              ...collab,
              user: undefined
            });
          }
        }
      }
      
      setCollaborators(formattedCollabs);
      
      if (project?.current_step_id) {
        const { data: assignments, error: assignmentsError } = await supabase
          .from('step_assignments')
          .select('id, step_id, user_id, assigned_at')
          .eq('step_id', project.current_step_id);

        if (assignmentsError) throw assignmentsError;

        const formattedAssignments: StepAssignment[] = [];
        
        if (assignments && assignments.length > 0) {
          for (const assignment of assignments) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar')
              .eq('id', assignment.user_id)
              .single();
              
            if (!profileError && profileData) {
              formattedAssignments.push({
                ...assignment,
                user: {
                  name: profileData.name,
                  avatar: profileData.avatar
                }
              });
            } else {
              formattedAssignments.push({
                ...assignment,
                user: undefined
              });
            }
          }
        }
        
        setStepAssignments(formattedAssignments);
      }
      
      if (project.current_step_id) {
        const currentStep = (steps || []).find(step => step.id === project.current_step_id) || null;
        setCurrentStep(currentStep);
      } else {
        setCurrentStep(null);
      }
      
      console.log('Project details loaded successfully');
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
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log("Creating project with title:", title, "and description:", description);
      
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          owner_id: user.id,
          is_published: false
        })
        .select()
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
        throw projectError;
      }
      
      console.log("Project created successfully:", newProject);
      
      const { data: initialStep, error: stepError } = await supabase
        .from('project_steps')
        .insert({
          project_id: newProject.id,
          title: "Getting Started",
          description: "This is your first project step. You can edit or delete it, and add more steps as needed.",
          is_completed: false,
          order_index: 0,
          parent_step_id: null
        })
        .select()
        .single();
        
      if (stepError) {
        console.warn("Could not create initial step:", stepError);
      } else {
        console.log("Initial step created:", initialStep);
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({ current_step_id: initialStep.id })
          .eq('id', newProject.id);
          
        if (updateError) {
          console.warn("Could not set current step:", updateError);
        }
      }
      
      setProjects(prev => [...prev, newProject]);
      
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

  const publishProject = async (projectId: string, isPublished: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ is_published: isPublished })
        .eq('id', projectId);

      if (updateError) throw updateError;
      
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, is_published: isPublished } 
            : project
        )
      );
      
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, is_published: isPublished } : prev);
      }
      
      toast({
        title: 'Success',
        description: `Project ${isPublished ? 'published' : 'unpublished'} successfully`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      setError(`Failed to ${isPublished ? 'publish' : 'unpublish'} project. Please try again later.`);
      toast({
        title: 'Error',
        description: `Failed to ${isPublished ? 'publish' : 'unpublish'} project. Please try again later.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectData: Partial<Project> & { id: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq('id', projectData.id);

      if (updateError) throw updateError;
      
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

  const createStep = async (data: { title: string; description?: string; parent_step_id?: string | null }): Promise<ProjectStep | null> => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive'
      });
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const existingSteps = projectSteps.filter(s => s.parent_step_id === data.parent_step_id);
      const orderIndex = existingSteps.length > 0 
        ? Math.max(...existingSteps.map(s => s.order_index)) + 1 
        : 0;

      const { data: newStep, error: stepError } = await supabase
        .from('project_steps')
        .insert({
          project_id: currentProject.id,
          title: data.title,
          description: data.description || null,
          is_completed: false,
          order_index: orderIndex,
          parent_step_id: data.parent_step_id || null
        })
        .select()
        .single();

      if (stepError) throw stepError;
      
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
      const { error: updateError } = await supabase
        .from('project_steps')
        .update(data)
        .eq('id', stepId);

      if (updateError) throw updateError;
      
      setProjectSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, ...data } 
            : step
        )
      );
      
      if (currentStep?.id === stepId) {
        setCurrentStep(prev => prev ? { ...prev, ...data } : prev);
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
      
      const { error: deleteError } = await supabase
        .from('project_steps')
        .delete()
        .in('id', allStepIds);

      if (deleteError) throw deleteError;
      
      setProjectSteps(prev => prev.filter(step => !allStepIds.includes(step.id)));
      
      if (allStepIds.includes(currentStep?.id || '')) {
        setCurrentStep(null);
      }
      
      if (currentProject?.current_step_id && allStepIds.includes(currentProject.current_step_id)) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ current_step_id: null })
          .eq('id', currentProject.id);

        if (updateError) throw updateError;
        
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
      const { error: updateError } = await supabase
        .from('project_steps')
        .update({ is_completed: isCompleted })
        .eq('id', stepId);

      if (updateError) throw updateError;
      
      setProjectSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, is_completed: isCompleted } 
            : step
        )
      );
      
      if (currentStep?.id === stepId) {
        setCurrentStep(prev => prev ? { ...prev, is_completed: isCompleted } : prev);
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
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, name, avatar, email')
        .eq('email', email)
        .limit(1);

      if (userError) throw userError;
      
      if (!users || users.length === 0) {
        toast({
          title: 'User not found',
          description: 'No user with that email address was found',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      const user = users[0];
      
      const existingCollaborator = collaborators.find(c => c.user_id === user.id);
      if (existingCollaborator) {
        toast({
          title: 'Already a collaborator',
          description: 'This user is already a collaborator on this project',
          variant: 'default'
        });
        setLoading(false);
        return;
      }
      
      const { data: newCollaborator, error: insertError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: currentProject.id,
          user_id: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      const formattedCollaborator = {
        ...newCollaborator,
        user: {
          name: user.name,
          avatar: user.avatar,
          email: user.email
        }
      };
      
      setCollaborators(prev => [...prev, formattedCollaborator]);
      
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
      
      const { error: deleteError } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (deleteError) throw deleteError;
      
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      
      const assignmentsToRemove = stepAssignments.filter(a => a.user_id === collaboratorToRemove.user_id);
      if (assignmentsToRemove.length > 0) {
        const assignmentIds = assignmentsToRemove.map(a => a.id);
        
        const { error: assignmentError } = await supabase
          .from('step_assignments')
          .delete()
          .in('id', assignmentIds);

        if (assignmentError) throw assignmentError;
        
        setStepAssignments(prev => prev.filter(a => !assignmentIds.includes(a.id)));
      }
      
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
      
      const { data: newAssignment, error: assignError } = await supabase
        .from('step_assignments')
        .insert({
          step_id: stepId,
          user_id: userId
        })
        .select()
        .single();

      if (assignError) throw assignError;
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      
      const formattedAssignment = {
        ...newAssignment,
        user: {
          name: userData.name,
          avatar: userData.avatar
        }
      };
      
      setStepAssignments(prev => [...prev, formattedAssignment]);
      
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
      const { error: deleteError } = await supabase
        .from('step_assignments')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) throw deleteError;
      
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
        publishProject,
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
