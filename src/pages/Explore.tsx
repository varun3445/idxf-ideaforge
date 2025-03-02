import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creator: string;
}

const Explore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
  };

  const filteredPortfolioItems = portfolioItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Label htmlFor="search" className="sr-only">
              Search projects
            </Label>
            <Input
              type="search"
              id="search"
              placeholder="Search for projects..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
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
