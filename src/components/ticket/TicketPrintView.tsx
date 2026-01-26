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
    "dd/MM/yyyy 'à' HH:mm:ss",
    { locale: fr }
  );

  // Moyens list for display
  const moyensList = moyens.map((m) => m.vehicule_code).join(', ');

  // Single vehicle personnel display
  const renderVehiclePersonnel = (moyen: MoyenAffecte) => (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
        PIQUET ({moyen.vehicule_code}) :
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '120px', padding: '2px 0' }}>C A :</td>
            <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.CA)}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0' }}>COND :</td>
            <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.COND)}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0' }}>CE :</td>
            <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.CE)}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0' }}>EQ :</td>
            <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.EQ)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // All vehicles personnel display
  const renderAllPersonnel = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
        PERSONNEL :
      </div>
      {moyens.length === 0 ? (
        <div style={{ fontSize: '12px', fontStyle: 'italic' }}>Aucun moyen engagé</div>
      ) : (
        moyens.map((moyen, idx) => (
          <div key={idx} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
              {moyen.vehicule_code} :
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginLeft: '16px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '80px', padding: '2px 0' }}>C A :</td>
                  <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.CA)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>COND :</td>
                  <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.COND)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>CE :</td>
                  <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.CE)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>EQ :</td>
                  <td style={{ padding: '2px 0' }}>{formatPostePersonnel(moyen.postes?.EQ)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );

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
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
          Intervention Numéro {ticket.num_inter}
        </div>
        {currentVehicule && (
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>
            Véhicule : {currentVehicule.vehicule_code}
          </div>
        )}
      </div>

      {/* Body - Field lines */}
      <div style={{ fontSize: '12px' }}>
        <div style={{ marginBottom: '4px' }}>
          <span>Le {formattedDate}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>RAPPORT DEPUIS :</span>{' '}
          <span>{ticket.origines?.libelle || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>PARCOURS DE L'APPEL :</span>{' '}
          <span>{ticket.origines?.libelle || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Type Inter :</span>{' '}
          <span>{ticket.categories?.libelle || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Commune :</span>{' '}
          <span>{ticket.communes?.nom?.toUpperCase() || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Adresse :</span>{' '}
          <span>{address.toUpperCase()}</span>
        </div>

        {ticket.complement_adresse && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Complément :</span>{' '}
            <span>{ticket.complement_adresse.toUpperCase()}</span>
          </div>
        )}

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Type lieu :</span>{' '}
          <span>{ticket.types_lieux?.libelle || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Nature :</span>{' '}
          <span>{ticket.natures?.libelle?.toUpperCase() || ''}</span>
        </div>

        {ticket.complement_nature && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Détails nature :</span>{' '}
            <span>{ticket.complement_nature.toUpperCase()}</span>
          </div>
        )}

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Appelant :</span>{' '}
          <span>{ticket.appelant?.toUpperCase() || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Victime :</span>{' '}
          <span>{ticket.victime?.toUpperCase() || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Rens. complémentaire :</span>{' '}
          <span>{ticket.rens_compl?.toUpperCase() || ''}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Points d'eau indisponibles :</span>{' '}
          <span>{ticket.pts_eau_indispo || ''}</span>
        </div>

        {ticket.coordonnees && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Coordonnées :</span>{' '}
            <span>{ticket.coordonnees}</span>
          </div>
        )}

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Moyen(s) mis en disposition :</span>{' '}
          <span>{moyensList}</span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Dispositif de départ :</span>{' '}
          <span>{moyensList}</span>
        </div>

        {ticket.transit && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Transit :</span>{' '}
            <span>{ticket.transit}</span>
          </div>
        )}

        {ticket.talkgroup && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>Talkgroup :</span>{' '}
            <span>{ticket.talkgroup}</span>
          </div>
        )}

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Message :</span>{' '}
          <span></span>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold' }}>Renfort(s) :</span>{' '}
          <span>{ticket.renfort || ''}</span>
        </div>

        {/* Personnel section */}
        {showAllVehicles || vehiculeIndex < 0 ? (
          renderAllPersonnel()
        ) : currentVehicule ? (
          renderVehiclePersonnel(currentVehicule)
        ) : null}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '8px',
          borderTop: '1px solid #ccc',
          fontSize: '10px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        Généré le {format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
      </div>
    </div>
  );
});
