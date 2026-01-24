import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import {
  Plus,
  Flame,
  Clock,
  MapPin,
  Truck,
  FileText,
  Printer,
  Edit,
  Loader2,
  Calendar,
} from 'lucide-react';
import type { Ticket, Categorie, Commune, Nature } from '@/lib/supabase-types';

interface TicketWithRelations extends Ticket {
  categories: Categorie | null;
  communes: Commune | null;
  natures: Nature | null;
}

export default function Index() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, categories(*), communes(*), natures(*)')
        .gte('date_intervention', `${today}T00:00:00`)
        .lte('date_intervention', `${today}T23:59:59`)
        .order('date_intervention', { ascending: false });

      if (error) throw error;
      return data as unknown as TicketWithRelations[];
    },
  });

  const getTimeFromDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVehiculesCodes = (moyens: Ticket['moyens']) => {
    if (!Array.isArray(moyens)) return [];
    return moyens.map((m: { vehicule_code: string }) => m.vehicule_code);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              Tickets du jour
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {todayFormatted}
            </p>
          </div>
          <Button onClick={() => navigate('/ticket/nouveau')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau ticket
          </Button>
        </div>

        {/* Tickets list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun ticket aujourd'hui</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier ticket de départ pour cette journée
              </p>
              <Button onClick={() => navigate('/ticket/nouveau')}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/ticket/${ticket.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Header row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-lg">{ticket.num_inter}</span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeFromDate(ticket.date_intervention)}</span>
                        </div>
                        {ticket.communes && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.communes.nom}</span>
                          </div>
                        )}
                        {ticket.etat === 'brouillon' && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Brouillon
                          </span>
                        )}
                      </div>

                      {/* Nature row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {ticket.categories && (
                          <CategoryBadge
                            code={ticket.categories.code}
                            libelle={ticket.categories.libelle}
                          />
                        )}
                        {ticket.natures && (
                          <span className="text-sm">{ticket.natures.libelle}</span>
                        )}
                        {ticket.complement_nature && (
                          <span className="text-sm text-muted-foreground">
                            - {ticket.complement_nature}
                          </span>
                        )}
                      </div>

                      {/* Vehicules row */}
                      {ticket.moyens && getVehiculesCodes(ticket.moyens).length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          {getVehiculesCodes(ticket.moyens).map((code) => (
                            <span
                              key={code}
                              className="text-xs bg-muted px-2 py-1 rounded font-medium"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Generate PDF
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Print
                        }}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ticket/${ticket.id}/edit`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {tickets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{tickets.length}</div>
                <div className="text-sm text-muted-foreground">Interventions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {tickets.filter((t) => t.categories?.code === 'SUAP').length}
                </div>
                <div className="text-sm text-muted-foreground">SUAP</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {tickets.filter((t) => t.categories?.code === 'Accident').length}
                </div>
                <div className="text-sm text-muted-foreground">Accidents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {tickets.filter((t) => t.categories?.code === 'Incendie').length}
                </div>
                <div className="text-sm text-muted-foreground">Incendies</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
