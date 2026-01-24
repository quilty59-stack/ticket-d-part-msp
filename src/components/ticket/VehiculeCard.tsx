import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, X, Users } from 'lucide-react';
import { PosteDropZone } from './PosteDropZone';
import type { Vehicule, PersonnelDisponible } from '@/lib/supabase-types';

interface VehiculeCardProps {
  vehicule: Vehicule;
  affectations: Record<string, PersonnelDisponible | null>;
  onRemoveVehicule: () => void;
  onRemoveAffectation: (posteKey: string) => void;
}

export function VehiculeCard({ 
  vehicule, 
  affectations, 
  onRemoveVehicule,
  onRemoveAffectation 
}: VehiculeCardProps) {
  // Générer tous les postes en fonction de la configuration
  const postes: { poste: string; index: number }[] = [];
  Object.entries(vehicule.postes).forEach(([poste, count]) => {
    for (let i = 0; i < count; i++) {
      postes.push({ poste, index: i });
    }
  });

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="py-3 px-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold">{vehicule.code}</CardTitle>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-4 h-4" />
              {vehicule.taille_equipage} pers.
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemoveVehicule}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {postes.map(({ poste, index }) => {
          const posteKey = `${poste}-${index}`;
          return (
            <PosteDropZone
              key={posteKey}
              vehiculeId={vehicule.id}
              poste={poste}
              index={index}
              affectedPerson={affectations[posteKey] || null}
              onRemove={() => onRemoveAffectation(posteKey)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
