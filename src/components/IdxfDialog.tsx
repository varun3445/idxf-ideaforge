import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';
interface IdxfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}
const IdxfDialog: React.FC<IdxfDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton = true
}) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-idxf-lime text-idxf-black border-0 rounded-3xl max-w-md">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            {description && <DialogDescription className="text-idxf-black/70 text-center">
                {description}
              </DialogDescription>}
          </div>
          {showCloseButton}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>;
};
export default IdxfDialog;