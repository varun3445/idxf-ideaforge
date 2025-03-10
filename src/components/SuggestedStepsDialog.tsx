
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Users, ChevronRight } from 'lucide-react';

interface StepSuggestion {
  title: string;
  description: string;
}

interface SuggestedStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: StepSuggestion[];
  onViewTeam: () => void;
}

const SuggestedStepsDialog: React.FC<SuggestedStepsDialogProps> = ({ 
  open, 
  onOpenChange,
  steps,
  onViewTeam
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI-Suggested Project Steps</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {steps.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No step suggestions available</p>
          ) : (
            <ul className="space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium">{step.title}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={onViewTeam}>
              <Users className="mr-2 h-4 w-4" />
              View Suggested Team
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestedStepsDialog;
