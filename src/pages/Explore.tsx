import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const filteredPortfolioItems = portfolioItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.creator.toLowerCase().includes(searchQuery.toLowerCase()) || item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
  return <AnimatedTransition>
      <div className="page-container">
        <section className="py-16">
          <div className={`
            transition-all duration-1000
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <h1 className="page-header text-4xl md:text-5xl mb-6">Explore Projects</h1>
            <p className="page-subheader text-lg md:text-xl max-w-3xl text-center px-[32px] mx-[240px] py-[15px]">
              Discover innovative projects and connect with talented creators.
            </p>
          </div>

          <div className={`
            mb-16 transition-all duration-1000 delay-100 max-w-2xl mx-auto
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <Label htmlFor="search" className="sr-only">
              Search projects
            </Label>
            <Input type="search" id="search" placeholder="Search for projects..." value={searchQuery} onChange={handleSearchChange} className="text-lg py-6 rounded-full shadow-md px-[32px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {filteredPortfolioItems.map(item => <div key={item.id} className={`transition-all duration-700 delay-${100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <GlassmorphicCard className="h-full flex flex-col p-8 space-y-8">
                  <img src={item.imageUrl} alt={item.title} className="aspect-video w-full rounded-lg mb-8 shadow-md object-cover" />
                  
                  <div className="flex flex-col items-start mb-6">
                    <h3 className="text-2xl font-semibold leading-tight mb-2 text-left">{item.title}</h3>
                    {item.category && <span className="text-sm text-muted-foreground py-[5px]">
                        {item.category}
                      </span>}
                  </div>
                  
                  <p className="text-muted-foreground text-base leading-relaxed mb-8 text-left">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    {item.techStack?.map((tech, index) => <span key={index} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        {tech}
                      </span>)}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-8 text-left">
                    Created by <span className="font-medium text-foreground">{item.creator}</span>
                  </p>
                  
                  <div className="mt-auto flex justify-between items-center pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users size={18} className="bg-transparent" />
                      <span className="text-center">{item.collaborators || 0}</span>
                    </div>
                    
                    <Link to={`/project/${item.id}`} className="flex items-center font-medium text-primary hover:underline gap-2 group">
                      <span>Explore</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </GlassmorphicCard>
              </div>)}
          </div>
        </section>
      </div>
    </AnimatedTransition>;
};
export default Explore;