
import { useState } from 'react';
import { ProjectStep } from '@/types/project.types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/hooks/useProjects';
import { CheckCircle, Circle } from 'lucide-react';

interface ProjectStepCardProps {
  step: ProjectStep;
  isOwner: boolean;
}

const ProjectStepCard = ({ step, isOwner }: ProjectStepCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateProjectStep } = useProjects();
  
  const toggleComplete = () => {
    updateProjectStep.mutate({
      id: step.id,
      is_completed: !step.is_completed
    });
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 mb-4 transition-all ${
        step.is_completed ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <Checkbox 
            checked={step.is_completed}
            onCheckedChange={() => toggleComplete()}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 
              className={`text-lg font-medium mb-1 text-left ${
                step.is_completed ? 'text-primary' : ''
              }`}
            >
              {step.title}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
          
          {isExpanded && step.description && (
            <p className="mt-2 text-muted-foreground text-sm text-left">
              {step.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStepCard;
