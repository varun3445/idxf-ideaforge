
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../hooks/use-toast';

const JoinProject: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [projectTitle, setProjectTitle] = useState('Project');

  // In a real implementation, you would fetch the project details using the share code
  useEffect(() => {
    // Mock project data for now
    // In a real implementation, you would fetch this from Supabase
    setProjectTitle('Collaborative Project');
  }, [shareCode]);

  const handleJoinProject = () => {
    // In a real implementation, this would add the current user to the project
    toast({
      title: 'Success!',
      description: 'You have joined the project successfully.',
      variant: 'default'
    });
    
    // Navigate to the projects page
    navigate('/projects');
  };

  return (
    <AnimatedTransition>
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Collaboration</CardTitle>
            <CardDescription>
              You've been invited to collaborate on "{projectTitle}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex justify-center py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
            </div>
            <p>
              Join this project to collaborate with the team, contribute to steps, and track progress together.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleJoinProject} className="w-full">
              Join Project <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AnimatedTransition>
  );
};

export default JoinProject;
