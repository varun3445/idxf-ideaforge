
import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { skillCategories } from '../data/mockData';

interface SkillsetSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsetSelector = ({ selectedSkills, onChange }: SkillsetSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState(skillCategories[0].name);
  const [isExpanded, setIsExpanded] = useState(false);
  
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
            {selectedSkills.map(skill => (
              <div 
                key={skill} 
                className="chip chip-active flex items-center gap-1 pr-1"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
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
              {skillCategories.map(category => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`chip whitespace-nowrap ${
                    activeCategory === category.name ? 'chip-active' : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skillCategories
                .find(c => c.name === activeCategory)
                ?.skills.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => handleToggleSkill(skill)}
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
                      <span>{skill}</span>
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
