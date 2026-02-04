import { forwardRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GraduationCap, Wrench } from 'lucide-react';
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
          return null;
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
          'flex items-stretch rounded-lg border bg-card text-card-foreground',
          'transition-all duration-200 cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-50 scale-105 shadow-lg z-50',
          isAffected && 'opacity-40 cursor-not-allowed',
          !isAffected && 'hover:border-primary hover:shadow-sm'
        )}
      >
        {/* Left part - Identity info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Line 1: Icon + Grade + Name */}
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium text-xs text-muted-foreground flex-shrink-0">
              {person.grade_code}
            </span>
            <span className="text-sm font-medium">
              {person.nom} {person.prenom}
            </span>
          </div>
          {/* Line 2: Role badge + Session */}
          <div className="flex items-center gap-2 mt-1 ml-6">
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {badge}
              </span>
            )}
            {person.session_code && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Session: {person.session_code}
              </span>
            )}
          </div>
        </div>

        {/* Right part - Stats (fixed width) */}
        {stats && (
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 border-l rounded-r-lg">
            <div className="flex flex-col gap-0.5 text-[9px]">
              <div className="flex items-center gap-1">
                <span className={cn(
                  'px-1.5 py-0.5 rounded font-bold min-w-[32px] text-center',
                  'bg-blue-100 text-blue-700'
                )}>
                  COND
                </span>
                <span className="font-bold w-4 text-center">{stats.COND}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(
                  'px-1.5 py-0.5 rounded font-bold min-w-[32px] text-center',
                  'bg-orange-100 text-orange-700'
                )}>
                  CE
                </span>
                <span className="font-bold w-4 text-center">{stats.CE}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-[9px]">
              <div className="flex items-center gap-1">
                <span className={cn(
                  'px-1.5 py-0.5 rounded font-bold min-w-[32px] text-center',
                  'bg-green-100 text-green-700'
                )}>
                  EQ
                </span>
                <span className="font-bold w-4 text-center">{stats.EQ}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(
                  'px-1.5 py-0.5 rounded font-bold min-w-[32px] text-center',
                  'bg-purple-100 text-purple-700'
                )}>
                  CA
                </span>
                <span className="font-bold w-4 text-center">{stats.CA}</span>
              </div>
            </div>
            {/* Total */}
            <div className="flex flex-col items-center justify-center px-1.5 border-l border-muted ml-1">
              <span className="text-[8px] text-muted-foreground">TOT</span>
              <span className="text-sm font-bold">{stats.total}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
