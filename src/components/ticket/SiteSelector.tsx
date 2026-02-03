import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Building2, MapPinned, MapPin, Phone, User } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSitesConventionnes, type SiteConventionne } from '@/hooks/useSitesConventionnes';
import { useSitesTemporaires, type SiteTemporaire } from '@/hooks/useSitesTemporaires';

export type SelectedSite = {
  type: 'conventionne' | 'temporaire';
  id: string;
  nom: string;
  adresse?: string | null;
  commune?: string | null;
  code_postal?: string | null;
  complement?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
};

interface SiteSelectorProps {
  selectedSite: SelectedSite | null;
  onSelectSite: (site: SelectedSite | null) => void;
}

export function SiteSelector({ selectedSite, onSelectSite }: SiteSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: sitesConventionnes = [], isLoading: loadingConv } = useSitesConventionnes();
  const { data: sitesTemporaires = [], isLoading: loadingTemp } = useSitesTemporaires();

  const isLoading = loadingConv || loadingTemp;

  // Convert sites to unified format
  const allSites = useMemo(() => {
    const conv: SelectedSite[] = sitesConventionnes.map((s) => ({
      type: 'conventionne' as const,
      id: s.id,
      nom: s.name,
      adresse: s.address,
      commune: s.commune,
      code_postal: s.postal_code,
      complement: s.notes,
      contact_name: s.contact_name,
      contact_phone: s.contact_phone,
    }));

    const temp: SelectedSite[] = sitesTemporaires.map((s) => ({
      type: 'temporaire' as const,
      id: s.id,
      nom: s.nom,
      adresse: s.adresse,
      commune: s.commune?.nom || null,
      code_postal: s.commune?.code_postal || null,
      complement: s.complement,
    }));

    return [...conv, ...temp];
  }, [sitesConventionnes, sitesTemporaires]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedSite ? (
                <span className="flex items-center gap-2 truncate">
                  {selectedSite.type === 'conventionne' ? (
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <MapPinned className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  {selectedSite.nom}
                </span>
              ) : (
                'Sélectionner un site...'
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un site..." />
              <CommandList>
                <CommandEmpty>Aucun site trouvé</CommandEmpty>

                {/* Option to clear selection */}
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onSelectSite(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        !selectedSite ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="text-muted-foreground">Aucun site (saisie manuelle)</span>
                  </CommandItem>
                </CommandGroup>

                {/* Sites conventionnés */}
                {sitesConventionnes.length > 0 && (
                  <CommandGroup heading="Sites conventionnés">
                    {sitesConventionnes.map((site) => (
                      <CommandItem
                        key={`conv-${site.id}`}
                        value={`conv ${site.name} ${site.commune || ''}`}
                        onSelect={() => {
                          onSelectSite({
                            type: 'conventionne',
                            id: site.id,
                            nom: site.name,
                            adresse: site.address,
                            commune: site.commune,
                            code_postal: site.postal_code,
                            complement: site.notes,
                            contact_name: site.contact_name,
                            contact_phone: site.contact_phone,
                          });
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedSite?.type === 'conventionne' && selectedSite?.id === site.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <Building2 className="w-4 h-4 mr-2 text-primary shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{site.name}</span>
                          {site.commune && (
                            <span className="text-xs text-muted-foreground">
                              {site.postal_code} {site.commune}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Sites temporaires */}
                {sitesTemporaires.length > 0 && (
                  <CommandGroup heading="Sites temporaires">
                    {sitesTemporaires.map((site) => (
                      <CommandItem
                        key={`temp-${site.id}`}
                        value={`temp ${site.nom} ${site.commune?.nom || ''}`}
                        onSelect={() => {
                          onSelectSite({
                            type: 'temporaire',
                            id: site.id,
                            nom: site.nom,
                            adresse: site.adresse,
                            commune: site.commune?.nom || null,
                            code_postal: site.commune?.code_postal || null,
                            complement: site.complement,
                          });
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedSite?.type === 'temporaire' && selectedSite?.id === site.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <MapPinned className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{site.nom}</span>
                          {site.commune && (
                            <span className="text-xs text-muted-foreground">
                              {site.commune.code_postal} {site.commune.nom}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Read-only display of selected site details */}
      {selectedSite && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                {selectedSite.adresse && <div>{selectedSite.adresse}</div>}
                <div className="font-medium">
                  {selectedSite.code_postal} {selectedSite.commune}
                </div>
              </div>
            </div>
            {selectedSite.contact_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{selectedSite.contact_name}</span>
              </div>
            )}
            {selectedSite.contact_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selectedSite.contact_phone}</span>
              </div>
            )}
            {selectedSite.complement && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded border">
                {selectedSite.complement}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
