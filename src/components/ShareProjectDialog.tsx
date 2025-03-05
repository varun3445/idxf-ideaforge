
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Project, QRCodeResponse } from '@/types/project.types';
import { useProjects } from '@/hooks/useProjects';
import { QrCode, Copy, Check, Share2 } from 'lucide-react';

interface ShareProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareProjectDialog = ({ project, open, onOpenChange }: ShareProjectDialogProps) => {
  const [qrCodeData, setQrCodeData] = useState<QRCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateQRCode } = useProjects();
  const { toast } = useToast();
  
  const handleGenerateQRCode = async () => {
    try {
      setIsLoading(true);
      const data = await generateQRCode(project.id);
      setQrCodeData(data);
    } catch (error) {
      toast({
        title: "Error generating QR code",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!qrCodeData) return;
    
    navigator.clipboard.writeText(qrCodeData.shareUrl);
    setCopied(true);
    
    toast({
      title: "Link copied",
      description: "Project link has been copied to clipboard"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async () => {
    if (!qrCodeData) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${project.title} on Forge`,
          text: `Join my project "${project.title}" on Forge`,
          url: qrCodeData.shareUrl
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast({
            title: "Error sharing",
            description: "Failed to share project link"
          });
        }
      }
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Generate a QR code or share a link to invite collaborators
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          {!qrCodeData ? (
            <div className="text-center">
              <Button 
                onClick={handleGenerateQRCode} 
                disabled={isLoading}
                className="mb-2"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will create a unique sharing link for your project
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-md mb-4">
                <img 
                  src={qrCodeData.qrCodeUrl} 
                  alt="Project QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-2"
                    value={qrCodeData.shareUrl}
                    readOnly
                  />
                  <Button 
                    size="icon" 
                    onClick={copyToClipboard}
                    variant="outline"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button onClick={handleShare} className="mt-2">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
