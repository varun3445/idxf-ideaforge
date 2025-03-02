
import { useState, useEffect, useRef } from 'react';
import AnimatedTransition from '../components/AnimatedTransition';
import { Loader2, Sparkles, Info, ArrowLeft, ArrowRight, Image, Check, UserPlus, X } from 'lucide-react';
import { supabase, checkDatabaseConnection } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
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
  skills: {name: string, color: string}[];
  avatar: string | null;
  matchScore?: number;
  isNearby?: boolean;
}

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  image: string;
  skills: {name: string, color: string}[];
  contributors: string[];
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
  
  const profilesScrollRef = useRef<HTMLDivElement>(null);
  const projectsScrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Check database connection
        await checkDatabaseConnection();
        
        // Fetch all users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        
        // Fetch all skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');
          
        if (skillsError) throw skillsError;
        
        setSkills(skillsData as Skill[]);
        
        // Fetch user skills for each user
        const profilesWithSkills: Profile[] = [];
        
        for (const profile of profilesData) {
          if (profile.id === user?.id) continue; // Skip current user
          
          const { data: userSkillsData, error: userSkillsError } = await supabase
            .from('user_skills')
            .select('skills(id, name, color)')
            .eq('user_id', profile.id);
            
          if (userSkillsError) {
            console.error(`Error fetching skills for user ${profile.id}:`, userSkillsError);
            continue;
          }
          
          const skills = userSkillsData.map(item => ({
            name: item.skills.name,
            color: item.skills.color
          }));
          
          profilesWithSkills.push({
            id: profile.id,
            name: profile.name,
            location: profile.location,
            skills,
            avatar: profile.avatar
          });
        }
        
        setProfiles(profilesWithSkills);
        
        // Generate mock project ideas with colored skills
        const generatedProjects: ProjectIdea[] = [];
        for (let i = 0; i < 8; i++) {
          const randomProfiles = profilesWithSkills
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);
          
          // Flatten all skills and get unique ones with their colors
          const allSkills = randomProfiles.flatMap(p => p.skills);
          const uniqueSkillNames = [...new Set(allSkills.map(s => s.name))];
          const projectSkills = uniqueSkillNames
            .map(name => allSkills.find(s => s.name === name)!)
            .slice(0, Math.min(uniqueSkillNames.length, 3));
            
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
        
        // Find nearby users and calculate scores (same location)
        if (user?.location) {
          const nearby = profilesWithSkills.filter(p => 
            p.location.toLowerCase().includes(user.location.toLowerCase())
          ).map(p => ({...p, isNearby: true}));
          setNearbyUsers(nearby);
        }
        
        // Find users with similar skills and calculate match scores
        if (user?.skills && user.skills.length > 0) {
          const withSimilarSkills = profilesWithSkills
            .map(profile => {
              const profileSkillNames = profile.skills.map(s => s.name);
              const commonSkills = profileSkillNames.filter(skill => 
                user.skills.includes(skill)
              );
              
              // Calculate match score
              const matchScore = user.skills.length > 0 ? 
                Math.round((commonSkills.length / user.skills.length) * 100) : 0;
              
              // Check if user is nearby for additional sorting
              const isNearby = user.location && 
                profile.location.toLowerCase().includes(user.location.toLowerCase());
              
              return {
                ...profile,
                matchScore,
                isNearby
              };
            })
            .filter(item => item.matchScore > 0)
            .sort((a, b) => {
              // First sort by match score
              if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
              }
              // Then by proximity if scores are equal
              return (b.isNearby ? 1 : 0) - (a.isNearby ? 1 : 0);
            });
            
          // Limit to top 10 matches
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
  }, [user]);
  
  useEffect(() => {
    if (!search) {
      // When search is empty, show default view with similar skills users
      if (similarSkillsUsers.length > 0) {
        setFilteredProfiles(similarSkillsUsers);
      } else {
        setFilteredProfiles(profiles.slice(0, 10)); // Show only top 10 by default
      }
      setUsingAI(false);
      return;
    }
    
    const searchLower = search.toLowerCase();
    
    // First try simple filtering
    const filtered = profiles.filter(profile => 
      profile.name.toLowerCase().includes(searchLower) ||
      profile.location.toLowerCase().includes(searchLower) ||
      profile.skills.some(skill => {
        // Enhanced search for UX terms - if UX is searched, match with design skills
        if (searchLower === 'ux') {
          return skill.toLowerCase().includes('design');
        }
        return skill.toLowerCase().includes(searchLower);
      })
    );
    
    // Apply the same sorting as for similar skills users
    const sortedFiltered = filtered
      .map(profile => {
        // For searches, calculate match score based on how many skills match the search term
        const matchingSkills = profile.skills.filter(skill => 
          skill.toLowerCase().includes(searchLower) || 
          (searchLower === 'ux' && skill.toLowerCase().includes('design'))
        );
        
        // If searching for UX and has design skill, give 100% match
        const matchScore = searchLower === 'ux' && profile.skills.some(s => 
          s.toLowerCase().includes('design')
        ) ? 100 : Math.min(
          Math.round((matchingSkills.length / profile.skills.length) * 100), 
          100
        );
        
        // Check if user is nearby
        const isNearby = user?.location && 
          profile.location.toLowerCase().includes(user.location.toLowerCase());
        
        return {
          ...profile,
          matchScore,
          isNearby
        };
      })
      .sort((a, b) => {
        // First sort by match score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // Then by proximity if scores are equal
        return (b.isNearby ? 1 : 0) - (a.isNearby ? 1 : 0);
      })
      .slice(0, 10); // Limit to top 10 matches
      
    setFilteredProfiles(sortedFiltered);
    
    // If we have minimal results, try AI search
    if (filtered.length < 3 && searchLower.length > 2) {
      handleAISearch();
    } else {
      setUsingAI(false);
    }
  }, [search, profiles, similarSkillsUsers, user?.location]);
  
  const handleAISearch = async () => {
    if (!search || search.length < 3) return;
    
    setLoadingAI(true);
    setUsingAI(true);
    
    try {
      // Simulate AI search results
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example AI response - but now sorting by match score and proximity
      const aiMatches = profiles
        .map(profile => {
          // For AI search, generate a more intelligent match score
          const searchTerms = search.toLowerCase().split(' ');
          
          // Check if any search terms appear in skills
          const skillMatch = profile.skills.some(skill => 
            searchTerms.some(term => skill.toLowerCase().includes(term))
          );
          
          // Higher match for skill matches
          let matchScore = Math.floor(Math.random() * 30) + 50;
          
          // Boost score for skill matches
          if (skillMatch) {
            matchScore += 20;
          }
          
          // UX designers get 100% match for UX searches
          if (search.toLowerCase().includes('ux') && 
              profile.skills.some(s => s.toLowerCase().includes('design'))) {
            matchScore = 100;
          }
          
          // Check if user is nearby
          const isNearby = user?.location && 
            profile.location.toLowerCase().includes(user.location.toLowerCase());
          
          // Boost score for nearby users
          if (isNearby) {
            matchScore = Math.min(matchScore + 10, 100);
          }
          
          return {
            profile: {
              ...profile,
              matchScore,
              isNearby
            },
            matchScore
          };
        })
        .sort((a, b) => {
          // First sort by match score
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          // Then by proximity if scores are equal
          return (b.profile.isNearby ? 1 : 0) - (a.profile.isNearby ? 1 : 0);
        })
        .slice(0, 10); // Limit to top 10
        
      setAiResults(aiMatches);
    } catch (error) {
      console.error('Error with AI search:', error);
    } finally {
      setLoadingAI(false);
    }
  };
  
  const handleProfilesScroll = (direction: 'left' | 'right') => {
    if (profilesScrollRef.current) {
      const { current } = profilesScrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const handleProjectsScroll = (direction: 'left' | 'right') => {
    if (projectsScrollRef.current) {
      const { current } = projectsScrollRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const openProjectDetails = (project: ProjectIdea) => {
    setSelectedProject(project);
    setShowProjectDialog(true);
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
          <h1 className="text-4xl font-bold">find and</h1>
          <h1 className="text-4xl font-bold mb-6">be found.</h1>
          <p className="text-muted-foreground max-w-lg">
            Connect with creative minds and innovative projects that match your skills and interests.
          </p>
        </div>
        
        <div className={`w-full transition-all duration-300 ${searchFocused ? 'max-w-full' : 'max-w-xl'}`}>
          <div className="relative">
            <Input
              className={`minimal-search letter-spacing-wide transition-all duration-300 pl-4 shadow-lg ${
                searchFocused ? 'text-lg' : 'text-base'
              }`}
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
                        aiResults.map(({ profile, matchScore }) => (
                          <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md">
                              {profile.avatar ? (
                                <img 
                                  src={profile.avatar} 
                                  alt={profile.name} 
                                  className="w-full h-full object-cover"
                                />
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
                                <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
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
                    ) : filteredProfiles.length > 0 ? (
                      filteredProfiles.map(profile => (
                        <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md">
                            {profile.avatar ? (
                              <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="w-full h-full object-cover"
                              />
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
                              <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
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
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Users with similar skills */}
                {similarSkillsUsers.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-0">People with similar skills</h2>
                        <p className="text-sm text-muted-foreground">Users who share your expertise</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleProfilesScroll('left')}
                          className="shadow-md"
                        >
                          <ArrowLeft size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleProfilesScroll('right')}
                          className="shadow-md"
                        >
                          <ArrowRight size={18} />
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      ref={profilesScrollRef}
                      className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide scroll-smooth"
                    >
                      {similarSkillsUsers.map(profile => (
                        <div 
                          key={profile.id} 
                          className="flex-shrink-0 w-64 border-b-3 border-border p-4 hover:border-primary transition-all duration-300 bg-white rounded-lg shadow-md"
                        >
                          <div className="w-full aspect-square mb-4 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden shadow-md">
                            {profile.avatar ? (
                              <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="w-full h-full object-cover"
                              />
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
                              <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
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
                
                {/* Nearby users */}
                {nearbyUsers.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-0">People near you</h2>
                        <p className="text-sm text-muted-foreground">Connections in your area</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {nearbyUsers.slice(0, 5).map(profile => (
                        <div key={profile.id} className="border-3 border-border/40 p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white shadow-md">
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md">
                            {profile.avatar ? (
                              <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                                {profile.name[0]}
                              </div>
                            )}
                          </div>
                          <h3 className="text-center font-bold text-lg mb-1">{profile.name}</h3>
                          <p className="text-center text-muted-foreground mb-2">{profile.location}</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {profile.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Project ideas */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-0">Trending Projects</h2>
                      <p className="text-sm text-muted-foreground">Projects that might interest you</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleProjectsScroll('left')}
                        className="shadow-md"
                      >
                        <ArrowLeft size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleProjectsScroll('right')}
                        className="shadow-md"
                      >
                        <ArrowRight size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    ref={projectsScrollRef}
                    className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide scroll-smooth"
                  >
                    {projectIdeas.map(project => (
                      <div 
                        key={project.id} 
                        className="flex-shrink-0 w-80 border-3 border-border/40 rounded-lg overflow-hidden hover:border-primary transition-all duration-300 cursor-pointer bg-white shadow-lg"
                        onClick={() => openProjectDetails(project)}
                      >
                        <div className="w-full h-40 bg-muted">
                          <img 
                            src={project.image} 
                            alt={project.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-base mb-1">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills.map((skill, index) => (
                              <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {project.contributors.length} contributor{project.contributors.length !== 1 ? 's' : ''}
                            </span>
                            {project.contributors.length >= 10 ? (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 shadow-sm">
                                <Check size={12} className="mr-1" /> Full
                              </Badge>
                            ) : (
                              <Button variant="outline" size="sm" className="shadow-sm">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Project Details Dialog - improved with thicker borders and shadows */}
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="sm:max-w-[600px] border-3 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProject?.title}</DialogTitle>
              <DialogDescription>
                {selectedProject?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2">
              <div className="w-full h-64 rounded-lg overflow-hidden mb-4 shadow-md">
                {selectedProject?.image && (
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject?.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject?.skills.map((skill, index) => (
                      <Badge key={index} style={{backgroundColor: skill.color, color: '#000000'}} className="shadow-sm">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Team Status</h4>
                  <div className="flex items-center">
                    <UserPlus size={16} className="mr-2 text-muted-foreground" />
                    <span>
                      {selectedProject?.contributors.length} / 10 contributors
                      {selectedProject?.contributors.length === 10 && " (Project is full)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <DialogClose asChild>
                <Button variant="outline" className="shadow-md">
                  <X size={16} className="mr-2" />
                  Close
                </Button>
              </DialogClose>
              
              {selectedProject && selectedProject.contributors.length < 10 && (
                <Button className="shadow-md">
                  <UserPlus size={16} className="mr-2" />
                  Collaborate
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
