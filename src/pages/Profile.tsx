
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import AnimatedTransition from '../components/AnimatedTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Save, X, Plus } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  color: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [sex, setSex] = useState(user?.sex || 'male');
  const [avatar, setAvatar] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>(user?.skills || []);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  
  // Update avatar when name or sex changes
  useEffect(() => {
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&gender=${sex}`);
  }, [name, sex]);
  
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setAvailableSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    
    fetchSkills();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          location,
          sex
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // First, get all existing user skills
      const { data: existingUserSkills, error: fetchError } = await supabase
        .from('user_skills')
        .select('skill_id, skills(name)')
        .eq('user_id', user.id);
        
      if (fetchError) throw fetchError;
      
      // Delete all existing skill associations
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Add all selected skills
      for (const skillName of userSkills) {
        // Check if skill exists
        let skillId;
        const existingSkill = availableSkills.find(s => s.name === skillName);
        
        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          // Create new skill
          const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
          const { data: newSkill, error: newSkillError } = await supabase
            .from('skills')
            .insert({
              name: skillName,
              color: randomColor
            })
            .select('id')
            .single();
            
          if (newSkillError) {
            console.error(`Error creating skill ${skillName}:`, newSkillError);
            continue;
          }
          
          skillId = newSkill.id;
        }
        
        // Add user skill association
        const { error: insertError } = await supabase
          .from('user_skills')
          .insert({
            user_id: user.id,
            skill_id: skillId
          });
          
        if (insertError) {
          console.error(`Error adding skill ${skillName}:`, insertError);
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
      // Reload page to refresh user data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (userSkills.includes(newSkill.trim())) {
      toast({
        title: "Skill already added",
        description: "This skill is already in your profile",
        variant: "destructive"
      });
      return;
    }
    
    setUserSkills([...userSkills, newSkill.trim()]);
    setNewSkill('');
  };
  
  const handleRemoveSkill = (skill: string) => {
    setUserSkills(userSkills.filter(s => s !== skill));
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AnimatedTransition>
      <div className="page-container pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="page-header">Your Profile</h1>
          <p className="page-subheader mb-8">
            Manage your personal information and skills
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-background">
                    <img 
                      src={avatar} 
                      alt={name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Profile picture is automatically generated based on your name and gender
                  </p>
                  
                  <div className="w-full mb-6">
                    <Label htmlFor="sex" className="mb-2 block">Gender for Avatar</Label>
                    <Select 
                      value={sex} 
                      onValueChange={setSex}
                    >
                      <SelectTrigger id="sex">
                        <SelectValue placeholder="Select gender for avatar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="mt-4 w-full"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          className="flex-grow"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddSkill}
                          variant="secondary"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {userSkills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1 text-sm"
                          >
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                        {userSkills.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No skills added yet
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Profile;
