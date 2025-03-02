
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GlassmorphicCard from './GlassmorphicCard';
import { ProjectIdea } from '../data/mockData';

interface ProjectIdeaCardProps {
  idea: ProjectIdea;
}

const ProjectIdeaCard = ({ idea }: ProjectIdeaCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <GlassmorphicCard
      className="h-full flex flex-col"
      onClick={() => setExpanded(!expanded)}
      hoverEffect={true}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="mb-2">
            <span className={`chip ${getDifficultyColor(idea.difficulty)}`}>
              {idea.difficulty}
            </span>
            <span className="chip ml-2">{idea.category}</span>
          </div>
          <h3 className="text-lg font-medium">{idea.title}</h3>
        </div>
        <button 
          className="p-1 rounded-full hover:bg-secondary transition-colors mt-1"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        {idea.description}
      </p>
      
      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-2">Process Steps:</h4>
          <ol className="space-y-2">
            {idea.steps.map((step, index) => (
              <li key={index} className="flex items-baseline gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </GlassmorphicCard>
  );
};

export default ProjectIdeaCard;
