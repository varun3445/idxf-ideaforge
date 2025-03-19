
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MapPin } from 'lucide-react';
import SkillsetSelector from '../components/SkillsetSelector';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import PlanSelectionStep from '../components/PlanSelectionStep';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters."
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters."
  }),
  sex: z.enum(["male", "female", "other"])
});

type FormValues = z.infer<typeof formSchema>;
type SignupStep = 'account' | 'skills' | 'plan';

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [promoCode, setPromoCode] = useState<string>('');
  const [step, setStep] = useState<SignupStep>('account');
  const [accountData, setAccountData] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      location: "",
      sex: "male"
    }
  });

  const onSubmitAccountInfo = (values: FormValues) => {
    setAccountData(values);
    setStep('skills');
  };

  const goToStep = (newStep: SignupStep) => {
    setStep(newStep);
  };

  // Location detection
  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || '';
        const country = data.address.country || '';
        
        let locationStr = '';
        if (city) locationStr += city;
        if (state && state !== city) locationStr += locationStr ? `, ${state}` : state;
        if (country) locationStr += locationStr ? `, ${country}` : country;
        
        form.setValue('location', locationStr);
        toast({
          title: "Location detected",
          description: `Your location was set to ${locationStr}`
        });
      } else {
        throw new Error('Failed to get location data');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      toast({
        variant: "destructive",
        title: "Location detection failed",
        description: "Please enter your location manually."
      });
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSignup = async () => {
    if (!accountData) return;
    setLoading(true);
    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password
      });
      if (signupError) throw signupError;
      if (!authData.user) {
        throw new Error('User creation failed');
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: accountData.name,
        email: accountData.email,
        location: accountData.location,
        sex: accountData.sex
      });
      if (profileError) throw profileError;

      if (selectedSkills.length > 0) {
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name')
          .in('name', selectedSkills);
        if (skillsError) throw skillsError;
        if (skillsData && skillsData.length > 0) {
          const userSkills = skillsData.map(skill => ({
            user_id: authData.user!.id,
            skill_id: skill.id
          }));
          const { error: userSkillsError } = await supabase
            .from('user_skills')
            .insert(userSkills);
          if (userSkillsError) throw userSkillsError;
        }
      }

      if (selectedPlan !== 'free') {
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const { error: planError } = await supabase
          .from('user_plans')
          .insert({
            user_id: authData.user.id,
            plan_type: selectedPlan,
            expires_at: expiresAt,
            promo_code: promoCode || null
          });
        if (planError) throw planError;
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to Idea Forge."
      });
      setTimeout(() => {
        navigate('/explore');
      }, 1000);
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup."
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-4 space-x-2">
        {['account', 'skills', 'plan'].map((stepName: string) => (
          <div 
            key={stepName} 
            className={`h-2 w-12 rounded-full ${step === stepName ? 'bg-primary' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="border-none shadow-lg w-full max-w-md">
        {renderStepIndicator()}
        
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            {step === 'account' && "Enter your information to get started"}
            {step === 'skills' && "What skills do you have?"}
            {step === 'plan' && "Choose your plan"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 'account' && (
              <motion.div 
                key="account" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitAccountInfo)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="********" 
                                {...field} 
                                className="pr-10"
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="New York, USA" {...field} className="pr-10" />
                              <button 
                                type="button" 
                                onClick={detectLocation} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                disabled={detectingLocation}
                                title="Detect your location"
                                tabIndex={-1}
                              >
                                <MapPin size={18} className={detectingLocation ? "animate-pulse" : ""} />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Male
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Female
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full mt-8">
                      Continue to Skills
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
            
            {step === 'skills' && (
              <motion.div 
                key="skills" 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label>Select your skills</Label>
                  <div className="relative z-0">
                    <SkillsetSelector selectedSkills={selectedSkills} onChange={setSelectedSkills} />
                  </div>
                  
                  <div className="flex justify-between mt-8 pt-4 relative z-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep('account')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => goToStep('plan')}
                      className="flex items-center"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {step === 'plan' && (
              <motion.div 
                key="plan" 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  <PlanSelectionStep
                    selectedPlan={selectedPlan}
                    promoCode={promoCode}
                    onPlanChange={setSelectedPlan}
                    onPromoCodeChange={setPromoCode}
                    onComplete={handleSignup}
                    isLoading={loading}
                  />
                  
                  <div className="flex justify-between mt-8 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep('skills')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
