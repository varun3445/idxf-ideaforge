
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronRight, Trash, MoreHorizontal, UserPlus, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProject, ProjectStep, StepAssignment } from '../contexts/ProjectContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectStepCardProps {
  step: ProjectStep;
  onAddSubstep?: (stepId: string) => void;
  isCurrentFocus?: boolean;
}

const ProjectStepCard: React.FC<ProjectStepCardProps> = ({
  step,
  onAddSubstep,
  isCurrentFocus = false
}) => {
  const {
    projectSteps,
    stepAssignments,
    collaborators,
    deleteStep,
    completeStep,
    assignStep,
    unassignStep,
    currentProject
  } = useProject();
  const [expanded, setExpanded] = useState(true);

  // Find substeps for current step
  const substeps = projectSteps.filter(s => s.parent_step_id === step.id).sort((a, b) => a.order_index - b.order_index);

  // Find assignments for this step
  const assignments = stepAssignments.filter(a => a.step_id === step.id);

  // Handle step completion toggle
  const handleCompletionToggle = () => {
    completeStep(step.id, !step.is_completed);
  };

  // Handle delete step
  const handleDeleteStep = () => {
    if (confirm(`Are you sure you want to delete "${step.title}"? This will also delete all substeps.`)) {
      deleteStep(step.id);
    }
  };

  // Handle assign collaborator
  const handleAssignCollaborator = (collaboratorId: string) => {
    assignStep(step.id, collaboratorId);
  };

  // Handle unassign collaborator
  const handleUnassignCollaborator = (assignmentId: string) => {
    unassignStep(assignmentId);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <Card className={cn("border transition-all duration-200", isCurrentFocus && "border-primary shadow-md", step.is_completed && "bg-gray-50/50")}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <Checkbox id={`step-${step.id}-checkbox`} checked={step.is_completed} onCheckedChange={handleCompletionToggle} />
            <div>
              <div className="flex items-center">
                <label htmlFor={`step-${step.id}-checkbox`} className={cn("font-medium cursor-pointer text-base", step.is_completed && "line-through text-gray-500")}>
                  {step.title}
                </label>
                {isCurrentFocus && (
                  <div className="ml-2 text-primary text-xs font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                    Current Focus
                  </div>
                )}
              </div>
              {step.description && <p className="text-sm text-gray-600 mt-1 text-left">{step.description}</p>}
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span>Created {format(new Date(step.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Assigned users */}
            {assignments.length > 0 && (
              <div className="flex -space-x-2 mr-2">
                {assignments.map(assignment => (
                  <DropdownMenu key={assignment.id}>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-6 w-6 cursor-pointer hover:ring-2 ring-white">
                        <AvatarImage src={assignment.user?.avatar || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(assignment.user?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        {assignment.user?.name}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUnassignCollaborator(assignment.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Remove assignment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            )}
            
            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to
                  <ChevronRight className="h-4 w-4 ml-auto" />
                  
                  <DropdownMenuContent className="min-w-[180px]">
                    {collaborators.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No collaborators available
                      </DropdownMenuItem>
                    ) : (
                      collaborators.map(collaborator => (
                        <DropdownMenuItem key={collaborator.id} onClick={() => handleAssignCollaborator(collaborator.user_id)}>
                          <div className="flex items-center w-full">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={collaborator.user?.avatar || ''} />
                              <AvatarFallback>
                                {getInitials(collaborator.user?.name || 'User')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{collaborator.user?.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleDeleteStep} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Expand/collapse button for substeps */}
            {substeps.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1" onClick={() => setExpanded(prev => !prev)}>
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {/* Substeps */}
      {substeps.length > 0 && expanded && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="pl-6 ml-1 border-l border-gray-200 space-y-3">
            {substeps.map(substep => (
              <ProjectStepCard 
                key={substep.id} 
                step={substep} 
                isCurrentFocus={currentProject?.current_step_id === substep.id} 
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProjectStepCard;
