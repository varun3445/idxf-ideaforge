
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useProject } from '../contexts/ProjectContext';
import { useToast } from '../hooks/use-toast';
import { useParams } from 'react-router-dom';

interface AddCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCollaboratorDialog: React.FC<AddCollaboratorDialogProps> = ({ 
  open, 
  onOpenChange
}) => {
  const { addCollaborator } = useProject();
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const [email, setEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !projectId) {
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Pass only the email as required by the updated method
      await addCollaborator(email.trim());
      
      setEmail('');
      onOpenChange(false);
      
      toast({
        title: 'Collaborator invited',
        description: 'An invitation has been sent to the collaborator',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add collaborator',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collaborator-email">Email</Label>
            <Input 
              id="collaborator-email" 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter collaborator's email"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Collaborator
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
