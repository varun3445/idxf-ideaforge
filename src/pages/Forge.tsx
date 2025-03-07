
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Layers, 
  ListChecks, 
  ArrowLeft, 
  Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import ProjectStepCard from '@/components/ProjectStepCard';
import AddStepDialog from '@/components/AddStepDialog';
import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';
import CollaboratorsList from '@/components/CollaboratorsList';
import { useProject, ProjectProvider } from '../contexts/ProjectContext';
import { useToast } from '../hooks/use-toast';

const ProjectContent: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    loadProjectDetails, 
    currentProject, 
    projectSteps,
    currentStep,
    loading,
    error
  } = useProject();
  
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [addCollaboratorDialogOpen, setAddCollaboratorDialogOpen] = useState(false);
  const [parentStepId, setParentStepId] = useState<string | null>(null);
  
  useEffect(() => {
    if (projectId) {
      loadProjectDetails(projectId);
    }
  }, [projectId]);
  
  // Handle opening add step dialog
  const handleAddStep = () => {
    setParentStepId(null);
    setAddStepDialogOpen(true);
  };
  
  // Handle opening add substep dialog
  const handleAddSubstep = (parentId: string) => {
    setParentStepId(parentId);
    setAddStepDialogOpen(true);
  };
  
  // Handle sharing project
  const handleShareProject = () => {
    if (currentProject?.share_code) {
      navigator.clipboard.writeText(
        `${window.location.origin}/join-project/${currentProject.share_code}`
      );
      toast({
        title: 'Link copied',
        description: 'Project invitation link copied to clipboard',
        variant: 'default'
      });
    }
  };
  
  // Root level steps (no parent)
  const rootSteps = projectSteps
    .filter(step => step.parent_step_id === null)
    .sort((a, b) => a.order_index - b.order_index);
  
  if (loading && !currentProject) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error && !currentProject) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Error loading project</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/projects')}>Go back to projects</Button>
        </div>
      </div>
    );
  }
  
  if (!currentProject) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Project not found</h3>
          <p className="text-sm text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/projects')}>Go back to projects</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              className="mb-2 pl-0"
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <h1 className="text-3xl font-bold">{currentProject.title}</h1>
            {currentProject.description && (
              <p className="text-gray-600 mt-2">{currentProject.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleShareProject}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={() => setAddCollaboratorDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>
            <Button onClick={handleAddStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </div>
        
        {currentStep && (
          <Card className="mt-6 border-l-4 border-l-primary">
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
                  {currentStep.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('#step-' + currentStep.id)}>
                  <ListChecks className="mr-2 h-4 w-4" />
                  Go to Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Project Steps</h2>
            <Button size="sm" onClick={handleAddStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
          
          {rootSteps.length === 0 ? (
            <Card>
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
            </Card>
          ) : (
            <div className="space-y-4">
              {rootSteps.map(step => (
                <ProjectStepCard 
                  key={step.id} 
                  step={step} 
                  onAddSubstep={handleAddSubstep}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:w-80">
          <CollaboratorsList onAddCollaborator={() => setAddCollaboratorDialogOpen(true)} />
        </div>
      </div>
      
      <AddStepDialog 
        open={addStepDialogOpen} 
        onOpenChange={setAddStepDialogOpen}
        parentStepId={parentStepId}
      />
      
      <AddCollaboratorDialog 
        open={addCollaboratorDialogOpen} 
        onOpenChange={setAddCollaboratorDialogOpen}
      />
    </div>
  );
};

const ForgeWithProvider: React.FC = () => {
  return (
    <AnimatedTransition>
      <ProjectProvider>
        <ProjectContent />
      </ProjectProvider>
    </AnimatedTransition>
  );
};

export default ForgeWithProvider;
