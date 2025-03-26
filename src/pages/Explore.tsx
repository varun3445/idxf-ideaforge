
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Award, Heart, MessageSquare, Bell, Loader2, Clock, Target, BookOpen } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '../integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  creator?: string;
  collaborators?: number;
  category?: string;
  techStack?: string[];
  backers_count?: number;
  owner_id?: string;
  created_at: string;
  overview?: string;
  goals?: string;
  challenges?: string;
  skills?: string[];
}

const Explore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'details'>('card');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    setIsVisible(true);
    loadPublishedProjects();
  }, []);

  const loadPublishedProjects = async () => {
    setLoading(true);
    console.log("Loading published projects...");
    
    try {
      // First, load the mock projects
      const mockProjects: PortfolioItem[] = [
        {
          id: '1',
          title: 'AI-Powered Visual Design Assistant',
          description: 'An intelligent design assistant that provides real-time feedback and suggestions as designers work on their projects.',
          imageUrl: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop',
          creator: 'Alice Wonderland',
          collaborators: 5,
          category: 'AI & Design',
          techStack: ['React', 'TensorFlow.js', 'WebGL', 'Three.js'],
          backers_count: 24,
          owner_id: 'user-1',
          created_at: '2023-11-15T00:00:00Z',
          overview: 'This project aims to revolutionize how designers work by providing an AI assistant that can analyze designs in real-time and offer suggestions for improvement.',
          goals: 'Create an intuitive UI for designers, implement advanced ML algorithms for design analysis, and build a community of designers who can share their work.',
          challenges: 'Balancing AI suggestions with creative freedom, optimizing performance for real-time feedback, and developing accurate models for design evaluation.',
          skills: ['UI Design', 'Machine Learning', 'Frontend Development']
        },
        {
          id: '2',
          title: 'Decentralized Creative Marketplace',
          description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
          imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1064&auto=format&fit=crop',
          creator: 'Bob Johnson',
          collaborators: 3,
          category: 'Blockchain',
          techStack: ['Solidity', 'React', 'Ethers.js', 'IPFS'],
          backers_count: 18,
          owner_id: 'user-2',
          created_at: '2023-09-23T00:00:00Z',
          overview: 'This marketplace removes intermediaries and gives creatives full control over their work and earnings through blockchain technology.',
          goals: 'Implement secure smart contracts, create a user-friendly marketplace interface, and build a community of artists and buyers.',
          challenges: 'Ensuring security of transactions, optimizing gas fees, and creating an intuitive UX for users unfamiliar with blockchain.',
          skills: ['Blockchain', 'Smart Contracts', 'Web3 Development']
        },
        {
          id: '3',
          title: 'Immersive VR Educational Platform',
          description: 'An educational platform using VR technology to create interactive learning experiences for students across various subjects.',
          imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1064&auto=format&fit=crop',
          creator: 'Charlie Smith',
          collaborators: 4,
          category: 'Education & VR',
          techStack: ['Unity', 'C#', 'WebXR', 'Three.js'],
          backers_count: 31,
          owner_id: 'user-3',
          created_at: '2023-10-05T00:00:00Z',
          overview: 'This platform transforms education by creating immersive VR environments where students can explore complex concepts in a hands-on way.',
          goals: 'Develop engaging educational experiences, create tools for educators to build content, and support various learning styles.',
          challenges: 'Optimizing performance for VR devices, creating intuitive interactions, and designing effective educational experiences.',
          skills: ['VR Development', 'Unity', '3D Modeling', 'Education Design']
        }
      ];
      
      // Now, try to fetch real projects from Supabase
      let realProjects: PortfolioItem[] = [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_published', true);
      
      if (error) {
        console.error('Error fetching published projects:', error);
      } else if (data) {
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
          collaborators: 1, // Default value
          category: 'Project', // Default category
          techStack: ['Web Development'], // Default tech stack
          overview: project.overview || '',
          goals: project.goals || '',
          challenges: project.challenges || '',
          skills: project.skills || []
        }));
      }
      
      // Combine mock projects with real projects
      const combinedProjects = [...mockProjects, ...realProjects];
      setPortfolioItems(combinedProjects);
      console.log("Combined projects loaded:", combinedProjects);
    } catch (error) {
      console.error('Error loading published projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load published projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBackProject = (projectId: string, projectTitle: string) => {
    toast({
      title: "Project Backed",
      description: `You have successfully backed "${projectTitle}"`,
      variant: "success"
    });
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleSelectProject = (item: PortfolioItem) => {
    setSelectedItem(item);
    setViewMode('details');
  };

  const handleBackToGrid = () => {
    setViewMode('card');
    setSelectedItem(null);
  };

  const filteredPortfolioItems = portfolioItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.skills && item.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return <AnimatedTransition>
      <div className="page-container">
        <section className="py-6 sm:py-10 md:py-16">
          <div className="fixed z-30 top-4 left-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="fixed z-30 top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <MessageSquare size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>No new messages</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className={`
            transition-all duration-1000
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <h1 className="page-header text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 text-left font-playfair">Explore Projects</h1>
            <p className="page-subheader text-base md:text-lg max-w-3xl mx-auto py-0 text-left">
              Discover innovative projects and connect with talented creators.
            </p>
          </div>

          <div className={`
            mb-8 sm:mb-12 md:mb-16 transition-all duration-1000 delay-100 max-w-2xl mx-auto
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <Label htmlFor="search" className="sr-only">
              Search projects
            </Label>
            <Input type="search" id="search" placeholder="Search for projects..." value={searchQuery} onChange={handleSearchChange} className="text-base md:text-lg py-3 md:py-6 rounded-full shadow-md px-4 md:px-8" />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPortfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No published projects found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or check back later for new projects</p>
              <Button onClick={() => navigate('/projects')}>Create Your Own Project</Button>
            </div>
          ) : viewMode === 'card' ? (
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 lg:gap-8`}>
              {filteredPortfolioItems.map(item => (
                <div key={item.id} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <GlassmorphicCard className="h-full flex flex-col p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
                    <img src={item.imageUrl} alt={item.title} className="aspect-video w-full rounded-lg mb-4 sm:mb-6 md:mb-8 shadow-md object-cover" />
                    
                    <div className="flex flex-col items-start mb-3 sm:mb-4 md:mb-6">
                      <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-2 text-left font-playfair">{item.title}</h3>
                      {item.category && <Badge variant="outline" className="text-primary border-primary/20 text-xs sm:text-sm py-1 sm:py-[5px] bg-zinc-900">
                          {item.category}
                        </Badge>}
                    </div>
                    
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 sm:mb-6 md:mb-8 text-left line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                      {item.skills ? 
                        item.skills.map((skill, index) => (
                          <span key={index} className="text-xs sm:text-sm bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white">
                            {skill}
                          </span>
                        )) 
                        : 
                        item.techStack?.map((tech, index) => (
                          <span key={index} className="text-xs sm:text-sm bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white">
                            {tech}
                          </span>
                        ))
                      }
                    </div>
                    
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-3 sm:pt-4 md:pt-6 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Users size={16} className="bg-transparent" />
                          <span className="text-center">{item.collaborators || 0}</span>
                        </div>
                        
                        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                          <Award className="h-3 w-3" />
                          <span>{item.backers_count || 0} backers</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center font-medium gap-1 sm:gap-2 group"
                          onClick={() => handleSelectProject(item)}
                        >
                          <span>Details</span>
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Button>
                        
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center font-medium gap-1 sm:gap-2 group"
                          onClick={() => handleViewProject(item.id)}
                        >
                          <span>View</span>
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </GlassmorphicCard>
                </div>
              ))}
            </div>
          ) : (
            selectedItem && (
              <div className="max-w-4xl mx-auto">
                <Button 
                  variant="outline" 
                  onClick={handleBackToGrid} 
                  className="mb-6"
                >
                  ← Back to Projects
                </Button>
                
                <GlassmorphicCard className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                      <img 
                        src={selectedItem.imageUrl} 
                        alt={selectedItem.title} 
                        className="w-full h-80 object-cover rounded-lg shadow-md" 
                      />
                    </div>
                    
                    <div className="md:w-1/2">
                      <h2 className="text-3xl font-bold mb-4 font-playfair">{selectedItem.title}</h2>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        {selectedItem.category && (
                          <Badge variant="outline" className="text-primary border-primary/20 bg-zinc-900">
                            {selectedItem.category}
                          </Badge>
                        )}
                        
                        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                          <Award className="h-3 w-3" />
                          <span>{selectedItem.backers_count || 0} backers</span>
                        </Badge>
                        
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{selectedItem.collaborators || 0} collaborators</span>
                        </Badge>
                        
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedItem.skills ? 
                          selectedItem.skills.map((skill, index) => (
                            <span key={index} className="text-xs bg-primary/10 px-3 py-1.5 rounded-full text-white">
                              {skill}
                            </span>
                          )) 
                          : 
                          selectedItem.techStack?.map((tech, index) => (
                            <span key={index} className="text-xs bg-primary/10 px-3 py-1.5 rounded-full text-white">
                              {tech}
                            </span>
                          ))
                        }
                      </div>
                      
                      <div className="flex gap-4 mt-auto">
                        <Button 
                          onClick={() => handleBackProject(selectedItem.id, selectedItem.title)}
                          className="flex items-center gap-2"
                        >
                          <Heart className="h-4 w-4" />
                          Back Project
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewProject(selectedItem.id)}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                        <TabsTrigger value="challenges">Challenges</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="mt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <BookOpen className="h-6 w-6 text-primary mt-1" />
                          <h3 className="text-xl font-medium">Project Overview</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedItem.overview || selectedItem.description}
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="goals" className="mt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Target className="h-6 w-6 text-primary mt-1" />
                          <h3 className="text-xl font-medium">Project Goals</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedItem.goals || "No detailed goals have been specified for this project yet."}
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="challenges" className="mt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Award className="h-6 w-6 text-primary mt-1" />
                          <h3 className="text-xl font-medium">Technical Challenges</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedItem.challenges || "No technical challenges have been specified for this project yet."}
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </GlassmorphicCard>
              </div>
            )
          )}
        </section>
      </div>
    </AnimatedTransition>;
};

export default Explore;
