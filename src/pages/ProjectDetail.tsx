
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Link2, CheckCircle, XCircle, Users, Heart, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useProject, ProjectProvider, Project } from '../contexts/ProjectContext';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';

const ProjectDetailContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loadProjects } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  
  useEffect(() => {
    const loadProject = async () => {
      await loadProjects();
      setLoading(false);
    };
    
    loadProject();
  }, [loadProjects]);
  
  useEffect(() => {
    if (!loading && id) {
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
      }
    }
  }, [projects, id, loading]);
  
  const handleBack = () => {
    navigate('/explore');
  };
  
  const handleJoinWaitlist = () => {
    setHasJoinedWaitlist(true);
    toast({
      title: "Waitlist Request Sent",
      description: "The project owner will be notified of your interest.",
    });
  };
  
  const handleJoinProject = () => {
    navigate(`/join-project/${project?.share_code}`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => navigate('/explore')}>
              Explore Other Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const createdDate = new Date(project.created_at);
  
  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Explore
      </Button>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Created {format(createdDate, 'MMMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!hasJoinedWaitlist ? (
              <Button onClick={handleJoinWaitlist}>
                <Clock className="mr-2 h-4 w-4" />
                Join Waitlist
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                On Waitlist
              </Button>
            )}
            
            <Button onClick={handleJoinProject} variant="default">
              <Link2 className="mr-2 h-4 w-4" />
              Join with Code
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">{project.overview || project.description}</p>
              </CardContent>
            </Card>
            
            {(project.goals || project.challenges) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.goals && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{project.goals}</p>
                    </CardContent>
                  </Card>
                )}
                
                {project.challenges && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Challenges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{project.challenges}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Team Size</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>3 members</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Supporters</span>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{project.backers_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {project.skills && project.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">Project Owner</div>
                    <div className="text-sm text-muted-foreground">Owner</div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4" />
                  <span className="ml-2">View All Team Members</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailWithProvider: React.FC = () => {
  return (
    <AnimatedTransition>
      <ProjectProvider>
        <ProjectDetailContent />
      </ProjectProvider>
    </AnimatedTransition>
  );
};

export default ProjectDetailWithProvider;
