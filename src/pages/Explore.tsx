
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Layers, Users, Link2, Eye, Bookmark, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedTransition from '@/components/AnimatedTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';

interface Project {
  id: string;
  title: string;
  description: string;
  creator: string;
  collaborators: number;
  category: string;
  techStack: string[];
  imageUrl: string;
  created_at: string;
  is_published: boolean;
}

const Explore: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPublishedProjects();
  }, []);

  const loadPublishedProjects = async () => {
    console.log("Loading published projects...");
    try {
      // Get projects from localStorage instead of Supabase
      const projectsString = localStorage.getItem("userProjects");
      const allProjects = projectsString ? JSON.parse(projectsString) : [];
      
      // Filter to just published projects
      const publishedProjects = allProjects.filter((project: any) => project.is_published === true);
      
      console.log("Published projects from localStorage:", publishedProjects);
      
      // Add any missing fields needed for display
      const enhancedProjects = publishedProjects.map((project: any) => ({
        ...project,
        creator: "Default User", // Using a placeholder
        collaborators: 1,
        category: "Technology",
        techStack: ["React", "JavaScript", "Tailwind CSS"],
        imageUrl: "https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop"
      }));
      
      setProjects(enhancedProjects);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching published projects:", error);
      setError("Failed to load projects. Please try again.");
      setLoading(false);
      throw error;
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const filterProjects = (category: string) => {
    setActiveFilter(category);
    // In a real implementation, this would filter projects by category
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creative-pink"></div>
          <p className="mt-4 text-creative-purple text-sm">Loading creative projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <GlassmorphicCard className="max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-creative-purple hover:bg-creative-purple/90 text-white"
            >
              Try again
            </Button>
          </div>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <AnimatedTransition>
      <div className="figma-workspace">
        {/* Figma-like toolbar */}
        <div className="figma-toolbar mb-6 -mx-6 px-6 py-3">
          <h1 className="text-xl font-medium">Explore Projects</h1>
          <div className="ml-auto flex space-x-2">
            <Button variant="outline" size="sm" className="border-creative-purple/30 text-creative-purple">
              <Eye size={16} className="mr-1" /> Browse
            </Button>
            <Button size="sm" className="bg-creative-pink text-creative-black hover:bg-creative-pink/90">
              Create New
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => filterProjects('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-creative-pink text-creative-black' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => filterProjects('design')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'design' 
                ? 'bg-creative-purple text-creative-black' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => filterProjects('development')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'development' 
                ? 'bg-creative-yellow text-creative-black' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Development
          </button>
          <button
            onClick={() => filterProjects('marketing')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'marketing' 
                ? 'bg-creative-green text-creative-black' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Marketing
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-md bg-white/5 p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-creative-purple/10 mb-4">
              <Layers className="h-8 w-8 text-creative-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              There are no published projects available at the moment. Be the first to share your creative work!
            </p>
            <Button 
              className="bg-creative-pink text-creative-black hover:bg-creative-pink/90"
              onClick={() => navigate('/projects/new')}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-creative-black border border-white/10 hover:border-creative-purple/30 transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover border-b border-white/10"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="bg-black/50 backdrop-blur-sm p-1.5 rounded-md hover:bg-black/70 transition-colors">
                      <Bookmark className="h-4 w-4 text-creative-pink" />
                    </button>
                    <button className="bg-black/50 backdrop-blur-sm p-1.5 rounded-md hover:bg-black/70 transition-colors">
                      <Share2 className="h-4 w-4 text-creative-yellow" />
                    </button>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1 text-gray-400">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map((tech, index) => (
                      <span key={index} className="text-xs bg-creative-purple/20 text-creative-purple px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{project.collaborators} Collaborator{project.collaborators !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 border-creative-purple/30 text-creative-purple hover:bg-creative-purple/10"
                    onClick={() => handleViewProject(project.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Explore;
