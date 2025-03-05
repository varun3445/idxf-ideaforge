import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Plus, Share2, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedTransition from '@/components/AnimatedTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/AuthContext';
import ProjectStepCard from '@/components/ProjectStepCard';
import AddStepDialog from '@/components/AddStepDialog';
import { ShareProjectDialog } from '@/components/ShareProjectDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!id) {
      navigate('/forge');
    }
  }, [id, navigate]);
  
  const projectId = id || '';
  
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
  
  const { data: steps, isLoading: isStepsLoading } = useProjects().useProjectSteps(projectId);
  const { data: collaborators, isLoading: isCollaboratorsLoading } = useProjects().useProjectCollaborators(projectId);
  
  const isOwner = project?.owner_id === user?.id;
  const completedSteps = steps?.filter(step => step.is_completed)?.length || 0;
  const totalSteps = steps?.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  if (isProjectLoading || isStepsLoading || isCollaboratorsLoading) {
    return (
      <div className="page-container flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-xl">Loading project details...</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-8">The project you're looking for doesn't exist or may have been removed.</p>
          <Link to="/forge">
            <Button>Return to Forge</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="w-full flex justify-start mb-8">
          <Link to="/forge" className="inline-flex items-center gap-2 text-black hover:underline">
            <ArrowLeft size={18} />
            <span>Back to Forge</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar size={16} className="mr-1" />
                  <span>Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
                
                {isOwner && (
                  <Button
                    onClick={() => setIsAddStepDialogOpen(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Step
                  </Button>
                )}
              </div>
            </div>
            
            {project.description && (
              <p className="text-muted-foreground mb-8 text-left">{project.description}</p>
            )}
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Progress: {completedSteps} of {totalSteps} steps complete
                </h2>
                <span className="text-lg font-medium">{progress}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-4 mb-6">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold mb-4">Steps</h2>
              
              {steps && steps.length > 0 ? (
                steps.map((step) => (
                  <ProjectStepCard 
                    key={step.id} 
                    step={step}
                    isOwner={isOwner}
                  />
                ))
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-2">No steps added yet</h3>
                  {isOwner ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        Add steps to track progress on your project
                      </p>
                      <Button
                        onClick={() => setIsAddStepDialogOpen(true)}
                      >
                        <Plus size={16} className="mr-2" />
                        Add First Step
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      The project owner has not added any steps yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <GlassmorphicCard className="sticky top-24">
              <h3 className="text-xl font-semibold mb-6">Project Members</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-left">{user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground text-left">Owner</p>
                    </div>
                  </div>
                </div>
                
                {collaborators && collaborators.length > 0 && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Collaborators ({collaborators.length})
                    </h4>
                    
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.user?.avatar || undefined} alt={collaborator.user?.name || 'User'} />
                          <AvatarFallback>{collaborator.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-left">{collaborator.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground text-left">
                            Joined {format(new Date(collaborator.joined_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-6 border-t border-border">
                  <Button 
                    onClick={() => setIsShareDialogOpen(true)}
                    className="w-full"
                  >
                    <Users size={16} className="mr-2" />
                    {isOwner ? 'Invite Collaborators' : 'Share Project'}
                  </Button>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
        
        {isAddStepDialogOpen && (
          <AddStepDialog
            projectId={projectId}
            open={isAddStepDialogOpen}
            onOpenChange={setIsAddStepDialogOpen}
          />
        )}
        
        {isShareDialogOpen && (
          <ShareProjectDialog
            project={project}
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
          />
        )}
      </div>
    </AnimatedTransition>
  );
};

export default ProjectDetail;
