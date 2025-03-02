import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { X, ArrowLeft, MapPin, Loader2, Eye, EyeOff, Plus } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';

interface SkillProps {
  name: string;
  selected: boolean;
  color: string;
  onClick: () => void;
}

const Skill = ({ name, selected, color, onClick }: SkillProps) => {
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
        selected ? 'text-black' : 'text-white hover:text-black'
      }`}
      style={{ backgroundColor: selected ? color : 'rgba(255, 255, 255, 0.1)' }}
      onClick={onClick}
      type="button"
    >
      {name}
      {selected && (
        <X size={14} className="text-black" />
      )}
    </button>
  );
};

const Signup = () => {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  
  const [availableSkills, setAvailableSkills] = useState([
    { name: 'UX Design', color: '#8B5CF6' },
    { name: 'UI Design', color: '#D946EF' },
    { name: 'Frontend Development', color: '#F97316' },
    { name: 'Backend Development', color: '#0EA5E9' },
    { name: 'Product Management', color: '#10B981' },
    { name: 'Marketing', color: '#F59E0B' },
    { name: 'Content Writing', color: '#6366F1' },
    { name: 'Graphic Design', color: '#EC4899' },
    { name: '3D Modeling', color: '#14B8A6' },
    { name: 'Video Editing', color: '#8B5CF6' },
    { name: 'Animation', color: '#F43F5E' },
    { name: 'Illustration', color: '#F97316' },
    { name: 'Sound Design', color: '#0EA5E9' },
    { name: 'Game Development', color: '#10B981' },
    { name: 'Data Science', color: '#F59E0B' },
  ]);

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
  };

  const addNewSkill = () => {
    if (!newSkillName.trim()) {
      toast({
        title: "Skill name required",
        description: "Please enter a skill name",
        variant: "destructive"
      });
      return;
    }

    if (availableSkills.some(skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in the list",
        variant: "destructive"
      });
      return;
    }

    const randomColor = generateRandomColor();
    
    const newSkill = {
      name: newSkillName.trim(),
      color: randomColor
    };

    setAvailableSkills([...availableSkills, newSkill]);
    setSelectedSkills([...selectedSkills, newSkill.name]);
    
    setNewSkillName('');
    setIsAddingSkill(false);

    toast({
      title: "Skill added",
      description: `${newSkill.name} has been added to your skills`,
    });
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!name || !email || !password || !location) {
        setError('Please fill in all fields');
        return;
      }
      setError('');
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const detectLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location data');
            }
            
            const data = await response.json();
            
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            const country = data.address.country || '';
            
            let locationString = '';
            if (city) {
              locationString += city;
              if (state) {
                locationString += `, ${state}`;
              } else if (country) {
                locationString += `, ${country}`;
              }
            } else if (state) {
              locationString = `${state}, ${country}`;
            } else {
              locationString = country;
            }
            
            setLocation(locationString);
            setLocationLoading(false);
            
            toast({
              title: "Location detected",
              description: `Your location: ${locationString}`,
            });
          } catch (error) {
            console.error('Error getting location name:', error);
            setLocationLoading(false);
            toast({
              title: "Location detection failed",
              description: "Please enter your location manually",
              variant: "destructive"
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationLoading(false);
          toast({
            title: "Location detection failed",
            description: error.message || "Please enter your location manually",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signup(name, email, password, location, selectedSkills);
      
      if (error) {
        setError(error.message);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome to Idea Forge!",
          description: "Your account has been created successfully",
        });
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Idea Forge and connect with creative professionals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive text-destructive text-sm rounded-md">
              {error}
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location">Location</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={detectLocation}
                    disabled={locationLoading}
                    className="h-8 px-2 text-xs"
                  >
                    {locationLoading ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <MapPin size={14} className="mr-1" />
                    )}
                    Detect
                  </Button>
                </div>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="button"
                className="w-full mt-6"
                onClick={goToNextStep}
                disabled={!name || !email || !password || !location}
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Select your skills</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingSkill(!isAddingSkill)}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Custom
                  </Button>
                </div>
                
                {isAddingSkill && (
                  <div className="mb-4 p-3 bg-background/50 border rounded-md space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newSkillName">Skill Name</Label>
                      <Input
                        id="newSkillName"
                        type="text"
                        placeholder="Enter skill name"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        onClick={addNewSkill}
                        className="flex-1"
                      >
                        Add Skill
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddingSkill(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Skill
                      key={skill.name}
                      name={skill.name}
                      selected={selectedSkills.includes(skill.name)}
                      color={skill.color}
                      onClick={() => toggleSkill(skill.name)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected skills: {selectedSkills.length}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skillName) => {
                    const skill = availableSkills.find(s => s.name === skillName);
                    return (
                      <div
                        key={skillName}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-black flex items-center gap-1.5"
                        style={{ backgroundColor: skill?.color }}
                      >
                        {skillName}
                        <button 
                          onClick={() => toggleSkill(skillName)}
                          className="hover:bg-white/20 rounded-full p-0.5"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goToPreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-1 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Complete Signup"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
