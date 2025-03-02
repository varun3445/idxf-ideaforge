
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useAuth } from '../AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { generateMultipleUsers } from '../utils/auth.utils';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatingUsers, setGeneratingUsers] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await login(email, password);
      
      if (error) {
        setError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back to Idea Forge!",
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateUsers = async () => {
    setGeneratingUsers(true);
    try {
      const success = await generateMultipleUsers(25);
      if (success) {
        toast({
          title: "Users generated successfully",
          description: "25 users have been created in the database",
        });
      } else {
        toast({
          title: "Error generating users",
          description: "There was a problem creating the users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating users:', error);
      toast({
        title: "Error generating users",
        description: "There was a problem creating the users",
        variant: "destructive"
      });
    } finally {
      setGeneratingUsers(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to your account to continue
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
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
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
        
        <div className="mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGenerateUsers}
            disabled={generatingUsers}
          >
            {generatingUsers ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Generating 25 Users...
              </>
            ) : (
              "Generate 25 Sample Users"
            )}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            This will create 25 random user profiles for testing purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
