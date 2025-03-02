import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import AnimatedTransition from '../components/AnimatedTransition';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Loader2, Save, X, Plus, Upload, Camera, LogOut } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  color: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(user?.avatar || null);
  const [userSkills, setUserSkills] = useState<string[]>(user?.skills || []);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setAvailableSkills(data as Skill[] || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    
    fetchSkills();
    
    const fetchUserAvatar = async () => {
      if (user?.id && user?.avatar) {
        setCustomAvatar(user.avatar);
      }
    };
    
    fetchUserAvatar();
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLocation(user.location || '');
      setUserSkills(user.skills || []);
      setCustomAvatar(user.avatar || null);
    }
  }, [user]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) {
      return;
    }
    
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const fileData = new File([file], fileName, { type: file.type });
      
      const { data, error: uploadError } = await supabase.storage
        .from('user_avatars')
        .upload(filePath, fileData);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('user_avatars')
        .getPublicUrl(filePath);
        
      if (publicUrlData && publicUrlData.publicUrl) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar: publicUrlData.publicUrl
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        setCustomAvatar(publicUrlData.publicUrl);
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveCustomAvatar = async () => {
    if (!user?.id || !customAvatar) return;
    
    setUploadingImage(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar: null
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setCustomAvatar(null);
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed"
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Operation failed",
        description: "There was an error removing your profile picture",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          location
        } as any)
        .eq('id', user.id as any);
        
      if (profileError) throw profileError;
      
      const { data: existingUserSkills, error: fetchError } = await supabase
        .from('user_skills')
        .select('skill_id, skills(name)')
        .eq('user_id', user.id as any);
        
      if (fetchError) throw fetchError;
      
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id as any);
        
      if (deleteError) throw deleteError;
      
      for (const skillName of userSkills) {
        let skillId;
        const existingSkill = availableSkills.find(s => s.name === skillName);
        
        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
          const { data: newSkill, error: newSkillError } = await supabase
            .from('skills')
            .insert({
              name: skillName,
              color: randomColor
            } as any)
            .select('id')
            .single();
            
          if (newSkillError) {
            console.error(`Error creating skill ${skillName}:`, newSkillError);
            continue;
          }
          
          skillId = newSkill?.id;
        }
        
        const { error: insertError } = await supabase
          .from('user_skills')
          .insert({
            user_id: user.id,
            skill_id: skillId
          } as any);
          
        if (insertError) {
          console.error(`Error adding skill ${skillName}:`, insertError);
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
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
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <AnimatedTransition>
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-8">
            Manage your personal information and skills
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="border-3 border-border/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-background relative shadow-lg">
                    {customAvatar ? (
                      <img 
                        src={customAvatar} 
                        alt={name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <Camera size={32} />
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 mb-1" />
                          <span className="text-xs">Change Photo</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  
                  <div className="flex w-full space-x-2 mb-4">
                    <Button 
                      type="button" 
                      onClick={triggerFileInput}
                      variant="outline"
                      className="flex-1 shadow-md"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Upload size={16} className="mr-2" />
                      )}
                      Upload
                    </Button>
                    
                    {customAvatar && (
                      <Button 
                        type="button" 
                        onClick={handleRemoveCustomAvatar}
                        variant="outline"
                        className="flex-1 shadow-md"
                        disabled={uploadingImage}
                      >
                        <X size={16} className="mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="mt-4 w-full shadow-md"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="border-3 border-border/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="block text-left">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="block text-left">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="block text-left">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        required
                        className="shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="block text-left">Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          className="flex-grow shadow-md"
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
                          className="shadow-md"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {userSkills.map((skill, index) => {
                          const skillInfo = availableSkills.find(s => s.name === skill);
                          const bgColor = skillInfo?.color || '#9b87f5';
                          
                          return (
                            <span 
                              key={index} 
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm shadow-sm"
                              style={{ backgroundColor: bgColor, color: '#000000' }}
                            >
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-black/70 hover:text-black/90"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          );
                        })}
                        {userSkills.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No skills added yet
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full shadow-md"
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
