
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

interface ProjectPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSuccess: () => void;
}

const ProjectPublishDialog: React.FC<ProjectPublishDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSuccess
}) => {
  const { toast } = useToast();
  const [overview, setOverview] = useState('');
  const [goals, setGoals] = useState('');
  const [challenges, setChallenges] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!overview.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a project overview',
        variant: 'destructive'
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      // Update the project with additional fields and set it as published
      const { error } = await supabase
        .from('projects')
        .update({
          overview: overview.trim(),
          goals: goals.trim(),
          challenges: challenges.trim(),
          is_published: true
        })
        .eq('id', projectId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Project published',
        description: 'Your project is now available on the Explore page',
        variant: 'success'
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: 'Publishing failed',
        description: 'Could not publish your project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Publish "{projectTitle}"</DialogTitle>
          <DialogDescription>
            Provide additional information about your project before publishing it to the Explore page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="overview" className="text-base">
              Project Overview <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="overview"
              placeholder="Provide a comprehensive overview of your project"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on the Explore page. Be descriptive but concise.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-base">
              Project Goals
            </Label>
            <Textarea
              id="goals"
              placeholder="What are the main goals of this project?"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-base">
              Technical Challenges
            </Label>
            <Textarea
              id="challenges"
              placeholder="What technical challenges do you anticipate?"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectPublishDialog;
