
import { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import { BarChart2, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface Creative {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills: string[];
  location: string;
  sex?: string; // Add sex field
  isNearby?: boolean;
  matchScore?: number;
  portfolio: Array<{
    id: string;
    title: string;
    image: string;
  }>;
}

interface CreativeCardProps {
  creative: Creative;
  showMatchScore?: boolean;
}

const CreativeCard = ({ creative, showMatchScore = false }: CreativeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const truncateBio = (bio: string, limit: number = 100) => {
    if (bio.length <= limit) return bio;
    return bio.slice(0, limit) + '...';
  };

  // Use sex for avatar if available, default to seed-based avatar
  const avatarSrc =  `https://api.dicebear.com/7.x/avataaars/svg?seed=${creative.name}&gender=${creative.sex || 'male'}`;

  // Make sure matchScore is displayed as an integer
  const displayMatchScore = creative.matchScore !== undefined 
    ? Math.round(creative.matchScore) 
    : undefined;

  return (
    <GlassmorphicCard
      className="h-full flex flex-col relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {creative.isNearby && (
        <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
          <MapPin size={10} className="mr-1" />
          Near you
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <img 
            src={avatarSrc} 
            alt={creative.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
          {showMatchScore && displayMatchScore !== undefined && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-xs text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-background font-medium">
              {displayMatchScore}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{creative.name}</span>
          <span className="text-sm text-muted-foreground">{creative.role}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {truncateBio(creative.bio)}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {creative.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="chip">
            {skill}
          </span>
        ))}
        {creative.skills.length > 4 && (
          <span className="chip">+{creative.skills.length - 4}</span>
        )}
      </div>
      
      {showMatchScore && displayMatchScore !== undefined && (
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              <div className="text-sm">
                <span className="text-muted-foreground">Match: </span>
                <span className="font-medium">{displayMatchScore}%</span>
              </div>
            </div>
            
            <Button size="sm" variant="ghost" className="text-xs h-8">
              Connect <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
      
      {!showMatchScore && creative.portfolio.length > 0 && (
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
          {creative.portfolio.slice(0, 2).map((item) => (
            <div key={item.id} className="grid-card rounded-md overflow-hidden aspect-square">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {!showMatchScore && creative.portfolio.length === 0 && (
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{creative.location}</span>
          </div>
          
          <Button size="sm" variant="ghost" className="text-xs h-8">
            Connect <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
      )}
    </GlassmorphicCard>
  );
};

export default CreativeCard;
