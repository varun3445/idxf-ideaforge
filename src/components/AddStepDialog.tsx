
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useProject } from '../contexts/ProjectContext';

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
  const { createStep } = useProject();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    const result = await createStep({
      title: title.trim(),
      description: description.trim() || undefined,
      parent_step_id: parentStepId
    });
    
    if (result) {
      setTitle('');
      setDescription('');
      onOpenChange(false);
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
            <Button type="submit">
              Add Step
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStepDialog;
