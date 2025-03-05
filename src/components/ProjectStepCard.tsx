
import { useState } from 'react';
import { Check, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStep } from '@/types/project.types';

interface ProjectStepCardProps {
  step: ProjectStep;
  isOwner?: boolean;
}

const ProjectStepCard = ({ step, isOwner = false }: ProjectStepCardProps) => {
  const [isChecked, setIsChecked] = useState(step.is_completed);
  const { toggleStepCompletion } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    try {
      setIsSubmitting(true);
      
      // We need to wait for the mutation to complete to avoid the UI flickering
      await toggleStepCompletion.mutateAsync({
        step,
        isCompleted: !isChecked
      });
      
      // Update local state after successful mutation
      setIsChecked(!isChecked);
    } catch (error) {
      console.error('Error toggling step completion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
      <Checkbox
        id={`step-${step.id}`}
        checked={isChecked}
        disabled={isSubmitting}
        onCheckedChange={handleToggle}
        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      
      <div className="flex-1">
        <label 
          htmlFor={`step-${step.id}`} 
          className={`font-medium block mb-1 cursor-pointer ${isChecked ? 'line-through text-muted-foreground' : ''}`}
        >
          {step.title}
        </label>
        
        {step.description && (
          <p className={`text-sm ${isChecked ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
            {step.description}
          </p>
        )}
      </div>
      
      {isOwner && (
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            disabled={isSubmitting}
            onClick={handleToggle}
          >
            {isChecked ? <X size={16} /> : <Check size={16} />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectStepCard;
