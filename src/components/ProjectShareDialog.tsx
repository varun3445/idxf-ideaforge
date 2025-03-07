
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';

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
  
  if (!shareCode) return null;
  
  const shareUrl = `${window.location.origin}/join-project/${shareCode}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: 'Link copied',
      description: 'Project invitation link copied to clipboard',
      variant: 'default'
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG 
              value={shareUrl}
              size={200}
              level="H"
              includeMargin={true}
              className="block"
            />
          </div>
          
          <div className="text-sm text-center">
            <p className="font-medium mb-1">{projectTitle}</p>
            <p className="text-gray-500">Scan this QR code to join the project</p>
          </div>
          
          <div className="grid w-full gap-2">
            <Label htmlFor="share-link">Share link</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                onClick={event => (event.target as HTMLInputElement).select()}
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={handleCopyLink}
                variant={copied ? "default" : "outline"}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectShareDialog;
