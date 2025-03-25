
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Users, Layers, ListChecks, ArrowLeft, Share2, CheckCircle2, Circle, ChevronRight, Link2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import ProjectStepCard from '@/components/ProjectStepCard';
import AddStepDialog from '@/components/AddStepDialog';
import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';
import CollaboratorsList from '@/components/CollaboratorsList';
import { useProject, ProjectProvider, ProjectStep } from '../contexts/ProjectContext';
import { useToast } from '../hooks/use-toast';
import ProjectShareDialog from '@/components/ProjectShareDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const ForgeStyles = () => <style>
    {`
    .highlight-step {
      background-color: rgba(var(--primary-rgb), 0.1);
      border-radius: 0.5rem;
      transition: background-color 0.3s ease-in-out;
    }
    .animate-pulse-once {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `}
  </style>;

const ProjectContent: React.FC = () => {
  const {
    projectId
  } = useParams<{
    projectId: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    loadProjectDetails,
    currentProject,
    projectSteps,
    currentStep,
    setCurrentStep,
    updateProject,
    publishProject,
    loading,
    error
  } = useProject();
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [addCollaboratorDialogOpen, setAddCollaboratorDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [parentStepId, setParentStepId] = useState<string | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails(projectId);
    }
  }, [projectId, loadProjectDetails]);

  const handleAddStep = () => {
    setParentStepId(null);
    setAddStepDialogOpen(true);
  };

  const handleAddSubstep = (parentId: string) => {
    setParentStepId(parentId);
    setAddStepDialogOpen(true);
  };

  const handleShareProject = () => {
    setShareDialogOpen(true);
  };

  const handleTogglePublish = async () => {
    if (!currentProject) return;
    
    try {
      await publishProject(currentProject.id, !currentProject.is_published);
      
      toast({
        title: currentProject.is_published ? 'Project Unpublished' : 'Project Published',
        description: currentProject.is_published 
          ? 'Your project is now hidden from the explore page' 
          : 'Your project is now visible on the explore page',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project publishing status',
        variant: 'destructive'
      });
    }
  };

  const handleSetCurrentFocus = (step: ProjectStep) => {
    if (!currentProject) return;
    setCurrentStep(step);
    updateProject({
      id: currentProject.id,
      current_step_id: step.id
    });
    toast({
      title: 'Current focus updated',
      description: `The team is now focused on "${step.title}"`,
      variant: 'default'
    });
  };

  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const stepElement = document.getElementById(`step-${stepId}`);
      if (stepElement) {
        stepElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        stepElement.classList.add('highlight-step');
        setTimeout(() => {
          stepElement.classList.remove('highlight-step');
        }, 2000);
      }
    }, 100);
  };

  const rootSteps = projectSteps.filter(step => step.parent_step_id === null).sort((a, b) => a.order_index - b.order_index);

  if (loading && !currentProject) {
    return <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  if (error && !currentProject) {
    return <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Error loading project</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/projects')}>Go back to projects</Button>
        </div>
      </div>;
  }

  if (!currentProject) {
    return <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Project not found</h3>
          <p className="text-sm text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/projects')}>Go back to projects</Button>
        </div>
      </div>;
  }

  return <div className="page-container p-4 md:p-6">
      <ForgeStyles />
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-2 pl-0 text-left">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-left">{currentProject.title}</h1>
            {currentProject.description && <p className="text-gray-600 mt-2">{currentProject.description}</p>}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 mr-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="mr-2">Publish</span>
              <Switch 
                checked={currentProject.is_published} 
                onCheckedChange={handleTogglePublish} 
                aria-label="Toggle publish" 
              />
            </div>
            
            <Button onClick={handleShareProject}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={() => setAddCollaboratorDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>
          </div>
        </div>
        
        {currentStep && <Card className="mt-6 border-l-4 border-l-primary animate-pulse-once">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Current Focus
              </CardTitle>
              <CardDescription>The step your team is currently focused on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{currentStep.title}</h3>
                  {currentStep.description && <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>}
                </div>
                <Button size="sm" variant="outline" onClick={() => scrollToStep(currentStep.id)}>
                  <ListChecks className="mr-2 h-4 w-4" />
                  Go to Step
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1" ref={stepsRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Project Steps</h2>
            <Button size="sm" onClick={handleAddStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
          
          {rootSteps.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <ListChecks className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No steps yet</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Start by adding the first step to your project
                </p>
                <Button onClick={handleAddStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Step
                </Button>
              </CardContent>
            </Card> : <div className="space-y-4">
              {rootSteps.map(step => <div key={step.id} id={`step-${step.id}`} className="transition-all duration-300">
                  <div className="flex items-start gap-2 mb-2">
                    
                    
                    <div className="flex-1">
                      <ProjectStepCard step={step} onAddSubstep={handleAddSubstep} isCurrentFocus={currentStep?.id === step.id} />
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
        
        <div className="lg:w-80">
          <CollaboratorsList onAddCollaborator={() => setAddCollaboratorDialogOpen(true)} />
        </div>
      </div>
      
      <AddStepDialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen} parentStepId={parentStepId} />
      
      <AddCollaboratorDialog open={addCollaboratorDialogOpen} onOpenChange={setAddCollaboratorDialogOpen} />
      
      {currentProject && <ProjectShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} projectTitle={currentProject.title} shareCode={currentProject.share_code} />}
    </div>;
};

const ForgeWithProvider: React.FC = () => {
  return <AnimatedTransition>
      <ProjectProvider>
        <ProjectContent />
      </ProjectProvider>
    </AnimatedTransition>;
};

export default ForgeWithProvider;
