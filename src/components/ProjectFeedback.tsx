import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, MessageSquare, Edit, Trash2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { format } from 'date-fns';

interface Feedback {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string | null;
    avatar: string | null;
  } | null;
}

interface ProjectFeedbackProps {
  projectId: string;
}

const ProjectFeedback = ({ projectId }: ProjectFeedbackProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_feedback')
        .select(`
          *,
          profiles:profiles(name, avatar)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data as Feedback[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Error fetching feedback',
        description: 'Could not load feedback for this project',
        variant: 'destructive',
      });
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to leave feedback',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter feedback content',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (editingFeedback) {
        const { error } = await supabase
          .from('project_feedback')
          .update({
            content,
            rating,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFeedback.id);

        if (error) throw error;

        toast({
          title: 'Feedback updated',
          description: 'Your feedback has been updated successfully',
        });
        
        setEditingFeedback(null);
      } else {
        const { error } = await supabase
          .from('project_feedback')
          .insert({
            project_id: projectId,
            user_id: user.id,
            content,
            rating,
          });

        if (error) throw error;

        toast({
          title: 'Feedback submitted',
          description: 'Your feedback has been submitted successfully',
        });
      }

      setContent('');
      setRating(5);
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (item: Feedback) => {
    setEditingFeedback(item);
    setContent(item.content);
    setRating(item.rating);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Feedback deleted',
        description: 'Your feedback has been deleted successfully',
      });
      
      fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ));
  };

  const renderRatingSelector = () => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 cursor-pointer ${
                i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
              }`}
              onClick={() => setRating(i + 1)}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Juror Feedback</h3>
        {isAuthenticated && (
          <Button onClick={() => {
            setEditingFeedback(null);
            setContent('');
            setRating(5);
            setIsDialogOpen(true);
          }}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        )}
      </div>

      {feedbackLoading ? (
        <div className="text-center py-8">
          <p>Loading feedback...</p>
        </div>
      ) : feedback.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No feedback yet. Be the first to provide critical feedback!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={item.profiles?.avatar || ''} />
                      <AvatarFallback>{item.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{item.profiles?.name || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(item.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.content}</p>
              </CardContent>
              {user && user.id === item.user_id && (
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(item.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeedback ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
            <DialogDescription>
              Share your thoughts as a juror for this project. Provide constructive criticism to help the creators improve.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <div className="flex justify-center">{renderRatingSelector()}</div>
                <Textarea
                  placeholder="Share your thoughts on this project..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : editingFeedback ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectFeedback;
