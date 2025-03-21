
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SkillsetSelector from '@/components/SkillsetSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const steps = ['account', 'skills'];

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: SignupFormValues) => {
    if (currentStep < steps.length - 1) {
      return nextStep();
    }

    setIsSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        skills: selectedSkills,
      });

      toast({
        title: 'Account created',
        description: 'Your account has been created successfully',
      });

      navigate('/explore');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold">
              Idea <span className="text-primary">Forge</span>
            </Link>
            <h1 className="text-2xl font-semibold mt-6">Create your account</h1>
            <p className="text-gray-600 mt-2">
              Join our community of creators and innovators
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <Tabs value={steps[currentStep]} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="account" disabled>
                  Account
                </TabsTrigger>
                <TabsTrigger value="skills" disabled>
                  Skills
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="account" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                            <Input type="email" placeholder="your.email@example.com" {...field} />
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
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="button" onClick={nextStep} disabled={!form.formState.isValid}>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-6">
                    <div className="flex flex-wrap justify-between items-center mb-4">
                      <Button type="button" variant="ghost" onClick={prevStep} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      
                      <Button type="submit" disabled={isSubmitting} className="mb-4">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Finish
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="py-2">
                      <h3 className="text-lg font-medium mb-4">Select your skills</h3>
                      <SkillsetSelector 
                        selectedSkills={selectedSkills} 
                        onChange={setSelectedSkills} 
                      />
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Signup;
