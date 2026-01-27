import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePersonnelResolver } from '@/hooks/usePersonnelResolver';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

interface TicketInterventionProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Position ordering for crew display
const POSITION_ORDER = ['CA', 'COND', 'CE', 'EQ'];

export function TicketIntervention({
  ticket,
  open,
  onOpenChange,
}: TicketInterventionProps) {
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const { resolvePerson } = usePersonnelResolver();

  const moyens = useMemo(
    () => (ticket?.moyens || []) as MoyenAffecte[],
    [ticket?.moyens]
  );
  const totalVehicles = moyens.length;
  const currentVehicle = moyens[currentVehicleIndex];

  // Reset to first vehicle when ticket changes
  useEffect(() => {
    setCurrentVehicleIndex(0);
  }, [ticket?.id]);

  // Get crew list sorted by position
  const getCrewList = (moyen: MoyenAffecte) => {
    const crew: Array<{
      position: string;
      grade: string;
      nom: string;
      prenom: string;
      numeroBip?: string;
    }> = [];

    const processPoste = (
      postes: string | string[] | undefined,
      positionCode: string
    ) => {
      if (!postes) return;
      const arr = Array.isArray(postes) ? postes : [postes];
      arr.forEach((personnelId) => {
        const person = resolvePerson(personnelId);
        if (person) {
          crew.push({
            position: positionCode,
            grade: person.grade_code || '',
            nom: person.nom,
            prenom: person.prenom,
            numeroBip: undefined, // Add if you have BIP data
          });
        }
      });
    };

    // Process in position order
    POSITION_ORDER.forEach((pos) => {
      processPoste(moyen.postes?.[pos], pos);
    });

    return crew;
  };

  // Build address string
  const buildAddress = () => {
    if (!ticket) return '';
    const parts = [
      ticket.num_voie,
      ticket.types_voies?.libelle,
      ticket.nom_voie,
    ].filter(Boolean);
    return parts.join(' ').toUpperCase();
  };

  // Format date/time
  const formatDateTime = () => {
    if (!ticket) return { date: '', time: '' };
    const d = new Date(ticket.date_intervention);
    return {
      date: format(d, 'dd/MM/yyyy', { locale: fr }),
      time: format(d, 'HH:mm:ss'),
    };
  };

  // Get all vehicle codes for "Dispositif au départ"
  const getAllVehicleCodes = () =>
    moyens.map((m) => m.vehicule_code).join(' - ');

  // Get previous vehicle codes for "Moyen(s) déjà engagé(s)"
  const getPreviousVehicleCodes = () =>
    moyens
      .slice(0, currentVehicleIndex)
      .map((m) => m.vehicule_code)
      .join(' - ') || '-';

  // Print current ticket
  const printCurrentTicket = () => {
    if (!ticket) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateTicketHtml(
      ticket!,
      moyens,
      currentVehicleIndex + 1,
      totalVehicles,
      resolvePerson
    );
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Print all tickets sequentially
  const printAllTickets = () => {
    if (!ticket) return;
    moyens.forEach((_, index) => {
      setTimeout(() => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = generateTicketHtml(
          ticket!,
          moyens,
          index + 1,
          totalVehicles,
          resolvePerson
        );
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }, index * 500);
    });
  };

  if (!ticket) return null;

  const { date, time } = formatDateTime();
  const address = buildAddress();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Ticket de Départ</span>
            {totalVehicles > 1 && (
              <span className="text-sm font-normal text-muted-foreground">
                Véhicule {currentVehicleIndex + 1} / {totalVehicles}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Preview - Monospace style */}
          <div className="bg-white border rounded-lg p-6 font-mono text-sm text-black leading-relaxed">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold tracking-wider">
                Intervention numero {ticket.num_inter}
              </h1>
            </div>

            {/* Date/Time */}
            <div className="mb-4">
              <p>
                Le {date} a {time}
              </p>
            </div>

            {/* Renfort info */}
            <div className="mb-4 space-y-1">
              {ticket.renfort && (
                <p>
                  {'  '}RENFORT NUMERO{' '}
                  {String(ticket.renfort).padStart(2, '0')}
                </p>
              )}
              <p>
                {'  '}Origine de l'appel :{' '}
                {ticket.origines?.libelle?.toUpperCase() || 'INITIAL 18'}
              </p>
            </div>

            {/* Location */}
            <div className="mb-4 space-y-1">
              <p>
                {'     '}Commune :{' '}
                {ticket.communes?.nom?.toUpperCase() || ''}
              </p>
              <p>
                {'  '}Type de lieu:{' '}
                {ticket.types_lieux?.libelle?.toUpperCase() || ''}
              </p>
              {address && (
                <p>
                  {'     '}Adresse : {address}
                </p>
              )}
              {ticket.talkgroup && (
                <p>
                  TalkGroup{'    '}: {ticket.talkgroup}
                </p>
              )}
            </div>

            {/* Nature */}
            <div className="mb-4 space-y-1">
              <p>
                {'      '}Nature :{' '}
                {ticket.natures?.libelle?.toUpperCase() || ''}
              </p>
              {ticket.complement_nature && (
                <p className="pl-14">
                  {ticket.complement_nature.toUpperCase()}
                </p>
              )}
            </div>

            {/* Appelant */}
            {ticket.appelant && (
              <div className="mb-4">
                <p>
                  {'     '}Appelant : {ticket.appelant.toUpperCase()}
                </p>
              </div>
            )}

            {/* Renseignements complémentaires */}
            {ticket.rens_compl && (
              <div className="mb-4">
                <p>
                  {'     '}Rens. compl. :{'    '}
                  {ticket.rens_compl.toUpperCase()}
                </p>
              </div>
            )}

            {/* Coordonnées */}
            {ticket.coordonnees && (
              <div className="mb-4">
                <p>
                  {'     '}Coordonnees :{'    '}
                  {ticket.coordonnees}
                </p>
              </div>
            )}

            {/* Separator */}
            <Separator className="my-4 border-dashed" />

            {/* Dispositif */}
            <div className="mb-4 space-y-1">
              <p>Moyen(s) deja engage(s) : {getPreviousVehicleCodes()}</p>
              <p>Dispositif au depart : {getAllVehicleCodes()}</p>
            </div>

            {/* All Vehicles & Crews */}
            {moyens.map((moyen) => {
              const crew = getCrewList(moyen);
              return (
                <div key={moyen.vehicule_id} className="mb-4">
                  <p className="font-bold mb-2">
                    Vehicule : {moyen.vehicule_code}
                  </p>
                  <div className="pl-4">
                    <p>Equipage :</p>
                    {crew.length > 0 ? (
                      crew.map((person, idx) => (
                        <p key={idx} className="pl-6">
                          {String(idx + 1).padStart(2, '0')}- {person.grade}{' '}
                          {person.nom.toUpperCase()}{' '}
                          {person.prenom.substring(0, 2).toUpperCase()}
                          {person.numeroBip && (
                            <span className="text-blue-600 ml-2">
                              BIP {person.numeroBip}
                            </span>
                          )}
                          <span className="text-muted-foreground ml-2">
                            ({person.position})
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className="pl-6 text-muted-foreground">
                        (Aucun équipage)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            {totalVehicles > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentVehicleIndex(Math.max(0, currentVehicleIndex - 1))
                  }
                  disabled={currentVehicleIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentVehicleIndex(
                      Math.min(totalVehicles - 1, currentVehicleIndex + 1)
                    )
                  }
                  disabled={currentVehicleIndex === totalVehicles - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            {totalVehicles > 1 && (
              <Button variant="secondary" onClick={printAllTickets}>
                <Printer className="h-4 w-4 mr-2" />
                Tout imprimer ({totalVehicles})
              </Button>
            )}
            <Button onClick={printCurrentTicket} disabled={totalVehicles === 0}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Generate full HTML for printing
function generateTicketHtml(
  ticket: Ticket,
  moyens: MoyenAffecte[],
  _vehicleIndex: number,
  _totalVehicles: number,
  resolvePerson: (id: string) => {
    grade_code: string;
    nom: string;
    prenom: string;
  } | null
): string {
  const d = new Date(ticket.date_intervention);
  const dateStr = format(d, 'dd/MM/yyyy', { locale: fr });
  const timeStr = format(d, 'HH:mm:ss');

  const addressParts = [
    ticket.num_voie,
    ticket.types_voies?.libelle,
    ticket.nom_voie,
  ].filter(Boolean);
  const address = addressParts.join(' ').toUpperCase();

  const previousVehicles =
    moyens
      .slice(0, _vehicleIndex - 1)
      .map((m) => m.vehicule_code)
      .join(' - ') || '-';
  const allVehicles = moyens.map((m) => m.vehicule_code).join(' - ');

  // Generate crews HTML
  const generateCrewsHtml = () => {
    return moyens
      .map((moyen) => {
        const crew: Array<{
          position: string;
          grade: string;
          nom: string;
          prenom: string;
        }> = [];

        POSITION_ORDER.forEach((pos) => {
          const postes = moyen.postes?.[pos];
          if (!postes) return;
          const arr = Array.isArray(postes) ? postes : [postes];
          arr.forEach((personnelId) => {
            const person = resolvePerson(personnelId);
            if (person) {
              crew.push({
                position: pos,
                grade: person.grade_code || '',
                nom: person.nom,
                prenom: person.prenom,
              });
            }
          });
        });

        const crewRows =
          crew.length > 0
            ? crew
                .map(
                  (p, idx) =>
                    `          ${String(idx + 1).padStart(2, '0')}- ${p.grade} ${p.nom.toUpperCase()} ${p.prenom.substring(0, 2).toUpperCase()} (${p.position})`
                )
                .join('\n')
            : '          (Aucun équipage)';

        return `
    <div class="section">
      <div class="vehicle-header">Vehicule : ${moyen.vehicule_code}</div>
      <div class="line">    Equipage :</div>
<pre class="crew-member">${crewRows}</pre>
    </div>`;
      })
      .join('\n');
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket de Départ - ${ticket.num_inter}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 10mm;
    }
    .header {
      text-align: center;
      margin-bottom: 8mm;
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .line {
      margin-bottom: 2mm;
    }
    .section {
      margin-bottom: 5mm;
    }
    .separator {
      border-top: 1px dashed #666;
      margin: 6mm 0;
    }
    .crew-member {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .vehicle-header {
      font-weight: bold;
      margin-bottom: 3mm;
    }
    .bip {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="header">
    Intervention numero ${ticket.num_inter}
  </div>
  
  <div class="section">
    <div class="line">Le ${dateStr} a ${timeStr}</div>
  </div>
  
  <div class="section">
    ${ticket.renfort ? `<div class="line">  RENFORT NUMERO ${String(ticket.renfort).padStart(2, '0')}</div>` : ''}
    <div class="line">  Origine de l'appel : ${ticket.origines?.libelle?.toUpperCase() || 'INITIAL 18'}</div>
  </div>
  
  <div class="section">
    <div class="line">     Commune : ${ticket.communes?.nom?.toUpperCase() || ''}</div>
    <div class="line">  Type de lieu: ${ticket.types_lieux?.libelle?.toUpperCase() || ''}</div>
    ${address ? `<div class="line">     Adresse : ${address}</div>` : ''}
    ${ticket.talkgroup ? `<div class="line">TalkGroup    : ${ticket.talkgroup}</div>` : ''}
  </div>
  
  <div class="section">
    <div class="line">      Nature : ${ticket.natures?.libelle?.toUpperCase() || ''}</div>
    ${ticket.complement_nature ? `<div class="line" style="padding-left: 14ch;">${ticket.complement_nature.toUpperCase()}</div>` : ''}
  </div>
  
  ${ticket.appelant ? `<div class="section"><div class="line">     Appelant : ${ticket.appelant.toUpperCase()}</div></div>` : ''}
  
  ${ticket.rens_compl ? `<div class="section"><div class="line">     Rens. compl. :    ${ticket.rens_compl.toUpperCase()}</div></div>` : ''}
  
  ${ticket.coordonnees ? `<div class="section"><div class="line">     Coordonnees :    ${ticket.coordonnees}</div></div>` : ''}
  
  <div class="separator"></div>
  
  <div class="section">
    <div class="line">Moyen(s) deja engage(s) : ${previousVehicles}</div>
    <div class="line">Dispositif au depart : ${allVehicles}</div>
  </div>
  
  ${generateCrewsHtml()}
</body>
</html>`;
}
