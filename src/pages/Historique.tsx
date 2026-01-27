import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { TicketIntervention } from '@/components/ticket/TicketIntervention';
import {
  History,
  Plus,
  Eye,
  Printer,
  FileText,
  Loader2,
  Truck,
} from 'lucide-react';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

export default function Historique() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [printTicket, setPrintTicket] = useState<Ticket | null>(null);

  // Fetch tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Ticket[];
    },
  });

  // Print handler
  const handlePrint = (ticket: Ticket) => {
    setPrintTicket(ticket);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Historique des Tickets
          </h1>
          <Link to="/ticket/nouveau">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau ticket
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tickets récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun ticket créé pour le moment
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Inter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Commune</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Nature</TableHead>
                    <TableHead>Moyens</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => {
                    const moyens = (ticket.moyens || []) as MoyenAffecte[];
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono font-medium">
                          {ticket.num_inter}
                        </TableCell>
                        <TableCell>
                          {format(new Date(ticket.date_intervention), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {ticket.communes?.nom || '-'}
                        </TableCell>
                        <TableCell>
                          {ticket.categories ? (
                            <CategoryBadge
                              code={ticket.categories.code}
                              libelle={ticket.categories.libelle}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {ticket.natures?.libelle || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <span>{moyens.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.etat === 'valide' ? 'default' : 'secondary'}>
                            {ticket.etat === 'valide' ? 'Validé' : 'Brouillon'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePrint(ticket)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog - use TicketIntervention for viewing */}
      <TicketIntervention
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      />

      {/* Print Dialog */}
      <TicketIntervention
        ticket={printTicket}
        open={!!printTicket}
        onOpenChange={(open) => !open && setPrintTicket(null)}
      />
    </AppLayout>
  );
}
