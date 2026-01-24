import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  code: string;
  libelle: string;
  couleur?: string;
  className?: string;
}

export function CategoryBadge({ code, libelle, couleur, className }: CategoryBadgeProps) {
  const getColorClass = () => {
    switch (code) {
      case 'SUAP':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Accident':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'Incendie':
        return 'bg-red-500 hover:bg-red-600';
      case 'Operations_diverses':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'NRBCE':
        return 'bg-yellow-400 text-black hover:bg-yellow-500';
      case 'Prestations_payantes':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Badge 
      className={cn(
        'text-white font-medium',
        getColorClass(),
        className
      )}
      style={couleur ? { backgroundColor: couleur } : undefined}
    >
      {libelle}
    </Badge>
  );
}
