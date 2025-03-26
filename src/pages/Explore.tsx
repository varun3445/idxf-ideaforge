import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Search, Bookmark, Filter, Award, Users } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import AnimatedTransition from '../components/AnimatedTransition';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backers_count: number;
  skills?: string[];
  overview?: string;
  goals?: string;
  challenges?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for initial display
  const mockProjects: PortfolioItem[] = [
    {
      id: '1',
      title: 'AI Visual Design Helper',
      description: 'An AI-powered tool that helps designers create better mockups and interfaces by analyzing design principles.',
      imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1170&auto=format&fit=crop',
      backers_count: 12,
      skills: ['React', 'AI', 'UI/UX', 'TypeScript'],
      overview: 'A tool that leverages artificial intelligence to enhance the design process.',
      goals: 'To bridge the gap between technical implementation and visual design excellence.',
      challenges: 'Integrating sophisticated AI algorithms with an intuitive user interface.'
    },
    {
      id: '2',
      title: 'Collaborative Code Learning',
      description: 'Platform for developers to learn coding together by working on shared projects with mentorship features.',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1170&auto=format&fit=crop',
      backers_count: 18,
      skills: ['JavaScript', 'Python', 'Education', 'Community'],
      overview: 'A collaborative platform for learning coding through real projects.',
      goals: 'To make coding education more interactive and practical.',
      challenges: 'Creating a balance between structured learning and creative freedom.'
    },
    {
      id: '3',
      title: 'Sustainable Resource Tracker',
      description: 'Application to track and optimize sustainable resource usage in communities and businesses.',
      imageUrl: 'https://images.unsplash.com/photo-1544507286-d301f18ada89?q=80&w=1170&auto=format&fit=crop',
      backers_count: 9,
      skills: ['Data Visualization', 'Sustainability', 'Analytics'],
      overview: 'A tracking system for monitoring and improving resource sustainability.',
      goals: 'To provide actionable insights for reducing environmental impact.',
      challenges: 'Collecting accurate data and presenting it in a meaningful way.'
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      let combinedProjects: PortfolioItem[] = [...mockProjects];
      
      try {
        // First set mock data
        setPortfolioItems(mockProjects);
        
        // Then attempt to fetch real projects from Supabase
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        let realProjects: PortfolioItem[] = [];
        
        if (data && data.length > 0) {
          console.log('Fetched real projects:', data);
          
          // Transform Supabase data to match our PortfolioItem interface
          // Using a default image URL since the projects table doesn't have an image_url field
          realProjects = data.map(project => ({
            id: project.id,
            title: project.title || 'Untitled Project',
            description: project.description || 'No description available',
            imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1170&auto=format&fit=crop', // Default image
            backers_count: project.backers_count || 0,
            owner_id: project.owner_id,
            created_at: project.created_at,
            updated_at: project.updated_at,
            overview: project.overview || undefined,
            goals: project.goals || undefined, 
            challenges: project.challenges || undefined,
            skills: project.skills || []
          }));
          
          // Combine mock and real projects
          combinedProjects = [...realProjects, ...mockProjects];
        }
        
        setPortfolioItems(combinedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Showing sample projects instead.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const filteredItems = portfolioItems.filter(item => {
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesQuery;
    // Add more filter cases as needed for other tabs
    return matchesQuery;
  });

  const formatSkills = (skills?: string[]) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {skills.slice(0, 3).map((skill, index) => (
          <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
        ))}
        {skills.length > 3 && (
          <Badge variant="outline" className="text-xs">+{skills.length - 3} more</Badge>
        )}
      </div>
    );
  };

  const navigateToProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Hero Section */}
          <section className="text-center mb-8">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">Explore Projects</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover innovative projects from creators around the world. Find inspiration, collaboration opportunities, or back projects that excite you.
            </p>
          </section>
          
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="new">Newest</TabsTrigger>
              <TabsTrigger value="popular">Most Backed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} className="animate-pulse">
                      <div className="aspect-video w-full bg-muted" />
                      <CardHeader>
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                        {formatSkills(item.skills)}
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">Creator Name</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {item.backers_count} backers
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigateToProject(item.id)}>
                          View Project <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No projects found matching your search criteria.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Other tabs content would be similar */}
            <TabsContent value="trending" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Trending projects will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Newest projects will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Most backed projects will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Explore;
