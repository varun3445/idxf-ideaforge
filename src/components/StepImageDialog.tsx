
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { ImageIcon, Upload, X } from 'lucide-react';

interface StepImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: string;
  stepTitle: string;
}

const StepImageDialog: React.FC<StepImageDialogProps> = ({ 
  open, 
  onOpenChange,
  stepId,
  stepTitle
}) => {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
      const file = e.dataTransfer.files[0];
      if (!file.type.match('image.*')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
  };
  
  const handleSave = () => {
    // In a production app, you would upload the image to storage and save the URL
    toast({
      title: 'Image saved',
      description: 'The image has been added to the step',
      variant: 'default'
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image to Step: {stepTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!image ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <ImageIcon size={48} className="text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 text-center mb-2">Drag and drop an image here, or click to select</p>
              <p className="text-xs text-gray-500">JPEG, PNG, GIF up to 5MB</p>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={image} 
                alt="Step image" 
                className="w-full h-auto rounded-lg object-cover"
              />
              <button 
                className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={!image}
            >
              <Upload className="mr-2 h-4 w-4" />
              Save Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepImageDialog;
