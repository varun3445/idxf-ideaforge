import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "../components/ui/navigation-menu";
import { Button } from "../components/ui/button";
const Index = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const features = [{
    title: 'Explore',
    description: 'Discover projects and connect with creative professionals from around the world.',
    icon: Grid,
    path: '/explore',
    delay: 100
  }, {
    title: 'Matches',
    description: 'Find collaborators with complementary skills for your next project.',
    icon: Heart,
    path: '/matches',
    delay: 200
  }, {
    title: 'Experiment Lab',
    description: 'Get inspired and develop your ideas through guided creative exercises.',
    icon: Lightbulb,
    path: '/lab',
    delay: 300
  }];
  return <AnimatedTransition>
      <div className="min-h-screen bg-background">
        {/* Navigation Bar */}
        <nav className="py-4 px-6 border-b border-border/20">
          
        </nav>
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-10 md:py-20 lg:py-32 hero-section">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                An Exclusive Community of<br />Like-Minded Creators
              </h1>
              
              <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                A platform where lifestyle meets influence making it
                easier for brands and creators to grow together
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
                  Get Started
                </Link>
                
                <Link to="/login" className="bg-secondary text-secondary-foreground border-2 border-border px-8 py-3 rounded-md font-medium hover:border-primary/50 transition-colors">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-20 bg-secondary">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Our platform makes it easy to bring your creative ideas to life through collaboration
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => <div key={index} className="bg-background border-2 border-border/20 rounded-lg p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="text-foreground" size={20} />
                  </div>
                  
                  <h3 className="font-playfair text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 mb-4">
                    {feature.description}
                  </p>
                  
                  <Link to="/signup" className="inline-flex items-center text-foreground font-medium hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        
      </div>
    </AnimatedTransition>;
};
export default Index;