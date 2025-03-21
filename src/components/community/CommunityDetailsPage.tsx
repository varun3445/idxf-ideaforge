
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../AuthContext";
import { useToast } from "../../hooks/use-toast";
import { Community } from "../../pages/Communities";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Calendar, Globe, Lock, Share, Users } from "lucide-react";

const CommunityDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunityDetails();
    }
  }, [id, user]);

  const fetchCommunityDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch community details
      const { data, error } = await supabase
        .from("communities")
        .select(`
          *,
          owner:owner_id(name, avatar)
        `)
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        navigate("/communities");
        return;
      }
      
      setCommunity(data);
      
      // Check if user is a member and their role
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from("community_members")
          .select("role")
          .eq("community_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (memberError) throw memberError;
        
        setIsMember(!!memberData);
        setIsAdmin(memberData?.role === "admin");
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
      toast({
        variant: "destructive",
        title: "Error loading community",
        description: "Failed to load community details. Please try again."
      });
      navigate("/communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user || !community) return;
    
    try {
      const { error } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: "member"
        });
        
      if (error) throw error;
      
      // Update member count
      await supabase.rpc("increment_community_members", {
        community_id: community.id
      });
      
      setIsMember(true);
      
      toast({
        title: "Joined community",
        description: `You have joined ${community.name}`
      });
      
      // Refresh community data to get updated member count
      fetchCommunityDetails();
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        variant: "destructive",
        title: "Failed to join",
        description: "An error occurred while joining the community."
      });
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !community) return;
    
    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", community.id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Update member count
      await supabase.rpc("decrement_community_members", {
        community_id: community.id
      });
      
      setIsMember(false);
      setIsAdmin(false);
      
      toast({
        title: "Left community",
        description: `You have left ${community.name}`
      });
      
      // Refresh community data to get updated member count
      fetchCommunityDetails();
    } catch (error) {
      console.error("Error leaving community:", error);
      toast({
        variant: "destructive",
        title: "Failed to leave",
        description: "An error occurred while leaving the community."
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="h-40 w-full bg-muted animate-pulse rounded-lg mb-4"></div>
        <div className="h-10 w-1/3 bg-muted animate-pulse rounded-lg mb-4"></div>
        <div className="h-20 w-full bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Community not found</h2>
        <p className="mb-6">This community may have been removed or does not exist.</p>
        <Button onClick={() => navigate("/communities")}>
          Return to Communities
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Community header with banner */}
      <div className="relative mb-6">
        {community.banner_image ? (
          <div 
            className="h-48 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${community.banner_image})` }}
          ></div>
        ) : (
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg"></div>
        )}
        
        <div className="absolute -bottom-12 left-6 flex items-end">
          <Avatar className="h-24 w-24 border-4 border-background">
            {community.icon_image ? (
              <AvatarImage src={community.icon_image} alt={community.name} />
            ) : (
              <AvatarFallback className="text-2xl">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
      
      {/* Community info section */}
      <div className="mt-14 flex flex-col md:flex-row justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{community.name}</h1>
            {community.is_private ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{community.member_count} members</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(community.created_at)}</span>
            </div>
          </div>
          
          <p className="text-base mb-4">{community.description}</p>
          
          {community.tags && community.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {community.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          {isMember ? (
            <Button 
              variant="outline" 
              className="min-w-36"
              onClick={handleLeaveCommunity}
            >
              Leave Community
            </Button>
          ) : (
            <Button 
              className="min-w-36"
              onClick={handleJoinCommunity}
            >
              Join Community
            </Button>
          )}
          
          <Button variant="outline" className="min-w-36">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {/* Tabs for community content */}
      <Tabs defaultValue="discussions">
        <TabsList className="mb-6">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions" className="min-h-[400px]">
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Discussion functionality is currently under development.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="min-h-[400px]">
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Project sharing functionality is currently under development.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="min-h-[400px]">
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Member listings are currently under development.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="min-h-[400px]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">About This Community</h3>
              <p>{community.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Community Owner</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={community.owner?.avatar} />
                  <AvatarFallback>
                    {community.owner?.name?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{community.owner?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">Community Admin</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityDetailsPage;
