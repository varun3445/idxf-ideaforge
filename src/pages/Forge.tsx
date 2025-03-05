
import { useState } from 'react';
import { Plus, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedTransition from '@/components/AnimatedTransition';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/AuthContext';

const Forge = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const { ownedProjects, collaboratingProjects } = useProjects();
  const { user } = useAuth();
  
  const isLoading = ownedProjects.isLoading || collaboratingProjects.isLoading;
  
  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-left mb-2">Forge</h1>
            <p className="text-muted-foreground text-center md:text-left">
              Create, manage and collaborate on projects
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={() => setJoinDialogOpen(true)} variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Join Project
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-left">Your Projects</h2>
              
              {ownedProjects.data && ownedProjects.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedProjects.data.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      isOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
                  <Share2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to get started
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-left">Collaborations</h2>
              
              {collaboratingProjects.data && collaboratingProjects.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collaboratingProjects.data.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No collaborations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Join a project using a share code or link
                  </p>
                  <Button onClick={() => setJoinDialogOpen(true)} variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Join Project
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
        
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
        
        <AddCollaboratorDialog
          projectId=""
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
        />
      </div>
    </AnimatedTransition>
  );
};

export default Forge;
