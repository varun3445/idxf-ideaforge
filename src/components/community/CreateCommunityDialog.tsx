
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../AuthContext";
import { supabase } from "../../integrations/supabase/client";
import { Community } from "../../pages/Communities";
import { Loader2, X } from "lucide-react";
import { Badge } from "../../components/ui/badge";

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (community: Community) => void;
}

const CreateCommunityDialog: React.FC<CreateCommunityDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 10) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Community name required",
        description: "Please enter a name for your community",
      });
      return false;
    }
    
    if (name.length < 3) {
      toast({
        variant: "destructive",
        title: "Community name too short",
        description: "Name must be at least 3 characters long",
      });
      return false;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please enter a description for your community",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create a community",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create the community
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .insert({
          name,
          description,
          owner_id: user.id,
          is_private: isPrivate,
          tags,
          member_count: 1 // Creator is the first member
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Add creator as a member with admin role
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: communityData.id,
          user_id: user.id,
          role: "admin"
        });

      if (memberError) throw memberError;

      // Get owner info for UI update
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", user.id)
        .single();

      // Construct full community object for UI
      const newCommunity: Community = {
        ...communityData,
        owner: ownerData || { name: user.email || "User" },
        is_member: true
      };

      onSuccess(newCommunity);
      
      // Reset form
      setName("");
      setDescription("");
      setIsPrivate(false);
      setTags([]);
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        variant: "destructive",
        title: "Failed to create community",
        description: "An error occurred while creating your community. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
          <DialogDescription>
            Create a new community for people with similar interests to connect and collaborate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AI Innovators"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your community about?"
              className="resize-none min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (up to 10)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags and press Enter"
                disabled={tags.length >= 10}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleAddTag}
                disabled={!tagInput || tags.length >= 10}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Community</Label>
              <p className="text-xs text-muted-foreground">
                Private communities can only be joined via invitation
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Community"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityDialog;
