import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight, ArrowUpRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';
const Index = () => {
  const [isVisible, setIsVisible] = useState(true);
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
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`text-left transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <span className=""></span>
                <h1 className="hero-headline mb-6">
                  Connect, Collaborate & Create <span className="text-primary">Together</span>
                </h1>
                <p className="hero-subheadline max-w-xl">
                  Find the perfect creative partners with complementary skillsets and bring your ideas to life on Idea Forge.
                </p>
                
                <div className={`
                  flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-200
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}>
                  <Link to="/signup" className="button-primary flex items-center justify-center">
                    <span>Get Started</span>
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                  <Link to="/login" className="button-secondary flex items-center justify-center">
                    <span>Login</span>
                  </Link>
                </div>
              </div>
              
              <div className={`
                relative w-full transition-all duration-1000 delay-300
                ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}>
                <div className="relative w-full flex items-center justify-center">
                  <img src="/lovable-uploads/dca4cf86-d17a-4f6a-b4bb-8748c5a74884.png" alt="Idea Forge App" className="w-full max-w-md mx-auto rounded-2xl shadow-lg border border-border/10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-left mb-16">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl">
                Our platform makes it easy to bring your creative ideas to life through collaboration
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => <div key={index} className={`transition-all duration-700 delay-${feature.delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex flex-col h-full p-6 rounded-2xl bg-background border border-border/40 hover:border-primary/40 transition-all duration-300">
                    <div className="feature-icon w-14 h-14 flex items-center justify-center rounded-full mb-6">
                      <feature.icon size={24} />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {feature.description}
                    </p>
                    
                    <Link to="/signup" className="mt-auto inline-flex items-center text-primary font-medium hover:underline gap-1 group">
                      <span>Try {feature.title}</span>
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </div>
                </div>)}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 md:px-6 text-left">
            <h2 className="text-3xl font-bold mb-4">Ready to start your creative journey?</h2>
            <p className="text-white/70 mb-8 max-w-2xl">
              Join thousands of creators and innovators already using Idea Forge to collaborate on amazing projects.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="button-primary inline-flex items-center">
                Get Started For Free
              </Link>
              <Link to="/login" className="bg-transparent border border-white text-white hover:bg-white/10 px-5 py-2 rounded-full inline-flex items-center transition-colors">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AnimatedTransition>;
};
export default Index;