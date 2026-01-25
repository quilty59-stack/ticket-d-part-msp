import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Ticket, MoyenAffecte } from '@/lib/supabase-types';

interface TicketPrintViewProps {
  ticket: Ticket;
  vehiculeIndex: number; // -1 = tous les véhicules
  showAllVehicles?: boolean;
}

export function TicketPrintView({
  ticket,
  vehiculeIndex,
  showAllVehicles = false,
}: TicketPrintViewProps) {
  const moyens = (ticket.moyens || []) as MoyenAffecte[];
  const currentVehicule = vehiculeIndex >= 0 ? moyens[vehiculeIndex] : null;

  // Build address
  const addressParts = [
    ticket.num_voie,
    ticket.types_voies?.libelle,
    ticket.nom_voie,
  ].filter(Boolean);
  const address = addressParts.join(' ') || '-';

  // Get CA (Chef d'Agrès) from vehicle
  const getCA = (moyen: MoyenAffecte) => {
    const caRef = moyen.postes?.CA;
    if (!caRef) return null;
    const ref = Array.isArray(caRef) ? caRef[0] : caRef;
    return ref;
  };

  return (
    <div className="print-content space-y-4 text-sm">
      {/* Header */}
      <div className="header text-center border-b pb-4">
        <h1 className="text-xl font-bold">TICKET DE DÉPART</h1>
        <p className="text-lg font-mono">{ticket.num_inter}</p>
        {currentVehicule && (
          <p className="text-primary font-bold mt-2">
            Véhicule: {currentVehicule.vehicule_code}
          </p>
        )}
      </div>

      {/* Intervention Info */}
      <div className="section">
        <div className="section-title bg-muted p-2 font-bold rounded">
          Informations Intervention
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2 p-2">
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Date et heure</div>
            <div className="field-value font-medium">
              {format(new Date(ticket.date_intervention), 'dd/MM/yyyy HH:mm', { locale: fr })}
            </div>
          </div>
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Origine</div>
            <div className="field-value font-medium">
              {ticket.origines?.libelle || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="section">
        <div className="section-title bg-muted p-2 font-bold rounded">
          Localisation
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2 p-2">
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Commune</div>
            <div className="field-value font-medium">
              {ticket.communes?.nom || '-'}
              {ticket.communes?.code_postal && ` (${ticket.communes.code_postal})`}
            </div>
          </div>
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Type de lieu</div>
            <div className="field-value font-medium">
              {ticket.types_lieux?.libelle || '-'}
            </div>
          </div>
          <div className="field col-span-2">
            <div className="field-label text-muted-foreground text-xs">Adresse</div>
            <div className="field-value font-medium">{address}</div>
          </div>
          {ticket.complement_adresse && (
            <div className="field col-span-2">
              <div className="field-label text-muted-foreground text-xs">Complément</div>
              <div className="field-value font-medium">{ticket.complement_adresse}</div>
            </div>
          )}
        </div>
      </div>

      {/* Nature */}
      <div className="section">
        <div className="section-title bg-muted p-2 font-bold rounded">
          Nature de l'intervention
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2 p-2">
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Catégorie</div>
            <div className="field-value font-medium">
              {ticket.categories?.libelle || '-'}
            </div>
          </div>
          <div className="field">
            <div className="field-label text-muted-foreground text-xs">Nature</div>
            <div className="field-value font-medium">
              {ticket.natures?.libelle || '-'}
            </div>
          </div>
          {ticket.complement_nature && (
            <div className="field col-span-2">
              <div className="field-label text-muted-foreground text-xs">Détails</div>
              <div className="field-value font-medium">{ticket.complement_nature}</div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(ticket.appelant || ticket.victime || ticket.rens_compl) && (
        <div className="section">
          <div className="section-title bg-muted p-2 font-bold rounded">
            Informations complémentaires
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 p-2">
            {ticket.appelant && (
              <div className="field">
                <div className="field-label text-muted-foreground text-xs">Appelant</div>
                <div className="field-value font-medium">{ticket.appelant}</div>
              </div>
            )}
            {ticket.victime && (
              <div className="field">
                <div className="field-label text-muted-foreground text-xs">Victime</div>
                <div className="field-value font-medium">{ticket.victime}</div>
              </div>
            )}
            {ticket.rens_compl && (
              <div className="field col-span-2">
                <div className="field-label text-muted-foreground text-xs">Renseignements</div>
                <div className="field-value font-medium">{ticket.rens_compl}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Moyens - Single vehicle or all */}
      <div className="section">
        <div className="section-title bg-muted p-2 font-bold rounded">
          Moyens engagés
        </div>
        <div className="mt-2">
          {showAllVehicles || vehiculeIndex < 0 ? (
            // Show all vehicles
            moyens.length === 0 ? (
              <p className="text-muted-foreground italic p-2">Aucun moyen engagé</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-2 text-left">Véhicule</th>
                    <th className="border p-2 text-left">CA</th>
                    <th className="border p-2 text-left">COND</th>
                    <th className="border p-2 text-left">CE</th>
                    <th className="border p-2 text-left">EQ</th>
                  </tr>
                </thead>
                <tbody>
                  {moyens.map((moyen, idx) => (
                    <tr key={idx}>
                      <td className="border p-2 font-bold">{moyen.vehicule_code}</td>
                      <td className="border p-2">{formatPoste(moyen.postes?.CA)}</td>
                      <td className="border p-2">{formatPoste(moyen.postes?.COND)}</td>
                      <td className="border p-2">{formatPoste(moyen.postes?.CE)}</td>
                      <td className="border p-2">{formatPoste(moyen.postes?.EQ)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : currentVehicule ? (
            // Show single vehicle
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-left">Poste</th>
                  <th className="border p-2 text-left">Personnel</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-bold">Chef d'Agrès (CA)</td>
                  <td className="border p-2">{formatPoste(currentVehicule.postes?.CA)}</td>
                </tr>
                <tr>
                  <td className="border p-2 font-bold">Conducteur (COND)</td>
                  <td className="border p-2">{formatPoste(currentVehicule.postes?.COND)}</td>
                </tr>
                <tr>
                  <td className="border p-2 font-bold">Chef d'Équipe (CE)</td>
                  <td className="border p-2">{formatPoste(currentVehicule.postes?.CE)}</td>
                </tr>
                <tr>
                  <td className="border p-2 font-bold">Équipier(s) (EQ)</td>
                  <td className="border p-2">{formatPoste(currentVehicule.postes?.EQ)}</td>
                </tr>
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
      </div>
    </div>
  );
}

function formatPoste(value: string | string[] | undefined): string {
  if (!value) return '-';
  if (Array.isArray(value)) {
    return value.map(extractName).join(', ') || '-';
  }
  return extractName(value) || '-';
}

function extractName(ref: string): string {
  // ref format: "type:id" - we just show the ID for now
  // In a real app, you'd resolve this to actual names
  const parts = ref.split(':');
  return parts.length > 1 ? `ID: ${parts[1].slice(0, 8)}...` : ref;
}
