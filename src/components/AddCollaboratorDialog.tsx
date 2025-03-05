
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';

interface AddCollaboratorDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const joinFormSchema = z.object({
  shareCode: z.string().min(1, "Share code is required"),
});

const AddCollaboratorDialog = ({ projectId, open, onOpenChange }: AddCollaboratorDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { joinProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      shareCode: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof joinFormSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Joining project with share code:', values.shareCode);
      
      const result = await joinProject(values.shareCode);
      
      if (result.success) {
        toast({
          title: 'Project joined',
          description: result.message || 'You have successfully joined the project',
        });
        
        form.reset();
        onOpenChange(false);
        
        // Navigate to the project page
        if (result.project?.id) {
          navigate(`/project/${result.project.id}`);
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to join project. Please check the share code and try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error joining project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join project. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
          <DialogDescription>
            Enter a share code to join an existing project
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shareCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project share code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                <Users size={16} className="mr-2" />
                {isSubmitting ? 'Joining...' : 'Join Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
