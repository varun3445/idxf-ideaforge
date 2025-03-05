
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/AnimatedTransition';
import { ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import GlassmorphicCard from '@/components/GlassmorphicCard';

const JoinProject = () => {
  const { code } = useParams<{ code: string }>();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { joinProject } = useProjects();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/join/${code}`));
    }
  }, [loading, isAuthenticated, navigate, code]);
  
  const handleJoinProject = async () => {
    if (!code) return;
    
    try {
      setIsJoining(true);
      setError(null);
      
      const result = await joinProject(code);
      
      toast({
        title: "Success",
        description: result.message,
      });
      
      navigate(`/project/${result.project.id}`);
    } catch (err) {
      console.error('Error joining project:', err);
      setError(err instanceof Error ? err.message : 'Failed to join project');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to join project',
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  if (loading) {
    return (
      <div className="page-container flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <AnimatedTransition>
      <div className="page-container max-w-md mx-auto">
        <div className="w-full flex justify-start mb-8">
          <Link to="/forge" className="inline-flex items-center gap-2 text-black hover:underline">
            <ArrowLeft size={18} />
            <span>Back to Forge</span>
          </Link>
        </div>
        
        <GlassmorphicCard className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <UserPlus size={28} className="text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Join Project</h1>
          <p className="text-muted-foreground mb-8">
            You're about to join a project using invitation code: <strong>{code}</strong>
          </p>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 text-left">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleJoinProject} 
            disabled={isJoining} 
            className="w-full"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Join Project
              </>
            )}
          </Button>
        </GlassmorphicCard>
      </div>
    </AnimatedTransition>
  );
};

export default JoinProject;
