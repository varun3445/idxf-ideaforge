
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
  
  // Immediately navigate to explore when visiting login page
  useEffect(() => {
    console.log('Login page disabled, redirecting to explore page');
    navigate('/explore');
  }, [navigate]);

  // Return an empty div since this component will immediately redirect
  return <div></div>;
};

export default Login;
