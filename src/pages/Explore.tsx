import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Heart } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creator: string;
  collaborators?: number;
  category?: string;
  techStack?: string[];
}

const Explore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([{
    id: '1',
    title: 'AI-Powered Visual Design Assistant',
    description: 'An intelligent design assistant that provides real-time feedback and suggestions as designers work on their projects.',
    imageUrl: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop',
    creator: 'Alice Wonderland',
    collaborators: 5,
    category: 'AI & Design',
    techStack: ['React', 'TensorFlow.js', 'WebGL', 'Three.js']
  }, {
    id: '2',
    title: 'Decentralized Creative Marketplace',
    description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1332&auto=format&fit=crop',
    creator: 'Bob Builder',
    collaborators: 3,
    category: 'Web3',
    techStack: ['Solidity', 'React', 'IPFS', 'Ethereum']
  }, {
    id: '3',
    title: 'Immersive Learning Environment',
    description: 'A VR-based educational platform that creates interactive, spatial learning experiences for complex subjects.',
    imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1170&auto=format&fit=crop',
    creator: 'Charlie Chen',
    collaborators: 8,
    category: 'Education',
    techStack: ['Unity', 'WebXR', 'Three.js', 'Node.js']
  }, {
    id: '4',
    title: 'Sustainable Design Calculator',
    description: 'A tool that helps designers measure and optimize the environmental impact of their digital and physical products.',
    imageUrl: 'https://images.unsplash.com/photo-1516535794938-6f3426ecacba?q=80&w=1206&auto=format&fit=crop',
    creator: 'Dana Davis',
    collaborators: 2,
    category: 'Sustainability',
    techStack: ['React', 'Python', 'D3.js', 'PostgreSQL']
  }, {
    id: '5',
    title: 'Collaborative Audio Workspace',
    description: 'A platform for remote music production and audio engineering teams to work together in real-time.',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1170&auto=format&fit=crop',
    creator: 'Eddie Evans',
    collaborators: 6,
    category: 'Music & Audio',
    techStack: ['WebRTC', 'Web Audio API', 'React', 'Node.js']
  }, {
    id: '6',
    title: 'Accessibility Design System',
    description: 'An open-source design system focused on creating highly accessible digital experiences for users of all abilities.',
    imageUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1336&auto=format&fit=crop',
    creator: 'Fiona Frost',
    collaborators: 4,
    category: 'Accessibility',
    techStack: ['React', 'TypeScript', 'ARIA', 'Storybook']
  }]);

  const {
    toast
  } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const filteredPortfolioItems = portfolioItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.creator.toLowerCase().includes(searchQuery.toLowerCase()) || item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return <AnimatedTransition>
      <div className="page-container bg-white text-black">
        <section className="py-6 sm:py-10 md:py-16">
          <div className={`
            transition-all duration-1000
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <h1 className="page-header text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 text-left text-black">Explore Projects</h1>
            <p className="page-subheader text-base md:text-lg max-w-3xl mx-auto py-0 text-left text-gray-800">
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
            <Input 
              type="search" 
              id="search" 
              placeholder="Search for projects..." 
              value={searchQuery} 
              onChange={handleSearchChange} 
              className="text-base md:text-lg py-3 md:py-6 rounded-full shadow-md px-4 md:px-8 bg-white text-black border-gray-300" 
            />
          </div>

          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 lg:gap-8`}>
            {filteredPortfolioItems.map(item => <div key={item.id} className={`transition-all duration-700 delay-${100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <GlassmorphicCard className="h-full flex flex-col p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 bg-white shadow-lg">
                  <img src={item.imageUrl} alt={item.title} className="aspect-video w-full rounded-lg mb-4 sm:mb-6 md:mb-8 shadow-md object-cover" />
                  
                  <div className="flex flex-col items-start mb-3 sm:mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-2 text-left text-black">{item.title}</h3>
                    {item.category && <Badge variant="outline" className="text-black border-gray-300 text-xs sm:text-sm py-1 sm:py-[5px] bg-gray-100">
                        {item.category}
                      </Badge>}
                  </div>
                  
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 sm:mb-6 md:mb-8 text-left">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                    {item.techStack?.map((tech, index) => <span key={index} className="text-xs sm:text-sm bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-black">
                        {tech}
                      </span>)}
                  </div>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8 text-left">
                    Created by <span className="font-medium text-black">{item.creator}</span>
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Users size={16} className="bg-transparent" />
                        <span className="text-center">{item.collaborators || 0}</span>
                      </div>
                      
                      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                        <Award className="h-3 w-3" />
                        <span>24 backers</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/project/${item.id}`} className="flex items-center font-medium text-blue-600 hover:underline gap-1 sm:gap-2 group">
                        <span>Explore</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </GlassmorphicCard>
              </div>)}
          </div>
        </section>
      </div>
    </AnimatedTransition>;
};

export default Explore;
