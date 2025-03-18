
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../AuthContext';
import SkillsetSelector from '../components/SkillsetSelector';
import AvatarUpload from '../components/AvatarUpload';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [skills, setSkills] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);

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
      const fetchUserSkills = async () => {
        try {
          const { data: userSkills, error } = await supabase
            .from('user_skills')
            .select('skill_id, skills(name)')
            .eq('user_id', user.id);

          if (error) throw error;

          if (userSkills) {
            const skillNames = userSkills.map(skill => skill.skills.name);
            setSkills(skillNames);
          }
        } catch (error) {
          console.error('Error fetching user skills:', error);
        }
      };

      fetchUserSkills();
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          location,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      if (user) {
        setUser({
          ...user,
          name,
          location,
          avatar
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar Upload Component */}
              <AvatarUpload 
                userId={user.id} 
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
    </div>
  );
};

export default Profile;
