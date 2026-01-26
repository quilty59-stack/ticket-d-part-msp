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
      
      // CA first
      if (moyen.postes?.CA) {
        const caPersonnel = Array.isArray(moyen.postes.CA) ? moyen.postes.CA : [moyen.postes.CA];
        caPersonnel.forEach(p => {
          const name = formatPostePersonnel(p);
          if (name) list.push(name);
        });
      }
      
      // COND
      if (moyen.postes?.COND) {
        const condPersonnel = Array.isArray(moyen.postes.COND) ? moyen.postes.COND : [moyen.postes.COND];
        condPersonnel.forEach(p => {
          const name = formatPostePersonnel(p);
          if (name) list.push(name);
        });
      }
      
      // CE
      if (moyen.postes?.CE) {
        const cePersonnel = Array.isArray(moyen.postes.CE) ? moyen.postes.CE : [moyen.postes.CE];
        cePersonnel.forEach(p => {
          const name = formatPostePersonnel(p);
          if (name) list.push(name);
        });
      }
      
      // EQ
      if (moyen.postes?.EQ) {
        const eqPersonnel = Array.isArray(moyen.postes.EQ) ? moyen.postes.EQ : [moyen.postes.EQ];
        eqPersonnel.forEach(p => {
          const name = formatPostePersonnel(p);
          if (name) list.push(name);
        });
      }
      
      return list;
    };

    // Render a single vehicle with its crew
    const renderVehicleWithCrew = (moyen: MoyenAffecte) => {
      const equipage = getEquipageList(moyen);
      return (
        <div key={moyen.vehicule_code} style={{ marginTop: '16px' }}>
          <div>
            Vehicule : {moyen.vehicule_code}
          </div>
          {equipage.length > 0 && (
            <div style={{ marginLeft: '20px' }}>
              <span>Equipage : </span>
              {equipage.map((person, idx) => (
                <span key={idx}>
                  {idx === 0 ? '' : <br style={{ display: 'block' }} />}
                  {idx === 0 ? '' : <span style={{ marginLeft: '76px' }}></span>}
                  {String(idx + 1).padStart(2, '0')}- {person}
                </span>
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
          lineHeight: '1.6',
          color: '#000',
          backgroundColor: '#fff',
          padding: '20px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {/* Header - Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'normal' }}>
            Intervention numero {ticket.num_inter}
          </div>
        </div>

        {/* Body - Field lines */}
        <div style={{ fontSize: '12px' }}>
          {/* Date */}
          <div style={{ marginBottom: '8px' }}>
            Le {formattedDate}
          </div>

          {/* Renfort + Origine on same area */}
          {ticket.renfort && (
            <div style={{ marginBottom: '4px' }}>
              RENFORT NUMERO {ticket.renfort}
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            Origine de l'appel : {ticket.origines?.libelle?.toUpperCase() || ''}
          </div>

          {/* Commune + Type lieu */}
          <div style={{ marginBottom: '4px' }}>
            {'   '}Commune : {ticket.communes?.nom?.toUpperCase() || ''}
          </div>
          <div style={{ marginBottom: '8px' }}>
            Type de lieu: {ticket.types_lieux?.libelle?.toUpperCase() || ''}
          </div>

          {/* Adresse + Talkgroup */}
          <div style={{ marginBottom: '4px' }}>
            {'   '}Adresse : {address.toUpperCase()}
          </div>
          {ticket.talkgroup && (
            <div style={{ marginBottom: '8px' }}>
              TalkGroup{'   '}: {ticket.talkgroup}
            </div>
          )}

          {/* Nature (sur 2 lignes si détails) */}
          <div style={{ marginBottom: ticket.complement_nature ? '0' : '8px' }}>
            {'   '}Nature : {ticket.natures?.libelle?.toUpperCase() || ''}
          </div>
          {ticket.complement_nature && (
            <div style={{ marginBottom: '8px', marginLeft: '76px' }}>
              {ticket.complement_nature.toUpperCase()}
            </div>
          )}

          {/* Appelant */}
          <div style={{ marginBottom: '8px' }}>
            {'   '}Appelant : {ticket.appelant?.toUpperCase() || ''}
          </div>

          {/* Rens compl */}
          <div style={{ marginBottom: '8px' }}>
            {'   '}Rens. compl. :{' '}{' '}{' '}{ticket.rens_compl?.toUpperCase() || ''}
          </div>

          {/* Coordonnees */}
          {ticket.coordonnees && (
            <div style={{ marginBottom: '8px' }}>
              {'   '}Coordonnees :{' '}{' '}{' '}{ticket.coordonnees}
            </div>
          )}

          {/* Moyens déjà engagés */}
          <div style={{ marginBottom: '8px' }}>
            {'   '}Moyen(s) deja engage(s) : {moyensList}
          </div>

          {/* Dispositif au départ */}
          <div style={{ marginBottom: '8px' }}>
            {'   '}Dispositif au depart :{' '}{' '}{' '}{moyensList}
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
