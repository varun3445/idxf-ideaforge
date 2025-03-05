
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Users, Calendar, Share2, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { Project } from '@/types/project.types';
import { Button } from '@/components/ui/button';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import { ShareProjectDialog } from '@/components/ShareProjectDialog';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  collaboratorsCount?: number;
  isOwner?: boolean;
}

const ProjectCard = ({ project, collaboratorsCount = 0, isOwner = false }: ProjectCardProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const navigate = useNavigate();
  
  const handleViewProject = () => {
    navigate(`/project/${project.id}`);
  };
  
  return (
    <GlassmorphicCard className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1 text-left">{project.title}</h3>
          <p className="text-muted-foreground text-sm text-left">
            {project.description || 'No description provided'}
          </p>
        </div>
        {isOwner && (
          <Badge variant="secondary" className="ml-2">
            Owner
          </Badge>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar size={16} />
          <span>Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}</span>
        </div>
        
        {collaboratorsCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Users size={16} />
            <span>{collaboratorsCount} collaborator{collaboratorsCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="default" 
            className="flex-1"
            onClick={handleViewProject}
          >
            <Pencil size={16} className="mr-1" /> View Project
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowShareDialog(true)}
            title="Share Project"
          >
            <Share2 size={16} />
          </Button>
        </div>
      </div>
      
      <ShareProjectDialog 
        project={project}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </GlassmorphicCard>
  );
};

export default ProjectCard;
