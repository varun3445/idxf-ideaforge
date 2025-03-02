
// Just updating the UserProfile interface definition to ensure it includes avatar
interface UserProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  avatar?: string | null;
  distance?: number;
  matchScore?: number;
  isNearby?: boolean;
  skillMatch?: boolean;
  locationMatch?: boolean;
}
