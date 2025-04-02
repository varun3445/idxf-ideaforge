
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Users, Eye } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-creative-pink"></div>
          <p className="mt-4 text-creative-purple text-sm">Loading creative projects...</p>
        </div>
      </div>;
  }

  if (error) {
    return <div className="flex h-[80vh] w-full items-center justify-center">
        <GlassmorphicCard className="max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-creative-purple hover:bg-creative-purple/90 text-white">
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
          <button onClick={() => filterProjects('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-creative-pink text-creative-black' : 'bg-white/5 hover:bg-white/10'}`}>
            All Projects
          </button>
          <button onClick={() => filterProjects('design')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'design' ? 'bg-creative-purple text-creative-black' : 'bg-white/5 hover:bg-white/10'}`}>
            Design
          </button>
          <button onClick={() => filterProjects('development')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'development' ? 'bg-creative-yellow text-creative-black' : 'bg-white/5 hover:bg-white/10'}`}>
            Development
          </button>
          <button onClick={() => filterProjects('marketing')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'marketing' ? 'bg-creative-green text-creative-black' : 'bg-white/5 hover:bg-white/10'}`}>
            Marketing
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-md bg-white/5 p-10 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-creative-purple/10 mb-6">
              <Layers className="h-8 w-8 text-creative-purple" />
            </div>
            <h3 className="text-xl font-medium mb-4">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              There are no published projects available at the moment. Be the first to share your creative work!
            </p>
            <Button className="bg-creative-pink text-creative-black hover:bg-creative-pink/90 px-6 py-2" onClick={() => navigate('/projects/new')}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="group relative rounded-3xl bg-creative-yellow/80 p-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleViewProject(project.id)}
              >
                {/* Main image container - big black rounded rectangle */}
                <div className="w-full aspect-[4/3] bg-creative-black rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>

                {/* Project title and meta information */}
                <div className="px-1">
                  {/* Title as three lines */}
                  <div className="space-y-1.5 mb-2">
                    <div className="h-2 bg-creative-black rounded-full w-full max-w-[180px]"></div>
                    <div className="h-2 bg-creative-black rounded-full w-full max-w-[160px]"></div>
                    <div className="h-2 bg-creative-black rounded-full w-full max-w-[120px]"></div>
                  </div>

                  {/* Tech Stack as rounded pills */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map((tech, index) => (
                      <span 
                        key={index} 
                        className="inline-block h-6 w-16 bg-white/30 rounded-full"
                      ></span>
                    ))}
                  </div>

                  {/* Hidden overlay with actual project details that appears on hover */}
                  <div className="absolute inset-0 bg-creative-black/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-sm mb-4 line-clamp-3">{project.description}</p>
                    <Button 
                      variant="outline" 
                      className="border-creative-purple/30 text-creative-purple hover:bg-creative-purple/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProject(project.id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Project
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedTransition>;
};

export default Explore;
