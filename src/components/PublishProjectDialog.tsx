
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface PublishProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onPublish: (projectId: string, data: { overview: string; goals: string; challenges: string }) => Promise<void>;
  isPublished: boolean;
}

const PublishProjectDialog: React.FC<PublishProjectDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onPublish,
  isPublished
}) => {
  const [overview, setOverview] = useState('');
  const [goals, setGoals] = useState('');
  const [challenges, setChallenges] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    try {
      await onPublish(projectId, { overview, goals, challenges });
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isPublished ? 'Edit Project Details' : 'Publish Project'}</DialogTitle>
          <DialogDescription>
            {isPublished 
              ? 'Update the information that will be displayed on your project page.' 
              : 'Before publishing, provide some details about your project to help others understand it better.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-overview">Project Overview</Label>
            <Textarea
              id="project-overview"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Provide a high-level overview of your project..."
              rows={4}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="project-goals">Project Goals</Label>
            <Textarea
              id="project-goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What are the main goals you're trying to achieve?"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="technical-challenges">Technical Challenges</Label>
            <Textarea
              id="technical-challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Describe any technical challenges you're facing or anticipate..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={loading || !overview.trim()}>
            {loading ? 
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isPublished ? 'Updating...' : 'Publishing...'}</> : 
              (isPublished ? 'Update Details' : 'Publish Project')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishProjectDialog;
