
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Globe, Users, MessageSquare, CalendarDays, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GlassmorphicCard from '@/components/GlassmorphicCard';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  image?: string;
  isMember?: boolean;
}

const Communities: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);

  // Populate with mock data
  useEffect(() => {
    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'Web3 Developers',
        description: 'A community for blockchain and decentralized application developers',
        memberCount: 432,
        createdAt: '2023-05-12T00:00:00Z',
        image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1332&auto=format&fit=crop',
        isMember: true
      },
      {
        id: '2',
        name: 'UI/UX Design Guild',
        description: 'Share your design work, get feedback, and discuss the latest trends in user experience',
        memberCount: 851,
        createdAt: '2023-02-28T00:00:00Z',
        image: 'https://images.unsplash.com/photo-1664575198263-269a022d6e14?q=80&w=1170&auto=format&fit=crop',
        isMember: true
      },
      {
        id: '3',
        name: 'Open Source Contributors',
        description: 'Find projects to contribute to and connect with other open source enthusiasts',
        memberCount: 623,
        createdAt: '2023-07-15T00:00:00Z',
        image: 'https://images.unsplash.com/photo-1522313889083-9659e3734414?q=80&w=1134&auto=format&fit=crop',
        isMember: false
      },
      {
        id: '4',
        name: 'AI & Machine Learning',
        description: 'Discuss advancements in artificial intelligence, machine learning, and neural networks',
        memberCount: 1243,
        createdAt: '2023-01-10T00:00:00Z',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1465&auto=format&fit=crop',
        isMember: false
      },
      {
        id: '5',
        name: 'Creative Coders',
        description: 'Where art meets programming - share your creative coding projects and experiments',
        memberCount: 378,
        createdAt: '2023-03-22T00:00:00Z',
        image: 'https://images.unsplash.com/photo-1617802688099-0f5b2b0a307f?q=80&w=1170&auto=format&fit=crop',
        isMember: false
      }
    ];
    
    setCommunities(mockCommunities);
    setMyCommunities(mockCommunities.filter(c => c.isMember));
  }, []);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityName.trim() || !communityDescription.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock creating a community
      const newCommunity: Community = {
        id: `comm-${Date.now()}`,
        name: communityName.trim(),
        description: communityDescription.trim(),
        memberCount: 1,
        createdAt: new Date().toISOString(),
        isMember: true
      };
      
      setCommunities(prev => [...prev, newCommunity]);
      setMyCommunities(prev => [...prev, newCommunity]);
      
      setCommunityName('');
      setCommunityDescription('');
      setCreateDialogOpen(false);
      
      toast({
        title: 'Community Created',
        description: 'Your new community has been created successfully',
        variant: 'success'
      });
      
      // Navigate to the new community
      // navigate(`/communities/${newCommunity.id}`);
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: 'Error',
        description: 'Failed to create community. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = (community: Community) => {
    if (community.isMember) {
      // Leave community
      setCommunities(prev => 
        prev.map(c => c.id === community.id ? { ...c, isMember: false, memberCount: c.memberCount - 1 } : c)
      );
      setMyCommunities(prev => prev.filter(c => c.id !== community.id));
      
      toast({
        title: 'Left Community',
        description: `You have left the ${community.name} community`,
        variant: 'default'
      });
    } else {
      // Join community
      setCommunities(prev => 
        prev.map(c => c.id === community.id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c)
      );
      
      const updatedCommunity = { ...community, isMember: true, memberCount: community.memberCount + 1 };
      setMyCommunities(prev => [...prev, updatedCommunity]);
      
      toast({
        title: 'Joined Community',
        description: `You have joined the ${community.name} community`,
        variant: 'success'
      });
    }
  };

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedTransition>
      <div className="page-container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-left">Communities</h1>
            <p className="text-gray-600 mt-2 text-left">Connect with like-minded creators and join discussions</p>
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Community
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search communities..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="mt-0">
            {filteredCommunities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No communities found</h3>
                  <p className="text-center text-gray-500 mb-6 max-w-md">
                    We couldn't find any communities matching your search. Try a different search term or create your own community.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Community
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(community => (
                  <GlassmorphicCard key={community.id} className="overflow-hidden flex flex-col">
                    <div 
                      className="h-36 bg-cover bg-center"
                      style={{ 
                        backgroundImage: community.image ? `url(${community.image})` : 'url(https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop)'
                      }}
                    >
                      <div className="w-full h-full bg-black/40 p-6 flex items-end">
                        <h3 className="text-white text-xl font-bold">{community.name}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="flex-grow p-6">
                      <p className="text-sm text-gray-600 mb-4">{community.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{community.memberCount} members</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t p-6">
                      <Button 
                        variant={community.isMember ? "outline" : "default"} 
                        className="w-full"
                        onClick={() => handleJoinCommunity(community)}
                      >
                        {community.isMember ? 'Leave Community' : 'Join Community'}
                      </Button>
                    </CardFooter>
                  </GlassmorphicCard>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-communities" className="mt-0">
            {myCommunities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">You haven't joined any communities yet</h3>
                  <p className="text-center text-gray-500 mb-6 max-w-md">
                    Join existing communities to connect with other creators or start your own community.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => document.querySelector('[value="discover"]')?.dispatchEvent(new Event('click'))}>
                      Discover Communities
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCommunities.map(community => (
                  <GlassmorphicCard key={community.id} className="overflow-hidden flex flex-col">
                    <div 
                      className="h-36 bg-cover bg-center"
                      style={{ 
                        backgroundImage: community.image ? `url(${community.image})` : 'url(https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop)'
                      }}
                    >
                      <div className="w-full h-full bg-black/40 p-6 flex items-end">
                        <h3 className="text-white text-xl font-bold">{community.name}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="flex-grow p-6">
                      <p className="text-sm text-gray-600 mb-4">{community.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{community.memberCount} members</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>5 new posts today</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t p-6">
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: 'Coming Soon',
                            description: 'Community discussions are coming soon!',
                            variant: 'default'
                          });
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Discussions
                      </Button>
                    </CardFooter>
                  </GlassmorphicCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Create a community to connect with like-minded creators and share ideas
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateCommunity} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="community-name">Community Name *</Label>
                <Input 
                  id="community-name" 
                  value={communityName} 
                  onChange={e => setCommunityName(e.target.value)} 
                  placeholder="Enter community name" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="community-description">Description *</Label>
                <Textarea 
                  id="community-description" 
                  value={communityDescription} 
                  onChange={e => setCommunityDescription(e.target.value)} 
                  placeholder="What is this community about?" 
                  rows={4} 
                  required 
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!communityName.trim() || !communityDescription.trim() || loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Community'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedTransition>
  );
};

export default Communities;
