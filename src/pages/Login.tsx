
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Debug log for auth state
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, authLoading });
  }, [isAuthenticated, authLoading]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User is authenticated, redirecting to explore');
      navigate('/explore');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting login process...');
      const { error } = await login(email, password);
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Login successful",
          description: "Redirecting you to the app...",
        });
        
        // Immediately check if we can navigate
        if (isAuthenticated) {
          console.log('Already authenticated, redirecting now');
          navigate('/explore');
        } else {
          console.log('Waiting for auth state to update');
          // We'll let the useEffect handle the redirect once auth state updates
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to your Idea Forge account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive text-destructive text-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading || authLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  disabled={loading || authLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || authLoading}
          >
            {loading || authLoading ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                {isAuthenticated ? 'Redirecting...' : 'Logging in...'}
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
