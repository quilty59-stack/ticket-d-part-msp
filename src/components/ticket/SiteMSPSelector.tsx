import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, MapPin, Phone, User } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSitesConventionnes, type SiteConventionne } from '@/hooks/useSitesConventionnes';

interface SiteMSPSelectorProps {
  selectedSiteId: string | null;
  onSelectSite: (site: SiteConventionne | null) => void;
}

export function SiteMSPSelector({ selectedSiteId, onSelectSite }: SiteMSPSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: sites = [], isLoading, error } = useSitesConventionnes();

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-destructive">
          Erreur de chargement des sites conventionnés
        </div>
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
                <span className="truncate">{selectedSite.name}</span>
              ) : (
                'Sélectionner un site MSP...'
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un site..." />
              <CommandList>
                <CommandEmpty>Aucun site trouvé</CommandEmpty>
                <CommandGroup>
                  {/* Option to clear selection */}
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
                        !selectedSiteId ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="text-muted-foreground">Aucun site</span>
                  </CommandItem>
                  {sites.map((site) => (
                    <CommandItem
                      key={site.id}
                      value={`${site.name} ${site.commune || ''}`}
                      onSelect={() => {
                        onSelectSite(site);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedSiteId === site.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
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
                {selectedSite.address && <div>{selectedSite.address}</div>}
                <div className="font-medium">
                  {selectedSite.postal_code} {selectedSite.commune}
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
            {selectedSite.notes && (
              <div className="text-xs text-muted-foreground mt-2 p-2 bg-background rounded border">
                {selectedSite.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
