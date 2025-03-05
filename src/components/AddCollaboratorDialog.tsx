
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { QrCode, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddCollaboratorDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shareCodeSchema = z.object({
  shareCode: z.string().min(1, "Share code is required"),
});

const AddCollaboratorDialog = ({ projectId, open, onOpenChange }: AddCollaboratorDialogProps) => {
  const [view, setView] = useState<'options' | 'shareCode'>('options');
  const { joinProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof shareCodeSchema>>({
    resolver: zodResolver(shareCodeSchema),
    defaultValues: {
      shareCode: '',
    },
  });
  
  const handleJoinViaCode = async (values: z.infer<typeof shareCodeSchema>) => {
    try {
      const result = await joinProject(values.shareCode);
      toast({
        title: "Success",
        description: result.message,
      });
      onOpenChange(false);
      navigate(`/project/${result.project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join project",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
          <DialogDescription>
            Join a project using a share code or link
          </DialogDescription>
        </DialogHeader>
        
        {view === 'options' ? (
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              onClick={() => setView('shareCode')}
              className="flex items-center justify-start h-auto p-4"
            >
              <div className="mr-4 p-2 rounded-full bg-primary-foreground">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Via Share Code</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a project share code
                </p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-start h-auto p-4"
              disabled // Will be implemented in future
            >
              <div className="mr-4 p-2 rounded-full bg-muted">
                <AtSign className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Via Email</h3>
                <p className="text-sm text-muted-foreground">
                  Invite a user by email
                </p>
              </div>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleJoinViaCode)} className="space-y-4">
              <FormField
                control={form.control}
                name="shareCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter share code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex sm:justify-between gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setView('options')}
                >
                  Back
                </Button>
                <Button type="submit">Join Project</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
