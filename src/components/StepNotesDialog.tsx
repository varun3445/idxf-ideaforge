
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { Save } from 'lucide-react';

interface StepNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: string;
  stepTitle: string;
}

const StepNotesDialog: React.FC<StepNotesDialogProps> = ({ 
  open, 
  onOpenChange,
  stepId,
  stepTitle
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<string>('');
  
  const handleSaveNotes = () => {
    // In a production app, you would save the notes to the database
    toast({
      title: 'Notes saved',
      description: 'The notes have been added to the step',
      variant: 'default'
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Notes to Step: {stepTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="step-notes">Notes</Label>
            <Textarea 
              id="step-notes" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Add detailed notes about this step..."
              rows={8}
              className="resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveNotes}
              disabled={!notes.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepNotesDialog;
