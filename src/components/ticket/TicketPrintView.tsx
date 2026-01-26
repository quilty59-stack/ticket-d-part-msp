import { forwardRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePersonnelResolver } from '@/hooks/usePersonnelResolver';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

interface TicketPrintViewProps {
  ticket: Ticket;
  vehiculeIndex: number; // -1 = tous les véhicules
  showAllVehicles?: boolean;
}

export const TicketPrintView = forwardRef<HTMLDivElement, TicketPrintViewProps>(
  function TicketPrintView(
    { ticket, vehiculeIndex, showAllVehicles = false },
    ref
  ) {
    const { formatPostePersonnel } = usePersonnelResolver();
    const moyens = (ticket.moyens || []) as MoyenAffecte[];
    const currentVehicule = vehiculeIndex >= 0 ? moyens[vehiculeIndex] : null;

    // Build address
    const addressParts = [
      ticket.num_voie,
      ticket.types_voies?.libelle,
      ticket.nom_voie,
    ].filter(Boolean);
    const address = addressParts.join(' ') || '';

    // Format date
    const formattedDate = format(
      new Date(ticket.date_intervention),
      "dd/MM/yyyy 'a' HH:mm:ss",
      { locale: fr }
    );

    // Moyens list for display
    const moyensList = moyens.map((m) => m.vehicule_code).join(' ');

    // Get all personnel from a vehicle as numbered list
    const getEquipageList = (moyen: MoyenAffecte): string[] => {
      const list: string[] = [];
      
      const addPersonnel = (postes: string | string[] | undefined) => {
        if (!postes) return;
        const arr = Array.isArray(postes) ? postes : [postes];
        arr.forEach(p => {
          const name = formatPostePersonnel(p);
          if (name) list.push(name);
        });
      };
      
      addPersonnel(moyen.postes?.CA);
      addPersonnel(moyen.postes?.COND);
      addPersonnel(moyen.postes?.CE);
      addPersonnel(moyen.postes?.EQ);
      
      return list;
    };

    // Fixed-width label style for alignment (monospace simulation)
    const labelStyle: React.CSSProperties = {
      display: 'inline-block',
      minWidth: '160px',
    };

    // Render a single vehicle with its crew
    const renderVehicleWithCrew = (moyen: MoyenAffecte) => {
      const equipage = getEquipageList(moyen);
      return (
        <div key={moyen.vehicule_code} style={{ marginTop: '12px' }}>
          <div>
            Vehicule : {moyen.vehicule_code}
          </div>
          {equipage.length > 0 && (
            <div style={{ marginLeft: '40px' }}>
              {equipage.map((person, idx) => (
                <div key={idx}>
                  {idx === 0 ? 'Equipage : ' : '          '}
                  {String(idx + 1).padStart(2, '0')}- {person}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#000',
          backgroundColor: '#fff',
          padding: '20px',
        }}
      >
        {/* Header - Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '22px' }}>
            Intervention numero {ticket.num_inter}
          </div>
        </div>

        {/* Body - Field lines */}
        <div style={{ fontSize: '12px' }}>
          {/* Date */}
          <div style={{ marginBottom: '8px' }}>
            Le {formattedDate}
          </div>

          {/* Renfort numéro + Origine de l'appel */}
          {ticket.renfort && (
            <div>
              {'    '}RENFORT NUMERO {ticket.renfort}
            </div>
          )}
          <div style={{ marginBottom: '6px' }}>
            Origine de l'appel : {ticket.origines?.libelle?.toUpperCase() || ''}
          </div>

          {/* Commune + Type de lieu */}
          <div>
            {'    '}Commune : {ticket.communes?.nom?.toUpperCase() || ''}
          </div>
          <div style={{ marginBottom: '6px' }}>
            Type de lieu: {ticket.types_lieux?.libelle?.toUpperCase() || ''}
          </div>

          {/* Adresse + TalkGroup */}
          <div>
            {'    '}Adresse : {address.toUpperCase()}
          </div>
          {ticket.talkgroup && (
            <div style={{ marginBottom: '6px' }}>
              TalkGroup{'    '}: {ticket.talkgroup}
            </div>
          )}

          {/* Nature (2 lignes si détails nature) */}
          <div>
            {'    '}Nature : {ticket.natures?.libelle?.toUpperCase() || ''}
          </div>
          {ticket.complement_nature && (
            <div style={{ marginLeft: '90px', marginBottom: '6px' }}>
              {ticket.complement_nature.toUpperCase()}
            </div>
          )}
          {!ticket.complement_nature && <div style={{ marginBottom: '6px' }} />}

          {/* Appelant */}
          <div style={{ marginBottom: '6px' }}>
            {'    '}Appelant : {ticket.appelant?.toUpperCase() || ''}
          </div>

          {/* Rens. compl. (peut être multiligne) */}
          <div style={{ marginBottom: '6px' }}>
            {'    '}Rens. compl. :{'    '}{ticket.rens_compl?.toUpperCase() || ''}
          </div>

          {/* Coordonnees (avec Parcellaire et DFCI si présents) */}
          {ticket.coordonnees && (
            <div style={{ marginBottom: '6px' }}>
              {'    '}Coordonnees :{'    '}{ticket.coordonnees}
            </div>
          )}

          {/* Moyens déjà engagés */}
          <div style={{ marginBottom: '6px' }}>
            {'    '}Moyen(s) deja engage(s) : {moyensList}
          </div>

          {/* Dispositif au départ */}
          <div style={{ marginBottom: '6px' }}>
            {'    '}Dispositif au depart :{'    '}{moyensList}
          </div>

          {/* Vehicle(s) with crew */}
          {showAllVehicles || vehiculeIndex < 0 ? (
            moyens.map((moyen) => renderVehicleWithCrew(moyen))
          ) : currentVehicule ? (
            renderVehicleWithCrew(currentVehicule)
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            fontSize: '10px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          Genere le {format(new Date(), "dd/MM/yyyy 'a' HH:mm", { locale: fr })}
        </div>
      </div>
    );
  }
);
