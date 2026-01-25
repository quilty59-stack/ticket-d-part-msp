import { useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { TicketPrintView } from '@/components/ticket/TicketPrintView';
import {
  History,
  Plus,
  Eye,
  Printer,
  FileText,
  Loader2,
  Truck,
} from 'lucide-react';
import type { Ticket, MoyenAffecte, PersonnelDisponible } from '@/lib/supabase-types';

export default function Historique() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<{
    ticket: Ticket;
    vehiculeIndex: number;
    totalVehicules: number;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

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

  // Print handler - creates one print per CA (vehicle)
  const handlePrint = (ticket: Ticket) => {
    const moyens = (ticket.moyens || []) as MoyenAffecte[];
    const totalVehicules = moyens.length;

    if (totalVehicules === 0) {
      // No vehicles, print empty ticket
      setPrintData({ ticket, vehiculeIndex: -1, totalVehicules: 0 });
      setPrintDialogOpen(true);
      return;
    }

    // For multiple vehicles, we'll print sequentially
    setPrintData({ ticket, vehiculeIndex: 0, totalVehicules });
    setPrintDialogOpen(true);
  };

  const handlePrintNext = () => {
    if (!printData) return;

    const { ticket, vehiculeIndex, totalVehicules } = printData;
    
    if (vehiculeIndex < totalVehicules - 1) {
      setPrintData({
        ticket,
        vehiculeIndex: vehiculeIndex + 1,
        totalVehicules,
      });
    } else {
      setPrintDialogOpen(false);
      setPrintData(null);
    }
  };

  const triggerPrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Ticket de Départ</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 4px 8px; text-align: left; }
              th { background: #f0f0f0; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .section-title { font-weight: bold; background: #e0e0e0; padding: 5px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
              .field { margin-bottom: 5px; }
              .field-label { font-weight: bold; font-size: 12px; color: #666; }
              .field-value { font-size: 14px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          handlePrintNext();
        }, 250);
      }
    }
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

      {/* View Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ticket {selectedTicket?.num_inter}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <TicketPrintView
              ticket={selectedTicket}
              vehiculeIndex={-1}
              showAllVehicles
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Impression du Ticket
              {printData && printData.totalVehicules > 1 && (
                <Badge variant="outline" className="ml-2">
                  Véhicule {printData.vehiculeIndex + 1} / {printData.totalVehicules}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {printData && (
            <>
              <div ref={printRef} className="border rounded-lg p-4 bg-white">
                <TicketPrintView
                  ticket={printData.ticket}
                  vehiculeIndex={printData.vehiculeIndex}
                  showAllVehicles={printData.totalVehicules === 0}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={triggerPrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                  {printData.totalVehicules > 1 && (
                    <span className="ml-1">
                      ({printData.vehiculeIndex + 1}/{printData.totalVehicules})
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
