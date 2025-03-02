
import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface Skill {
  name: string;
  color: string;
}

interface SkillsetSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  availableSkills?: Skill[]; // Now accepting skills as prop
}

// Define some default skill categories for organization
const defaultCategories = [
  "Design", 
  "Development", 
  "Management", 
  "Creative", 
  "Technical"
];

// Helper function to categorize skills (simplified)
const categorizeSkill = (skillName: string): string => {
  if (skillName.includes("Design") || skillName.includes("UI") || skillName.includes("UX") || skillName.includes("Graphic") || skillName.includes("Illustration")) {
    return "Design";
  } else if (skillName.includes("Development") || skillName.includes("Frontend") || skillName.includes("Backend") || skillName.includes("Game")) {
    return "Development";
  } else if (skillName.includes("Management") || skillName.includes("Marketing")) {
    return "Management";
  } else if (skillName.includes("3D") || skillName.includes("Video") || skillName.includes("Animation") || skillName.includes("Sound")) {
    return "Creative";
  } else {
    return "Technical";
  }
};

const SkillsetSelector = ({ selectedSkills, onChange, availableSkills = [] }: SkillsetSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategories[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Group skills by category
  const skillsByCategory = defaultCategories.reduce((acc, category) => {
    acc[category] = availableSkills.filter(skill => 
      categorizeSkill(skill.name) === category
    );
    return acc;
  }, {} as Record<string, Skill[]>);
  
  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    onChange(selectedSkills.filter(s => s !== skill));
  };
  
  return (
    <div className="glassmorphic-card">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Selected Skills</h3>
        
        {selectedSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Select skills to find creatives with matching abilities
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => {
              const skillInfo = availableSkills.find(s => s.name === skill);
              return (
                <div 
                  key={skill} 
                  className="chip flex items-center gap-1 pr-1"
                  style={{ backgroundColor: skillInfo?.color || '#6366F1', color: '#fff' }}
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="button-secondary flex items-center justify-center gap-2 w-full"
        >
          <Plus size={18} />
          <span>{isExpanded ? 'Close Skill Selector' : 'Add Skills'}</span>
        </button>
        
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 glassmorphic-card z-10">
            <div className="flex gap-1 mb-4 overflow-x-auto pb-2 scrollbar-thin">
              {defaultCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`chip whitespace-nowrap ${
                    activeCategory === category ? 'chip-active' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skillsByCategory[activeCategory]?.map(skill => {
                const isSelected = selectedSkills.includes(skill.name);
                return (
                  <button
                    key={skill.name}
                    onClick={() => handleToggleSkill(skill.name)}
                    className={`
                      text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2
                      ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-muted-foreground'}
                    `}>
                      {isSelected && <Check size={12} className="text-primary" />}
                    </div>
                    <span>{skill.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsetSelector;
