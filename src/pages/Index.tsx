
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedTransition from '../components/AnimatedTransition';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Index = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeSlide, setActiveSlide] = useState(1);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const features = [
    {
      title: 'Explore',
      description: 'Discover projects and co-create with creative professionals.',
      color: '#E4FF98',
      id: 0
    }, 
    {
      title: 'Search',
      description: 'Find collaborators with complementary skills for your next project.',
      color: '#E4FF98',
      id: 1
    }, 
    {
      title: 'Create',
      description: 'Get inspired and develop your ideas through guided creative collaboration.',
      color: '#E4FF98',
      id: 2
    }
  ];

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };
  
  return (
    <AnimatedTransition>
      <div className="min-h-screen bg-[#121212] flex flex-col relative">
        {/* Logo Area */}
        <div className="w-full h-[127px] bg-[#121212] flex justify-center items-end pb-4">
          <img 
            src="/lovable-uploads/4e4b3c3d-9ef2-4e5f-8850-d3b647902ecb.png" 
            alt="IDXF Logo" 
            className="w-[160px] h-auto"
          />
        </div>
        
        {/* Welcome Text */}
        <div className="px-6 mt-[19px]">
          <h2 className="text-white text-[25px] font-bold font-satoshi">
            Welcome to Idea Forge :)
          </h2>
          
          <p className="text-white text-[25px] font-bold font-satoshi mt-6 leading-[34px]">
            An exclusive third space for creatives to: Connect, Collaborate, and Co-create!
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto px-6 mb-[76px]">
          <div className="flex flex-col gap-3">
            <Link 
              to="/signup" 
              className="bg-[#E4FF98] text-[#121212] h-[48px] rounded-[50px] flex items-center justify-center font-satoshi font-bold text-[25px]"
            >
              Get started
            </Link>
            
            <Link 
              to="/login" 
              className="bg-white text-[#121212] h-[48px] rounded-[50px] flex items-center justify-center font-satoshi font-bold text-[25px]"
            >
              Login
            </Link>
          </div>
        </div>
        
        {/* Feature Cards Carousel */}
        <div className="w-full h-[200px] overflow-x-auto flex px-4 gap-4 mb-[65px] no-scrollbar">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex-none w-[352px] h-[200px] bg-[#E4FF98] rounded-[50px] flex items-center justify-center p-4"
            >
              <p className="text-[#121212] text-[40px] leading-[54px] font-bold font-satoshi text-center">
                {feature.title} <span className="block text-[32px]">{feature.description}</span>
              </p>
            </div>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-3 mb-16">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full ${
                activeSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Index;
