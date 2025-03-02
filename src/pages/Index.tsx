
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heart, Lightbulb, ArrowRight } from 'lucide-react';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const features = [
    {
      title: 'Explore',
      description: 'Discover projects and connect with creative professionals from around the world.',
      icon: Grid,
      path: '/explore',
      delay: 100,
    },
    {
      title: 'Matches',
      description: 'Find collaborators with complementary skills for your next project.',
      icon: Heart,
      path: '/matches',
      delay: 200,
    },
    {
      title: 'Experiment Lab',
      description: 'Get inspired and develop your ideas through guided creative exercises.',
      icon: Lightbulb,
      path: '/lab',
      delay: 300,
    },
  ];

  return (
    <AnimatedTransition>
      <div className="page-container">
        <section className="flex flex-col lg:flex-row gap-12 items-center justify-between py-16 lg:py-24">
          <div className="max-w-2xl space-y-6">
            <div 
              className={`transition-all duration-1000 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <span className="chip bg-neon/10 text-neon mb-4">Idea Forge</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
                Connect, Collaborate, Create
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Find the perfect creative partners with complementary skillsets and bring your ideas to life.
              </p>
            </div>
            
            <div className={`
              flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-200
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}>
              <Link to="/signup" className="button-primary">
                Sign Up
              </Link>
              <Link to="/login" className="button-secondary">
                Log In
              </Link>
            </div>
          </div>
          
          <div className={`
            relative w-full max-w-md transition-all duration-1000 delay-300
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}>
            <div className="relative w-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/3a8bca34-e0db-482d-8ecc-9aed0ea2913e.png" 
                alt="Idea Forge Logo" 
                className="w-full max-w-[280px]"
              />
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transition-all duration-700 delay-${feature.delay} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <GlassmorphicCard className="h-full flex flex-col">
                  <div className="mb-4 p-3 rounded-full bg-neon/10 w-fit">
                    <feature.icon size={24} className="text-neon" />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {feature.description}
                  </p>
                  
                  <Link
                    to="/signup"
                    className="mt-auto flex items-center font-medium text-neon hover:underline gap-1 group"
                  >
                    <span>Try {feature.title}</span>
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

export default Index;
