
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Clock, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../AuthContext';

export type Community = {
  id: string;
  name: string;
  description: string | null;
  member_count: number | null;
  created_at: string;
  icon_image?: string | null;
  banner_image?: string | null;
  is_private: boolean;
  tags?: string[];
  isMember?: boolean;
  role?: string;
};

interface CommunityCardProps {
  community: Community;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  disabled?: boolean;
}

const CommunityCard = ({ community, onJoin, onLeave, disabled }: CommunityCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMember, setIsMember] = useState(community.isMember || false);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join communities",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      setIsMember(true);
      toast({
        title: "Joined community",
        description: `You've successfully joined ${community.name}`,
      });
      
      if (onJoin) {
        onJoin(community.id);
      }
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error.message || "An error occurred while joining the community",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    setIsLeaving(true);
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', community.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsMember(false);
      toast({
        title: "Left community",
        description: `You've left ${community.name}`,
      });
      
      if (onLeave) {
        onLeave(community.id);
      }
    } catch (error: any) {
      toast({
        title: "Failed to leave",
        description: error.message || "An error occurred while leaving the community",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={community.icon_image || ''} alt={community.name} />
          <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{community.name}</h3>
            {community.is_private && (
              <Badge variant="outline" className="ml-2">Private</Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1" />
            <span>{community.member_count} members</span>
            <span className="mx-2">•</span>
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>Created {formatDate(community.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 py-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {community.description}
        </p>
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {community.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {isMember ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleLeaveCommunity}
            disabled={isLeaving || disabled}
          >
            {isLeaving ? "Leaving..." : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Member
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            onClick={handleJoinCommunity}
            disabled={isJoining || disabled}
          >
            {isJoining ? "Joining..." : "Join Community"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;
