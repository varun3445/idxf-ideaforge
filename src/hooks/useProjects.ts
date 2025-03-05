
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/AuthContext';
import { type Project, type ProjectStep, type ProjectCollaborator, type QRCodeResponse, type JoinProjectResponse } from '@/types/project.types';

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Debug logging function
  const logDebug = (message: string, data?: any) => {
    console.log(`[useProjects] ${message}`, data || '');
  };

  // Get projects owned by the current user
  const ownedProjects = useQuery({
    queryKey: ['ownedProjects'],
    queryFn: async () => {
      logDebug('Fetching owned projects for user ID:', user?.id);
      
      if (!user?.id) {
        logDebug('No user ID found, skipping query');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching owned projects:', error);
          throw error;
        }

        logDebug('Fetched owned projects:', data);
        return data || [];
      } catch (err) {
        console.error('Failed to fetch owned projects:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Get projects the current user is collaborating on
  const collaboratingProjects = useQuery({
    queryKey: ['collaboratingProjects'],
    queryFn: async () => {
      logDebug('Fetching collaborating projects for user ID:', user?.id);
      
      if (!user?.id) {
        logDebug('No user ID found, skipping query');
        return [];
      }

      try {
        const { data: collaborations, error: collaborationsError } = await supabase
          .from('project_collaborators')
          .select('project_id')
          .eq('user_id', user.id);

        if (collaborationsError) {
          console.error('Error fetching collaborations:', collaborationsError);
          throw collaborationsError;
        }

        if (!collaborations || collaborations.length === 0) {
          logDebug('No collaborations found');
          return [];
        }

        const projectIds = collaborations.map(collab => collab.project_id);
        logDebug('Project IDs the user is collaborating on:', projectIds);

        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds)
          .order('updated_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching collaborating projects:', projectsError);
          throw projectsError;
        }

        logDebug('Fetched collaborating projects:', projects);
        return projects || [];
      } catch (err) {
        console.error('Failed to fetch collaborating projects:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Get collaborators for a specific project
  const useProjectCollaborators = (projectId: string) => {
    return useQuery({
      queryKey: ['projectCollaborators', projectId],
      queryFn: async () => {
        logDebug('Fetching collaborators for project ID:', projectId);
        
        if (!projectId) {
          logDebug('No project ID provided, skipping query');
          return [];
        }

        try {
          // First get the collaborator records
          const { data: collaborators, error: collaboratorsError } = await supabase
            .from('project_collaborators')
            .select('*')
            .eq('project_id', projectId);

          if (collaboratorsError) {
            console.error('Error fetching collaborators:', collaboratorsError);
            throw collaboratorsError;
          }

          if (!collaborators || collaborators.length === 0) {
            logDebug('No collaborators found for project');
            return [];
          }

          logDebug('Raw collaborator records:', collaborators);

          // Then for each collaborator, fetch their profile information
          const collaboratorsWithProfiles = await Promise.all(
            collaborators.map(async (collaborator) => {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', collaborator.user_id)
                  .single();

                if (profileError) {
                  console.error('Error fetching profile for user:', collaborator.user_id, profileError);
                  // Return collaborator with empty user object if profile fetch fails
                  return {
                    ...collaborator,
                    user: { name: 'Unknown User', avatar: null }
                  };
                }

                return {
                  ...collaborator,
                  user: profileData
                };
              } catch (err) {
                console.error('Failed to fetch profile for user:', collaborator.user_id, err);
                return {
                  ...collaborator,
                  user: { name: 'Unknown User', avatar: null }
                };
              }
            })
          );

          logDebug('Collaborators with profiles:', collaboratorsWithProfiles);
          return collaboratorsWithProfiles;
        } catch (err) {
          console.error('Failed to fetch project collaborators:', err);
          throw err;
        }
      },
      enabled: !!projectId,
      retry: 1,
    });
  };

  // Get steps for a specific project
  const useProjectSteps = (projectId: string) => {
    return useQuery({
      queryKey: ['projectSteps', projectId],
      queryFn: async () => {
        logDebug('Fetching steps for project ID:', projectId);
        
        if (!projectId) {
          logDebug('No project ID provided, skipping query');
          return [];
        }

        try {
          const { data, error } = await supabase
            .from('project_steps')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

          if (error) {
            console.error('Error fetching project steps:', error);
            throw error;
          }

          logDebug('Fetched project steps:', data);
          return data || [];
        } catch (err) {
          console.error('Failed to fetch project steps:', err);
          throw err;
        }
      },
      enabled: !!projectId,
      retry: 1,
    });
  };

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      logDebug('Creating new project with data:', projectData);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newProject = {
        ...projectData,
        id: uuidv4(),
        owner_id: user.id,
        share_code: null
      };

      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([newProject])
          .select()
          .single();

        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }

        logDebug('Project created successfully:', data);
        return data;
      } catch (err) {
        console.error('Failed to create project:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Project creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Add a step to a project
  const addProjectStep = useMutation({
    mutationFn: async ({ 
      projectId, 
      title, 
      description 
    }: { 
      projectId: string; 
      title: string; 
      description?: string;
    }) => {
      logDebug('Adding step to project ID:', projectId);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        // Get the current highest order_index
        const { data: steps, error: stepsError } = await supabase
          .from('project_steps')
          .select('order_index')
          .eq('project_id', projectId)
          .order('order_index', { ascending: false })
          .limit(1);

        if (stepsError) {
          throw stepsError;
        }

        const order_index = steps && steps.length > 0 ? steps[0].order_index + 1 : 0;

        const newStep = {
          id: uuidv4(),
          project_id: projectId,
          title,
          description: description || null,
          is_completed: false,
          order_index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('project_steps')
          .insert([newStep])
          .select()
          .single();

        if (error) {
          console.error('Error adding project step:', error);
          throw error;
        }

        // Update the project's updated_at field
        await supabase
          .from('projects')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', projectId);

        logDebug('Step added successfully:', data);
        return data;
      } catch (err) {
        console.error('Failed to add project step:', err);
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectSteps', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratingProjects'] });
      toast({
        title: 'Step added',
        description: 'The step has been added to your project.',
      });
    },
    onError: (error) => {
      console.error('Step addition error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add step. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update a project step
  const updateProjectStep = useMutation({
    mutationFn: async ({
      id,
      is_completed
    }: {
      id: string;
      is_completed: boolean;
    }) => {
      logDebug('Updating step ID:', id);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const { data, error } = await supabase
          .from('project_steps')
          .update({ is_completed })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating project step:', error);
          throw error;
        }

        // Update the project's updated_at field
        await supabase
          .from('projects')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', data.project_id);

        logDebug('Step updated successfully:', data);
        return data;
      } catch (err) {
        console.error('Failed to update project step:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectSteps', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratingProjects'] });
      toast({
        title: data.is_completed ? 'Step completed' : 'Step marked as incomplete',
        description: data.is_completed 
          ? 'Great job! The step has been marked as complete.' 
          : 'The step has been marked as incomplete.',
      });
    },
    onError: (error) => {
      console.error('Step update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle step completion status
  const toggleStepCompletion = useMutation({
    mutationFn: async ({ step, isCompleted }: { step: ProjectStep; isCompleted: boolean }) => {
      logDebug('Toggling step completion, ID:', step.id);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const { data, error } = await supabase
          .from('project_steps')
          .update({ is_completed: isCompleted })
          .eq('id', step.id)
          .select()
          .single();

        if (error) {
          console.error('Error toggling step completion:', error);
          throw error;
        }

        // Update the project's updated_at field
        await supabase
          .from('projects')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', step.project_id);

        logDebug('Step toggled successfully:', data);
        return data;
      } catch (err) {
        console.error('Failed to toggle step completion:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectSteps', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratingProjects'] });
      toast({
        title: data.is_completed ? 'Step completed' : 'Step marked as incomplete',
        description: data.is_completed 
          ? 'Great job! The step has been marked as complete.' 
          : 'The step has been marked as incomplete.',
      });
    },
    onError: (error) => {
      console.error('Step toggle error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Generate QR code for project sharing
  const generateQRCode = async (projectId: string): Promise<QRCodeResponse> => {
    logDebug('Generating QR code for project ID:', projectId);
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { projectId },
      });

      if (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
      }

      logDebug('QR code generated successfully:', data);
      return data as QRCodeResponse;
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      throw err;
    }
  };

  // Join a project using a share code
  const joinProject = async (shareCode: string): Promise<JoinProjectResponse> => {
    logDebug('Joining project with share code:', shareCode);
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('join-project', {
        body: { shareCode, userId: user.id },
      });

      if (error) {
        console.error('Error joining project:', error);
        throw new Error('Failed to join project');
      }

      // Invalidate queries to refresh project lists
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratingProjects'] });

      logDebug('Project joined successfully:', data);
      return data as JoinProjectResponse;
    } catch (err) {
      console.error('Failed to join project:', err);
      throw err;
    }
  };

  return {
    ownedProjects,
    collaboratingProjects,
    useProjectCollaborators,
    useProjectSteps,
    createProject,
    addProjectStep,
    updateProjectStep,
    toggleStepCompletion,
    generateQRCode,
    joinProject
  };
};
