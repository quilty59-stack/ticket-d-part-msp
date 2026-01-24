import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, User, GraduationCap } from 'lucide-react';
import type { PersonnelDisponible } from '@/lib/supabase-types';

interface PosteDropZoneProps {
  vehiculeId: string;
  poste: string;
  index: number;
  affectedPerson: PersonnelDisponible | null;
  onRemove: () => void;
}

const posteLabels: Record<string, string> = {
  CA: 'Chef d\'Agrès',
  COND: 'Conducteur',
  CE: 'Chef d\'Équipe',
  EQ: 'Équipier',
};

export function PosteDropZone({ 
  vehiculeId, 
  poste, 
  index, 
  affectedPerson, 
  onRemove 
}: PosteDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${vehiculeId}-${poste}-${index}`,
    data: { vehiculeId, poste, index },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 border-dashed min-h-[52px]',
        'transition-all duration-200',
        isOver && 'border-primary bg-primary/10',
        affectedPerson ? 'border-solid border-muted bg-muted/50' : 'border-muted-foreground/30'
      )}
    >
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="text-xs font-bold text-muted-foreground uppercase">
          {poste}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          ({posteLabels[poste] || poste})
        </span>
      </div>

      <div className="flex-1">
        {affectedPerson ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {affectedPerson.type === 'permanent' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <GraduationCap className="w-4 h-4 text-orange-500" />
              )}
              <span className="font-medium text-xs text-muted-foreground">
                {affectedPerson.grade_code}
              </span>
              <span className="text-sm">
                {affectedPerson.nom} {affectedPerson.prenom}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Glissez un pompier ici
          </span>
        )}
      </div>
    </div>
  );
}
