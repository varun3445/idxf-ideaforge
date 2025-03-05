
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/AuthContext';
import { type Project, type ProjectStep, type ProjectCollaborator } from '@/types/project.types';

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get projects owned by the current user
  const ownedProjects = useQuery({
    queryKey: ['ownedProjects'],
    queryFn: async () => {
      console.log('Fetching owned projects for user ID:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID found, skipping query');
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching owned projects:', error);
        throw error;
      }

      console.log('Fetched owned projects:', data);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get projects the current user is collaborating on
  const collaboratingProjects = useQuery({
    queryKey: ['collaboratingProjects'],
    queryFn: async () => {
      console.log('Fetching collaborating projects for user ID:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID found, skipping query');
        return [];
      }

      const { data: collaborations, error: collaborationsError } = await supabase
        .from('project_collaborators')
        .select('project_id')
        .eq('user_id', user.id);

      if (collaborationsError) {
        console.error('Error fetching collaborations:', collaborationsError);
        throw collaborationsError;
      }

      if (!collaborations || collaborations.length === 0) {
        console.log('No collaborations found');
        return [];
      }

      const projectIds = collaborations.map(collab => collab.project_id);
      console.log('Project IDs the user is collaborating on:', projectIds);

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching collaborating projects:', projectsError);
        throw projectsError;
      }

      console.log('Fetched collaborating projects:', projects);
      return projects || [];
    },
    enabled: !!user?.id,
  });

  // Get collaborators for a specific project
  const useProjectCollaborators = (projectId: string) => {
    return useQuery({
      queryKey: ['projectCollaborators', projectId],
      queryFn: async () => {
        console.log('Fetching collaborators for project ID:', projectId);
        
        if (!projectId) {
          console.log('No project ID provided, skipping query');
          return [];
        }

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
          console.log('No collaborators found for project');
          return [];
        }

        console.log('Raw collaborator records:', collaborators);

        // Then for each collaborator, fetch their profile information
        const collaboratorsWithProfiles = await Promise.all(
          collaborators.map(async (collaborator) => {
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
          })
        );

        console.log('Collaborators with profiles:', collaboratorsWithProfiles);
        return collaboratorsWithProfiles;
      },
      enabled: !!projectId,
    });
  };

  // Get steps for a specific project
  const useProjectSteps = (projectId: string) => {
    return useQuery({
      queryKey: ['projectSteps', projectId],
      queryFn: async () => {
        console.log('Fetching steps for project ID:', projectId);
        
        if (!projectId) {
          console.log('No project ID provided, skipping query');
          return [];
        }

        const { data, error } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .order('position');

        if (error) {
          console.error('Error fetching project steps:', error);
          throw error;
        }

        console.log('Fetched project steps:', data);
        return data || [];
      },
      enabled: !!projectId,
    });
  };

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newProject = {
        ...projectData,
        id: uuidv4(),
        owner_id: user.id,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      return data;
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
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get the current highest position
      const { data: steps, error: stepsError } = await supabase
        .from('project_steps')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);

      if (stepsError) {
        throw stepsError;
      }

      const position = steps && steps.length > 0 ? steps[0].position + 1 : 0;

      const newStep = {
        id: uuidv4(),
        project_id: projectId,
        title,
        description: description || '',
        is_completed: false,
        position,
        created_by: user.id,
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

      return data;
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

  // Toggle step completion status
  const toggleStepCompletion = useMutation({
    mutationFn: async ({ step, isCompleted }: { step: ProjectStep; isCompleted: boolean }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

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

      return data;
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

  // Use this hook in other components
  return {
    ownedProjects,
    collaboratingProjects,
    useProjectCollaborators,
    useProjectSteps,
    createProject,
    addProjectStep,
    toggleStepCompletion,
  };
};
