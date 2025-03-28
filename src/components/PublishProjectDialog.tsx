
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image, Upload, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface PublishProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onPublish: (projectId: string, data: { overview: string; goals: string; challenges: string; image?: File | null }) => Promise<void>;
  isPublished: boolean;
}

const PublishProjectDialog: React.FC<PublishProjectDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onPublish,
  isPublished
}) => {
  const { toast } = useToast();
  const [overview, setOverview] = useState('');
  const [goals, setGoals] = useState('');
  const [challenges, setChallenges] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePublish = async () => {
    if (!overview.trim()) {
      toast({
        title: "Project overview required",
        description: "Please provide a brief overview of your project.",
        variant: "destructive"
      });
      return;
    }
    
    if (!goals.trim()) {
      toast({
        title: "Project goals required",
        description: "Please specify the goals of your project.",
        variant: "destructive"
      });
      return;
    }
    
    if (!challenges.trim()) {
      toast({
        title: "Technical challenges required",
        description: "Please describe the technical challenges of your project.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await onPublish(projectId, { overview, goals, challenges, image });
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: "Publication failed",
        description: "There was an error publishing your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setImagePreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isPublished ? 'Edit Project Details' : 'Publish Project'}</DialogTitle>
          <DialogDescription>
            {isPublished 
              ? 'Update the information that will be displayed on your project page.' 
              : 'Before publishing, provide some details about your project to help others understand it better.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-image">Project Image</Label>
            {!imagePreview ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Image size={48} className="text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 text-center mb-2">Drag and drop an image here, or click to select</p>
                <p className="text-xs text-gray-500">JPEG, PNG, GIF up to 5MB</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Project preview" 
                  className="w-full h-48 object-cover"
                />
                <button 
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="project-overview">Project Overview <span className="text-red-500">*</span></Label>
            <Textarea
              id="project-overview"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Provide a high-level overview of your project..."
              rows={4}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="project-goals">Project Goals <span className="text-red-500">*</span></Label>
            <Textarea
              id="project-goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What are the main goals you're trying to achieve?"
              rows={3}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="technical-challenges">Technical Challenges <span className="text-red-500">*</span></Label>
            <Textarea
              id="technical-challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Describe any technical challenges you're facing or anticipate..."
              rows={3}
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={loading || !overview.trim() || !goals.trim() || !challenges.trim()}
          >
            {loading ? 
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isPublished ? 'Updating...' : 'Publishing...'}</> : 
              (isPublished ? 'Update Details' : 'Publish Project')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishProjectDialog;
