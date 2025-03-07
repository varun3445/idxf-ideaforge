
import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Users, Plus, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ProjectStep, StepAssignment, useProject } from '../contexts/ProjectContext';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ProjectStepCardProps {
  step: ProjectStep;
  level?: number;
  onAddSubstep?: (parentId: string) => void;
}

const ProjectStepCard: React.FC<ProjectStepCardProps> = ({ 
  step, 
  level = 0,
  onAddSubstep 
}) => {
  const { 
    projectSteps, 
    completeStep, 
    updateStep, 
    deleteStep, 
    assignStep,
    unassignStep,
    collaborators,
    stepAssignments,
    currentProject,
    setCurrentStep
  } = useProject();
  
  const [expanded, setExpanded] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description || '');
  
  // Find substeps for this step
  const substeps = projectSteps.filter(s => s.parent_step_id === step.id)
    .sort((a, b) => a.order_index - b.order_index);
  
  // Find assignments for this step
  const assignments = stepAssignments.filter(a => a.step_id === step.id);
  
  // Handle toggling completion status
  const handleToggleComplete = () => {
    completeStep(step.id, !step.is_completed);
  };
  
  // Handle saving step edits
  const handleSaveEdit = () => {
    updateStep(step.id, {
      title,
      description
    });
    setShowEditDialog(false);
  };
  
  // Handle deleting a step
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this step and all its substeps?')) {
      deleteStep(step.id);
    }
  };
  
  // Handle assigning a user to this step
  const handleAssignUser = (userId: string) => {
    assignStep(step.id, userId);
  };
  
  // Handle setting as current step
  const handleSetAsCurrent = () => {
    if (currentProject) {
      setCurrentStep(step);
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className={`mb-4 ${level > 0 ? 'ml-6' : ''}`}>
      <Card className={`border-l-4 ${step.is_completed ? 'border-l-green-500' : 'border-l-blue-500'}`}>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 w-full">
            <button onClick={handleToggleComplete} className="flex-shrink-0">
              {step.is_completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <CardTitle className={`text-lg ${step.is_completed ? 'line-through text-gray-500' : ''}`}>
              {step.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {assignments.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Assigned users</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60">
                  <div className="space-y-2">
                    <h4 className="font-medium">Assigned to:</h4>
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignment.user?.avatar || ''} />
                            <AvatarFallback>{getInitials(assignment.user?.name || 'User')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignment.user?.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => unassignStep(assignment.id)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sr-only">Remove assignment</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Assign or add substep</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60">
                <div className="space-y-2">
                  <h4 className="font-medium">Assign to:</h4>
                  {collaborators.length === 0 ? (
                    <p className="text-sm text-gray-500">No collaborators to assign</p>
                  ) : (
                    collaborators.map(collaborator => (
                      <Button 
                        key={collaborator.id} 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleAssignUser(collaborator.user_id)}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={collaborator.user?.avatar || ''} />
                          <AvatarFallback>{getInitials(collaborator.user?.name || 'User')}</AvatarFallback>
                        </Avatar>
                        {collaborator.user?.name}
                      </Button>
                    ))
                  )}
                  
                  <hr className="my-2" />
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      if (onAddSubstep) onAddSubstep(step.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add substep
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSetAsCurrent}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set as current step
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowEditDialog(true)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span className="sr-only">Edit</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            
            {substeps.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">{expanded ? 'Collapse' : 'Expand'}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {step.description && (
            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
          )}
          
          {assignments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {assignments.map(assignment => (
                <Badge key={assignment.id} variant="outline" className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={assignment.user?.avatar || ''} />
                    <AvatarFallback>{getInitials(assignment.user?.name || 'User')}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{assignment.user?.name}</span>
                </Badge>
              ))}
            </div>
          )}
          
          {expanded && substeps.length > 0 && (
            <div className="mt-4">
              {substeps.map(substep => (
                <ProjectStepCard 
                  key={substep.id} 
                  step={substep} 
                  level={level + 1}
                  onAddSubstep={onAddSubstep}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Title</Label>
              <Input 
                id="step-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="step-description">Description</Label>
              <Textarea 
                id="step-description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectStepCard;
