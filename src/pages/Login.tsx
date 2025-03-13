
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/button';
import AnimatedTransition from '../components/AnimatedTransition';
import GlassmorphicCard from '../components/GlassmorphicCard';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [appearanceReady, setAppearanceReady] = useState(false);

  // Custom appearance for Clerk components to match our design
  const appearance = {
    elements: {
      formButtonPrimary: 'bg-primary text-white hover:bg-primary/90 rounded-full shadow-md border-2 border-primary/30 backdrop-blur-sm',
      card: 'bg-transparent shadow-none',
      formFieldInput: 'flex h-10 w-full rounded-md border-3 border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-md',
      footerActionText: 'text-primary',
      footerActionLink: 'text-primary hover:underline',
      identityPreviewText: 'text-foreground',
      identityPreviewEditButton: 'text-primary',
      formFieldLabel: 'text-sm font-medium leading-none'
    },
    layout: {
      socialButtonsVariant: 'iconButton'
    }
  };

  useEffect(() => {
    // Ensure appearance is only applied after component is mounted
    setAppearanceReady(true);
  }, []);

  // If already authenticated, redirect to explore page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/explore');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AnimatedTransition>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Idea Forge</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          
          <GlassmorphicCard>
            {appearanceReady && (
              <SignIn 
                appearance={appearance}
                redirectUrl="/explore"
                signUpUrl="/signup"
              />
            )}
          </GlassmorphicCard>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Login;
