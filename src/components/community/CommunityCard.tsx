
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Globe, Users, Lock, User } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Community } from "../../pages/Communities";
import { useNavigate } from "react-router-dom";

interface CommunityCardProps {
  community: Community;
  onJoin: () => void;
  onLeave: () => void;
  showJoinButton: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  onJoin, 
  onLeave, 
  showJoinButton 
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/community/${community.id}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border/50">
      {community.banner_image && (
        <div 
          className="h-24 bg-cover bg-center" 
          style={{ backgroundImage: `url(${community.banner_image})` }}
        />
      )}
      
      <CardHeader className="flex flex-row items-center gap-4 pt-4 pb-2">
        <Avatar className="h-12 w-12 border-2 border-background">
          {community.icon_image ? (
            <AvatarImage src={community.icon_image} alt={community.name} />
          ) : (
            <AvatarFallback>
              {getInitials(community.name)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 
              className="font-semibold text-lg truncate cursor-pointer hover:underline" 
              onClick={handleCardClick}
            >
              {community.name}
            </h3>
            {community.is_private ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{formatNumber(community.member_count)} members</span>
            </div>
            
            <span>•</span>
            
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate" title={community.owner?.name || "Unknown"}>
                {community.owner?.name || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm line-clamp-2">{community.description}</p>
        
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {community.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {community.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{community.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {showJoinButton && (
          community.is_member ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
            >
              Leave
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
            >
              Join
            </Button>
          )
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full" 
            onClick={handleCardClick}
          >
            Visit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;
