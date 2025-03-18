
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Upload } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  onUpload: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload = ({ userId, url, onUpload, size = 'md' }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('user_avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('user_avatars')
        .getPublicUrl(filePath);
        
      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: data.publicUrl })
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      onUpload(data.publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading your avatar."
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={`${sizes[size]} cursor-pointer relative group border-2 border-primary/20`}>
        <AvatarImage src={url || undefined} alt="Profile Avatar" />
        <AvatarFallback className="bg-muted">
          <User className="w-1/2 h-1/2 text-muted-foreground" />
        </AvatarFallback>
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Upload size={size === 'sm' ? 16 : 24} className="text-white" />
        </div>
      </Avatar>
      
      <div>
        <label className="cursor-pointer">
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            disabled={uploading}
            className="relative overflow-hidden"
          >
            {uploading ? 'Uploading...' : 'Change Avatar'}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </Button>
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;
