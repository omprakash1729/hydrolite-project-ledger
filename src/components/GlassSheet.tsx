import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export const GlassSheet = ({ open, onOpenChange, title, description, children }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="glass shadow-glass border-0 sm:max-w-lg rounded-3xl w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6">
      <DialogHeader>
        <DialogTitle className="font-display text-xl sm:text-2xl">{title}</DialogTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
