import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PersonnelCard } from '@/components/ticket/PersonnelCard';
import { VehiculeCard } from '@/components/ticket/VehiculeCard';
import { StatsLegend } from '@/components/ticket/AffectationStatsBadges';
import { Truck, Users, Plus, GraduationCap, Wrench, BookOpen, BarChart3 } from 'lucide-react';
import type { Vehicule, PersonnelDisponible } from '@/lib/supabase-types';
import type { SessionFormation } from '@/hooks/useSessionsFormation';
import type { PersonnelStats } from '@/hooks/useAffectationStats';

const posteLabels: Record<string, string> = {
  CA: 'Chef d\'Agrès',
  COND: 'Conducteur',
  CE: 'Chef d\'Équipe',
  EQ: 'Équipier',
};

interface StepMoyensProps {
  selectedVehicules: Vehicule[];
  affectations: Record<string, Record<string, PersonnelDisponible | null>>;
  vehiculeSelectOpen: boolean;
  setVehiculeSelectOpen: (open: boolean) => void;
  availableVehicules: Vehicule[];
  personnelDisponible: PersonnelDisponible[];
  affectedIds: Set<string>;
  onAddVehicule: (vehicule: Vehicule) => void;
  onRemoveVehicule: (vehiculeId: string) => void;
  onRemoveAffectation: (vehiculeId: string, posteKey: string) => void;
  // Session filter props
  sessions: SessionFormation[];
  selectedSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  // Stats
  personnelStats?: Record<string, PersonnelStats>;
}

export function StepMoyens({
  selectedVehicules,
  affectations,
  vehiculeSelectOpen,
  setVehiculeSelectOpen,
  availableVehicules,
  personnelDisponible,
  affectedIds,
  onAddVehicule,
  onRemoveVehicule,
  onRemoveAffectation,
  sessions,
  selectedSessionId,
  onSessionChange,
  personnelStats = {},
}: StepMoyensProps) {
  // Grouper le personnel par type et trier par total d'affectations (croissant)
  const stagiaires = useMemo(
    () => personnelDisponible
      .filter((p) => p.type === 'stagiaire')
      .sort((a, b) => {
        const statsA = personnelStats[`stagiaire:${a.id}`];
        const statsB = personnelStats[`stagiaire:${b.id}`];
        return (statsA?.total || 0) - (statsB?.total || 0);
      }),
    [personnelDisponible, personnelStats]
  );
  
  const manoeuvrants = useMemo(
    () => personnelDisponible
      .filter((p) => p.type === 'manoeuvrant')
      .sort((a, b) => {
        const statsA = personnelStats[`manoeuvrant:${a.id}`];
        const statsB = personnelStats[`manoeuvrant:${b.id}`];
        return (statsA?.total || 0) - (statsB?.total || 0);
      }),
    [personnelDisponible, personnelStats]
  );

  // Helper pour obtenir les stats d'une personne
  const getPersonStats = (person: PersonnelDisponible): PersonnelStats | undefined => {
    const ref = `${person.type}:${person.id}`;
    return personnelStats[ref];
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Left column - Véhicules */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Moyens et équipages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedVehicules.map((vehicule) => (
              <VehiculeCard
                key={vehicule.id}
                vehicule={vehicule}
                affectations={affectations[vehicule.id] || {}}
                onRemoveVehicule={() => onRemoveVehicule(vehicule.id)}
                onRemoveAffectation={(posteKey) =>
                  onRemoveAffectation(vehicule.id, posteKey)
                }
              />
            ))}

            <Popover open={vehiculeSelectOpen} onOpenChange={setVehiculeSelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un moyen
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un véhicule..." />
                  <CommandList>
                    <CommandEmpty>Aucun véhicule disponible</CommandEmpty>
                    <CommandGroup>
                      {availableVehicules.map((v) => (
                        <CommandItem
                          key={v.id}
                          value={v.code}
                          onSelect={() => onAddVehicule(v)}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          {v.code}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {v.taille_equipage} pers.
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Personnel disponible */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personnel disponible
              </CardTitle>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <StatsLegend />
              </div>
            </div>
            
            {/* Session filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Filtrer par session
              </label>
              <Select
                value={selectedSessionId || 'all'}
                onValueChange={(value) => onSessionChange(value === 'all' ? null : value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Toutes les sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sessions</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.code} - {session.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {/* Manœuvrants */}
            {manoeuvrants.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Wrench className="w-4 h-4" />
                  Manœuvrants ({manoeuvrants.length})
                </h4>
                <div className="space-y-2">
                  {manoeuvrants.map((person) => (
                    <PersonnelCard
                      key={person.id}
                      person={person}
                      isAffected={affectedIds.has(person.id)}
                      badge={person.poste ? posteLabels[person.poste] || person.poste : undefined}
                      stats={getPersonStats(person)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stagiaires */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                Stagiaires ({stagiaires.length})
              </h4>
              {stagiaires.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Aucun stagiaire disponible
                </p>
              ) : (
                <div className="space-y-2">
                  {stagiaires.map((person) => (
                    <PersonnelCard
                      key={person.id}
                      person={person}
                      isAffected={affectedIds.has(person.id)}
                      stats={getPersonStats(person)}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
