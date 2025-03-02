
import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import SkillsetSelector from '../components/SkillsetSelector';
import CreativeCard from '../components/CreativeCard';
import { creatives, Creative } from '../data/mockData';
import { Sliders } from 'lucide-react';

const Matches = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchedCreatives, setMatchedCreatives] = useState<Creative[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  useEffect(() => {
    if (selectedSkills.length === 0) {
      setMatchedCreatives([...creatives]);
      return;
    }
    
    // Calculate match score for each creative based on skill overlap
    const creativesWithScores = creatives.map(creative => {
      // Count matching skills
      const matchingSkills = creative.skills.filter(skill => 
        selectedSkills.includes(skill)
      );
      
      // Calculate score - percentage of selected skills that match
      const score = Math.round((matchingSkills.length / selectedSkills.length) * 100);
      
      return {
        ...creative,
        matchScore: score
      };
    });
    
    // Sort by match score (highest first)
    const sorted = creativesWithScores.sort((a, b) => 
      (b.matchScore || 0) - (a.matchScore || 0)
    );
    
    setMatchedCreatives(sorted);
  }, [selectedSkills]);
  
  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="page-header">Find Your Match</h1>
          <p className="page-subheader">
            Select the skills you're looking for and discover creatives with matching abilities
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`lg:w-1/3 transition-all duration-300 ${
            filtersOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          }`}>
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-medium">Filters</h2>
                <button 
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <Sliders size={20} />
                </button>
              </div>
              
              {filtersOpen && (
                <SkillsetSelector 
                  selectedSkills={selectedSkills}
                  onChange={setSelectedSkills}
                />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">Matches</h2>
                <p className="text-sm text-muted-foreground">
                  {matchedCreatives.length} creative{matchedCreatives.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="p-2 rounded-full hover:bg-secondary transition-colors hidden lg:flex"
              >
                <Sliders size={20} />
              </button>
            </div>
            
            {matchedCreatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedCreatives.map((creative) => (
                  <CreativeCard 
                    key={creative.id} 
                    creative={creative} 
                    showMatchScore={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="glassmorphic-card text-center py-12">
                <h3 className="text-lg font-medium mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  Try selecting different skills or broadening your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
