
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creator: string;
  tags?: string[];
  matchScore?: number;
}

const Explore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAISearch, setIsAISearch] = useState(false);
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'AI-Powered Art Generator',
      description: 'A web app that generates unique art pieces based on user prompts using the latest AI models.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Alice Wonderland',
    },
    {
      id: '2',
      title: 'Decentralized Social Media Platform',
      description: 'A social media platform built on blockchain technology, ensuring user data privacy and content ownership.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Bob The Builder',
    },
    {
      id: '3',
      title: 'Smart Home Automation System',
      description: 'An integrated system that automates home functions like lighting, temperature, and security using IoT devices.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Charlie Chaplin',
    },
    {
      id: '4',
      title: 'AI-Powered Art Generator',
      description: 'A web app that generates unique art pieces based on user prompts using the latest AI models.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Alice Wonderland',
    },
    {
      id: '5',
      title: 'Decentralized Social Media Platform',
      description: 'A social media platform built on blockchain technology, ensuring user data privacy and content ownership.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Bob The Builder',
    },
    {
      id: '6',
      title: 'Smart Home Automation System',
      description: 'An integrated system that automates home functions like lighting, temperature, and security using IoT devices.',
      imageUrl: '/placeholder-image.jpg',
      creator: 'Charlie Chaplin',
    },
  ]);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setIsAISearch(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setIsAISearch(true);
    
    try {
      const response = await fetch('/api/search-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error('AI search failed');
      }
      
      const data = await response.json();
      
      // Process results
      const aiMatchedProjects = portfolioItems.map(item => {
        // Simulate AI matching logic
        const matchScore = Math.floor(Math.random() * 60) + 40; // 40-99% match
        const isRelevant = searchQuery.toLowerCase().split(' ').some(term => 
          item.title.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term)
        );
        
        return {
          ...item,
          matchScore: isRelevant ? matchScore : Math.floor(Math.random() * 30) + 10
        };
      }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      setPortfolioItems(aiMatchedProjects);
      
      toast({
        title: "AI Search Completed",
        description: "Found " + aiMatchedProjects.length + " relevant projects",
      });
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to perform AI search at this time",
        variant: "destructive"
      });
      
      // Fallback to regular search
      basicSearch();
    } finally {
      setIsLoading(false);
    }
  };
  
  const basicSearch = () => {
    const filtered = portfolioItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered;
  };

  const filteredPortfolioItems = isAISearch ? 
    portfolioItems : 
    basicSearch();

  return (
    <AnimatedTransition>
      <div className="page-container">
        <section className="py-12">
          <div className={`
            transition-all duration-1000
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <h1 className="page-header">Explore Projects</h1>
            <p className="page-subheader">
              Discover innovative projects and connect with talented creators.
            </p>
          </div>

          <div className={`
            mb-8 transition-all duration-1000 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search projects
                </Label>
                <Input
                  type="search"
                  id="search"
                  placeholder="Search for projects..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleAISearch}
                disabled={isLoading || !searchQuery}
                className={isAISearch ? "border-primary" : ""}
              >
                <Sparkles className={`h-4 w-4 ${isAISearch ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
            </div>
            
            {isAISearch && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Using AI-enhanced search results</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolioItems.map((item) => (
              <div
                key={item.id}
                className={`transition-all duration-700 delay-${100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <GlassmorphicCard className="h-full flex flex-col">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="aspect-video w-full object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                  <p className="text-muted-foreground text-xs mb-4">
                    By {item.creator}
                  </p>
                  {item.matchScore && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {item.matchScore}% match
                      </span>
                    </div>
                  )}
                  <Link
                    to={`/project/${item.id}`}
                    className="mt-auto flex items-center font-medium text-primary hover:underline gap-1 group"
                  >
                    <span>Learn More</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </GlassmorphicCard>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AnimatedTransition>
  );
};

export default Explore;
