import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Layers, Users, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedTransition from '@/components/AnimatedTransition';

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
        techStack: ["React", "JavaScript"],
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

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    </div>;
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold font-playfair mb-6">Explore Projects</h1>
        
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              No projects have been published yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Layers className="mr-1 h-4 w-4" />
                      <span>{project.techStack.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{project.collaborators} Collaborators</span>
                    </div>
                  </div>
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
