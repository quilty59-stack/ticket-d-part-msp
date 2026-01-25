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
import { PersonnelCard } from '@/components/ticket/PersonnelCard';
import { VehiculeCard } from '@/components/ticket/VehiculeCard';
import { Truck, Users, Plus, User, GraduationCap, Wrench } from 'lucide-react';
import type { Vehicule, PersonnelDisponible } from '@/lib/supabase-types';

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
}: StepMoyensProps) {
  // Grouper le personnel par type
  const permanents = useMemo(
    () => personnelDisponible.filter((p) => p.type === 'permanent'),
    [personnelDisponible]
  );
  const stagiaires = useMemo(
    () => personnelDisponible.filter((p) => p.type === 'stagiaire'),
    [personnelDisponible]
  );
  const manoeuvrants = useMemo(
    () => personnelDisponible.filter((p) => p.type === 'manoeuvrant'),
    [personnelDisponible]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Véhicules */}
      <div className="lg:col-span-2 space-y-6">
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
        <Card className="sticky top-20">
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personnel disponible
            </CardTitle>
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
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Permanents */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Permanents ({permanents.length})
              </h4>
              <div className="space-y-2">
                {permanents.map((person) => (
                  <PersonnelCard
                    key={person.id}
                    person={person}
                    isAffected={affectedIds.has(person.id)}
                  />
                ))}
              </div>
            </div>

            {/* Stagiaires */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                Stagiaires du jour ({stagiaires.length})
              </h4>
              {stagiaires.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Aucun stagiaire ajouté aujourd'hui
                </p>
              ) : (
                <div className="space-y-2">
                  {stagiaires.map((person) => (
                    <PersonnelCard
                      key={person.id}
                      person={person}
                      isAffected={affectedIds.has(person.id)}
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
