
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import IdxfDialog from './IdxfDialog';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: () => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({
  open,
  onOpenChange,
  onRoomCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            name: roomName.trim(),
            description: roomDescription.trim() || null,
            is_private: isPrivate,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert([
          {
            room_id: roomData.id,
            user_id: user.id
          }
        ]);

      if (memberError) throw memberError;

      toast({
        title: "Room created successfully",
        description: `${roomName} is ready for conversations!`
      });

      // Reset form
      setRoomName('');
      setRoomDescription('');
      setIsPrivate(false);
      onOpenChange(false);
      onRoomCreated();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error creating room",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IdxfDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Chat Room"
      description="Create a new chat room for your community"
    >
      <form onSubmit={handleCreateRoom}>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium text-idxf-black/80">
              Room Name *
            </Label>
            <Input
              id="roomName"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="bg-idxf-black/10 border-0 placeholder:text-idxf-black/40 text-idxf-black rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomDescription" className="text-sm font-medium text-idxf-black/80">
              Description (Optional)
            </Label>
            <Textarea
              id="roomDescription"
              placeholder="Describe what this room is for"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              rows={3}
              className="bg-idxf-black/10 border-0 placeholder:text-idxf-black/40 text-idxf-black rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isPrivate" className="text-sm font-medium text-idxf-black/80">
                Private Room
              </Label>
              <p className="text-xs text-idxf-black/60">
                Only invited users can join private rooms
              </p>
            </div>
            <Switch
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !roomName.trim()}
            variant="black"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </Button>
        </div>
      </form>
    </IdxfDialog>
  );
};

export default CreateRoomDialog;
