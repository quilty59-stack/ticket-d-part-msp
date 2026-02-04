import { cn } from '@/lib/utils';
import type { PersonnelStats } from '@/hooks/useAffectationStats';

interface AffectationStatsBadgesProps {
  stats: PersonnelStats;
  compact?: boolean;
  showTotal?: boolean;
}

const posteColors: Record<string, { bg: string; text: string }> = {
  COND: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CE: { bg: 'bg-orange-100', text: 'text-orange-700' },
  EQ: { bg: 'bg-green-100', text: 'text-green-700' },
  CA: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

export function AffectationStatsBadges({ 
  stats, 
  compact = false,
  showTotal = true 
}: AffectationStatsBadgesProps) {
  const postes = ['COND', 'CE', 'EQ'] as const;
  
  // Version compacte pour les cartes personnel
  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {postes.map((poste) => {
          const count = stats[poste];
          const colors = posteColors[poste];
          return (
            <span
              key={poste}
              className={cn(
                'text-[9px] font-bold px-1 py-0.5 rounded min-w-[16px] text-center',
                colors.bg,
                colors.text,
                count === 0 && 'opacity-40'
              )}
              title={`${poste}: ${count}`}
            >
              {count}
            </span>
          );
        })}
        {showTotal && (
          <span 
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground min-w-[20px] text-center ml-0.5"
            title={`Total: ${stats.total}`}
          >
            {stats.total}
          </span>
        )}
      </div>
    );
  }

  // Version normale avec labels
  return (
    <div className="flex items-center gap-1">
      {postes.map((poste) => {
        const count = stats[poste];
        const colors = posteColors[poste];
        return (
          <div
            key={poste}
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
              colors.bg,
              colors.text
            )}
          >
            <span className="opacity-70">{poste}:</span>
            <span className="font-bold">{count}</span>
          </div>
        );
      })}
      {showTotal && (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-muted text-foreground">
          <span className="opacity-70">Total:</span>
          <span className="font-bold">{stats.total}</span>
        </div>
      )}
    </div>
  );
}

// Légende des couleurs
export function StatsLegend() {
  const items = [
    { label: 'COND', ...posteColors.COND },
    { label: 'CE', ...posteColors.CE },
    { label: 'EQ', ...posteColors.EQ },
  ];

  return (
    <div className="flex items-center gap-2 text-[10px]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className={cn('px-1.5 py-0.5 rounded font-medium', item.bg, item.text)}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
