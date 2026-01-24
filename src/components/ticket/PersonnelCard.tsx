import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { User, GraduationCap } from 'lucide-react';
import type { PersonnelDisponible } from '@/lib/supabase-types';

interface PersonnelCardProps {
  person: PersonnelDisponible;
  isAffected?: boolean;
}

export function PersonnelCard({ person, isAffected = false }: PersonnelCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${person.type}-${person.id}`,
    data: person,
    disabled: isAffected,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground',
        'transition-all duration-200 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 scale-105 shadow-lg z-50',
        isAffected && 'opacity-40 cursor-not-allowed',
        !isAffected && 'hover:border-primary hover:shadow-sm'
      )}
    >
      {person.type === 'permanent' ? (
        <User className="w-4 h-4 text-primary flex-shrink-0" />
      ) : (
        <GraduationCap className="w-4 h-4 text-orange-500 flex-shrink-0" />
      )}
      <span className="font-medium text-xs text-muted-foreground">
        {person.grade_code}
      </span>
      <span className="text-sm truncate">
        {person.nom} {person.prenom}
      </span>
    </div>
  );
}
