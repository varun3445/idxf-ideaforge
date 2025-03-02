
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { AnimatedTransition } from '../components/AnimatedTransition';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  skills_required: string[];
  match_percentage?: number;
}

interface Person {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  bio: string;
  match_percentage?: number;
}

const Matches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isNearMe, setIsNearMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'people' | 'projects'>('people');
  const [matches, setMatches] = useState<{
    people: Person[];
    projects: Project[];
  }>({
    people: [],
    projects: []
  });

  useEffect(() => {
    // Get user's current location if browser supports geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log("Got user location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "We couldn't access your location. Near Me search will not be available.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Near Me search will not be available.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const fetchMatches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get the current user's skills
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      const userSkills = profileData.skills || [];
      
      // Search functionality with OpenAI integration
      if (searchQuery.trim() !== '') {
        const { data: searchResults, error: searchError } = await supabase
          .functions.invoke('search-with-ai', {
            body: { 
              query: searchQuery,
              userSkills,
              userLocation: isNearMe ? userLocation : null
            }
          });

        if (searchError) throw searchError;
        
        // Format and set the matches
        setMatches({
          people: searchResults.people || [],
          projects: searchResults.projects || []
        });
        
        console.log("AI search results:", searchResults);
      } else {
        // If no search query, fetch regular matches based on skills
        
        // Fetch other users with similar skills
        const { data: peopleData, error: peopleError } = await supabase
          .from('profiles')
          .select('id, name, avatar, skills, bio, location')
          .neq('id', user.id);
          
        if (peopleError) throw peopleError;
        
        // Calculate match percentage and sort by it
        const peopleWithMatches = peopleData.map((person) => {
          const personSkills = person.skills || [];
          const matchCount = personSkills.filter(skill => userSkills.includes(skill)).length;
          const maxSkills = Math.max(userSkills.length, personSkills.length);
          const matchPercentage = maxSkills > 0 ? Math.round((matchCount / maxSkills) * 100) : 0;
          
          // Calculate distance if near me is selected and both locations are available
          let distance = Infinity;
          if (isNearMe && userLocation && person.location) {
            distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              person.location.latitude, 
              person.location.longitude
            );
          }
          
          return {
            ...person,
            match_percentage: matchPercentage,
            distance: distance
          };
        });
        
        // Sort based on match and optionally distance
        const sortedPeople = [...peopleWithMatches].sort((a, b) => {
          if (isNearMe) {
            // If nearMe, prioritize people within reasonable distance (50km) with good match
            const aIsNear = a.distance && a.distance < 50;
            const bIsNear = b.distance && b.distance < 50;
            
            if (aIsNear && !bIsNear) return -1;
            if (!aIsNear && bIsNear) return 1;
            if (aIsNear && bIsNear) {
              // Both nearby, use match percentage as secondary sort
              return b.match_percentage - a.match_percentage;
            }
          }
          // Default to sorting by match percentage
          return b.match_percentage - a.match_percentage;
        });
        
        // Fetch projects with similar skill requirements
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title, description, skills_required');
          
        if (projectsError) throw projectsError;
        
        // Calculate project match percentages
        const projectsWithMatches = projectsData.map((project) => {
          const projectSkills = project.skills_required || [];
          const matchCount = projectSkills.filter(skill => userSkills.includes(skill)).length;
          const maxSkills = Math.max(userSkills.length, projectSkills.length);
          const matchPercentage = maxSkills > 0 ? Math.round((matchCount / maxSkills) * 100) : 0;
          
          return {
            ...project,
            match_percentage: matchPercentage
          };
        });
        
        const sortedProjects = [...projectsWithMatches].sort((a, b) => 
          b.match_percentage - a.match_percentage
        );
        
        setMatches({
          people: sortedPeople,
          projects: sortedProjects
        });
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Failed to fetch matches",
        description: "There was an error retrieving your matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isNearMe]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches();
  };

  const toggleNearMe = () => {
    if (!userLocation) {
      toast({
        title: "Location not available",
        description: "Please allow location access to use this feature.",
        variant: "warning"
      });
      return;
    }
    setIsNearMe(!isNearMe);
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 px-4 md:px-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <Input
              type="text"
              placeholder="Search for matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button
              type="button"
              variant={isNearMe ? "default" : "outline"}
              onClick={toggleNearMe}
              className="whitespace-nowrap"
              disabled={!userLocation}
            >
              {isNearMe ? "Near Me: On" : "Near Me: Off"}
            </Button>
          </form>
        </div>
        
        <Tabs defaultValue="people" value={activeTab} onValueChange={(value) => setActiveTab(value as 'people' | 'projects')}>
          <TabsList className="mb-6">
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="people">
            {matches.people.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.people.map((person) => (
                  <Card key={person.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                          {person.avatar ? (
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/20 text-xl font-bold">
                              {person.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{person.name}</h3>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-primary/10">
                              {person.match_percentage}% Match
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {person.bio}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(person.skills || []).slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(person.skills || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(person.skills || []).length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Button size="sm" className="w-full">View Profile</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or updating your skills to find more matches.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects">
            {matches.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold">{project.title}</h3>
                        <Badge variant="outline" className="bg-primary/10">
                          {project.match_percentage}% Match
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(project.skills_required || []).slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(project.skills_required || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(project.skills_required || []).length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Button size="sm" className="w-full">View Project</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No project matches found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or updating your skills to find more project matches.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedTransition>
  );
};

export default Matches;
