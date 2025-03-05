
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { Check, Copy, QrCode, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Project, QRCodeResponse } from '@/types/project.types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ShareProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareProjectDialog = ({ project, open, onOpenChange }: ShareProjectDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { generateQRCode } = useProjects();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const shareUrl = qrCodeData?.shareUrl || `${window.location.origin}/join/${project.share_code}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: 'Link copied',
      description: 'The share link has been copied to your clipboard.',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleGenerateQRCode = async () => {
    if (qrCodeData) return; // Already generated
    
    try {
      setIsLoading(true);
      
      const data = await generateQRCode(project.id);
      
      setQrCodeData(data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on "{project.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div>
            <label htmlFor="share-link" className="text-sm font-medium block mb-2">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="share-link"
                readOnly
                value={shareUrl}
                className="flex-1"
              />
              <Button 
                variant="secondary" 
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateQRCode}
              disabled={isLoading || !!qrCodeData}
            >
              <QrCode size={16} className="mr-2" />
              {qrCodeData ? 'QR Code Generated' : isLoading ? 'Generating...' : 'Generate QR Code'}
            </Button>
            
            {qrCodeData && (
              <div className="flex justify-center p-2 mt-4">
                <img 
                  src={qrCodeData.qrCodeUrl} 
                  alt="QR Code" 
                  className="max-w-full h-auto border rounded-lg p-2"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
          
          {isMobile && (
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Collaborate on ${project.title}`,
                    text: `Join my project: ${project.title}`,
                    url: shareUrl,
                  }).catch((error) => console.log('Error sharing', error));
                } else {
                  handleCopyLink();
                }
              }}
            >
              <Share2 size={16} className="mr-2" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
