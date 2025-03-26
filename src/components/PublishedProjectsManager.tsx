
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, Eye, Bell, Trash, Globe, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { useToast } from '../hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  published: boolean;
  backersCount: number;
  createdAt: string;
  updatedAt: string;
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
  onAddUpdate,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updateContent, setUpdateContent] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const publishedProjects = projects.filter(project => project.published);

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/forge/${projectId}`);
  };

  const handleAddUpdate = () => {
    if (selectedProject && updateContent.trim()) {
      onAddUpdate(selectedProject.id, updateContent);
      setUpdateContent('');
      setIsUpdateDialogOpen(false);
      toast({
        title: "Update added",
        description: "Your project update has been published.",
        variant: "success",
      });
    }
  };

  const handleTogglePublishStatus = (project: Project) => {
    onPublishStatusChange(project.id, !project.published);
    toast({
      title: project.published ? "Project unpublished" : "Project published",
      description: project.published 
        ? "Your project is now hidden from the Explore page." 
        : "Your project is now visible on the Explore page.",
      variant: "success",
    });
  };

  const openUpdateDialog = (project: Project) => {
    setSelectedProject(project);
    setIsUpdateDialogOpen(true);
  };

  if (publishedProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have any published projects yet.</p>
        <Button className="mt-4" onClick={() => navigate('/forge')}>Create New Project</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {publishedProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video w-full relative">
              <img 
                src={project.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={project.title}
                className="object-cover w-full h-full"
              />
              <Badge 
                className="absolute top-2 right-2" 
                variant={project.published ? "default" : "outline"}
              >
                {project.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openUpdateDialog(project)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Add Update
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleTogglePublishStatus(project)}>
                      {project.published ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {project.backersCount} {project.backersCount === 1 ? 'backer' : 'backers'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Updated {format(new Date(project.updatedAt || project.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewProject(project.id)}
              >
                View Details
              </Button>
              <Button 
                size="sm" 
                onClick={() => openUpdateDialog(project)}
              >
                Add Update
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Update</DialogTitle>
            <DialogDescription>
              Share progress or news with your project supporters. This update will be visible to all project backers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="What's new with your project?"
              className="min-h-[150px]"
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUpdate} disabled={!updateContent.trim()}>Publish Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishedProjectsManager;
