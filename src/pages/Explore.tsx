
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink, Filter, Globe, Loader2, Search, Users } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  owner_id: string;
  backers_count: number;
  share_code: string;
  owner?: {
    name: string;
    avatar: string | null;
  };
}

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    loadPublishedProjects();
  }, []);

  const loadPublishedProjects = async () => {
    setLoading(true);
    try {
      // Fetch published projects
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, created_at, owner_id, backers_count, share_code')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch owner details separately
      const projectsWithOwners = await Promise.all(
        data.map(async (project) => {
          // Get owner profile details
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', project.owner_id)
            .single();
          
          return {
            ...project,
            owner: ownerError ? undefined : ownerData
          };
        })
      );

      setProjects(projectsWithOwners);
    } catch (error) {
      console.error('Error loading published projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    // First apply text search
    if (searchQuery && !(
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Then apply other filters if they exist
    if (Object.values(filters).some(value => value === true)) {
      // Apply filters logic here
      // This is a placeholder for future filter implementation
      return true;
    }
    
    return true;
  });

  const renderProjectGrid = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-16">
          <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium">No published projects found</h3>
          <p className="text-gray-500 mt-2 mb-6">Be the first to publish a project for others to discover!</p>
          <Button onClick={() => navigate('/projects')}>Create a Project</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-sm text-gray-500">
                {project.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{project.backers_count || 0} backers</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {project.owner?.avatar ? (
                    <img 
                      src={project.owner.avatar} 
                      alt={project.owner.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="text-sm">{project.owner?.name || 'Anonymous'}</div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-gray-50 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                View Project
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
            <p className="text-gray-600">
              Discover innovative projects and connect with like-minded creators
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="projects">Public Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              {renderProjectGrid()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Explore;
