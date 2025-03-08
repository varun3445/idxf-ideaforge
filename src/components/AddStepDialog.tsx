
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
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const validateForm = () => {
    setFormSubmitted(true);
    return title.trim() !== '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await createStep({
      title: title.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      note: note.trim() || undefined,
      parent_step_id: parentStepId
    });
    
    if (result) {
      resetForm();
      onOpenChange(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setNote('');
    setFormSubmitted(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentStepId ? 'Add Substep' : 'Add New Step'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="step-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="step-title" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter step title"
              className={formSubmitted && !title.trim() ? "border-red-500" : ""}
              required
            />
            {formSubmitted && !title.trim() && (
              <p className="text-red-500 text-sm mt-1">Step title is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-description">Description (optional)</Label>
            <Textarea 
              id="step-description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter step description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-image">Image URL (optional)</Label>
            <Input 
              id="step-image" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-note">Note (optional)</Label>
            <Textarea 
              id="step-note" 
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note for this step"
              rows={3}
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
