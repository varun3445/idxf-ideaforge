
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { User } from 'lucide-react';

interface TeamMember {
  role: string;
  skills: string;
}

interface TeamSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
}

const TeamSuggestionsDialog: React.FC<TeamSuggestionsDialogProps> = ({ 
  open, 
  onOpenChange,
  teamMembers
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggested Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {teamMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No team suggestions available</p>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{member.role}</h3>
                      <p className="text-sm text-gray-600 mt-1">{member.skills}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

export default TeamSuggestionsDialog;
