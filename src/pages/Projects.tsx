
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Layers, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProject, ProjectProvider, Project } from '../contexts/ProjectContext';
import { format } from 'date-fns';
import ProjectShareDialog from '@/components/ProjectShareDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject, loading } = useProject();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    const newProject = await createProject(title.trim(), description.trim());
    if (newProject) {
      setTitle('');
      setDescription('');
      setCreateDialogOpen(false);
      navigate(`/forge/${newProject.id}`);
    }
  };

  const handleShareProject = (project: Project) => {
    setSelectedProject(project);
    setShareDialogOpen(true);
  };

  // Divide projects into owned and collaborations
  const ownedProjects = projects.filter(p => p.owner_id === 'user-1'); // Update with real auth user id when ready
  const collaborativeProjects = projects.filter(p => p.owner_id !== 'user-1'); // Update with real auth user id when ready
  
  const renderProjectsGrid = (projectsList: Project[]) => {
    if (projectsList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-center text-gray-500 mb-6 max-w-md">
              {projectsList === ownedProjects 
                ? "Start your first project to collaborate with others and track progress" 
                : "You haven't been added to any projects as a collaborator yet"}
            </p>
            {projectsList === ownedProjects && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsList.map(project => {
          const createdDate = new Date(project.created_at);
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="cursor-pointer" onClick={() => navigate(`/forge/${project.id}`)}>
                <CardTitle className="text-xl">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="cursor-pointer" onClick={() => navigate(`/forge/${project.id}`)}>
                <p className="text-gray-600 line-clamp-3">{project.description}</p>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(createdDate, 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    3 collaborators
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareProject(project);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-2">Manage and collaborate on your projects</p>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="owned">Projects You Own</TabsTrigger>
            <TabsTrigger value="collaborating">Collaborating On</TabsTrigger>
          </TabsList>
          <TabsContent value="owned" className="mt-0">
            {renderProjectsGrid(ownedProjects)}
          </TabsContent>
          <TabsContent value="collaborating" className="mt-0">
            {renderProjectsGrid(collaborativeProjects)}
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input 
                id="project-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optional)</Label>
              <Textarea 
                id="project-description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {selectedProject && (
        <ProjectShareDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen} 
          projectTitle={selectedProject.title}
          shareCode={selectedProject.share_code}
        />
      )}
    </div>
  );
};

const ProjectsWithProvider: React.FC = () => {
  return (
    <AnimatedTransition>
      <ProjectProvider>
        <ProjectsList />
      </ProjectProvider>
    </AnimatedTransition>
  );
};

export default ProjectsWithProvider;
