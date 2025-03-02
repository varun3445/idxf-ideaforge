
import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

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

const defaultSkills: Skill[] = [
  { name: "UX Design", color: "#EC4899" },
  { name: "UI Design", color: "#8B5CF6" },
  { name: "Graphic Design", color: "#3B82F6" },
  { name: "Illustration", color: "#F59E0B" },
  { name: "Frontend Development", color: "#10B981" },
  { name: "Backend Development", color: "#6366F1" },
  { name: "Game Development", color: "#EF4444" },
  { name: "Mobile Development", color: "#8B5CF6" },
  { name: "Product Management", color: "#F59E0B" },
  { name: "Marketing", color: "#EC4899" },
  { name: "3D Modeling", color: "#3B82F6" },
  { name: "Video Editing", color: "#10B981" },
  { name: "Animation", color: "#6366F1" },
  { name: "Sound Design", color: "#EF4444" },
  { name: "React", color: "#61DAFB" },
  { name: "Node.js", color: "#68A063" },
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Python", color: "#306998" },
  { name: "Machine Learning", color: "#FF6F61" }
];

const SkillsetSelector = ({ selectedSkills, onChange, availableSkills = [] }: SkillsetSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategories[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  useEffect(() => {
    // Load skills from database if availableSkills is empty
    const loadSkills = async () => {
      if (availableSkills.length > 0) {
        setSkills(availableSkills);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*');
          
        if (error) {
          console.error('Error loading skills:', error);
          setSkills(defaultSkills);
          return;
        }
        
        if (data && data.length > 0) {
          setSkills(data);
        } else {
          setSkills(defaultSkills);
        }
      } catch (error) {
        console.error('Error:', error);
        setSkills(defaultSkills);
      }
    };
    
    loadSkills();
  }, [availableSkills]);
  
  // Group skills by category
  const skillsByCategory = defaultCategories.reduce((acc, category) => {
    acc[category] = skills.filter(skill => 
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
    <div className="border border-border rounded-md p-4 space-y-4 bg-card">
      <div className="mb-2">
        <h3 className="text-sm font-medium mb-2">Selected Skills</h3>
        
        {selectedSkills.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Select skills to find creatives with matching abilities
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => {
              const skillInfo = skills.find(s => s.name === skill);
              return (
                <div 
                  key={skill} 
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-full"
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
          className="flex items-center justify-center gap-2 px-4 py-2 w-full text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <Plus size={16} />
          <span>{isExpanded ? 'Close Skill Selector' : 'Add Skills'}</span>
        </button>
        
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 border border-border rounded-md bg-card shadow-lg z-10">
            <div className="flex gap-1 mb-4 overflow-x-auto pb-2 scrollbar-thin">
              {defaultCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
                    activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
