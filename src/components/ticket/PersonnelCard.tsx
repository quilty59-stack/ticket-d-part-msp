import { forwardRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { User, GraduationCap, Wrench } from 'lucide-react';
import { AffectationStatsBadges } from './AffectationStatsBadges';
import type { PersonnelDisponible } from '@/lib/supabase-types';
import type { PersonnelStats } from '@/hooks/useAffectationStats';

interface PersonnelCardProps {
  person: PersonnelDisponible;
  isAffected?: boolean;
  badge?: string;
  stats?: PersonnelStats;
}

export const PersonnelCard = forwardRef<HTMLDivElement, PersonnelCardProps>(
  function PersonnelCard({ person, isAffected = false, badge, stats }, ref) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `${person.type}-${person.id}`,
      data: person,
      disabled: isAffected,
    });

    const style = transform ? {
      transform: CSS.Translate.toString(transform),
    } : undefined;

    const getIcon = () => {
      switch (person.type) {
        case 'manoeuvrant':
          return <Wrench className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
        case 'stagiaire':
          return <GraduationCap className="w-4 h-4 text-amber-600 flex-shrink-0" />;
        default:
          return <User className="w-4 h-4 text-primary flex-shrink-0" />;
      }
    };

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
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
        {getIcon()}
        <span className="font-medium text-xs text-muted-foreground flex-shrink-0">
          {person.grade_code}
        </span>
        <span className="text-sm font-medium flex-1 min-w-0">
          {person.nom} {person.prenom}
        </span>
        
        {/* Stats badges */}
        {stats && (
          <AffectationStatsBadges stats={stats} compact showTotal />
        )}
        
        {person.session_code && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
            {person.session_code}
          </span>
        )}
        {badge && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium flex-shrink-0">
            {badge}
          </span>
        )}
      </div>
    );
  }
);
