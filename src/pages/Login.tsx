
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import AnimatedTransition from '../components/AnimatedTransition';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previousUser, setPreviousUser] = useState<{
    name: string;
    avatar: string | null;
  } | null>(null);

  useEffect(() => {
    const checkPreviousLogin = async () => {
      try {
        // Check local storage for the last login email
        const lastEmail = localStorage.getItem('lastLoginEmail');
        if (lastEmail) {
          // Try to fetch user profile from this email
          const { data, error } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('email', lastEmail)
            .maybeSingle();
            
          if (data && !error) {
            setPreviousUser({
              name: data.name,
              avatar: data.avatar
            });
            setEmail(lastEmail);
          }
        }
      } catch (error) {
        console.error('Error checking previous login:', error);
      }
    };
    
    checkPreviousLogin();
  }, []);

  useEffect(() => {
    // Add a console log to debug authentication state
    console.log('Authentication state:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to /explore');
      navigate('/explore');
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', email);
      const { error } = await login(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login failed',
          description: error.message || 'Please check your credentials and try again',
          variant: 'destructive',
        });
        return;
      }
      
      // Store email for future logins
      localStorage.setItem('lastLoginEmail', email);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in',
      });
      
      navigate('/explore');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h1 className="text-4xl font-extrabold mb-2">Idea Forge</h1>
            <p className="text-muted-foreground">Connect with like-minded innovators</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-left">Sign In</h2>
            
            {previousUser && (
              <div className="mb-6 text-center">
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-background mb-2">
                    {previousUser.avatar ? (
                      <img 
                        src={previousUser.avatar} 
                        alt={previousUser.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {previousUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="font-medium">Welcome back, {previousUser.name}!</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-left">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-left">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </Button>
              
              <div className="text-left text-sm mt-4">
                <span className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Login;
