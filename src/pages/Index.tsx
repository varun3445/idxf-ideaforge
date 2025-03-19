import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight, ArrowUpRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
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
        {/* Hero Section */}
        <section className="relative overflow-hidden py-10 md:py-20 lg:py-32 hero-section">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className={`text-left transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="hero-headline mb-4 md:mb-6">
                  Connect, Collaborate & Create <span className="text-primary">Together</span>
                </h1>
                <p className="hero-subheadline max-w-xl">We empower aim to aspiring creators, innovators, and entrepreneurs who want to build their identity and establish a personal or professional brand.</p>
                
                <div className={`
                  flex flex-col sm:flex-row gap-3 transition-all duration-1000 delay-200
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}>
                  <Link to="/signup" className="button-primary flex items-center justify-center">
                    <span>Get Started</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link to="/login" className="button-secondary flex items-center justify-center">
                    <span>Login</span>
                  </Link>
                </div>
              </div>
              
              {!isMobile && <div className={`
                  relative w-full transition-all duration-1000 delay-300
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}>
                  <div className="relative w-full flex items-center justify-center">
                    <img alt="Idea Forge App" className="w-full max-w-md mx-auto rounded-2xl shadow-lg border border-border/10" src="/lovable-uploads/b8bea92f-d08b-4bb7-ab93-fcda35750265.png" />
                    
                  </div>
                </div>}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-20 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-left mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-3 md:mt-4 max-w-2xl text-sm md:text-base">
                Our platform makes it easy to bring your creative ideas to life through collaboration
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => <div key={index} className={`transition-all duration-700 delay-${feature.delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex flex-col h-full p-4 md:p-6 rounded-2xl bg-background border border-border/40 hover:border-primary/40 transition-all duration-300">
                    <div className="feature-icon w-12 h-12 flex items-center justify-center rounded-full mb-4 md:mb-6">
                      <feature.icon size={20} />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 md:mb-6">
                      {feature.description}
                    </p>
                    
                    <Link to="/signup" className="mt-auto inline-flex items-center text-primary font-medium hover:underline gap-1 group">
                      <span>Try {feature.title}</span>
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </div>
                </div>)}
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
              <Link to="/signup" className="button-primary inline-flex items-center">
                Get Started For Free
              </Link>
              <Link to="/login" className="bg-transparent border border-white text-white hover:bg-white/10 px-4 py-2 rounded-full inline-flex items-center transition-colors">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AnimatedTransition>;
};
export default Index;