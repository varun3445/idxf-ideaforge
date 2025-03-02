
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
        <section className="flex flex-col lg:flex-row gap-12 items-center justify-between py-16 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <div 
              className={`transition-all duration-1000 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <span className="chip bg-primary/10 text-primary mb-4">Creative Hub Lab</span>
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
              <Link to="/explore" className="button-primary">
                Get Started
              </Link>
              <Link to="/matches" className="button-secondary">
                Find Collaborators
              </Link>
            </div>
          </div>
          
          <div className={`
            relative w-full max-w-lg aspect-square transition-all duration-1000 delay-300
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/5 rounded-full blur-3xl opacity-50 animate-pulse-soft" />
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-3/4 aspect-square bg-gradient-to-br from-primary to-[#818cf8] rounded-full flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-white rounded-full animate-float flex items-center justify-center">
                  <div className="text-4xl">👋</div>
                </div>
              </div>
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
                  <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {feature.description}
                  </p>
                  
                  <Link
                    to={feature.path}
                    className="mt-auto flex items-center font-medium text-primary hover:underline gap-1 group"
                  >
                    <span>Explore {feature.title}</span>
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
