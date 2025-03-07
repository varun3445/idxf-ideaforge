
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash, UserPlus } from 'lucide-react';
import { useProject, ProjectCollaborator } from '../contexts/ProjectContext';

interface CollaboratorsListProps {
  onAddCollaborator: () => void;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ onAddCollaborator }) => {
  const { collaborators, removeCollaborator } = useProject();
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleRemoveCollaborator = (collaborator: ProjectCollaborator) => {
    if (confirm(`Are you sure you want to remove ${collaborator.user?.name || 'this collaborator'}?`)) {
      removeCollaborator(collaborator.id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-md font-medium">Collaborators</CardTitle>
        <Button onClick={onAddCollaborator} size="sm" className="h-8 px-2">
          <UserPlus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500">No collaborators yet</p>
        ) : (
          <ul className="space-y-3">
            {collaborators.map(collaborator => (
              <li key={collaborator.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={collaborator.user?.avatar || ''} />
                    <AvatarFallback>{getInitials(collaborator.user?.name || 'User')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{collaborator.user?.name}</p>
                    <p className="text-xs text-gray-500">{collaborator.user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleRemoveCollaborator(collaborator)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorsList;
