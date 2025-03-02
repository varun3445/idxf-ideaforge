import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import CreativeCard from '../components/CreativeCard';
import { Search, Loader2, Sparkles, Info } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
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
  const [searchQuery, setSearchQuery] = useState("");
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchExplanation, setSearchExplanation] = useState<string | null>(null);
  
  const calculateLocationSimilarity = (location1: string, location2: string) => {
    if (!location1 || !location2) return false;
    
    const location1Parts = location1.toLowerCase().split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    const location2Parts = location2.toLowerCase().split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    
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

  const performSearch = async (query: string) => {
    if (!matchedUsers.length) {
      return;
    }

    setSearching(true);
    setSearchExplanation(null);

    try {
      // If the query is empty, show all users
      if (!query.trim()) {
        setFilteredUsers(matchedUsers);
        return;
      }

      // Use the AI search for all queries
      const { data, error } = await supabase.functions.invoke('search-with-ai', {
        body: {
          query,
          profiles: matchedUsers,
        },
      });

      if (error) {
        throw error;
      }

      // Process the AI response
      const { matchingProfiles, searchExplanation } = data;
      
      if (Array.isArray(matchingProfiles) && matchingProfiles.length > 0) {
        // Map the AI results to our user profiles with match scores
        const profilesWithScores = matchedUsers
          .map(profile => {
            const match = matchingProfiles.find(m => m.id === profile.id);
            return {
              ...profile,
              matchScore: match ? match.matchScore : 0
            };
          })
          .filter(profile => profile.matchScore > 0)
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        setFilteredUsers(profilesWithScores);
        setSearchExplanation(searchExplanation || null);
      } else {
        // If no matches, show empty results
        setFilteredUsers([]);
        setSearchExplanation(searchExplanation || "No profiles match your search criteria");
      }
    } catch (error) {
      console.error('Error using AI search:', error);
      
      // Fall back to simple text matching as a backup
      const query = searchQuery.toLowerCase().trim();
      const filtered = matchedUsers.filter(profile => {
        // Search in skills
        const hasMatchingSkill = profile.skills.some(skill => 
          skill.toLowerCase().includes(query)
        );
        
        // Search in name
        const nameMatch = profile.name.toLowerCase().includes(query);
        
        // Improved location matching using the similarity function
        const locationMatch = calculateLocationSimilarity(profile.location, query);
        
        return hasMatchingSkill || nameMatch || locationMatch;
      });
      
      setFilteredUsers(filtered);
      
      toast({
        title: "Simple search mode",
        description: "AI search is unavailable. Using basic text matching instead.",
        variant: "default"
      });
    } finally {
      setSearching(false);
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, matchedUsers]);
  
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
          },
          {
            name: 'Alex Petrov',
            email: 'alex.petrov@example.com',
            location: 'Berlin, Germany',
            skills: ['Machine Learning', 'Python', 'Data Visualization']
          },
          {
            name: 'Maya Cortez',
            email: 'maya.c@example.com',
            location: 'Mexico City, Mexico',
            skills: ['Content Marketing', 'SEO', 'Social Media Management']
          },
          {
            name: 'David Kim',
            email: 'david.kim@example.com',
            location: 'Seoul, South Korea',
            skills: ['Mobile Development', 'React Native', 'Swift']
          },
          {
            name: 'Olivia Brown',
            email: 'olivia.brown@example.com',
            location: 'Toronto, Canada',
            skills: ['Project Management', 'Agile', 'Technical Writing']
          },
          {
            name: 'Lucas Silva',
            email: 'lucas.silva@example.com',
            location: 'São Paulo, Brazil',
            skills: ['Full Stack Development', 'Node.js', 'React']
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
        
        // Add distance info
        const withDistance = usersWithSkills.map(profile => {
          const isNearby = calculateLocationSimilarity(user.location, profile.location);
          
          return {
            ...profile,
            distance: isNearby ? 1 : 0
          };
        });
        
        // Sort by distance by default
        withDistance.sort((a, b) => (b.distance || 0) - (a.distance || 0));
        
        setMatchedUsers(withDistance);
        setFilteredUsers(withDistance);
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
  }, [user]);
  
  return (
    <AnimatedTransition>
      <div className="page-container pt-24">
        <div className="mb-8">
          <h1 className="page-header">Find Your Match</h1>
          <p className="page-subheader">
            Search for skilled creatives to collaborate with on your next project
          </p>
        </div>
        
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, name, or location or ask naturally (e.g., 'designers in Bengaluru')..."
              className="pl-10 py-6 pr-12"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {searching ? (
                <Loader2 size={18} className="animate-spin text-primary" />
              ) : (
                <Search size={18} />
              )}
            </div>
            
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full 
                bg-primary text-primary-foreground"
              title="AI-powered search"
            >
              <Sparkles size={18} />
            </div>
          </div>
          
          {searchExplanation && searchQuery.trim() && (
            <Card className="mt-3 bg-muted/40 border-muted">
              <CardContent className="p-3 text-sm flex gap-2 items-start">
                <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">{searchExplanation}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Creative Profiles</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} creative{filteredUsers.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        {loading || searching ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((profile) => (
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
                  isNearby: !!profile.distance,
                  matchScore: profile.matchScore,
                  portfolio: []
                }}
                showMatchScore={!!searchQuery.trim()}
              />
            ))}
          </div>
        ) : (
          <div className="glassmorphic-card text-center py-12">
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords or phrasing your question differently
            </p>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
