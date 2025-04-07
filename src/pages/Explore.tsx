
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  overview?: string;
  goals?: string;
  challenges?: string;
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
        creator: "Default User",
        collaborators: 1,
        category: "Technology",
        techStack: ["React", "JavaScript", "Tailwind CSS"],
        // Use the project's uploaded image if available, otherwise use default
        imageUrl: project.imageUrl || "https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop"
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
    // Make sure we're navigating to the correct route that matches the route in App.tsx
    navigate(`/project/${projectId}`);
  };

  const filterProjects = (category: string) => {
    setActiveFilter(category);
    // In a real implementation, this would filter projects by category
  };

  if (loading) {
    return <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-blue-500 text-sm">Loading creative projects...</p>
        </div>
      </div>;
  }

  if (error) {
    return <div className="flex h-[80vh] w-full items-center justify-center">
        <GlassmorphicCard className="max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600 text-white">
              Try again
            </Button>
          </div>
        </GlassmorphicCard>
      </div>;
  }

  return <AnimatedTransition>
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
        {/* Figma-like header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-medium">Explore Projects</h1>
          <div className="flex gap-3">
            {/* Search or filter controls can go here */}
          </div>
        </div>

        {/* Category filters - more spaced out */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => filterProjects('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            All Projects
          </button>
          <button onClick={() => filterProjects('design')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'design' ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            Design
          </button>
          <button onClick={() => filterProjects('development')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'development' ? 'bg-blue-700 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            Development
          </button>
          <button onClick={() => filterProjects('marketing')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'marketing' ? 'bg-blue-800 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            Marketing
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-md bg-white/5 p-10 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
              <Layers className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium mb-4">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              There are no published projects available at the moment. Be the first to share your creative work!
            </p>
            <Button className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-2" onClick={() => navigate('/projects/new')}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
              <Card key={project.id} className="bg-black border border-white/10 hover:border-blue-500/30 transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg flex flex-col">
                <div className="relative">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-52 object-cover border-b border-white/10" />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="bg-black/50 backdrop-blur-sm p-2 rounded-md hover:bg-black/70 transition-colors">
                      <Bookmark className="h-4 w-4 text-blue-500" />
                    </button>
                    <button className="bg-black/50 backdrop-blur-sm p-2 rounded-md hover:bg-black/70 transition-colors">
                      <Share2 className="h-4 w-4 text-blue-400" />
                    </button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 text-gray-400">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4 space-y-4 flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span key={index} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{project.collaborators} Collaborator{project.collaborators !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="outline" className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10" onClick={() => handleViewProject(project.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedTransition>;
};

export default Explore;
