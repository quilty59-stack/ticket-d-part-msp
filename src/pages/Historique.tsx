import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTickets } from '@/hooks/useTickets';
import { useActiveSessionsFormation } from '@/hooks/useSessionsFormation';
import { useProfilesByUserIds } from '@/hooks/useProfiles';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  AlertCircle,
  Filter,
  User,
  GraduationCap,
} from 'lucide-react';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

export default function Historique() {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [printTicket, setPrintTicket] = useState<Ticket | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string>('all');

  // Fetch sessions for filter
  const { data: sessions = [] } = useActiveSessionsFormation();

  // Fetch tickets with optional session filter
  const { data: tickets = [], isLoading } = useTickets(
    sessionFilter === 'all' ? null : sessionFilter
  );

  // Get unique user IDs from tickets to fetch profiles
  const userIds = useMemo(() => {
    const ids = tickets
      .map((t) => t.created_by)
      .filter((id): id is string => id !== null);
    return [...new Set(ids)];
  }, [tickets]);

  // Fetch profiles for all creators
  const { data: profilesMap = {} } = useProfilesByUserIds(userIds);

  // Print handler
  const handlePrint = (ticket: Ticket) => {
    setPrintTicket(ticket);
  };

  // Renfort handler - navigate to nouveau ticket with renfort mode
  const handleRenfort = (ticket: Ticket) => {
    // Navigate to the new ticket page with renfort mode and pre-selected ticket
    navigate('/ticket/nouveau', {
      state: {
        renfortMode: true,
        renfortTicket: ticket,
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tickets récents
              </CardTitle>
              
              {/* Session Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filtrer par session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sessions</SelectItem>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {session.code}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {sessionFilter !== 'all' 
                  ? 'Aucun ticket pour cette session'
                  : 'Aucun ticket créé pour le moment'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Inter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Créé par</TableHead>
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
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(ticket.date_intervention), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {ticket.sessions_formation ? (
                              <Badge variant="outline" className="gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {ticket.sessions_formation.code}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ticket.created_by && profilesMap[ticket.created_by] ? (
                              <span className="flex items-center gap-1 text-sm">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {profilesMap[ticket.created_by]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
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
                          <TableCell className="max-w-[120px] truncate">
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
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedTicket(ticket)}
                                title="Voir le détail"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePrint(ticket)}
                                title="Imprimer"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenfort(ticket)}
                                className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                                title="Demander un renfort"
                              >
                                <AlertCircle className="w-4 h-4" />
                                Renfort
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
