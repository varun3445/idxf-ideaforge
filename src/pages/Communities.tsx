
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  Filter, 
  Globe
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../AuthContext';
import { supabase } from '../integrations/supabase/client';
import CreateCommunityDialog from '../components/community/CreateCommunityDialog';
import CommunityCard from '../components/community/CommunityCard';
import { useMediaQuery } from '../hooks/useMediaQuery';

export type Community = {
  id: string;
  name: string;
  description: string;
  banner_image?: string;
  icon_image?: string;
  created_at: string;
  owner_id: string;
  is_private: boolean;
  member_count: number;
  tags: string[];
  owner?: {
    name: string;
    avatar?: string;
  };
  is_member?: boolean;
};

const Communities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    if (!user) return;
    fetchCommunities();
    fetchMyCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          owner:owner_id(name, avatar)
        `)
        .eq('is_private', false)
        .order('member_count', { ascending: false });

      if (error) throw error;

      // If user is logged in, check which communities they're part of
      if (user) {
        const { data: memberships } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);

        const memberCommunityIds = memberships?.map(m => m.community_id) || [];
        
        const communitiesWithMembership = data.map(community => ({
          ...community,
          is_member: memberCommunityIds.includes(community.id)
        }));
        
        setCommunities(communitiesWithMembership);
      } else {
        setCommunities(data || []);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load communities',
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    if (!user) return;
    
    try {
      // Get communities where user is a member
      const { data: memberCommunities, error: memberError } = await supabase
        .from('community_members')
        .select(`
          community:community_id(
            *,
            owner:owner_id(name, avatar)
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Get communities where user is the owner
      const { data: ownedCommunities, error: ownerError } = await supabase
        .from('communities')
        .select(`
          *,
          owner:owner_id(name, avatar)
        `)
        .eq('owner_id', user.id);

      if (ownerError) throw ownerError;

      // Combine and deduplicate
      const memberCommunitiesFormatted = memberCommunities.map(item => ({
        ...item.community,
        is_member: true
      }));
      
      const ownedCommunitiesFormatted = ownedCommunities.map(community => ({
        ...community,
        is_member: true
      }));

      // Combine and deduplicate
      const allMyCommunities = [...memberCommunitiesFormatted, ...ownedCommunitiesFormatted];
      const uniqueCommunities = Array.from(new Map(allMyCommunities.map(item => [item.id, item])).values());
      
      setMyCommunities(uniqueCommunities);
    } catch (error) {
      console.error('Error fetching my communities:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load your communities',
        description: 'Please try again later',
      });
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'You need to be logged in to join communities',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      // Update member count in communities table
      await supabase.rpc('increment_community_members', {
        community_id: communityId
      });

      toast({
        title: 'Success!',
        description: 'You have joined the community',
      });

      // Update UI
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, is_member: true, member_count: community.member_count + 1 } 
            : community
        )
      );
      
      await fetchMyCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to join community',
        description: 'Please try again later',
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update member count in communities table
      await supabase.rpc('decrement_community_members', {
        community_id: communityId
      });

      toast({
        title: 'Success!',
        description: 'You have left the community',
      });

      // Update UI
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, is_member: false, member_count: Math.max(0, community.member_count - 1) } 
            : community
        )
      );
      
      setMyCommunities(prev => prev.filter(community => community.id !== communityId));
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to leave community',
        description: 'Please try again later',
      });
    }
  };

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredMyCommunities = myCommunities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const renderCommunityList = (communitiesList: Community[], showJoinButton: boolean) => {
    if (communitiesList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Globe className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No communities found</h3>
          <p className="text-gray-500 max-w-sm">
            {showJoinButton 
              ? "Try a different search or create your own community!"
              : "Join some communities to see them here!"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communitiesList.map(community => (
          <CommunityCard 
            key={community.id}
            community={community}
            onJoin={() => handleJoinCommunity(community.id)}
            onLeave={() => handleLeaveCommunity(community.id)}
            showJoinButton={showJoinButton}
          />
        ))}
      </div>
    );
  };

  const handleCreateSuccess = async (newCommunity: Community) => {
    toast({
      title: 'Community Created!',
      description: `${newCommunity.name} has been created successfully.`
    });
    setShowCreateDialog(false);
    await fetchCommunities();
    await fetchMyCommunities();
    setActiveTab('my-communities');
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-muted-foreground">Connect with innovators and creators</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Create Community</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search communities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Globe size={16} />
            <span>Discover</span>
          </TabsTrigger>
          <TabsTrigger value="my-communities" className="flex items-center gap-2">
            <Users size={16} />
            <span>My Communities</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Discover Communities</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span className="hidden md:inline">Popular</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Clock size={14} />
                <span className="hidden md:inline">Recent</span>
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="w-full h-40 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              renderCommunityList(filteredCommunities, true)
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="my-communities" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Communities</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="w-full h-40 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              renderCommunityList(filteredMyCommunities, false)
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <CreateCommunityDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Communities;
