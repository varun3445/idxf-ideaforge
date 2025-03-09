
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Check, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../hooks/use-toast';

interface ProjectShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  shareCode: string | null;
}

const ProjectShareDialog: React.FC<ProjectShareDialogProps> = ({
  open,
  onOpenChange,
  projectTitle,
  shareCode
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const projectUrl = shareCode ? `${window.location.origin}/join/${shareCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast({
      title: 'Link copied',
      description: 'Share link has been copied to clipboard',
      variant: 'default'
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{projectTitle}"</DialogTitle>
          <DialogDescription>
            Anyone with the link can view and join this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mb-4 mt-2">
          <Input
            value={projectUrl}
            readOnly
            className="flex-1"
          />
          <Button size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <Separator />
        
        <div className="flex flex-col items-center justify-center py-4">
          <QRCodeSVG 
            value={projectUrl || 'No share code available'}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/logo-icon.png",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <p className="text-center mt-4 text-sm text-gray-500">
            Scan this QR code to join and collaborate on this project.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectShareDialog;
