
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight, Users, Code, Sparkles } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Button } from "../components/ui/button";
import { useAuth } from '../AuthContext';

const Index = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const features = [{
    title: 'Explore',
    description: 'Discover innovative projects and connect with creative professionals from around the world.',
    icon: Grid,
    path: '/explore',
    delay: 100
  }, {
    title: 'Match',
    description: 'Find collaborators with complementary skills for your next groundbreaking project.',
    icon: Heart,
    path: '/matches',
    delay: 200
  }, {
    title: 'Create',
    description: 'Bring your ideas to life with powerful tools and a supportive community.',
    icon: Sparkles,
    path: '/projects',
    delay: 300
  }, {
    title: 'Connect',
    description: 'Join communities of like-minded creators and expand your professional network.',
    icon: Users,
    path: '/communities',
    delay: 400
  }];
  
  return <AnimatedTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-24 lg:py-32 hero-section">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                An Exclusive Community of<br />Like-Minded Creators
              </h1>
              
              <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                A platform where creativity meets collaboration, making it
                easier for innovators and creators to build amazing things together
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/explore')} 
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Our platform makes it easy to bring your creative ideas to life through collaboration
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glassmorphic-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover-lift"
                  onClick={() => navigate(feature.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  
                  <h3 className="font-playfair text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70 mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="inline-flex items-center text-foreground font-medium hover:text-primary transition-colors">
                    <span>Explore</span>
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How it Works Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">From Ideation to Creation</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Share Your Vision</h3>
                      <p className="text-foreground/70">Post your project idea and outline the skills you're looking for.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Connect with Collaborators</h3>
                      <p className="text-foreground/70">Our matching algorithm will help you find the perfect team members.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Collaborate Seamlessly</h3>
                      <p className="text-foreground/70">Use our tools to organize tasks, share updates, and track progress.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glassmorphic-card rounded-xl p-6 md:p-8">
                <div className="aspect-video bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Code size={64} className="text-primary/60" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-3">Project Showcase</h3>
                <p className="text-foreground/70 mb-4">
                  Browse through our gallery of successful collaborations and get inspired for your next project.
                </p>
                <Button 
                  onClick={() => navigate('/explore')} 
                  className="w-full mt-4"
                >
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">Ready to start your creative journey?</h2>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and innovators already using Idea Forge to collaborate on amazing projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/explore')} 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                size="lg"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AnimatedTransition>;
};

export default Index;
