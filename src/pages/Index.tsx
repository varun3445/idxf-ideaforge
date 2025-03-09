
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight, ArrowUpRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAuth } from '../AuthContext';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isAuthenticated } = useAuth();
  
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
  
  return (
    <AnimatedTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-10 md:py-20 lg:py-32 hero-section">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className={`text-left transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                  Connect, Collaborate & Create <span className="text-primary">Together</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-xl">
                  Find the perfect creative partners with complementary skillsets and bring your ideas to life on Idea Forge.
                </p>
                
                <div className={`
                  flex flex-col sm:flex-row gap-3 transition-all duration-1000 delay-200
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}>
                  <Link to={isAuthenticated ? "/explore" : "/signup"} className="bg-primary text-black hover:bg-primary/90 font-medium px-6 py-3 rounded-full flex items-center justify-center transition-all">
                    <span>{isAuthenticated ? "Go to Explore" : "Get Started"}</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                  {!isAuthenticated && (
                    <Link to="/login" className="bg-white text-black border-2 border-border hover:border-primary hover:shadow-md px-6 py-3 rounded-full flex items-center justify-center transition-all">
                      <span>Login</span>
                    </Link>
                  )}
                </div>
              </div>
              
              {!isMobile && (
                <div className={`
                  relative w-full transition-all duration-1000 delay-300
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}>
                  <div className="relative w-full flex items-center justify-center">
                    <img src="/lovable-uploads/dca4cf86-d17a-4f6a-b4bb-8748c5a74884.png" alt="Idea Forge App" className="w-full max-w-md mx-auto rounded-2xl shadow-lg border border-border/10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-left mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-3 md:mt-4 max-w-2xl text-sm md:text-base">
                Our platform makes it easy to bring your creative ideas to life through collaboration
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div key={index} className={`transition-all duration-700 delay-${feature.delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex flex-col h-full p-4 md:p-6 rounded-2xl bg-background border border-border/40 hover:border-primary/40 transition-all duration-300">
                    <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4 md:mb-6">
                      <feature.icon size={20} className="text-primary" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 md:mb-6">
                      {feature.description}
                    </p>
                    
                    <Link to={isAuthenticated ? feature.path : "/signup"} className="mt-auto inline-flex items-center text-primary font-medium hover:underline gap-1 group">
                      <span>Try {feature.title}</span>
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-10 md:py-20 bg-black text-white">
          <div className="container mx-auto px-4 md:px-6 text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to start your creative journey?</h2>
            <p className="text-white/70 mb-6 md:mb-8 max-w-2xl text-sm md:text-base">
              Join thousands of creators and innovators already using Idea Forge to collaborate on amazing projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/signup" className="bg-primary text-black hover:bg-primary/90 font-medium px-6 py-3 rounded-full inline-flex items-center transition-all">
                Get Started For Free
              </Link>
              <Link to="/login" className="bg-transparent border border-white text-white hover:bg-white/10 px-4 py-2 rounded-full inline-flex items-center transition-colors">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AnimatedTransition>
  );
};

export default Index;
