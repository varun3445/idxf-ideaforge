import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Layers, Users, Share2, Loader2, Heart } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AnimatedTransition from '../components/AnimatedTransition';
import { useToast } from '../hooks/use-toast';
import { useProject, Project } from '../contexts/ProjectContext';
import { useAuth } from '../AuthContext';
import { createLocalProject, debugProjectStorage } from '../utils/projectUtils';

interface ShareProjectProps {
  project: Project;
  onCopyLink: () => void;
  onClose: () => void;
}

const ShareProjectDialog: React.FC<ShareProjectProps> = ({ project, onCopyLink, onClose }) => (
  <Dialog open={!!project} onOpenChange={() => onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share Project</DialogTitle>
        <DialogDescription>
          Share your project with collaborators or get feedback.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Project Link
          </label>
          <div className="flex">
            <Input
              value={`https://ideaforge.app/join-project/${project?.share_code || ''}`}
              readOnly
            />
            <Button
              className="ml-2"
              onClick={onCopyLink}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can view and request to join your project.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button onClick={() => onClose()}>
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface ProjectCardProps {
  project: Project;
  isBackingProject: boolean;
  isOwnedByCurrentUser: boolean;
  collaboratorCount: number;
  toggleBackingProject: (projectId: string) => void;
  handleShareProject: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isBackingProject,
  isOwnedByCurrentUser,
  collaboratorCount,
  toggleBackingProject,
  handleShareProject,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'user-1';

  return (
    <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1 pr-4 cursor-pointer"
            onClick={() => navigate(`/forge/${project.id}`)}>
            {project.title}
          </CardTitle>
          {project.is_published && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              Published
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Layers className="mr-1 h-4 w-4" />
            <span>3 steps completed</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>{collaboratorCount} {collaboratorCount === 1 ? 'collaborator' : 'collaborators'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button variant="outline" size="sm" onClick={() => navigate(`/forge/${project.id}`)}>
          Open Project
        </Button>

        {!isOwnedByCurrentUser && (
          <Button
            variant={isBackingProject ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleBackingProject(project.id)}
          >
            {isBackingProject ? (
              <>
                <Heart className="mr-1 h-4 w-4 fill-current" /> Backing
              </>
            ) : (
              <>
                <Heart className="mr-1 h-4 w-4" /> Back Project
              </>
            )}
          </Button>
        )}

        {isOwnedByCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShareProject(project)}
          >
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProjectTitle: string;
  newProjectDescription: string;
  setNewProjectTitle: (title: string) => void;
  setNewProjectDescription: (description: string) => void;
  handleCreateProject: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  newProjectTitle,
  newProjectDescription,
  setNewProjectTitle,
  setNewProjectDescription,
  handleCreateProject,
  isSubmitting,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Add a new project to start collaborating and bringing your ideas to life.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleCreateProject}>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title
            </label>
            <Input
              id="title"
              placeholder="Enter a title for your project"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Project Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe what your project is about"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

interface ProjectShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  shareCode: string;
}

const ProjectShareDialog: React.FC<ProjectShareDialogProps> = ({ open, onOpenChange, projectTitle, shareCode }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share Project</DialogTitle>
        <DialogDescription>
          Share your project with collaborators or get feedback.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Project Link
          </label>
          <div className="flex">
            <Input
              value={`https://ideaforge.app/join-project/${shareCode}`}
              readOnly
            />
            <Button 
              className="ml-2"
              onClick={() => {
                if (shareCode) {
                  navigator.clipboard.writeText(`https://ideaforge.app/join-project/${shareCode}`);
                  toast({
                    title: "Link copied",
                    description: "The project link has been copied to your clipboard.",
                  });
                  setIsShareDialogOpen(false);
                }
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can view and request to join your project.
          </p>
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button onClick={() => setIsShareDialogOpen(false)}>
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'user-1';
  
  const { 
    projects,
    loading,
    error,
    createProject,
    loadUserProjects,
    toggleBackingProject,
    getBackingProjects
  } = useProject();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backingProjects, setBackingProjects] = useState<{ [projectId: string]: boolean }>({});
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    loadUserProjects();
    console.log("Loading user projects in Projects.tsx");
    debugProjectStorage();
  }, [loadUserProjects]);
  
  useEffect(() => {
    const fetchBackingProjects = async () => {
      const backedProjects = getBackingProjects();
      setBackingProjects(backedProjects);
      console.log("Backing projects:", backedProjects);
    };
    fetchBackingProjects();
  }, [getBackingProjects]);
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectTitle.trim() || !newProjectDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newProject = createLocalProject(newProjectTitle, newProjectDescription, userId);
      
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      
      setIsCreateDialogOpen(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      
      loadUserProjects();
      
      debugProjectStorage();
    } catch (error) {
      console.error("Failed to create project", error);
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: "Failed to create the project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleShareProject = (project: Project) => {
    setSelectedProject(project);
    setIsShareDialogOpen(true);
  };
  
  const handleCopyLink = () => {
    if (selectedProject?.share_code) {
      navigator.clipboard.writeText(`https://ideaforge.app/join-project/${selectedProject.share_code}`);
      toast({
        title: "Link copied",
        description: "The project link has been copied to your clipboard.",
      });
      setIsShareDialogOpen(false);
    }
  };
  
  const ownedProjects = projects.filter(p => p.owner_id === userId);
  const collaborativeProjects = projects.filter(p => p.owner_id !== userId);
  
  console.log("Current user ID:", userId);
  console.log("All projects:", projects);
  console.log("Owned projects:", ownedProjects);
  console.log("Collaborative projects:", collaborativeProjects);
  
  const renderProjectsGrid = (projectsList: Project[]) => {
    if (projectsList.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {projectsList === ownedProjects 
              ? "You haven't created any projects yet." 
              : "You're not collaborating on any projects yet."}
          </p>
          {projectsList === ownedProjects && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create New Project
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projectsList.map((project) => {
          const isBackingProject = backingProjects[project.id] || false;
          
          const isOwnedByCurrentUser = project.owner_id === userId;
          const collaboratorCount = isOwnedByCurrentUser ? 1 : 3;
          
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl line-clamp-1 pr-4 cursor-pointer" 
                    onClick={() => navigate(`/forge/${project.id}`)}>
                    {project.title}
                  </CardTitle>
                  {project.is_published && (
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      Published
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Layers className="mr-1 h-4 w-4" />
                    <span>3 steps completed</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{collaboratorCount} {collaboratorCount === 1 ? 'collaborator' : 'collaborators'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => navigate(`/forge/${project.id}`)}>
                  Open Project
                </Button>
                
                {!isOwnedByCurrentUser && (
                  <Button 
                    variant={isBackingProject ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => toggleBackingProject(project.id)}
                  >
                    {isBackingProject ? (
                      <>
                        <Heart className="mr-1 h-4 w-4 fill-current" /> Backing
                      </>
                    ) : (
                      <>
                        <Heart className="mr-1 h-4 w-4" /> Back Project
                      </>
                    )}
                  </Button>
                )}
                
                {isOwnedByCurrentUser && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareProject(project)}
                  >
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-playfair">Your Projects</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
        
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="owned" className="flex-1">Your Projects</TabsTrigger>
            <TabsTrigger value="collaborating" className="flex-1">Collaborating</TabsTrigger>
          </TabsList>
          
          <TabsContent value="owned" className="py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ownedProjects.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any projects yet.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create New Project
                    </Button>
                  </div>
                ) : (
                  ownedProjects.map((project) => {
                    const isBackingProject = backingProjects[project.id] || false;
                    const isOwnedByCurrentUser = project.owner_id === userId;
                    const collaboratorCount = 1;
                    
                    return (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isBackingProject={isBackingProject}
                        isOwnedByCurrentUser={isOwnedByCurrentUser}
                        collaboratorCount={collaboratorCount}
                        toggleBackingProject={toggleBackingProject}
                        handleShareProject={handleShareProject}
                      />
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="collaborating" className="py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collaborativeProjects.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      You're not collaborating on any projects yet.
                    </p>
                  </div>
                ) : (
                  collaborativeProjects.map((project) => {
                    const isBackingProject = backingProjects[project.id] || false;
                    const isOwnedByCurrentUser = project.owner_id === userId;
                    const collaboratorCount = 3;
                    
                    return (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isBackingProject={isBackingProject}
                        isOwnedByCurrentUser={isOwnedByCurrentUser}
                        collaboratorCount={collaboratorCount}
                        toggleBackingProject={toggleBackingProject}
                        handleShareProject={handleShareProject}
                      />
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          newProjectTitle={newProjectTitle}
          newProjectDescription={newProjectDescription}
          setNewProjectTitle={setNewProjectTitle}
          setNewProjectDescription={setNewProjectDescription}
          handleCreateProject={handleCreateProject}
          isSubmitting={isSubmitting}
        />

        {selectedProject && (
          <ProjectShareDialog 
            open={isShareDialogOpen} 
            onOpenChange={setIsShareDialogOpen} 
            projectTitle={selectedProject.title} 
            shareCode={selectedProject.share_code} 
          />
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Projects;
