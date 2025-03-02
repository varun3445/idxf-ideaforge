import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import SkillsetSelector from '../components/SkillsetSelector';
import CreativeCard from '../components/CreativeCard';
import { Sliders, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import crypto from 'crypto';

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
  
  const calculateLocationSimilarity = (location1: string, location2: string) => {
    const location1Parts = location1.toLowerCase().split(',').map(p => p.trim());
    const location2Parts = location2.toLowerCase().split(',').map(p => p.trim());
    
    for (const part1 of location1Parts) {
      for (const part2 of location2Parts) {
        if (part1 === part2 && part1.length > 1) {
          return true;
        }
      }
    }
    
    return false;
  };
  
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
  
  useEffect(() => {
    const addSampleUsers = async () => {
      if (!user) return;
      
      try {
        const { data: existingProfiles, error: checkError } = await supabase
          .from('profiles')
          .select('count')
          .neq('id', user.id);
          
        if (checkError) {
          console.error('Error checking for existing profiles:', checkError);
          return;
        }
        
        const userCount = existingProfiles[0]?.count || 0;
        
        if (userCount > 0) {
          console.log('Sample users already exist, skipping sample data creation');
          return;
        }
        
        console.log('Adding sample users...');
        
        const sampleUsers = [
          {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            location: 'New York, USA',
            skills: ['UX Design', 'Product Management', 'Content Writing']
          },
          {
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            location: 'San Francisco, USA',
            skills: ['Frontend Development', 'UI Design', 'Animation']
          },
          {
            name: 'Jessica Patel',
            email: 'jessica.patel@example.com',
            location: 'London, UK',
            skills: ['Backend Development', 'Data Science', 'Game Development']
          },
          {
            name: 'Carlos Rodriguez',
            email: 'carlos.r@example.com',
            location: 'Barcelona, Spain',
            skills: ['Graphic Design', 'Illustration', '3D Modeling']
          },
          {
            name: 'Aisha Nakamura',
            email: 'aisha.n@example.com',
            location: 'Tokyo, Japan',
            skills: ['Video Editing', 'Sound Design', 'Animation']
          }
        ];
        
        for (const sampleUser of sampleUsers) {
          const uniqueId = crypto.randomUUID();
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: uniqueId,
              name: sampleUser.name,
              email: sampleUser.email,
              location: sampleUser.location
            });
            
          if (profileError) {
            console.error(`Error creating profile for ${sampleUser.name}:`, profileError);
            continue;
          }
          
          for (const skillName of sampleUser.skills) {
            const { data: existingSkill, error: skillFetchError } = await supabase
              .from('skills')
              .select('id')
              .eq('name', skillName)
              .single();
              
            if (skillFetchError && skillFetchError.code !== 'PGRST116') {
              console.error(`Error checking skill ${skillName}:`, skillFetchError);
              continue;
            }
            
            let skillId;
            if (existingSkill) {
              skillId = existingSkill.id;
            } else {
              const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
              const { data: newSkill, error: newSkillError } = await supabase
                .from('skills')
                .insert({
                  name: skillName,
                  color: randomColor
                })
                .select('id')
                .single();
                
              if (newSkillError) {
                console.error(`Error creating skill ${skillName}:`, newSkillError);
                continue;
              }
              
              skillId = newSkill.id;
            }
            
            const { error: userSkillError } = await supabase
              .from('user_skills')
              .insert({
                user_id: uniqueId,
                skill_id: skillId
              });
              
            if (userSkillError) {
              console.error(`Error adding skill ${skillName} for ${sampleUser.name}:`, userSkillError);
            }
          }
        }
        
        toast({
          title: "Sample users added",
          description: "Example creative profiles are now available for matching"
        });
        
      } catch (error) {
        console.error('Error adding sample users:', error);
      }
    };
    
    addSampleUsers();
  }, [user]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, location')
          .neq('id', user.id);
          
        if (profilesError) {
          throw profilesError;
        }
        
        const { data: userSkills, error: skillsError } = await supabase
          .from('user_skills')
          .select('user_id, skills(id, name)');
          
        if (skillsError) {
          throw skillsError;
        }
        
        const usersWithSkills: UserProfile[] = profiles.map((profile) => {
          const profileSkills = userSkills
            .filter(us => us.user_id === profile.id)
            .map(us => us.skills.name);
            
          return {
            ...profile,
            skills: profileSkills,
          };
        });
        
        let matchedProfiles = [...usersWithSkills];
        
        if (selectedSkills.length > 0) {
          matchedProfiles = usersWithSkills.map(profile => {
            const matchingSkills = profile.skills.filter(skill => 
              selectedSkills.includes(skill)
            );
            
            const score = Math.round((matchingSkills.length / selectedSkills.length) * 100);
            
            return {
              ...profile,
              matchScore: score
            };
          });
          
          matchedProfiles.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
        
        matchedProfiles = matchedProfiles.map(profile => {
          const isNearby = calculateLocationSimilarity(user.location, profile.location);
          
          return {
            ...profile,
            distance: isNearby ? 1 : 0
          };
        });
        
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
                      role: profile.skills[0] || "Creative Professional",
                      bio: `Based in ${profile.location}`,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`,
                      skills: profile.skills,
                      location: profile.location,
                      matchScore: profile.matchScore,
                      isNearby: !!profile.distance,
                      portfolio: []
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
