
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronRight, Trash, MoreHorizontal, UserPlus, CheckCircle2, Image, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProject, ProjectStep, StepAssignment } from '../contexts/ProjectContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
    updateStep,
    currentProject
  } = useProject();
  const [expanded, setExpanded] = useState(true);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(step.image_url || '');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState(step.note || '');

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

  // Handle image update
  const handleUpdateImage = () => {
    updateStep(step.id, { image_url: imageUrl });
    setImageDialogOpen(false);
  };

  // Handle note update
  const handleUpdateNote = () => {
    updateStep(step.id, { note: noteContent });
    setNoteDialogOpen(false);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <>
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
                {step.description && <p className={cn("text-sm text-gray-600 mt-1 text-left", step.is_completed && "line-through text-gray-500")}>{step.description}</p>}
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs text-gray-500">Created {format(new Date(step.created_at), 'MMM d, yyyy')}</span>
                  
                  {step.note && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto hover:bg-transparent hover:underline text-xs text-gray-500"
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      View Note
                    </Button>
                  )}
                  
                  {step.image_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto hover:bg-transparent hover:underline text-xs text-gray-500 flex items-center"
                      onClick={() => setImageDialogOpen(true)}
                    >
                      <Image className="h-3 w-3 mr-1" />
                      View Image
                    </Button>
                  )}
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
                  <DropdownMenuItem onClick={() => setNoteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {step.note ? 'Edit' : 'Add'} Note
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                    <Image className="h-4 w-4 mr-2" />
                    {step.image_url ? 'Change' : 'Add'} Image
                  </DropdownMenuItem>
                  
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
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{step.image_url ? 'Update Image' : 'Add Image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input 
                id="image-url" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            
            {imageUrl && (
              <div className="border rounded-md p-2 mt-4">
                <img 
                  src={imageUrl} 
                  alt="Step preview" 
                  className="w-full h-auto max-h-60 object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/400x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateImage}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{step.note ? 'Edit Note' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-content">Note</Label>
              <Textarea 
                id="note-content" 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter note"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateNote}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectStepCard;
