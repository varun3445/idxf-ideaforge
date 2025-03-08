import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Layers, Users, Share2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProject, ProjectProvider, Project } from '../contexts/ProjectContext';
import { format } from 'date-fns';
import ProjectShareDialog from '@/components/ProjectShareDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuggestedStep {
  title: string;
  description: string;
}

interface SuggestedRole {
  title: string;
  description: string;
}

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject, loading } = useProject();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedSteps, setSuggestedSteps] = useState<SuggestedStep[]>([]);
  const [suggestedRoles, setSuggestedRoles] = useState<SuggestedRole[]>([]);
  const [isSuggestingSteps, setIsSuggestingSteps] = useState(false);
  const [isSuggestingRoles, setIsSuggestingRoles] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const validateForm = () => {
    setFormSubmitted(true);
    return title.trim() !== '' && description.trim() !== '';
  };
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newProject = await createProject(title.trim(), description.trim(), suggestedSteps);
    if (newProject) {
      setTitle('');
      setDescription('');
      setSuggestedSteps([]);
      setSuggestedRoles([]);
      setFormSubmitted(false);
      setCreateDialogOpen(false);
      navigate(`/forge/${newProject.id}`);
    }
  };

  const handleShareProject = (project: Project) => {
    setSelectedProject(project);
    setShareDialogOpen(true);
  };

  const handleSuggestSteps = async () => {
    if (!validateForm()) {
      toast({
        title: "Required fields missing",
        description: "Please provide both a project title and description",
        variant: "destructive"
      });
      return;
    }
    
    setIsSuggestingSteps(true);
    setSuggestedSteps([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('project-ai-assistant', {
        body: { 
          action: 'suggestSteps',
          projectInfo: {
            title,
            description
          }
        }
      });
      
      if (error) throw error;
      
      // Parse the AI response - simple parsing assuming a formatted list
      const content = data.result;
      const steps: SuggestedStep[] = [];
      
      // Simple parsing of the OpenAI response
      const lines = content.split('\n');
      let currentStep: Partial<SuggestedStep> = {};
      
      for (const line of lines) {
        if (line.match(/^\d+\.\s+/) || line.match(/^Step \d+:/)) { // New step
          const titleMatch = line.match(/^\d+\.\s+(.*)/i) || line.match(/^Step \d+:\s+(.*)/i);
          if (titleMatch && currentStep.title) {
            steps.push(currentStep as SuggestedStep);
            currentStep = {};
          }
          if (titleMatch) {
            currentStep.title = titleMatch[1].trim();
          }
        } else if (currentStep.title && !currentStep.description && line.trim()) {
          currentStep.description = line.trim();
        }
      }
      
      // Add the last step if it exists
      if (currentStep.title && currentStep.description) {
        steps.push(currentStep as SuggestedStep);
      }
      
      setSuggestedSteps(steps);
      
      toast({
        title: "Steps suggested!",
        description: "AI has generated project steps based on your project details",
      });
    } catch (error) {
      console.error('Error suggesting steps:', error);
      toast({
        title: "Suggestion failed",
        description: "Failed to generate steps. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSuggestingSteps(false);
    }
  };

  const handleSuggestTeam = async () => {
    if (!validateForm()) {
      toast({
        title: "Required fields missing",
        description: "Please provide both a project title and description",
        variant: "destructive"
      });
      return;
    }
    
    setIsSuggestingRoles(true);
    setSuggestedRoles([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('project-ai-assistant', {
        body: { 
          action: 'suggestTeam',
          projectInfo: {
            title,
            description
          }
        }
      });
      
      if (error) throw error;
      
      // Parse the AI response
      const content = data.result;
      const roles: SuggestedRole[] = [];
      
      // Simple parsing of the OpenAI response
      const lines = content.split('\n');
      let currentRole: Partial<SuggestedRole> = {};
      
      for (const line of lines) {
        if (line.match(/^\d+\.\s+/) || line.match(/^Role \d+:/)) { // New role
          const titleMatch = line.match(/^\d+\.\s+(.*?):/i) || line.match(/^Role \d+:\s+(.*?):/i);
          if (titleMatch && currentRole.title) {
            roles.push(currentRole as SuggestedRole);
            currentRole = {};
          }
          if (titleMatch) {
            currentRole.title = titleMatch[1].trim();
            // Get description if it's on the same line after the colon
            const descMatch = line.match(/^.*?:(.*)/);
            if (descMatch) {
              currentRole.description = descMatch[1].trim();
            }
          }
        } else if (currentRole.title && !currentRole.description && line.trim()) {
          currentRole.description = line.trim();
        }
      }
      
      // Add the last role if it exists
      if (currentRole.title && currentRole.description) {
        roles.push(currentRole as SuggestedRole);
      }
      
      setSuggestedRoles(roles);
      
      toast({
        title: "Team suggested!",
        description: "AI has generated team roles based on your project details",
      });
    } catch (error) {
      console.error('Error suggesting team roles:', error);
      toast({
        title: "Suggestion failed",
        description: "Failed to generate team roles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSuggestingRoles(false);
    }
  };

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="project-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter project title"
                className={formSubmitted && !title.trim() ? "border-red-500" : ""}
                required
              />
              {formSubmitted && !title.trim() && (
                <p className="text-red-500 text-sm mt-1">Project title is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                id="project-description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter project description"
                className={formSubmitted && !description.trim() ? "border-red-500" : ""}
                rows={4}
                required
              />
              {formSubmitted && !description.trim() && (
                <p className="text-red-500 text-sm mt-1">Project description is required</p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 py-3">
              <Button 
                type="button" 
                variant="secondary"
                className="flex-1"
                onClick={handleSuggestSteps}
                disabled={isSuggestingSteps}
              >
                {isSuggestingSteps ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isSuggestingSteps ? "Generating..." : "Suggest Project Steps"}
              </Button>
              
              <Button 
                type="button" 
                variant="secondary"
                className="flex-1"
                onClick={handleSuggestTeam}
                disabled={isSuggestingRoles}
              >
                {isSuggestingRoles ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                {isSuggestingRoles ? "Generating..." : "Suggest Team Roles"}
              </Button>
            </div>
            
            {suggestedSteps.length > 0 && (
              <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50 shadow-sm">
                <h3 className="font-semibold text-md flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Suggested Project Steps
                </h3>
                <div className="space-y-2">
                  {suggestedSteps.map((step, index) => (
                    <Card key={index} className="bg-white">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">
                  These steps will be automatically added when you create the project.
                </p>
              </div>
            )}
            
            {suggestedRoles.length > 0 && (
              <div className="space-y-3 mt-4 border rounded-md p-4 bg-gray-50 shadow-sm">
                <h3 className="font-semibold text-md flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Suggested Team Roles
                </h3>
                <div className="space-y-2">
                  {suggestedRoles.map((role, index) => (
                    <Card key={index} className="bg-white">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm font-medium">{role.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs text-gray-600">{role.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </DialogFooter>
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
