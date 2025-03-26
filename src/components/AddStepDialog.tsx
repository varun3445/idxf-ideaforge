
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../hooks/use-toast';

interface AddStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentStepId?: string | null;
}

const AddStepDialog: React.FC<AddStepDialogProps> = ({ 
  open, 
  onOpenChange,
  parentStepId = null
}) => {
  const { createStep, projectSteps } = useProject();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a step title",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate the next order_index for the new step
      let orderIndex = 0;
      if (parentStepId === null) {
        // For root steps, find the highest order_index among root steps and add 1
        const rootSteps = projectSteps.filter(step => step.parent_step_id === null);
        if (rootSteps.length > 0) {
          orderIndex = Math.max(...rootSteps.map(step => step.order_index)) + 1;
        }
      } else {
        // For substeps, find the highest order_index among siblings and add 1
        const siblingSteps = projectSteps.filter(step => step.parent_step_id === parentStepId);
        if (siblingSteps.length > 0) {
          orderIndex = Math.max(...siblingSteps.map(step => step.order_index)) + 1;
        }
      }
      
      const result = await createStep({
        title: title.trim(),
        description: description.trim() || undefined,
        parent_step_id: parentStepId,
        order_index: orderIndex
      });
      
      if (result) {
        toast({
          title: "Step created",
          description: parentStepId ? "Substep added successfully" : "Step added successfully",
          variant: "default"
        });
        setTitle('');
        setDescription('');
        onOpenChange(false);
      } else {
        throw new Error('Failed to create step');
      }
    } catch (error) {
      console.error('Error creating step:', error);
      toast({
        title: "Error",
        description: "Failed to create step. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentStepId ? 'Add Substep' : 'Add New Step'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="step-title">Title</Label>
            <Input 
              id="step-title" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter step title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-description">Description (optional)</Label>
            <Textarea 
              id="step-description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter step description"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Step'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStepDialog;
