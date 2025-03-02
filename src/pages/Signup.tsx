
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { X } from 'lucide-react';

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
    >
      {name}
      {selected && (
        <X size={14} className="text-black" />
      )}
    </button>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const availableSkills = [
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
  ];

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would handle actual signup
    console.log({ name, email, password, location, selectedSkills });
    // Redirect to the app after signup
    navigate('/explore');
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
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
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
                <h3 className="text-lg font-medium mb-3">Select your top skills (max 5)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose up to 5 skills that best represent your expertise
                </p>
                
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
                  Selected skills: {selectedSkills.length}/5
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
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={selectedSkills.length === 0}
                >
                  Complete Signup
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
