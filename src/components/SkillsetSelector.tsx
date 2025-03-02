
import { useState } from 'react';
import { Plus, X, Check, Circle, CircleCheck } from 'lucide-react';

interface Skill {
  name: string;
  color: string;
}

interface SkillsetSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  availableSkills?: Skill[]; // Now accepting skills as prop
}

// Default available skills (fallback if none provided)
const defaultSkills: Skill[] = [
  { name: "UI Design", color: "#3B82F6" },
  { name: "UX Design", color: "#8B5CF6" },
  { name: "Graphic Design", color: "#EC4899" },
  { name: "Frontend Development", color: "#10B981" },
  { name: "Backend Development", color: "#6366F1" },
  { name: "Game Development", color: "#F59E0B" },
  { name: "3D Modeling", color: "#EF4444" },
  { name: "Illustration", color: "#14B8A6" },
  { name: "Animation", color: "#F97316" },
  { name: "Sound Design", color: "#8B5CF6" },
  { name: "Marketing", color: "#06B6D4" },
  { name: "Project Management", color: "#64748B" }
];

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
  
  // Use default skills if none provided
  const skillsToUse = availableSkills.length > 0 ? availableSkills : defaultSkills;
  
  // Group skills by category
  const skillsByCategory = defaultCategories.reduce((acc, category) => {
    acc[category] = skillsToUse.filter(skill => 
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
          <div className="flex flex-wrap gap-3">
            {selectedSkills.map(skill => {
              const skillInfo = skillsToUse.find(s => s.name === skill);
              return (
                <div 
                  key={skill} 
                  className="chip flex items-center gap-2 py-1.5 px-3 rounded-full"
                  style={{ backgroundColor: skillInfo?.color || '#6366F1', color: '#fff' }}
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X size={14} />
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
          className="button-secondary flex items-center justify-center gap-2 w-full bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
        >
          <Plus size={18} />
          <span>{isExpanded ? 'Close Skill Selector' : 'Add Skills'}</span>
        </button>
        
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md p-4 shadow-lg z-50">
            <div className="flex gap-2 mb-4 overflow-x-auto py-2 pb-3 scrollbar-thin">
              {defaultCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`chip whitespace-nowrap px-4 py-1.5 ${
                    activeCategory === category ? 'chip-active' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              {skillsByCategory[activeCategory]?.map(skill => {
                const isSelected = selectedSkills.includes(skill.name);
                return (
                  <button
                    key={skill.name}
                    onClick={() => handleToggleSkill(skill.name)}
                    className={`
                      text-left px-4 py-3 rounded-full transition-colors flex items-center gap-3
                      ${isSelected ? 'bg-primary/10 text-primary border border-primary/30' : 'hover:bg-secondary/10 border border-border'}
                    `}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CircleCheck size={20} className="text-primary" />
                      ) : (
                        <Circle size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium">{skill.name}</span>
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
