import { useState, useEffect } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import CreativeCard from '../components/CreativeCard';
import { Search, Loader2, Sparkles, Info } from 'lucide-react';
import { supabase, checkDatabaseConnection } from '../integrations/supabase/client';
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
  isNearby?: boolean;
  skillMatch?: boolean;
  locationMatch?: boolean;
}

// Function to calculate distance between two locations using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Function to extract coordinates from a location string using a simple heuristic
// This is a simplified version - in a production app, you would use a geocoding API
const extractCoordinates = (location: string): { lat: number, lon: number } | null => {
  // Default coordinates for well-known cities (very simplified example)
  const cityCoordinates: {[key: string]: {lat: number, lon: number}} = {
    'new york': { lat: 40.7128, lon: -74.0060 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'berlin': { lat: 52.5200, lon: 13.4050 },
    'madrid': { lat: 40.4168, lon: -3.7038 },
    'rome': { lat: 41.9028, lon: 12.4964 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'toronto': { lat: 43.6532, lon: -79.3832 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'san francisco': { lat: 37.7749, lon: -122.4194 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'vancouver': { lat: 49.2827, lon: -123.1207 },
    'barcelona': { lat: 41.3851, lon: 2.1734 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'shanghai': { lat: 31.2304, lon: 121.4737 },
    'mexico city': { lat: 19.4326, lon: -99.1332 },
    'seoul': { lat: 37.5665, lon: 126.9780 },
    'lisbon': { lat: 38.7223, lon: -9.1393 },
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'moscow': { lat: 55.7558, lon: 37.6173 },
    'buenos aires': { lat: -34.6037, lon: -58.3816 },
    'osaka': { lat: 34.6937, lon: 135.5022 },
    'munich': { lat: 48.1351, lon: 11.5820 },
    'tel aviv': { lat: 32.0853, lon: 34.7818 },
    'taipei': { lat: 25.0330, lon: 121.5654 },
  };
  
  const locationLower = location.toLowerCase();
  
  // Try to find a city match
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (locationLower.includes(city)) {
      return coords;
    }
  }
  
  return null;
};

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
  const [isTyping, setIsTyping] = useState(false);
  const [dbConnectionChecked, setDbConnectionChecked] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lon: number} | null>(null);
  
  // Function to check if two locations are within 250km or have a direct match
  const isLocationNearby = (userLocation: string, searchLocation: string): boolean => {
    if (!userLocation || !searchLocation) return false;
    
    // Direct match checking (city or country name matches)
    const userLocationParts = userLocation.toLowerCase().split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    const searchLocationParts = searchLocation.toLowerCase().split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    
    for (const part1 of userLocationParts) {
      for (const part2 of searchLocationParts) {
        if (part1 === part2 && part1.length > 2) {
          return true;
        }
      }
    }
    
    // Distance-based matching
    const userCoords = extractCoordinates(userLocation);
    const searchCoords = extractCoordinates(searchLocation);
    
    if (userCoords && searchCoords) {
      const distance = calculateDistance(
        userCoords.lat, userCoords.lon, 
        searchCoords.lat, searchCoords.lon
      );
      
      return distance <= 250; // Within 250km range
    }
    
    return false;
  };

  // Enhanced function to check for location matching
  const checkLocationMatch = (profileLocation: string, searchTerms: string[]): boolean => {
    if (!profileLocation || !searchTerms.length) return false;
    
    const locationParts = profileLocation.toLowerCase().split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    
    for (const term of searchTerms) {
      for (const part of locationParts) {
        if (part.includes(term) || term.includes(part)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  useEffect(() => {
    if (user?.location) {
      setUserCoordinates(extractCoordinates(user.location));
    }
  }, [user]);
  
  useEffect(() => {
    const checkConnection = async () => {
      const { count, error } = await checkDatabaseConnection();
      if (error) {
        console.error("Database connection error:", error);
        toast({
          title: "Database connection issue",
          description: "There was a problem connecting to the database. Please try again later.",
          variant: "destructive"
        });
      } else {
        console.log(`Database connected successfully. Found ${count} profiles.`);
        setDbConnectionChecked(true);
      }
    };
    
    checkConnection();
    
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setAllSkills(data as any);
        }
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
      if (!query.trim()) {
        setFilteredUsers(matchedUsers.slice(0, 10).map(profile => ({
          ...profile, 
          matchScore: undefined, 
          isNearby: false,
          skillMatch: false,
          locationMatch: false
        })));
        return;
      }

      const { data, error } = await supabase.functions.invoke('search-with-ai', {
        body: {
          query,
          profiles: matchedUsers,
          userLocation: user?.location || null
        },
      });

      if (error) {
        throw error;
      }

      const { matchingProfiles, searchExplanation } = data;
      
      if (Array.isArray(matchingProfiles) && matchingProfiles.length > 0) {
        // Extract potential location terms from the query
        const queryTerms = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        const profilesWithScores = matchedUsers
          .map(profile => {
            const match = matchingProfiles.find(m => m.id === profile.id);
            
            // Check if location is nearby based on user's location
            const isNearby = user && user.location ? 
              isLocationNearby(user.location, profile.location) : false;
            
            // Check if the profile location matches any search terms
            const locationMatch = checkLocationMatch(profile.location, queryTerms);
            
            // Check if any skills directly match query terms
            const skillMatch = profile.skills.some(skill => 
              queryTerms.some(term => skill.toLowerCase().includes(term))
            );
            
            // Boost score for location matches
            let finalScore = match ? match.matchScore : 0;
            if (locationMatch && finalScore > 0) {
              // Prioritize profiles that match both skill and location
              finalScore = Math.min(100, finalScore + 20);
            }
            
            return {
              ...profile,
              matchScore: finalScore,
              isNearby,
              locationMatch,
              skillMatch
            };
          })
          .filter(profile => profile.matchScore > 0)
          .sort((a, b) => {
            // First prioritize exact location matches for the main requested skill
            if (a.locationMatch && a.skillMatch && (!b.locationMatch || !b.skillMatch)) return -1;
            if (b.locationMatch && b.skillMatch && (!a.locationMatch || !a.skillMatch)) return 1;
            
            // Then prioritize location matches
            if (a.locationMatch && !b.locationMatch) return -1;
            if (b.locationMatch && !a.locationMatch) return 1;
            
            // Then sort by match score
            return (b.matchScore || 0) - (a.matchScore || 0);
          })
          .slice(0, 10); // Limit to 10 results max
        
        setFilteredUsers(profilesWithScores);
        setSearchExplanation(searchExplanation || null);
      } else {
        setFilteredUsers([]);
        setSearchExplanation(searchExplanation || "No profiles match your search criteria");
      }
    } catch (error) {
      console.error('Error using AI search:', error);
      
      const query = searchQuery.toLowerCase().trim();
      
      if (!query) {
        setFilteredUsers(matchedUsers.slice(0, 10));
        return;
      }
      
      // Custom matching logic as fallback
      const queryTerms = query.split(/\s+/).filter(word => word.length > 1);
      
      const filtered = matchedUsers.map(profile => {
        // Calculate match score based on skills match
        const matchingSkills = profile.skills.filter(skill => 
          queryTerms.some(term => skill.toLowerCase().includes(term))
        );
        
        let matchScore = 0;
        if (matchingSkills.length > 0) {
          // Calculate percentage match based on how many skills match the query
          matchScore = Math.min(100, Math.round((matchingSkills.length / queryTerms.length) * 100));
        }
        
        // Check if location matches search terms
        const locationMatch = checkLocationMatch(profile.location, queryTerms);
        
        if (locationMatch) {
          matchScore = Math.max(matchScore, 50); // Boost score for location match
        }
        
        // Check if location is nearby to user's location
        const isNearby = user && user.location ? 
          isLocationNearby(user.location, profile.location) : false;
        
        // Check if any skills directly match query terms (for highlighting)
        const skillMatch = profile.skills.some(skill => 
          queryTerms.some(term => skill.toLowerCase().includes(term))
        );
        
        return {
          ...profile,
          matchScore,
          isNearby,
          locationMatch,
          skillMatch
        };
      })
      .filter(profile => profile.matchScore > 0)
      .sort((a, b) => {
        // First prioritize exact location matches for the main requested skill
        if (a.locationMatch && a.skillMatch && (!b.locationMatch || !b.skillMatch)) return -1;
        if (b.locationMatch && b.skillMatch && (!a.locationMatch || !a.skillMatch)) return 1;
        
        // Then prioritize location matches
        if (a.locationMatch && !b.locationMatch) return -1;
        if (b.locationMatch && !a.locationMatch) return 1;
        
        // Then sort by match score
        return (b.matchScore || 0) - (a.matchScore || 0);
      })
      .slice(0, 10); // Limit to 10 results max
      
      setFilteredUsers(filtered);
      
      toast({
        title: "Simple search mode",
        description: "AI search is unavailable. Using basic skills and location matching instead.",
        variant: "default"
      });
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    setIsTyping(true);
    
    const delaySearch = setTimeout(() => {
      setIsTyping(false);
      performSearch(searchQuery);
    }, 1000);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, matchedUsers]);
  
  useEffect(() => {
    const addSampleUsers = async () => {
      if (!user) return;
      
      try {
        // Check how many profiles exist
        const { data: existingProfiles, error: checkError } = await supabase
          .from('profiles')
          .select('count')
          .neq('id', user.id as any);
          
        if (checkError) {
          console.error('Error checking for existing profiles:', checkError);
          return;
        }
        
        const userCount = existingProfiles?.[0]?.count ?? 0;
        console.log(`Found ${userCount} existing profiles in the database`);
        
        if (Number(userCount) > 5) {
          console.log('Sample users already exist, skipping sample data creation');
          return;
        }
        
        console.log('Adding sample users because few were found...');
        
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
          },
          {
            name: 'Emma Watson',
            email: 'emma.w@example.com',
            location: 'London, UK',
            skills: ['Content Creation', 'Photography', 'Social Media']
          },
          {
            name: 'Ryan Park',
            email: 'ryan.p@example.com',
            location: 'Vancouver, Canada',
            skills: ['Game Design', 'Unity', 'C#']
          },
          {
            name: 'Sophia Martinez',
            email: 'sophia.m@example.com',
            location: 'Madrid, Spain',
            skills: ['Frontend Development', 'Accessibility', 'CSS Animation']
          },
          {
            name: 'Jamal Williams',
            email: 'jamal.w@example.com',
            location: 'Chicago, USA',
            skills: ['Music Production', 'Audio Engineering', 'Sound Design']
          },
          {
            name: 'Zoe Zhang',
            email: 'zoe.z@example.com',
            location: 'Shanghai, China',
            skills: ['UX Research', 'User Testing', 'Wireframing']
          },
          {
            name: 'Thomas Mueller',
            email: 'thomas.m@example.com',
            location: 'Munich, Germany',
            skills: ['3D Animation', 'Blender', 'Cinema 4D']
          },
          {
            name: 'Priya Sharma',
            email: 'priya.s@example.com',
            location: 'Mumbai, India',
            skills: ['Digital Marketing', 'SEO', 'Content Strategy']
          },
          {
            name: 'Andre Sousa',
            email: 'andre.s@example.com',
            location: 'Lisbon, Portugal',
            skills: ['UI Design', 'Design Systems', 'Prototyping']
          },
          {
            name: 'Leila Karim',
            email: 'leila.k@example.com',
            location: 'Dubai, UAE',
            skills: ['Project Management', 'Product Strategy', 'UX Design']
          },
          {
            name: 'Hiroshi Tanaka',
            email: 'hiroshi.t@example.com',
            location: 'Osaka, Japan',
            skills: ['Mobile Development', 'iOS', 'Flutter']
          },
          {
            name: 'Elena Petrova',
            email: 'elena.p@example.com',
            location: 'Moscow, Russia',
            skills: ['Data Science', 'Machine Learning', 'Python']
          },
          {
            name: 'Gabriel Fernandez',
            email: 'gabriel.f@example.com',
            location: 'Buenos Aires, Argentina',
            skills: ['Graphic Design', 'Brand Identity', 'Packaging Design']
          },
          {
            name: 'Fatima Al-Farsi',
            email: 'fatima.a@example.com',
            location: 'Muscat, Oman',
            skills: ['Content Writing', 'Copywriting', 'Social Media Management']
          },
          {
            name: 'Benjamin Cohen',
            email: 'benjamin.c@example.com',
            location: 'Tel Aviv, Israel',
            skills: ['Full Stack Development', 'DevOps', 'Cloud Architecture']
          },
          {
            name: 'Mei Lin',
            email: 'mei.l@example.com',
            location: 'Taipei, Taiwan',
            skills: ['Motion Graphics', 'After Effects', 'Video Editing']
          }
        ];
        
        let successCount = 0;
        for (const sampleUser of sampleUsers) {
          const uniqueId = crypto.randomUUID();
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: uniqueId,
              name: sampleUser.name,
              email: sampleUser.email,
              location: sampleUser.location,
              sex: Math.random() > 0.5 ? 'male' : 'female' // Randomize for variety
            } as any);
            
          if (profileError) {
            console.error(`Error creating profile for ${sampleUser.name}:`, profileError);
            continue;
          }
          
          // Add skills for each user
          let skillSuccessCount = 0;
          for (const skillName of sampleUser.skills) {
            // Check if skill exists
            const { data: existingSkill, error: skillFetchError } = await supabase
              .from('skills')
              .select('id')
              .eq('name', skillName as any)
              .single();
              
            if (skillFetchError && skillFetchError.code !== 'PGRST116') {
              console.error(`Error checking skill ${skillName}:`, skillFetchError);
              continue;
            }
            
            let skillId;
            if (existingSkill) {
              skillId = existingSkill.id;
            } else {
              // Create new skill
              const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
              const { data: newSkill, error: newSkillError } = await supabase
                .from('skills')
                .insert({
                  name: skillName,
                  color: randomColor
                } as any)
                .select('id')
                .single();
                
              if (newSkillError) {
                console.error(`Error creating skill ${skillName}:`, newSkillError);
                continue;
              }
              
              skillId = newSkill?.id;
            }
            
            // Add user skill association
            const { error: userSkillError } = await supabase
              .from('user_skills')
              .insert({
                user_id: uniqueId,
                skill_id: skillId
              } as any);
              
            if (userSkillError) {
              console.error(`Error adding skill ${skillName} for ${sampleUser.name}:`, userSkillError);
            } else {
              skillSuccessCount++;
            }
          }
          
          if (skillSuccessCount > 0) {
            successCount++;
            console.log(`Added profile for ${sampleUser.name} with ${skillSuccessCount} skills`);
          }
        }
        
        if (successCount > 0) {
          toast({
            title: `${successCount} sample users added`,
            description: "Example creative profiles are now available for matching"
          });
        }
        
      } catch (error) {
        console.error('Error adding sample users:', error);
      }
    };
    
    if (dbConnectionChecked) {
      addSampleUsers();
    }
  }, [user, dbConnectionChecked]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        console.log("Fetching profiles from database...");
        
        // Use a more direct approach to get profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id as any);
          
        if (profilesError) {
          throw profilesError;
        }
        
        if (!profiles || profiles.length === 0) {
          console.log("No profiles found in the database");
          setMatchedUsers([]);
          setFilteredUsers([]);
          setLoading(false);
          return;
        }
        
        console.log(`Found ${profiles.length} profiles in the database:`, profiles);
        
        // Get all user_skills with related skill names in a separate query
        const { data: userSkillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('user_id, skills(name)');
          
        if (skillsError) {
          console.error('Error fetching user skills:', skillsError);
        }
        
        const userSkillsMap = new Map();
        
        // Build a map of user_id -> skills[]
        if (userSkillsData) {
          userSkillsData.forEach(skill => {
            if (skill.user_id && skill.skills) {
              const skillName = (skill.skills as any)?.name;
              if (skillName) {
                if (!userSkillsMap.has(skill.user_id)) {
                  userSkillsMap.set(skill.user_id, []);
                }
                userSkillsMap.get(skill.user_id).push(skillName);
              }
            }
          });
        }
        
        console.log("User skills map:", Array.from(userSkillsMap.entries()));
        
        // Build complete user profiles
        const usersWithSkills = profiles.map(profile => {
          return {
            id: profile.id || '',
            name: profile.name || '',
            email: profile.email || '',
            location: profile.location || '',
            skills: userSkillsMap.get(profile.id) || []
          };
        });
        
        console.log(`Processed ${usersWithSkills.length} profiles with skills:`, usersWithSkills);
        
        setMatchedUsers(usersWithSkills);
        setFilteredUsers(usersWithSkills.slice(0, 10)); // Initially show up to 10 results
        
        if (usersWithSkills.length === 0) {
          console.warn("No profiles with skills found");
          toast({
            title: "No profiles found",
            description: "Try refreshing the page or adding sample users manually.",
            variant: "destructive"
          });
        }
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
    
    if (dbConnectionChecked) {
      fetchUsers();
    }
  }, [user, dbConnectionChecked]);
  
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
              placeholder="Search by skill or location (e.g., 'UI Design' or 'New York')..."
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
              {filteredUsers.length > 0 && matchedUsers.length > 10 ? ' (showing top 10)' : ''}
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : isTyping ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground animate-pulse">Searching...</p>
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
                  isNearby: profile.isNearby,
                  matchScore: profile.matchScore,
                  locationMatch: profile.locationMatch,
                  skillMatch: profile.skillMatch,
                  portfolio: []
                }}
                showMatchScore={!!searchQuery.trim() && profile.matchScore !== undefined && profile.matchScore > 0}
              />
            ))}
          </div>
        ) : (
          <div className="glassmorphic-card text-center py-12">
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords or check for skills that might be listed differently
            </p>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
