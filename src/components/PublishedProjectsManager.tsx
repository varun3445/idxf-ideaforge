
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Eye, EyeOff, MessageSquare, Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

interface ProjectUpdate {
  id: string;
  content: string;
  timestamp: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  published: boolean;
  backersCount: number;
  createdAt: string;
  updatedAt: string;
  owner_id: string;
  updates?: ProjectUpdate[];
}

interface PublishedProjectsManagerProps {
  projects: Project[];
  onUpdateProject: (projectId: string, data: Partial<Project>) => void;
  onPublishStatusChange: (projectId: string, publish: boolean) => void;
  onAddUpdate: (projectId: string, updateText: string) => void;
}

const PublishedProjectsManager: React.FC<PublishedProjectsManagerProps> = ({
  projects,
  onUpdateProject,
  onPublishStatusChange,
  onAddUpdate
}) => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});

  // Filter only published projects
  const publishedProjects = projects.filter(project => project.published);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !updateText.trim()) return;

    onAddUpdate(selectedProject.id, updateText.trim());
    setUpdateText('');
    setUpdateDialogOpen(false);
    
    toast({
      title: "Update posted",
      description: "Your project update has been posted successfully.",
    });
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleOpenUpdateDialog = (project: Project) => {
    setSelectedProject(project);
    setUpdateDialogOpen(true);
  };

  // Generate stable progress values based on project id
  const getStableProgress = (projectId: string) => {
    // Use a hash of the project ID to create a stable progress value
    const hashCode = projectId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate a number between 10 and 90
    return Math.abs(hashCode % 81) + 10;
  };

  return (
    <div>
      {publishedProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No published projects</h3>
          <p className="text-sm text-gray-500">
            When you publish projects, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {publishedProjects.map(project => {
            // Generate stable progress value
            const progressValue = getStableProgress(project.id);
            
            return (
              <Card key={project.id} className="overflow-hidden border-idxf-black/10">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPublishStatusChange(project.id, !project.published)}
                    >
                      {project.published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {project.imageUrl && (
                  <div className="px-6">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  </div>
                )}
                
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{project.backersCount} backers</span>
                    </div>
                  </div>
                  
                  {/* Progress bar - stable value based on project id */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress 
                      value={progressValue} 
                      className="h-2 bg-idxf-black/10" 
                    />
                  </div>
                  
                  <div className="border-t pt-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toggleProjectExpanded(project.id)}
                    >
                      <span>Project Updates</span>
                      {expandedProjects[project.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {expandedProjects[project.id] && (
                      <div className="mt-3 space-y-3">
                        {project.updates && project.updates.length > 0 ? (
                          project.updates.map(update => (
                            <div key={update.id} className="bg-gray-50/50 p-3 rounded-md">
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">Project Update</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(update.timestamp), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1">{update.content}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">
                            No updates yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleOpenUpdateDialog(project)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Project Update</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="update-text">Update Message</Label>
              <Textarea 
                id="update-text" 
                value={updateText} 
                onChange={e => setUpdateText(e.target.value)}
                placeholder="Share progress, milestones, or news about your project..."
                rows={5}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Post Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishedProjectsManager;
