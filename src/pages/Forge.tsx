
import { useState, useEffect } from 'react';
import { Plus, Users, Share2, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedTransition from '@/components/AnimatedTransition';
import ProjectCard from '@/components/ProjectCard';
import ProjectIdeaCard from '@/components/ProjectIdeaCard';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/AuthContext';
import { projectIdeas } from '../data/mockData';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useToast } from '@/hooks/use-toast';

const Forge = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'experiment'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const { ownedProjects, collaboratingProjects } = useProjects();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  
  const categories = ['All', ...new Set(projectIdeas.map(idea => idea.category))];
  const filteredIdeas = projectIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'All' || idea.category === activeFilter;
    return matchesSearch && matchesCategory;
  });
  
  const isLoading = ownedProjects.isLoading || collaboratingProjects.isLoading;
  const hasError = ownedProjects.error || collaboratingProjects.error;
  
  // Debug logging
  useEffect(() => {
    console.log('Forge component mounted');
    console.log('User:', user);
    console.log('Owned Projects Loading:', ownedProjects.isLoading);
    console.log('Collaborating Projects Loading:', collaboratingProjects.isLoading);
    
    if (ownedProjects.error) {
      console.error('Owned Projects Error:', ownedProjects.error);
    }
    
    if (collaboratingProjects.error) {
      console.error('Collaborating Projects Error:', collaboratingProjects.error);
    }
    
    if (ownedProjects.data) {
      console.log('Owned Projects Data:', ownedProjects.data);
    }
    
    if (collaboratingProjects.data) {
      console.log('Collaborating Projects Data:', collaboratingProjects.data);
    }
  }, [user, ownedProjects.isLoading, collaboratingProjects.isLoading, ownedProjects.error, collaboratingProjects.error, ownedProjects.data, collaboratingProjects.data]);

  // Show error toast if there's an error
  useEffect(() => {
    if (ownedProjects.error) {
      toast({
        title: 'Error loading your projects',
        description: 'There was an error loading your projects. Please try refreshing the page.',
        variant: 'destructive',
      });
    }
    
    if (collaboratingProjects.error) {
      toast({
        title: 'Error loading collaborations',
        description: 'There was an error loading your collaborations. Please try refreshing the page.',
        variant: 'destructive',
      });
    }
  }, [ownedProjects.error, collaboratingProjects.error, toast]);
  
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
            {activeTab === 'projects' ? (
              <>
                <Button onClick={() => setJoinDialogOpen(true)} variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Join Project
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'projects' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('projects')}
          >
            My Projects
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'experiment' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('experiment')}
          >
            Experiment Lab
          </button>
        </div>
        
        {activeTab === 'projects' ? (
          isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : hasError ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-xl font-medium mb-2">Error loading projects</h3>
              <p className="text-muted-foreground mb-4">
                There was a problem loading your projects. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
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
          )
        ) : (
          // Experiment Lab content
          <>
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-muted-foreground" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search for project ideas..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10 w-full h-10 sm:h-12 rounded-lg border border-input bg-background px-3 sm:px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Filter size={14} />
                    <span>Category:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {categories.map(category => (
                      <button 
                        key={category} 
                        onClick={() => setActiveFilter(category)} 
                        className={`chip text-xs ${activeFilter === category ? 'chip-active' : ''}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 ${isMobile ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'} gap-4 sm:gap-6`}>
              {filteredIdeas.map(idea => <ProjectIdeaCard key={idea.id} idea={idea} />)}
            </div>
            
            {filteredIdeas.length === 0 && (
              <div className="glassmorphic-card text-center py-8 sm:py-12 mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-medium mb-2">No project ideas found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search criteria or filter selection
                </p>
              </div>
            )}
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
