
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';
import SkillsetSelector from './SkillsetSelector';

interface PublishProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onConfirm: (data: { overview: string; goals: string; challenges: string; skills: string[] }) => Promise<void>;
}

const PublishProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onConfirm,
}: PublishProjectDialogProps) => {
  const { toast } = useToast();
  const [overview, setOverview] = useState('');
  const [goals, setGoals] = useState('');
  const [challenges, setChallenges] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!overview.trim()) {
      toast({
        title: 'Project overview required',
        description: 'Please provide an overview of your project',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ overview, goals, challenges, skills });
      toast({
        title: 'Project published',
        description: 'Your project is now visible on the explore page',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: 'Failed to publish project',
        description: 'An error occurred while publishing your project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish "{projectTitle}"</DialogTitle>
          <DialogDescription>
            Provide additional details about your project to attract collaborators
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="overview" className="text-base font-medium">
              Project Overview <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="overview"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="A comprehensive description of what your project is about and its purpose"
              rows={4}
              required
              className="resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-base font-medium">
              Project Goals
            </Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What are you hoping to achieve with this project? What problem are you solving?"
              rows={3}
              className="resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-base font-medium">
              Technical Challenges
            </Label>
            <Textarea
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What technical hurdles do you anticipate? What kind of expertise would be helpful?"
              rows={3}
              className="resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Required Skills</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Select skills that would be valuable for collaborating on this project
            </p>
            <SkillsetSelector selectedSkills={skills} onChange={setSkills} />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PublishProjectDialog;
