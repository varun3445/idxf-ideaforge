import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Layers, Users, Share2, Loader2, Heart, X } from 'lucide-react';
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
import IdxfDialog from '../components/IdxfDialog';

// Custom Share Dialog - Let's use our IdxfDialog for consistent styling
interface ShareProjectProps {
  project: Project | null;
  onCopyLink: () => void;
  onClose: () => void;
  open: boolean;
}
const ShareProjectDialog: React.FC<ShareProjectProps> = ({
  project,
  onCopyLink,
  onClose,
  open
}) => <IdxfDialog open={open} onOpenChange={() => onClose()} title="Share Project" description="Share your project with collaborators or get feedback.">
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-idxf-black/80">
          Project Link
        </label>
        <div className="flex">
          <Input value={`https://ideaforge.app/join-project/${project?.share_code || ''}`} readOnly className="bg-idxf-black/10 border-0 text-idxf-black rounded-lg" />
          <Button variant="black" className="ml-2" onClick={onCopyLink}>
            Copy
          </Button>
        </div>
        <p className="text-xs text-idxf-black/70">
          Anyone with this link can view and request to join your project.
        </p>
      </div>
    </div>
    
    <div className="mt-6 flex justify-end">
      <Button variant="black" onClick={() => onClose()}>
        Done
      </Button>
    </div>
  </IdxfDialog>;
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
  handleShareProject
}) => {
  const navigate = useNavigate();

  // Generate a random progress for design purposes (1-100)
  const randomProgress = Math.floor(Math.random() * 100) + 1;
  const progressClass = randomProgress < 30 ? 'idxf-progress-danger' : randomProgress < 70 ? 'idxf-progress-warning' : 'idxf-progress-success';
  return <Card variant="lime" className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl cursor-pointer font-bold" onClick={() => navigate(`/forge/${project.id}`)}>
            {project.title}
          </CardTitle>
          {project.is_published && <Badge variant="secondary" className="ml-2 shrink-0">
              Published
            </Badge>}
        </div>
        <CardDescription className="line-clamp-2 mt-1 text-idxf-black/70">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-idxf-black/70">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-idxf-black/70">
            <Layers className="mr-1 h-4 w-4" />
            <span>3 steps completed</span>
          </div>
          <div className="flex items-center text-sm text-idxf-black/70">
            <Users className="mr-1 h-4 w-4" />
            <span>{collaboratorCount} {collaboratorCount === 1 ? 'collaborator' : 'collaborators'}</span>
          </div>
          
          <div className="mt-3">
            <div className="text-xs text-idxf-black/70 mb-1">Progress</div>
            <div className="idxf-progress-container">
              <div className={`idxf-progress-bar ${progressClass}`} style={{
              width: `${randomProgress}%`
            }}></div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t border-idxf-black/10">
        <Button variant="black" size="sm" onClick={() => navigate(`/forge/${project.id}`)}>
          Open Project
        </Button>

        {!isOwnedByCurrentUser && <Button variant={isBackingProject ? "secondary" : "outline"} size="sm" onClick={() => toggleBackingProject(project.id)}>
            {isBackingProject ? <>
                <Heart className="mr-1 h-4 w-4 fill-current" /> Backing
              </> : <>
                <Heart className="mr-1 h-4 w-4" /> Back Project
              </>}
          </Button>}

        {isOwnedByCurrentUser && <Button variant="outline" size="sm" onClick={() => handleShareProject(project)} className="text-zinc-950">
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>}
      </CardFooter>
    </Card>;
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
  isSubmitting
}) => <IdxfDialog open={open} onOpenChange={onOpenChange} title="Create new project" description="Add a new project to start collaborating and bringing your ideas to life.">
    <form onSubmit={handleCreateProject}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-idxf-black/80 flex items-center">
            <span className="text-idxf-lime bg-idxf-black rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">*</span>
            Name your idea:
          </label>
          <Input id="title" placeholder="Enter a title for your project" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} required className="bg-idxf-black/10 border-0 placeholder:text-idxf-black/40 text-idxf-black rounded-lg" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-idxf-black/80 flex items-center">
            <span className="text-idxf-lime bg-idxf-black rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">*</span>
            Describe the idea:
          </label>
          <Textarea id="description" placeholder="Describe what your project is about" value={newProjectDescription} onChange={e => setNewProjectDescription(e.target.value)} rows={3} required className="bg-idxf-black/10 border-0 placeholder:text-idxf-black/40 text-idxf-black rounded-lg" />
        </div>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={isSubmitting} variant="black" className="w-full">
          {isSubmitting ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </> : 'Commit now!'}
        </Button>
      </div>
    </form>
  </IdxfDialog>;
