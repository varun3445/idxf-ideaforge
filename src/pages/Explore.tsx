
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Award, Heart, MessageSquare, Bell, Loader2 } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
}

const Explore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    loadPublishedProjects();
  }, []);

  const loadPublishedProjects = async () => {
    setLoading(true);
    console.log("Loading published projects...");
    
    try {
      // Use mock data since we're disabling authentication
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
          created_at: '2023-11-15T00:00:00Z'
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
          created_at: '2023-09-23T00:00:00Z'
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
          created_at: '2023-10-05T00:00:00Z'
        }
      ];
      
      setPortfolioItems(mockProjects);
      console.log("Mock projects loaded:", mockProjects);
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
    navigate(`/forge/${projectId}`);
  };

  const filteredPortfolioItems = portfolioItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
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
          ) : (
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 lg:gap-8`}>
              {filteredPortfolioItems.map(item => (
                <div key={item.id} className={`transition-all duration-700 delay-${100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
                      {item.techStack?.map((tech, index) => <span key={index} className="text-xs sm:text-sm bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white">
                          {tech}
                        </span>)}
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
          )}
        </section>
      </div>
    </AnimatedTransition>;
};

export default Explore;
