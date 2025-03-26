
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, Share2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '../contexts/ProjectContext';
import { createProjectWithSkills } from '../services/projectService';
import ProjectStepCard from '../components/ProjectStepCard';
import AddStepDialog from '../components/AddStepDialog';
import ProjectShareDialog from '../components/ProjectShareDialog';
import SuggestedStepsDialog from '../components/SuggestedStepsDialog';
import AnimatedTransition from '../components/AnimatedTransition';
import ProjectPublishDialog from '../components/ProjectPublishDialog';
import SkillsetSelector from '../components/SkillsetSelector';

interface ForgeParams {
  projectId?: string;
}

const Forge = () => {
  const { projectId } = useParams<ForgeParams>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Project Context
  const { 
    currentProject, 
    projectSteps,
    loading, 
    error, 
    loadProjectDetails,
    createProject,
    createProjectStep,
    updateProject,
    publishProject
  } = useProject();

  // Local State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSuggestedStepsOpen, setIsSuggestedStepsOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [parentStepId, setParentStepId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails(projectId);
    }
  }, [projectId, loadProjectDetails]);

  useEffect(() => {
    if (currentProject) {
      setTitle(currentProject.title);
      setDescription(currentProject.description);
      if (currentProject.skills) {
        setSkills(currentProject.skills);
      }
    }
  }, [currentProject]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your project.",
        variant: "destructive",
      });
      return;
    }

    if (projectId && currentProject) {
      // Update existing project
      setSaveLoading(true);
      try {
        await updateProject({
          id: projectId,
          title,
          description,
          skills
        });
        
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
          variant: "success",
        });
      } catch (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Update failed",
          description: "Failed to update project. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSaveLoading(false);
      }
    } else {
      // Create new project
      setCreateLoading(true);
      try {
        const newProject = await createProject(title, description, skills);
        if (newProject) {
          toast({
            title: "Project created",
            description: "Your new project has been created successfully.",
            variant: "success",
          });
          navigate(`/forge/${newProject.id}`);
        } else {
          throw new Error("Failed to create project");
        }
      } catch (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Creation failed",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCreateLoading(false);
      }
    }
  };

  const handleAddStep = (parentId: string | null = null) => {
    setParentStepId(parentId);
    setIsAddStepOpen(true);
  };

  const handleTogglePublish = async () => {
    if (!projectId || !currentProject) return;
    
    if (!currentProject.is_published) {
      // If not published, open the publish dialog
      setIsPublishDialogOpen(true);
    } else {
      // If already published, unpublish directly
      setPublishLoading(true);
      try {
        await publishProject(projectId, false);
        toast({
          title: "Project unpublished",
          description: "Your project is no longer visible on the Explore page.",
          variant: "success",
        });
      } catch (error) {
        console.error('Error unpublishing project:', error);
        toast({
          title: "Action failed",
          description: "Failed to unpublish project. Please try again.",
          variant: "destructive",
        });
      } finally {
        setPublishLoading(false);
      }
    }
  };

  const handlePublishSuccess = () => {
    // Handle after successful publishing from dialog
    toast({
      title: "Success",
      description: "Your project is now live on the Explore page.",
      variant: "success",
    });
    loadProjectDetails(projectId!);
  };

  if (loading && projectId) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && projectId) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading project: {error}</p>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl md:text-3xl">
                    {projectId ? 'Edit Project' : 'Create New Project'}
                  </CardTitle>
                  <CardDescription>
                    {projectId 
                      ? 'Update your project details and manage its steps' 
                      : 'Start by giving your project a title and description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium">
                      Project Title
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title for your project"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      Project Description
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your project and its goals"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="skills" className="block text-sm font-medium">
                      Project Skills
                    </label>
                    <SkillsetSelector 
                      selectedSkills={skills} 
                      onChange={setSkills} 
                    />
                    <p className="text-sm text-muted-foreground">
                      Select the skills required for this project
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {projectId && (
                      <>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsShareDialogOpen(true)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant={currentProject?.is_published ? "destructive" : "secondary"}
                          onClick={handleTogglePublish}
                          disabled={publishLoading}
                        >
                          {publishLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : currentProject?.is_published ? (
                            <EyeOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {currentProject?.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={createLoading || saveLoading}>
                    {(createLoading || saveLoading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {projectId ? 'Save Changes' : 'Create Project'}
                  </Button>
                </CardFooter>
              </Card>
              
              {projectId && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-playfair">Project Steps</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSuggestedStepsOpen(true)}
                        size="sm"
                      >
                        Get Suggestions
                      </Button>
                      <Button 
                        onClick={() => handleAddStep(null)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                  </div>
                  
                  {projectSteps.length === 0 ? (
                    <Card className="bg-muted/50">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-muted-foreground text-center mb-4">
                          <p>No steps have been created for this project yet.</p>
                          <p>Break down your project into manageable steps to get started.</p>
                        </div>
                        <Button onClick={() => handleAddStep(null)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Step
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {projectSteps
                        .filter(step => !step.parent_step_id)
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(step => (
                          <ProjectStepCard 
                            key={step.id}
                            step={step}
                            onAddSubStep={() => handleAddStep(step.id)}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Guide</CardTitle>
                  <CardDescription>
                    Follow these tips to create a great project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Clear Title</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose a descriptive title that clearly communicates your project's purpose.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Thorough Description</h4>
                      <p className="text-sm text-muted-foreground">
                        Explain your project's goals, technical approach, and anticipated outcomes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Select Skills</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose the skills required for your project to attract the right collaborators.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Define Steps</h4>
                      <p className="text-sm text-muted-foreground">
                        Break your project into clear, manageable steps. This helps collaborators understand the workflow.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {projectId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Publish Your Project</CardTitle>
                    <CardDescription>
                      When you're ready to share your project with the world
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Publishing makes your project visible on the Explore page, where other users can find and support it.
                    </p>
                    <div className="pt-2">
                      <Button 
                        className="w-full" 
                        variant={currentProject?.is_published ? "destructive" : "default"}
                        onClick={handleTogglePublish}
                        disabled={publishLoading}
                      >
                        {publishLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : currentProject?.is_published ? (
                          <EyeOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        {currentProject?.is_published ? 'Unpublish Project' : 'Publish Project'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
        
        {/* Dialogs */}
        {projectId && (
          <>
            <AddStepDialog 
              open={isAddStepOpen} 
              onOpenChange={setIsAddStepOpen}
              projectId={projectId}
              parentStepId={parentStepId}
            />
            
            <ProjectShareDialog
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
              shareCode={currentProject?.share_code || ''}
              projectTitle={currentProject?.title || 'Project'}
            />
            
            <SuggestedStepsDialog
              open={isSuggestedStepsOpen}
              onOpenChange={setIsSuggestedStepsOpen}
              projectId={projectId}
              projectTitle={currentProject?.title || ''}
              projectDescription={currentProject?.description || ''}
            />
            
            <ProjectPublishDialog
              open={isPublishDialogOpen}
              onOpenChange={setIsPublishDialogOpen}
              projectId={projectId}
              projectTitle={currentProject?.title || 'Project'}
              onSuccess={handlePublishSuccess}
            />
          </>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Forge;
