
import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import SkillsetSelector from '../components/SkillsetSelector';
import CreativeCard from '../components/CreativeCard';
import { Sliders, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  color: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  distance?: number;
  matchScore?: number;
}

const Matches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Calculate distance between two locations (using string comparison for now)
  const calculateLocationSimilarity = (location1: string, location2: string) => {
    // Simple string matching for now (in a real app, would use coordinates)
    const location1Parts = location1.toLowerCase().split(',').map(p => p.trim());
    const location2Parts = location2.toLowerCase().split(',').map(p => p.trim());
    
    // Check for exact matches in location parts
    for (const part1 of location1Parts) {
      for (const part2 of location2Parts) {
        if (part1 === part2 && part1.length > 1) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Fetch all skills from Supabase
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setAllSkills(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast({
          title: "Failed to load skills",
          description: "There was an error loading the available skills",
          variant: "destructive"
        });
      }
    };
    
    fetchSkills();
  }, []);
  
  // Fetch and filter users based on selected skills
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch all users except current user
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, location')
          .neq('id', user.id);
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Fetch all user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from('user_skills')
          .select('user_id, skills(id, name)');
          
        if (skillsError) {
          throw skillsError;
        }
        
        // Combine profiles with their skills
        const usersWithSkills: UserProfile[] = profiles.map((profile) => {
          const profileSkills = userSkills
            .filter(us => us.user_id === profile.id)
            .map(us => us.skills.name);
            
          return {
            ...profile,
            skills: profileSkills,
          };
        });
        
        // Calculate match scores if skills are selected
        let matchedProfiles = [...usersWithSkills];
        
        if (selectedSkills.length > 0) {
          matchedProfiles = usersWithSkills.map(profile => {
            // Count matching skills
            const matchingSkills = profile.skills.filter(skill => 
              selectedSkills.includes(skill)
            );
            
            // Calculate score - percentage of selected skills that match
            const score = Math.round((matchingSkills.length / selectedSkills.length) * 100);
            
            return {
              ...profile,
              matchScore: score
            };
          });
          
          // Sort by match score (highest first)
          matchedProfiles.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
        
        // Add location proximity information
        matchedProfiles = matchedProfiles.map(profile => {
          const isNearby = calculateLocationSimilarity(user.location, profile.location);
          
          return {
            ...profile,
            distance: isNearby ? 1 : 0 // 1 for nearby, 0 for distant (simplified)
          };
        });
        
        // If no skills selected, prioritize by location
        if (selectedSkills.length === 0) {
          matchedProfiles.sort((a, b) => (b.distance || 0) - (a.distance || 0));
        }
        
        setMatchedUsers(matchedProfiles);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load matches",
          description: "There was an error loading your potential matches",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, selectedSkills]);
  
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
                  availableSkills={allSkills.map(skill => ({ 
                    name: skill.name, 
                    color: skill.color 
                  }))}
                />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium">Matches</h2>
                <p className="text-sm text-muted-foreground">
                  {matchedUsers.length} creative{matchedUsers.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="p-2 rounded-full hover:bg-secondary transition-colors hidden lg:flex"
              >
                <Sliders size={20} />
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : matchedUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedUsers.map((profile) => (
                  <CreativeCard 
                    key={profile.id} 
                    creative={{
                      id: profile.id,
                      name: profile.name,
                      role: profile.skills[0] || "Creative Professional", // Show first skill as role
                      bio: `Based in ${profile.location}`,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`, // Generate avatar
                      skills: profile.skills,
                      location: profile.location,
                      matchScore: profile.matchScore,
                      isNearby: !!profile.distance,
                      portfolio: [] // No portfolio data for now
                    }}
                    showMatchScore={selectedSkills.length > 0}
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
