
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Users, Loader2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

const JoinProject = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loadProjects } = useProject();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const findProject = async () => {
      setLoading(true);
      try {
        // Ensure projects are loaded
        await loadProjects();
        
        // Find the project with the matching share code
        const foundProject = projects.find(p => p.share_code === shareCode);
        setProject(foundProject || null);
      } catch (error) {
        console.error('Error finding project:', error);
        toast({
          title: 'Error',
          description: 'Could not find the project. The link may be invalid or expired.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (shareCode) {
      findProject();
    }
  }, [shareCode, loadProjects, projects]);

  const handleJoinProject = async () => {
    if (!project) return;
    
    setJoining(true);
    
    try {
      // In a real app, this would call an API to add the current user as a collaborator
      // For now, we'll simulate success and navigate to the project
      
      setTimeout(() => {
        toast({
          title: 'Success!',
          description: `You've joined "${project.title}" as a collaborator`,
        });
        
        navigate(`/forge/${project.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error joining project:', error);
      toast({
        title: 'Error',
        description: 'Could not join the project. Please try again later.',
        variant: 'destructive'
      });
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <AnimatedTransition>
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </AnimatedTransition>
    );
  }

  if (!project) {
    return (
      <AnimatedTransition>
        <div className="container mx-auto max-w-md pt-24 px-4">
          <Card className="border-3 border-border/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Project Not Found</CardTitle>
              <CardDescription className="text-center">
                The project you're looking for doesn't exist or the invitation link is invalid.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button onClick={() => navigate('/projects')}>
                Go to Projects
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AnimatedTransition>
    );
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto max-w-md pt-24 px-4">
        <Card className="border-3 border-border/40 shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-center">Join and Collaborate</CardTitle>
            <CardDescription className="text-center">
              You're invited to collaborate on this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{project.title}</h3>
                {project.description && (
                  <p className="text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button onClick={handleJoinProject} disabled={joining} className="w-full">
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Project'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AnimatedTransition>
  );
};

export default JoinProject;
