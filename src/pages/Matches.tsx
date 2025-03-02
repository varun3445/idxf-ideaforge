
import { useState, useEffect, useRef } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import { Loader2, Sparkles, Info, ArrowLeft, ArrowRight, Image, Check, UserPlus, X, MapPin } from 'lucide-react';
import { supabase, checkDatabaseConnection } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { User } from '../types/auth.types';

interface Skill {
  id: string;
  name: string;
  color: string;
}

interface Profile {
  id: string;
  name: string;
  location: string;
  skills: {
    name: string;
    color: string;
  }[];
  avatar: string | null;
  matchScore?: number;
  isNearby?: boolean;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  image: string;
  skills: {
    name: string;
    color: string;
  }[];
  contributors: string[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const projectImages = [
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80", 
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80", 
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80", 
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
];

const Matches = () => {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingAI, setUsingAI] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([]);
  const [similarSkillsUsers, setSimilarSkillsUsers] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const profilesScrollRef = useRef<HTMLDivElement>(null);
  const projectsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log("User coordinates:", position.coords.latitude, position.coords.longitude);
        }, error => {
          console.error("Geolocation error:", error);
          setLocationError("Could not access your location. Please enable location services.");
          toast({
            title: "Location access denied",
            description: "Please enable location services for better local matches",
            variant: "destructive"
          });
        });
      } else {
        setLocationError("Geolocation is not supported by your browser");
        toast({
          title: "Location not supported",
          description: "Your browser doesn't support geolocation features",
          variant: "destructive"
        });
      }
    };
    getUserLocation();
  }, [toast]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const extractCoordinates = (locationString: string): { latitude: number; longitude: number; } | null => {
    if (locationString.includes(',')) {
      const parts = locationString.split(',').map(part => part.trim());
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          latitude: lat,
          longitude: lng
        };
      }
    }
    const locationMap: Record<string, { latitude: number; longitude: number; }> = {
      'new york': {
        latitude: 40.7128,
        longitude: -74.0060
      },
      'london': {
        latitude: 51.5074,
        longitude: -0.1278
      },
      'tokyo': {
        latitude: 35.6762,
        longitude: 139.6503
      },
      'paris': {
        latitude: 48.8566,
        longitude: 2.3522
      },
      'lagos': {
        latitude: 6.5244,
        longitude: 3.3792
      },
      'abuja': {
        latitude: 9.0765,
        longitude: 7.3986
      },
      'nigeria': {
        latitude: 9.0820,
        longitude: 8.6753
      },
      'san francisco': {
        latitude: 37.7749,
        longitude: -122.4194
      },
      'berlin': {
        latitude: 52.5200,
        longitude: 13.4050
      },
      'sydney': {
        latitude: -33.8688,
        longitude: 151.2093
      }
    };
    const lowerCaseLocation = locationString.toLowerCase();
    for (const [key, coords] of Object.entries(locationMap)) {
      if (lowerCaseLocation.includes(key)) {
        return coords;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await checkDatabaseConnection();
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
        if (profilesError) throw profilesError;
        
        const { data: skillsData, error: skillsError } = await supabase.from('skills').select('*');
        if (skillsError) throw skillsError;
        
        setSkills(skillsData as Skill[]);
        
        const profilesWithSkills: Profile[] = [];
        for (const profile of profilesData) {
          if (profile.id === user?.id) continue;
          
          const { data: userSkillsData, error: userSkillsError } = await supabase.from('user_skills').select('skills(id, name, color)').eq('user_id', profile.id);
          if (userSkillsError) {
            console.error(`Error fetching skills for user ${profile.id}:`, userSkillsError);
            continue;
          }
          
          const skills = userSkillsData.map(item => ({
            name: item.skills.name,
            color: item.skills.color
          }));
          
          const coordinates = extractCoordinates(profile.location);
          const profileWithSkills: Profile = {
            id: profile.id,
            name: profile.name,
            location: profile.location,
            skills,
            avatar: profile.avatar,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude
          };
          
          profilesWithSkills.push(profileWithSkills);
        }
        
        if (userCoordinates) {
          for (const profile of profilesWithSkills) {
            if (profile.latitude && profile.longitude) {
              profile.distance = calculateDistance(userCoordinates.latitude, userCoordinates.longitude, profile.latitude, profile.longitude);
              profile.isNearby = profile.distance < 100;
            }
          }
        }
        
        setProfiles(profilesWithSkills);
        
        const generatedProjects: ProjectIdea[] = [];
        for (let i = 0; i < 8; i++) {
          const randomProfiles = profilesWithSkills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
          const allSkills = randomProfiles.flatMap(p => p.skills);
          const uniqueSkillNames = [...new Set(allSkills.map(s => s.name))];
          const projectSkills = uniqueSkillNames.map(name => allSkills.find(s => s.name === name)!).slice(0, Math.min(uniqueSkillNames.length, 3));
          
          generatedProjects.push({
            id: `project-${i}`,
            title: getRandomProjectTitle(),
            description: getRandomProjectDescription(),
            image: projectImages[i % projectImages.length],
            skills: projectSkills,
            contributors: randomProfiles.map(p => p.id)
          });
        }
        
        setProjectIdeas(generatedProjects);
        
        if (userCoordinates) {
          const nearby = profilesWithSkills.filter(p => p.isNearby).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
          setNearbyUsers(nearby);
          console.log("Nearby users based on coordinates:", nearby);
        } else if (user?.location) {
          const nearby = profilesWithSkills.filter(p => p.location.toLowerCase().includes(user.location.toLowerCase())).map(p => ({
            ...p,
            isNearby: true
          }));
          setNearbyUsers(nearby);
          console.log("Nearby users based on string matching:", nearby);
        }
        
        if (user?.skills && user.skills.length > 0) {
          const withSimilarSkills = profilesWithSkills.map(profile => {
            const profileSkillNames = profile.skills.map(s => s.name);
            const commonSkills = profileSkillNames.filter(skill => user.skills.includes(skill));
            const matchScore = user.skills.length > 0 ? Math.round(commonSkills.length / user.skills.length * 100) : 0;
            
            return {
              ...profile,
              matchScore
            };
          }).filter(item => item.matchScore > 0).sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
              return b.matchScore - a.matchScore;
            }
            return (a.distance || Infinity) - (b.distance || Infinity);
          });
          
          setSimilarSkillsUsers(withSimilarSkills.slice(0, 10));
          setFilteredProfiles(withSimilarSkills.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user, userCoordinates]);

  useEffect(() => {
    if (!search) {
      if (similarSkillsUsers.length > 0) {
        setFilteredProfiles(similarSkillsUsers);
      } else {
        setFilteredProfiles(profiles.slice(0, 10));
      }
      setUsingAI(false);
      return;
    }
    
    const searchLower = search.toLowerCase();
    if (searchLower.includes("near me") || searchLower === "near" || searchLower === "nearby") {
      console.log("Processing 'near me' search with coordinates:", userCoordinates);
      if (userCoordinates) {
        const sortedByDistance = [...profiles].filter(p => p.latitude && p.longitude).map(p => ({
          ...p,
          distance: p.latitude && p.longitude ? calculateDistance(userCoordinates.latitude, userCoordinates.longitude, p.latitude, p.longitude) : Infinity,
          matchScore: 100
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity)).slice(0, 10);
        
        console.log("Near me results based on coordinates:", sortedByDistance);
        setFilteredProfiles(sortedByDistance);
        return;
      } else {
        toast({
          title: "Location not available",
          description: "Please enable location services for better local matches",
          variant: "destructive"
        });
      }
    }
    
    const filtered = profiles.filter(profile => 
      profile.name.toLowerCase().includes(searchLower) || 
      profile.location.toLowerCase().includes(searchLower) || 
      profile.skills.some(skill => {
        if (searchLower === 'ux') {
          return skill.name.toLowerCase().includes('design');
        }
        return skill.name.toLowerCase().includes(searchLower);
      })
    );
    
    const sortedFiltered = filtered.map(profile => {
      const matchingSkills = profile.skills.filter(skill => 
        skill.name.toLowerCase().includes(searchLower) || 
        searchLower === 'ux' && skill.name.toLowerCase().includes('design')
      );
      
      const matchScore = searchLower === 'ux' && profile.skills.some(s => s.name.toLowerCase().includes('design')) 
        ? 100 
        : Math.min(Math.round(matchingSkills.length / profile.skills.length * 100), 100);
      
      return {
        ...profile,
        matchScore
      };
    }).sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (a.distance || Infinity) - (b.distance || Infinity);
    }).slice(0, 10);
    
    setFilteredProfiles(sortedFiltered);
    
    if (filtered.length < 3 && searchLower.length > 2) {
      handleAISearch();
    } else {
      setUsingAI(false);
    }
  }, [search, profiles, similarSkillsUsers, userCoordinates, toast]);

  const handleAISearch = async () => {
    if (!search || search.length < 3) return;
    
    setLoadingAI(true);
    setUsingAI(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMatches = profiles.map(profile => {
        const searchTerms = search.toLowerCase().split(' ');
        const skillMatch = profile.skills.some(skill => searchTerms.some(term => skill.name.toLowerCase().includes(term)));
        
        let matchScore = Math.floor(Math.random() * 30) + 50;
        if (skillMatch) {
          matchScore += 20;
        }
        
        if (search.toLowerCase().includes('ux') && profile.skills.some(s => s.name.toLowerCase().includes('design'))) {
          matchScore = 100;
        }
        
        let locationScore = 0;
        if (search.toLowerCase().includes('near') || search.toLowerCase().includes('location')) {
          if (userCoordinates && profile.latitude && profile.longitude) {
            const distance = calculateDistance(userCoordinates.latitude, userCoordinates.longitude, profile.latitude, profile.longitude);
            if (distance < 100) {
              locationScore = Math.max(0, 50 - distance / 2);
            }
          }
        }
        
        const finalScore = Math.min(100, matchScore + locationScore);
        
        return {
          profile: {
            ...profile,
            matchScore: finalScore,
            isNearby: profile.isNearby,
            distance: profile.distance
          },
          matchScore: finalScore
        };
      }).sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return (a.profile.distance || Infinity) - (b.profile.distance || Infinity);
      }).slice(0, 10);
      
      console.log("AI search results with location awareness:", aiMatches);
      setAiResults(aiMatches);
    } catch (error) {
      console.error('Error with AI search:', error);
      toast({
        title: "AI Search Error",
        description: "There was a problem with the AI-enhanced search",
        variant: "destructive"
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleProfilesScroll = (direction: 'left' | 'right') => {
    if (profilesScrollRef.current) {
      const { current } = profilesScrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleProjectsScroll = (direction: 'left' | 'right') => {
    if (projectsScrollRef.current) {
      const { current } = projectsScrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const openProjectDetails = (project: ProjectIdea) => {
    setSelectedProject(project);
    setShowProjectDialog(true);
  };

  const handleJoinProject = () => {
    if (!selectedProject) return;
    
    toast({
      title: "Collaboration request sent!",
      description: `You've requested to join "${selectedProject.title}"`,
      variant: "success"
    });
    
    setShowProjectDialog(false);
  };

  const getRandomProjectTitle = () => {
    const titles = [
      "Smart City Planner", 
      "Health Monitor App", 
      "Sustainable Energy Platform", 
      "Virtual Reality Classroom", 
      "AI Writing Assistant", 
      "Blockchain Voting System", 
      "Digital Art Marketplace", 
      "Remote Work Collaboration Tool", 
      "Fitness Tracking Wearable", 
      "Augmented Reality Navigation"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRandomProjectDescription = () => {
    const descriptions = [
      "A platform to optimize urban planning and resource allocation", 
      "Real-time health data tracking and analysis for personalized care", 
      "Connecting renewable energy producers with consumers", 
      "Immersive educational experiences for remote learning", 
      "Using AI to assist with content creation and editing", 
      "Secure and transparent voting using blockchain technology", 
      "A marketplace for digital artists to sell their creations", 
      "Tools for effective team collaboration in remote settings", 
      "Advanced fitness tracking with personalized recommendations", 
      "AR-based navigation with real-time information overlay"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto flex flex-col min-h-screen pb-8 mt-4 px-4">
        <div className="mb-6 mt-2">
          <h1 className="text-4xl font-bold text-left px-0 py-0 mx-0">Find and be found.</h1>
          
          <p className="text-muted-foreground max-w-lg py-[25px] text-left">
            Connect with creative minds and innovative projects that match your skills and interests.
          </p>
        </div>
        
        <div className={`w-full transition-all duration-300 ${searchFocused ? 'max-w-full' : 'max-w-xl'}`}>
          <div className="relative">
            <Input 
              className={`minimal-search letter-spacing-wide transition-all duration-300 pl-4 shadow-lg ${searchFocused ? 'text-lg' : 'text-base'}`} 
              placeholder="Search for skills, people, locations..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={() => setSearchFocused(true)} 
              onBlur={() => setSearchFocused(false)} 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            {search ? (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                
                {locationError && search.toLowerCase().includes('near') && (
                  <div className="flex items-center mb-4 p-2 border-3 border-destructive/20 rounded-md bg-destructive/5 shadow-md">
                    <Info size={16} className="text-destructive mr-2" />
                    <span className="text-sm">{locationError}</span>
                  </div>
                )}
                
                {usingAI && (
                  <div className="flex items-center mb-4 p-2 border-3 border-primary/20 rounded-md bg-primary/5 shadow-md">
                    <Sparkles size={16} className="text-primary mr-2" />
                    <span className="text-sm">
                      {loadingAI ? 'Searching with AI...' : 'AI-enhanced search results'}
                    </span>
                  </div>
                )}
                
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Finding the best matches...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {usingAI ? (
                      aiResults.length > 0 ? (
                        aiResults.map(({profile, matchScore}) => (
                          <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                                  {profile.name[0]}
                                </div>
                              )}
                            </div>
                            <h3 className="text-center font-bold text-lg mb-1">{profile.name}</h3>
                            <p className="text-center text-muted-foreground mb-2">{profile.location}</p>
                            <div className="flex items-center justify-center mb-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">
                                {matchScore}% match
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {profile.skills.map((skill, index) => (
                                <Badge key={index} style={{
                                  backgroundColor: skill.color,
                                  color: '#000000'
                                }} className="shadow-sm">
                                  {skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No AI matches found</p>
                        </div>
                      )
                    ) : (
                      filteredProfiles.length > 0 ? (
                        filteredProfiles.map(profile => (
                          <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                                  {profile.name[0]}
                                </div>
                              )}
                            </div>
                            <h3 className="text-center font-bold text-lg mb-1">{profile.name}</h3>
                            <p className="text-center text-muted-foreground mb-2">{profile.location}</p>
                            {profile.matchScore && (
                              <div className="flex items-center justify-center mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">
                                  {profile.matchScore}% match
                                </Badge>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 justify-center">
                              {profile.skills.map((skill, index) => (
                                <Badge key={index} style={{
                                  backgroundColor: skill.color,
                                  color: '#000000'
                                }} className="shadow-sm">
                                  {skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No results found</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {similarSkillsUsers.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-0">People with similar skills</h2>
                        <p className="text-sm text-muted-foreground">Users who share your expertise</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleProfilesScroll('left')} className="shadow-md">
                          <ArrowLeft size={18} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleProfilesScroll('right')} className="shadow-md">
                          <ArrowRight size={18} />
                        </Button>
                      </div>
                    </div>
                    
                    <div ref={profilesScrollRef} className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide scroll-smooth">
                      {similarSkillsUsers.map(profile => (
                        <div key={profile.id} className="flex-shrink-0 w-64 border-b-3 border-border p-4 hover:border-primary transition-all duration-300 bg-white rounded-lg shadow-md">
                          <div className="w-full aspect-square mb-4 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden shadow-md">
                            {profile.avatar ? (
                              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl font-bold text-primary">{profile.name[0]}</span>
                            )}
                          </div>
                          <h3 className="font-bold text-base">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{profile.location}</p>
                          {profile.matchScore && (
                            <div className="mb-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">
                                {profile.matchScore}% match
                              </Badge>
                              {profile.isNearby && (
                                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200 shadow-sm">
                                  Nearby
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profile.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} style={{
                                backgroundColor: skill.color,
                                color: '#000000'
                              }} className="shadow-sm">
                                {skill.name}
                              </Badge>
                            ))}
                            {profile.skills.length > 3 && (
                              <Badge variant="outline" className="shadow-sm">
                                +{profile.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {nearbyUsers.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-0">People near you</h2>
                        <p className="text-sm text-muted-foreground">Connections in your area</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {nearbyUsers.slice(0, 4).map(profile => (
                        <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden shadow-md">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                                  {profile.name[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-base">{profile.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-1">
                                <MapPin size={14} className="mr-1" />
                                {profile.location}
                              </div>
                              {profile.distance && (
                                <div className="text-xs text-muted-foreground">
                                  {profile.distance < 1 ? 'Less than 1 km away' : `${Math.round(profile.distance)} km away`}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {profile.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} style={{
                                backgroundColor: skill.color,
                                color: '#000000'
                              }} className="shadow-sm">
                                {skill.name}
                              </Badge>
                            ))}
                            {profile.skills.length > 2 && (
                              <Badge variant="outline" className="shadow-sm">
                                +{profile.skills.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {projectIdeas.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-0">Project ideas for you</h2>
                        <p className="text-sm text-muted-foreground">Collaborative opportunities that match your skills</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleProjectsScroll('left')} className="shadow-md">
                          <ArrowLeft size={18} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleProjectsScroll('right')} className="shadow-md">
                          <ArrowRight size={18} />
                        </Button>
                      </div>
                    </div>
                    
                    <div ref={projectsScrollRef} className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide scroll-smooth">
                      {projectIdeas.map(project => (
                        <div 
                          key={project.id} 
                          className="flex-shrink-0 w-80 border border-border p-0 hover:border-primary transition-all duration-300 bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                          onClick={() => openProjectDetails(project)}
                        >
                          <div className="h-40 w-full overflow-hidden">
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.skills.map((skill, index) => (
                                <Badge key={index} style={{
                                  backgroundColor: skill.color,
                                  color: '#000000'
                                }} className="shadow-sm">
                                  {skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Project Collaboration</DialogTitle>
            <DialogDescription>
              Join this project to collaborate with other members.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="mt-4">
              <div className="h-40 w-full rounded-lg overflow-hidden mb-4">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">{selectedProject.title}</h2>
              <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Skills needed:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill, index) => (
                    <Badge key={index} style={{
                      backgroundColor: skill.color,
                      color: '#000000'
                    }} className="shadow-sm">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Collaborators:</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProject.contributors.length} person{selectedProject.contributors.length !== 1 ? 's' : ''} contributing to this project
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleJoinProject} className="bg-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Request to Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedTransition>
  );
};

export default Matches;
