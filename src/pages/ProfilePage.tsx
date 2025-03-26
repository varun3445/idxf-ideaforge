
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import SkillsetSelector from '../components/SkillsetSelector';
import AvatarUpload from '../components/AvatarUpload';
import AnimatedTransition from '../components/AnimatedTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PublishedProjectsManager from '../components/PublishedProjectsManager';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [skills, setSkills] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setLocation(user.location || '');
      setAvatar(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Simulating skill fetch for demo mode
      setSkills(user.skills || []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Simulating project fetch for demo mode
      // In a real implementation, this would be a database query
      const mockProjects = [
        {
          id: '1',
          title: 'AI-Powered Visual Design Assistant',
          description: 'An intelligent design assistant that provides real-time feedback and suggestions as designers work on their projects.',
          imageUrl: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop',
          published: true,
          backersCount: 24,
          createdAt: '2023-11-15',
          updatedAt: '2023-12-05',
        },
        {
          id: '2',
          title: 'Decentralized Creative Marketplace',
          description: 'A blockchain-based platform where creatives can sell their work directly to clients without intermediaries, using smart contracts.',
          imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1332&auto=format&fit=crop',
          published: true,
          backersCount: 18,
          createdAt: '2023-09-23',
          updatedAt: '2023-10-15',
        },
        {
          id: '3',
          title: 'Immersive Learning Environment',
          description: 'A VR-based educational platform that creates interactive, spatial learning experiences for complex subjects.',
          imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=1170&auto=format&fit=crop',
          published: false,
          backersCount: 0,
          createdAt: '2023-07-09',
          updatedAt: '2023-08-01',
        }
      ];
      
      setProjects(mockProjects);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Simulating profile update for demo mode
      if (user) {
        setUser({
          ...user,
          name,
          location,
          avatar,
          skills
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setAvatar(url);
    if (user) {
      setUser({
        ...user,
        avatar: url
      });
    }
  };

  const handleUpdateProject = (projectId: string, data: Partial<any>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, ...data } : project
    ));
  };

  const handlePublishStatusChange = (projectId: string, publish: boolean) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, published: publish } : project
    ));
  };

  const handleAddUpdate = (projectId: string, updateText: string) => {
    // In a real implementation, this would send the update to the database
    console.log(`Adding update to project ${projectId}: ${updateText}`);
    // For demo purposes, we'll just update the project's updatedAt date
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, updatedAt: new Date().toISOString() } : project
    ));
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Published Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="font-playfair">Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar Upload Component */}
                    <AvatarUpload 
                      userId={user?.id || 'mock-user-id'} 
                      url={avatar} 
                      onUpload={handleAvatarUpload} 
                      size="lg"
                    />
                    
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={email}
                          disabled
                          placeholder="Your email"
                        />
                        <p className="text-sm text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Your location"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Skills</Label>
                    <SkillsetSelector selectedSkills={skills} onChange={setSkills} />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card className="w-full mx-auto">
              <CardHeader>
                <CardTitle className="font-playfair">Published Projects</CardTitle>
                <CardDescription>
                  Manage your published projects, add updates, and track supporters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PublishedProjectsManager 
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onPublishStatusChange={handlePublishStatusChange}
                  onAddUpdate={handleAddUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedTransition>
  );
};

export default ProfilePage;
