import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { FileText, MapPin, Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RenfortTicketSelector } from '@/components/ticket/RenfortTicketSelector';
import { SiteMSPSelector } from '@/components/ticket/SiteMSPSelector';
import type { Origine, Commune, TypeLieu, TypeVoie, Ticket } from '@/lib/supabase-types';
import type { SiteConventionne } from '@/hooks/useSitesConventionnes';

interface StepInfosProps {
  // Infos intervention
  dateIntervention: string;
  setDateIntervention: (value: string) => void;
  origineId: string;
  setOrigineId: (value: string) => void;
  origines: Origine[];
  // Mode renfort
  isRenfortMode: boolean;
  selectedRenfortTicket: Ticket | null;
  onSelectRenfortTicket: (ticket: Ticket | null) => void;
  // Site MSP
  selectedSiteId: string | null;
  onSelectSite: (site: SiteConventionne | null) => void;
  // Localisation
  communeId: string;
  setCommuneId: (value: string) => void;
  communes: Commune[];
  typeLieuId: string;
  setTypeLieuId: (value: string) => void;
  typesLieux: TypeLieu[];
  numVoie: string;
  setNumVoie: (value: string) => void;
  typeVoieId: string;
  setTypeVoieId: (value: string) => void;
  typesVoies: TypeVoie[];
  nomVoie: string;
  setNomVoie: (value: string) => void;
  complementAdresse: string;
  setComplementAdresse: (value: string) => void;
}

export function StepInfos({
  dateIntervention,
  setDateIntervention,
  origineId,
  setOrigineId,
  origines,
  isRenfortMode,
  selectedRenfortTicket,
  onSelectRenfortTicket,
  selectedSiteId,
  onSelectSite,
  communeId,
  setCommuneId,
  communes,
  typeLieuId,
  setTypeLieuId,
  typesLieux,
  numVoie,
  setNumVoie,
  typeVoieId,
  setTypeVoieId,
  typesVoies,
  nomVoie,
  setNomVoie,
  complementAdresse,
  setComplementAdresse,
}: StepInfosProps) {
  const [communeOpen, setCommuneOpen] = useState(false);
  const selectedCommune = communes.find((c) => c.id === communeId);

  return (
    <div className="space-y-6">
      {/* Informations intervention */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informations intervention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date et heure</Label>
              <Input
                type="datetime-local"
                value={dateIntervention}
                onChange={(e) => setDateIntervention(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Origine</Label>
              <Select value={origineId} onValueChange={setOrigineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'origine" />
                </SelectTrigger>
                <SelectContent>
                  {origines.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indication mode renfort */}
          {isRenfortMode && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">
                Mode Renfort : Sélectionnez l'intervention à renforcer ci-dessous
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site MSP Selector */}
      {!isRenfortMode && (
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Site MSP conventionné</CardTitle>
          </CardHeader>
          <CardContent>
            <SiteMSPSelector
              selectedSiteId={selectedSiteId}
              onSelectSite={onSelectSite}
            />
          </CardContent>
        </Card>
      )}

      {/* Mode Renfort : Sélection du ticket existant */}
      {isRenfortMode ? (
        <RenfortTicketSelector
          selectedTicketId={selectedRenfortTicket?.id || ''}
          onSelectTicket={onSelectRenfortTicket}
        />
      ) : (
        /* Mode Normal : Localisation */
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commune</Label>
                <Popover open={communeOpen} onOpenChange={setCommuneOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedCommune?.nom || 'Sélectionner une commune'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher une commune..." />
                      <CommandList>
                        <CommandEmpty>Aucune commune trouvée</CommandEmpty>
                        <CommandGroup>
                          {communes.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.nom}
                              onSelect={() => {
                                setCommuneId(c.id);
                                setCommuneOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  communeId === c.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {c.nom}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Type de lieu</Label>
                <Select value={typeLieuId} onValueChange={setTypeLieuId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesLieux.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2 space-y-2">
                <Label>N°</Label>
                <Input
                  placeholder="123"
                  value={numVoie}
                  onChange={(e) => setNumVoie(e.target.value)}
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label>Type voie</Label>
                <Select value={typeVoieId} onValueChange={setTypeVoieId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesVoies.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-7 space-y-2">
                <Label>Nom de voie</Label>
                <Input
                  placeholder="DE LA GRISIERE"
                  value={nomVoie}
                  onChange={(e) => setNomVoie(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Complément d'adresse</Label>
              <Input
                placeholder="Angle route de Sancé, bâtiment B..."
                value={complementAdresse}
                onChange={(e) => setComplementAdresse(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
