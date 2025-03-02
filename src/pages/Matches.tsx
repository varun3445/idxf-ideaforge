
import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import CreativeCard from '../components/CreativeCard';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
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
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'regular' | 'ai'>('regular');
  
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
  
  // Filter users based on search query
  useEffect(() => {
    if (searchMode === 'ai') {
      return; // Skip regular filtering when AI mode is active
    }
    
    if (!searchQuery.trim()) {
      setFilteredUsers(matchedUsers);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = matchedUsers.filter(profile => {
      // Search in skills
      const hasMatchingSkill = profile.skills.some(skill => 
        skill.toLowerCase().includes(query)
      );
      
      // Search in name
      const nameMatch = profile.name.toLowerCase().includes(query);
      
      // Search in location
      const locationMatch = profile.location.toLowerCase().includes(query);
      
      return hasMatchingSkill || nameMatch || locationMatch;
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, matchedUsers, searchMode]);

  const performAiSearch = async () => {
    if (!searchQuery.trim() || !matchedUsers.length) {
      setFilteredUsers(matchedUsers);
      return;
    }

    setIsAiSearching(true);
    setSearchMode('ai');

    try {
      const { data, error } = await supabase.functions.invoke('search-with-ai', {
        body: {
          query: searchQuery,
          profiles: matchedUsers,
        },
      });

      if (error) {
        throw error;
      }

      const { matchingIds } = data;
      
      if (Array.isArray(matchingIds) && matchingIds.length > 0) {
        const aiFiltered = matchedUsers.filter(profile => 
          matchingIds.includes(profile.id)
        );
        setFilteredUsers(aiFiltered);
      } else {
        // If no matches or invalid response, show empty results
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error using AI search:', error);
      toast({
        title: "AI Search Failed",
        description: "There was an error processing your search with AI. Falling back to regular search.",
        variant: "destructive"
      });
      // Fall back to regular search
      setSearchMode('regular');
      
      // Trigger the regular search effect
      const query = searchQuery.toLowerCase().trim();
      const filtered = matchedUsers.filter(profile => {
        const hasMatchingSkill = profile.skills.some(skill => 
          skill.toLowerCase().includes(query)
        );
        const nameMatch = profile.name.toLowerCase().includes(query);
        const locationMatch = profile.location.toLowerCase().includes(query);
        return hasMatchingSkill || nameMatch || locationMatch;
      });
      setFilteredUsers(filtered);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // Reset to regular search mode when query is empty
    if (!newQuery.trim()) {
      setFilteredUsers(matchedUsers);
      setSearchMode('regular');
    } else {
      // Set a small delay for AI search to avoid too many requests
      if (searchMode === 'ai') {
        const delaySearch = setTimeout(() => {
          performAiSearch();
        }, 800);
        
        return () => clearTimeout(delaySearch);
      }
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performAiSearch();
    }
  };
  
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
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by skill, name, location or ask AI (e.g., 'Find designers in Europe')..."
              className="pl-10 py-6 pr-12"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {isAiSearching ? (
                <Loader2 size={18} className="animate-spin text-primary" />
              ) : (
                <Search size={18} />
              )}
            </div>
            
            <button 
              type="submit"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full 
                ${searchMode === 'ai' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'} 
                transition-colors`}
              title="Use AI for this search"
            >
              <Sparkles size={18} />
            </button>
          </form>
          
          {searchMode === 'ai' && searchQuery.trim() && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles size={12} className="text-primary" />
              <span>AI-powered search is active</span>
            </div>
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
        
        {loading || isAiSearching ? (
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
                  portfolio: []
                }}
                showMatchScore={false}
              />
            ))}
          </div>
        ) : (
          <div className="glassmorphic-card text-center py-12">
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords or asking a more general question
            </p>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
