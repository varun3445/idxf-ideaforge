
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash, UserPlus, Clock } from 'lucide-react';
import { useProject, ProjectCollaborator } from '../contexts/ProjectContext';
import { Badge } from './ui/badge';

interface CollaboratorsListProps {
  onAddCollaborator: () => void;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  onAddCollaborator
}) => {
  const {
    collaborators,
    removeCollaborator,
    currentProject
  } = useProject();

  // Get accepted collaborators
  const acceptedCollaborators = collaborators.filter(c => c.status === 'accepted');
  // Get pending collaborators
  const pendingCollaborators = collaborators.filter(c => c.status === 'pending');

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
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
          <div className="space-y-6">
            {acceptedCollaborators.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Active Collaborators</h3>
                <ul className="space-y-3">
                  {acceptedCollaborators.map(collaborator => (
                    <li key={collaborator.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.user?.avatar || ''} />
                          <AvatarFallback>{getInitials(collaborator.user?.name || 'User')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-left">{collaborator.user?.name}</p>
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
              </div>
            )}

            {pendingCollaborators.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
                <ul className="space-y-3">
                  {pendingCollaborators.map(collaborator => (
                    <li key={collaborator.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.user?.avatar || ''} />
                          <AvatarFallback>{getInitials(collaborator.user?.name || 'User')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-left">{collaborator.user?.name}</p>
                          <p className="text-xs text-gray-500">{collaborator.user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorsList;
