// Only fixing the one error related to user.id
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import AnimatedTransition from '../components/AnimatedTransition';
import { useAuth } from '../AuthContext';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { BookOpen, Cpu, Sparkles, Flame } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

export default function ExperimentLab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectIdea, setProjectIdea] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedIdeas();
    }
  }, [user]);

  const fetchSavedIdeas = async () => {
    try {
      // Demo mode: Get ideas from local storage
      const savedIdeasStr = localStorage.getItem('savedProjectIdeas');
      const savedIdeas = savedIdeasStr ? JSON.parse(savedIdeasStr) : [];
      
      // Filter to show only this user's ideas
      const userId = user?.id || ''; // Fixed error: user.id property access
      const userIdeas = savedIdeas.filter((idea: any) => idea.userId === userId);
      
      setSavedIdeas(userIdeas);
    } catch (error) {
      console.error('Error fetching saved ideas:', error);
    }
  };

  const generateAISuggestions = async () => {
    if (!projectIdea.trim()) {
      toast({
        title: 'Please enter a project idea',
        description: 'Provide a brief description of your project idea to get AI-powered suggestions.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAiSuggestions([]);

    try {
      // Simulate AI suggestions for demo mode
      const mockSuggestions = [
        `Develop a mobile app that uses AI to identify plant diseases based on images.`,
        `Create a web platform that generates personalized workout plans using machine learning.`,
        `Build a smart home system that optimizes energy consumption using AI algorithms.`,
      ];
      setAiSuggestions(mockSuggestions);

      toast({
        title: 'AI Suggestions Generated',
        description: 'Explore the AI-powered suggestions to refine your project idea.',
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: 'Error Generating Suggestions',
        description: 'Failed to generate AI suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectIdea = async (suggestion: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save your project ideas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Demo mode: Save idea to local storage
      const newIdea = {
        id: Date.now(),
        userId: user.id,
        idea: suggestion,
        createdAt: new Date().toISOString(),
      };

      const savedIdeasStr = localStorage.getItem('savedProjectIdeas');
      const savedIdeas = savedIdeasStr ? JSON.parse(savedIdeasStr) : [];
      savedIdeas.push(newIdea);
      localStorage.setItem('savedProjectIdeas', JSON.stringify(savedIdeas));

      setSavedIdeas((prevIdeas) => [...prevIdeas, newIdea]);

      toast({
        title: 'Project Idea Saved',
        description: 'Your project idea has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving project idea:', error);
      toast({
        title: 'Error Saving Idea',
        description: 'Failed to save the project idea. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AnimatedTransition>
      <div className="container max-w-5xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Experiment Lab</CardTitle>
            <CardDescription>
              Generate AI-powered project ideas and save them for later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-idea">Enter your project idea:</Label>
              <Textarea
                id="project-idea"
                placeholder="e.g., 'A platform for connecting local farmers with consumers'"
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={generateAISuggestions} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Cpu className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {aiSuggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Suggestions</CardTitle>
              <CardDescription>
                Explore these AI-generated suggestions to refine your project
                idea.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between">
                    <p>{suggestion}</p>
                    <Button
                      onClick={() => saveProjectIdea(suggestion)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Flame className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Save Idea
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {savedIdeas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Project Ideas</CardTitle>
              <CardDescription>
                Review and manage your saved project ideas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedIdeas.map((idea) => (
                <Card key={idea.id}>
                  <CardContent>
                    <p>{idea.idea}</p>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    Saved on{' '}
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedTransition>
  );
}
