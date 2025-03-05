
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStep, ProjectCollaborator, QRCodeResponse } from '@/types/project.types';
import { useToast } from '@/components/ui/use-toast';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get projects owned by the current user
  const ownedProjects = useQuery({
    queryKey: ['ownedProjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      return data as Project[];
    },
  });
  
  // Get projects the user is collaborating on
  const collaboratingProjects = useQuery({
    queryKey: ['collaboratingProjects'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('project_id')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data.length === 0) return [];
      
      const projectIds = data.map(item => item.project_id);
      
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .order('updated_at', { ascending: false });
        
      if (projectsError) throw projectsError;
      return projects as Project[];
    },
  });
  
  // Get project steps
  const useProjectSteps = (projectId: string) => {
    return useQuery({
      queryKey: ['projectSteps', projectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true });
          
        if (error) throw error;
        return data as ProjectStep[];
      },
      enabled: !!projectId,
    });
  };
  
  // Get project collaborators
  const useProjectCollaborators = (projectId: string) => {
    return useQuery({
      queryKey: ['projectCollaborators', projectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('project_collaborators')
          .select(`
            *,
            user:user_id (
              name:profiles!profiles(name),
              avatar:profiles!profiles(avatar)
            )
          `)
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        return data.map(collab => ({
          ...collab,
          user: {
            name: collab.user?.[0]?.name || 'Unknown User',
            avatar: collab.user?.[0]?.avatar || null
          }
        })) as ProjectCollaborator[];
      },
      enabled: !!projectId,
    });
  };
  
  // Create a new project
  const createProject = useMutation({
    mutationFn: async (projectData: { title: string; description?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description || null,
          owner_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add a step to a project
  const addProjectStep = useMutation({
    mutationFn: async (stepData: { projectId: string; title: string; description?: string }) => {
      // Get the highest order_index
      const { data: existingSteps, error: stepsError } = await supabase
        .from('project_steps')
        .select('order_index')
        .eq('project_id', stepData.projectId)
        .order('order_index', { ascending: false })
        .limit(1);
        
      if (stepsError) throw stepsError;
      
      const nextOrderIndex = existingSteps.length > 0 ? existingSteps[0].order_index + 1 : 0;
      
      const { data, error } = await supabase
        .from('project_steps')
        .insert({
          project_id: stepData.projectId,
          title: stepData.title,
          description: stepData.description || null,
          order_index: nextOrderIndex
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as ProjectStep;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectSteps', variables.projectId] });
      toast({
        title: "Step added",
        description: "New step has been added to the project.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding step",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update a project step
  const updateProjectStep = useMutation({
    mutationFn: async (stepData: { 
      id: string; 
      title?: string; 
      description?: string; 
      is_completed?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('project_steps')
        .update({
          title: stepData.title,
          description: stepData.description,
          is_completed: stepData.is_completed
        })
        .eq('id', stepData.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as ProjectStep;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectSteps', data.project_id] });
      toast({
        title: "Step updated",
        description: "Project step has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating step",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Generate QR code for a project
  const generateQRCode = async (projectId: string): Promise<QRCodeResponse> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }
    
    const response = await fetch(`${window.location.origin}/api/generate-qr-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      },
      body: JSON.stringify({ projectId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate QR code');
    }
    
    return await response.json();
  };
  
  // Join a project using a share code
  const joinProject = async (shareCode: string): Promise<{ message: string, project: Project }> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }
    
    const response = await fetch(`${window.location.origin}/api/join-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token}`
      },
      body: JSON.stringify({ shareCode })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to join project');
    }
    
    const result = await response.json();
    
    // Refetch after successful join
    queryClient.invalidateQueries({ queryKey: ['collaboratingProjects'] });
    
    return result;
  };
  
  // Add a collaborator to a project directly (by user ID)
  const addCollaborator = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: projectId,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectCollaborators', variables.projectId] });
      toast({
        title: "Collaborator added",
        description: "New collaborator has been added to the project.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding collaborator",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    ownedProjects,
    collaboratingProjects,
    useProjectSteps,
    useProjectCollaborators,
    createProject,
    addProjectStep,
    updateProjectStep,
    generateQRCode,
    joinProject,
    addCollaborator
  };
};