const Projects: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
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
  const [backingProjects, setBackingProjects] = useState<{
    [projectId: string]: boolean;
  }>({});
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
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const newProject = createLocalProject(newProjectTitle, newProjectDescription, userId);
      toast({
        title: "Project created",
        description: "Your project has been created successfully."
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
        description: "Failed to create the project. Please try again."
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
        description: "The project link has been copied to your clipboard."
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
  const renderEmptyState = (isOwnedTab: boolean) => <div className="text-center py-10">
      <p className="text-white mb-4">
        {isOwnedTab ? "You haven't created any projects yet." : "You're not collaborating on any projects yet."}
      </p>
      {isOwnedTab && <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Project
        </Button>}
    </div>;
  return <AnimatedTransition>
      <div className="bg-idxf-black min-h-screen text-white pb-24">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Create</h1>
            <div className="text-2xl font-bold tracking-tighter idxf-logo">IDXF</div>
          </div>
          
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="w-full mb-6 bg-idxf-olive/30 p-1 rounded-full">
              <TabsTrigger value="owned" className="w-1/2 data-[state=active]:bg-idxf-lime data-[state=active]:text-idxf-black rounded-full py-3 transition-all">
                Projects you own
              </TabsTrigger>
              <TabsTrigger value="collaborating" className="w-1/2 data-[state=active]:bg-idxf-lime data-[state=active]:text-idxf-black rounded-full py-3 transition-all">
                Collaborating on
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="owned" className="py-4">
              {loading ? <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-idxf-lime" />
                </div> : ownedProjects.length === 0 ? renderEmptyState(true) : <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {ownedProjects.map(project => {
                const isBackingProject = backingProjects[project.id] || false;
                const isOwnedByCurrentUser = project.owner_id === userId;
                const collaboratorCount = Math.floor(Math.random() * 5) + 1; // Random for demo

                return <ProjectCard key={project.id} project={project} isBackingProject={isBackingProject} isOwnedByCurrentUser={isOwnedByCurrentUser} collaboratorCount={collaboratorCount} toggleBackingProject={toggleBackingProject} handleShareProject={handleShareProject} />;
              })}
                </div>}
            </TabsContent>
            
            <TabsContent value="collaborating" className="py-4">
              {loading ? <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-idxf-lime" />
                </div> : collaborativeProjects.length === 0 ? renderEmptyState(false) : <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {collaborativeProjects.map(project => {
                const isBackingProject = backingProjects[project.id] || false;
                const isOwnedByCurrentUser = project.owner_id === userId;
                const collaboratorCount = Math.floor(Math.random() * 5) + 1; // Random for demo

                return <ProjectCard key={project.id} project={project} isBackingProject={isBackingProject} isOwnedByCurrentUser={isOwnedByCurrentUser} collaboratorCount={collaboratorCount} toggleBackingProject={toggleBackingProject} handleShareProject={handleShareProject} />;
              })}
                </div>}
            </TabsContent>
          </Tabs>
          
          <div className="fixed bottom-24 right-0 left-0 flex justify-center">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="text-white rounded-full py-3 px-6 shadow-lg flex items-center font-bold bg-zinc-800 hover:bg-zinc-700">
              Create project <span className="ml-2 text-idxf-lime">✧</span>
            </Button>
          </div>
        </div>
        
        <CreateProjectDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} newProjectTitle={newProjectTitle} newProjectDescription={newProjectDescription} setNewProjectTitle={setNewProjectTitle} setNewProjectDescription={setNewProjectDescription} handleCreateProject={handleCreateProject} isSubmitting={isSubmitting} />

        <ShareProjectDialog open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} project={selectedProject} onCopyLink={handleCopyLink} />
        
        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-idxf-black border-t border-white/10 p-3 flex justify-around">
          <div className="flex flex-col items-center text-xs" onClick={() => navigate('/explore')}>
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Explore</span>
          </div>
          
          <div className="flex flex-col items-center text-xs" onClick={() => navigate('/matches')}>
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Search</span>
          </div>
          
          <div className="flex flex-col items-center text-xs text-idxf-lime">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L10.6412 7.75342L6.75342 10.6412L3 12L6.75342 13.3588L10.6412 16.2466L12 20L13.3588 16.2466L17.2466 13.3588L21 12L17.2466 10.6412L13.3588 7.75342L12 4Z" stroke="#DEFA69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Create</span>
          </div>
          
          <div className="flex flex-col items-center text-xs" onClick={() => navigate('/chat')}>
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span>Chat</span>
          </div>
          
          <div className="flex flex-col items-center text-xs" onClick={() => navigate('/profile-page')}>
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </AnimatedTransition>;
};
export default Projects;
