
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, RefreshCw, Search } from 'lucide-react';
import CommunityCard, { Community } from '../components/community/CommunityCard';
import { Badge } from '../components/ui/badge';

const Communities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    isPrivate: false,
    tags: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCommunities();
      fetchMyCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // For each community, check if the user is a member
        const communitiesWithMembership = await Promise.all(
          data.map(async (community) => {
            if (user) {
              const { data: memberData } = await supabase
                .from('community_members')
                .select('role')
                .eq('community_id', community.id)
                .eq('user_id', user.id)
                .single();

              return {
                ...community,
                isMember: !!memberData,
                role: memberData?.role
              };
            }
            return { ...community, isMember: false };
          })
        );

        setCommunities(communitiesWithMembership);
      }
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load communities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get communities where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('community_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const communityIds = memberData.map(item => item.community_id);
        const roleMap = memberData.reduce((acc, item) => {
          acc[item.community_id] = item.role;
          return acc;
        }, {} as Record<string, string>);

        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .in('id', communityIds);

        if (communityError) throw communityError;

        if (communityData) {
          const myCommunitiesWithRole = communityData.map(community => ({
            ...community,
            isMember: true,
            role: roleMap[community.id]
          }));
          
          setMyCommunities(myCommunitiesWithRole);
        }
      } else {
        setMyCommunities([]);
      }
    } catch (error: any) {
      console.error('Error fetching my communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your communities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!user) return;
    
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and description for your community',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      // Parse tags from comma-separated string
      const tags = newCommunity.tags
        ? newCommunity.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      // Create new community
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          is_private: newCommunity.isPrivate,
          owner_id: user.id,
          tags
        })
        .select()
        .single();

      if (communityError) throw communityError;

      if (communityData) {
        // Add creator as admin member
        const { error: memberError } = await supabase
          .from('community_members')
          .insert({
            community_id: communityData.id,
            user_id: user.id,
            role: 'admin'
          });

        if (memberError) throw memberError;

        toast({
          title: 'Community created',
          description: `"${newCommunity.name}" has been created successfully`,
        });

        // Reset form and close dialog
        setNewCommunity({
          name: '',
          description: '',
          isPrivate: false,
          tags: ''
        });
        setIsCreateDialogOpen(false);

        // Refresh communities lists
        fetchMyCommunities();
        fetchCommunities();
      }
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create community',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCommunity = (communityId: string) => {
    // Update local state to reflect membership
    setCommunities(prevCommunities => 
      prevCommunities.map(community => 
        community.id === communityId 
          ? { ...community, isMember: true, member_count: community.member_count + 1 } 
          : community
      )
    );
    
    // Refresh my communities
    fetchMyCommunities();
  };

  const handleLeaveCommunity = (communityId: string) => {
    // Update local state to reflect membership
    setCommunities(prevCommunities => 
      prevCommunities.map(community => 
        community.id === communityId 
          ? { ...community, isMember: false, member_count: Math.max(0, community.member_count - 1) } 
          : community
      )
    );
    
    // Remove from my communities
    setMyCommunities(prevCommunities => 
      prevCommunities.filter(community => community.id !== communityId)
    );
  };

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.tags && community.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Tabs defaultValue="discover" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Communities</h1>
            <p className="text-muted-foreground">Connect with others and share ideas</p>
          </div>
          <TabsList className="mt-4 sm:mt-0">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="discover" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchCommunities}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Community</DialogTitle>
                    <DialogDescription>
                      Create a space for people with similar interests
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Community Name</Label>
                      <Input
                        id="name"
                        value={newCommunity.name}
                        onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                        placeholder="Enter community name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCommunity.description}
                        onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                        placeholder="What's this community about?"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={newCommunity.tags}
                        onChange={(e) => setNewCommunity({ ...newCommunity, tags: e.target.value })}
                        placeholder="technology, design, ai"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={newCommunity.isPrivate}
                        onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Label htmlFor="isPrivate">Private Community</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateCommunity} 
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Community"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading && <p className="text-center py-8">Loading communities...</p>}

          {!loading && filteredCommunities.length === 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ? 
                    "No communities match your search" : 
                    "No communities found. Be the first to create one!"
                  }
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && filteredCommunities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-communities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Communities You've Joined</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchMyCommunities}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading && <p className="text-center py-8">Loading your communities...</p>}

          {!loading && myCommunities.length === 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  You haven't joined any communities yet
                </p>
                <Button onClick={() => document.querySelector('[data-value="discover"]')?.click()}>
                  Discover Communities
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && myCommunities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map((community) => (
                <Card key={community.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <Badge variant={community.role === 'admin' ? 'default' : 'secondary'}>
                        {community.role === 'admin' ? 'Admin' : 'Member'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {community.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4 flex-1">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      <span>{community.member_count} members</span>
                    </div>
                    {community.tags && community.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {community.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <div className="px-6 pb-6 mt-auto">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleLeaveCommunity(community.id)}
                    >
                      Leave Community
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communities;
