
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Users, Eye, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
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
    navigate(`/project/${projectId}`);
  };

  const filterProjects = (category: string) => {
    setActiveFilter(category);
    // In a real implementation, this would filter projects by category
  };

  if (loading) {
    return <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e3f988]"></div>
          <p className="mt-4 text-[#e3f988] text-sm font-satoshi">Loading creative projects...</p>
        </div>
      </div>;
  }

  if (error) {
    return <div className="flex h-[80vh] w-full items-center justify-center">
        <GlassmorphicCard className="max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 font-satoshi">Error loading projects</h3>
            <p className="text-sm text-gray-400 mb-4 font-satoshi">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#e3f988] hover:bg-[#e3f988]/90 text-black font-satoshi">
              Try again
            </Button>
          </div>
        </GlassmorphicCard>
      </div>;
  }

  return <AnimatedTransition>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header section with Satoshi font */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 font-satoshi">Explore</h1>
          
          {/* Search bar with lime styling */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-[#e3f988] text-creative-black rounded-full px-5 py-3 outline-none font-satoshi"
            />
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-creative-black/70" />
          </div>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-md bg-white/5 p-10 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e3f988]/10 mb-6">
              <Layers className="h-8 w-8 text-[#e3f988]" />
            </div>
            <h3 className="text-xl font-medium mb-4 font-satoshi">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto font-satoshi">
              There are no published projects available at the moment. Be the first to share your creative work!
            </p>
            <Button className="bg-[#e3f988] text-creative-black hover:bg-[#e3f988]/90 px-6 py-2 font-satoshi" onClick={() => navigate('/projects/new')}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="group relative rounded-3xl bg-[#e3f988] p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleViewProject(project.id)}
              >
                {/* Image container with curved corners */}
                <div className="w-full aspect-[4/3] bg-creative-black rounded-3xl overflow-hidden mb-4">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Project title as black lines */}
                <div className="space-y-1.5 mb-3">
                  <div className="h-2.5 bg-black rounded-full w-full max-w-[180px]"></div>
                  <div className="h-2.5 bg-black rounded-full w-full max-w-[150px]"></div>
                </div>

                {/* Tech Stack indicators as rounded pills */}
                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 3).map((tech, index) => (
                    <span 
                      key={index} 
                      className="inline-block h-5 w-14 bg-white/50 rounded-full"
                    ></span>
                  ))}
                </div>

                {/* Hidden overlay with project details */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-white rounded-3xl">
                  <h3 className="text-xl font-bold mb-2 font-satoshi">{project.title}</h3>
                  <p className="text-sm mb-4 line-clamp-3 font-satoshi">{project.description}</p>
                  <Button 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 font-satoshi"
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
            ))}
          </div>
        )}
      </div>
    </AnimatedTransition>;
};

export default Explore;
