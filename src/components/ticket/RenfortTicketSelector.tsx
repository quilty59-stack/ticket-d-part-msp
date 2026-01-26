import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { AlertCircle, Loader2, MapPin, Truck, Clock } from 'lucide-react';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

interface RenfortTicketSelectorProps {
  selectedTicketId: string;
  onSelectTicket: (ticket: Ticket | null) => void;
}

export function RenfortTicketSelector({
  selectedTicketId,
  onSelectTicket,
}: RenfortTicketSelectorProps) {
  // Fetch tickets en cours (validés, récents - moins de 24h)
  const { data: ticketsEnCours = [], isLoading } = useQuery({
    queryKey: ['tickets-en-cours'],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          origines (libelle),
          communes (nom, code_postal),
          types_lieux (libelle),
          types_voies (libelle),
          categories (code, libelle, couleur),
          natures (libelle)
        `)
        .eq('etat', 'valide')
        .gte('date_intervention', yesterday.toISOString())
        .order('date_intervention', { ascending: false });

      if (error) throw error;
      return data as unknown as Ticket[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (ticketsEnCours.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>Aucune intervention en cours</p>
          <p className="text-sm">Les interventions des dernières 24h apparaissent ici</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Sélectionner l'intervention à renforcer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedTicketId}
          onValueChange={(value) => {
            const ticket = ticketsEnCours.find((t) => t.id === value) || null;
            onSelectTicket(ticket);
          }}
          className="space-y-3"
        >
          {ticketsEnCours.map((ticket) => {
            const moyens = (ticket.moyens || []) as MoyenAffecte[];
            const addressParts = [
              ticket.num_voie,
              ticket.types_voies?.libelle,
              ticket.nom_voie,
            ].filter(Boolean);
            const address = addressParts.join(' ') || 'Adresse non renseignée';

            return (
              <div
                key={ticket.id}
                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedTicketId === ticket.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => {
                  onSelectTicket(ticket);
                }}
              >
                <RadioGroupItem value={ticket.id} id={ticket.id} className="mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold">{ticket.num_inter}</span>
                    {ticket.categories && (
                      <CategoryBadge
                        code={ticket.categories.code}
                        libelle={ticket.categories.libelle}
                      />
                    )}
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(ticket.date_intervention), 'HH:mm', { locale: fr })}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{ticket.communes?.nom} - {address}</span>
                    </div>
                    <div>
                      <strong>Nature :</strong> {ticket.natures?.libelle || '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>Moyens engagés : {moyens.map((m) => m.vehicule_code).join(', ') || 'Aucun'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
