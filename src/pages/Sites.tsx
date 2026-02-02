import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, AlertTriangle } from 'lucide-react';
import { useSitesConventionnes } from '@/hooks/useSitesConventionnes';
import { useState } from 'react';

export default function Sites() {
  const { data: sites = [], isLoading, error } = useSitesConventionnes();
  const [search, setSearch] = useState('');

  const filteredSites = sites.filter((site) => {
    const searchLower = search.toLowerCase();
    return (
      site.name.toLowerCase().includes(searchLower) ||
      site.commune?.toLowerCase().includes(searchLower) ||
      site.address?.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Erreur de chargement des sites conventionnés</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Sites conventionnés MSP
            </h1>
            <p className="text-muted-foreground mt-1">
              {sites.length} site{sites.length > 1 ? 's' : ''} disponible{sites.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Input
          placeholder="Rechercher un site par nom, commune ou adresse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site) => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{site.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Adresse */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      {site.address && <div>{site.address}</div>}
                      <div className="font-medium">
                        {site.postal_code} {site.commune}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {site.notes && (
                    <div className="flex items-start gap-2 text-xs p-2 rounded bg-muted/50 border">
                      <AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">{site.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSites.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun site trouvé pour cette recherche
          </div>
        )}
      </div>
    </AppLayout>
  );
}
