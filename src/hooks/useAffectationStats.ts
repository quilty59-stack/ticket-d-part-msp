import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MoyenAffecte } from '@/lib/supabase-types';

export interface PersonnelStats {
  personnelRef: string; // "stagiaire:uuid" ou "manoeuvrant:uuid"
  personnelId: string;
  personnelType: 'stagiaire' | 'manoeuvrant';
  CA: number;
  COND: number;
  CE: number;
  EQ: number;
  total: number;
  lastAssignment?: string; // Date de dernière affectation
}

export interface SessionStats {
  sessionId: string;
  sessionCode: string;
  personnelStats: Record<string, PersonnelStats>;
  globalStats: {
    totalAffectations: number;
    byPoste: Record<string, number>;
  };
}

// Récupérer les tickets validés d'une session
function useSessionTickets(sessionId: string | null) {
  return useQuery({
    queryKey: ['tickets', 'session-stats', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        // Si pas de session, récupérer tous les tickets
        const { data, error } = await supabase
          .from('tickets')
          .select('id, moyens, date_intervention, session_id')
          .eq('etat', 'valide')
          .order('date_intervention', { ascending: false });
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, moyens, date_intervention, session_id')
        .eq('session_id', sessionId)
        .eq('etat', 'valide')
        .order('date_intervention', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Cache 30 secondes
  });
}

// Hook principal pour calculer les stats d'affectation
export function useAffectationStats(sessionId: string | null) {
  const { data: tickets = [], isLoading, error } = useSessionTickets(sessionId);

  const stats = useMemo(() => {
    const personnelStats: Record<string, PersonnelStats> = {};
    const globalStats = {
      totalAffectations: 0,
      byPoste: { CA: 0, COND: 0, CE: 0, EQ: 0 } as Record<string, number>,
    };

    tickets.forEach((ticket) => {
      const moyens = (ticket.moyens as unknown as MoyenAffecte[]) || [];
      
      moyens.forEach((moyen) => {
        const postes = moyen.postes || {};
        
        Object.entries(postes).forEach(([poste, value]) => {
          const refs = Array.isArray(value) ? value : [value];
          
          refs.forEach((ref) => {
            if (!ref || typeof ref !== 'string') return;
            
            const [type, id] = ref.split(':');
            if (!type || !id) return;
            
            // Initialiser les stats si inexistantes
            if (!personnelStats[ref]) {
              personnelStats[ref] = {
                personnelRef: ref,
                personnelId: id,
                personnelType: type as 'stagiaire' | 'manoeuvrant',
                CA: 0,
                COND: 0,
                CE: 0,
                EQ: 0,
                total: 0,
              };
            }
            
            // Incrémenter le compteur du poste
            const basePoste = poste.replace(/\d+$/, ''); // Enlever les suffixes numériques (CE1 -> CE)
            const normalizedPoste = basePoste.toUpperCase() as 'CA' | 'COND' | 'CE' | 'EQ';
            
            if (normalizedPoste in personnelStats[ref]) {
              personnelStats[ref][normalizedPoste]++;
            }
            personnelStats[ref].total++;
            
            // Mettre à jour la date de dernière affectation
            if (!personnelStats[ref].lastAssignment || 
                ticket.date_intervention > personnelStats[ref].lastAssignment!) {
              personnelStats[ref].lastAssignment = ticket.date_intervention;
            }
            
            // Stats globales
            globalStats.totalAffectations++;
            if (normalizedPoste in globalStats.byPoste) {
              globalStats.byPoste[normalizedPoste]++;
            }
          });
        });
      });
    });

    return {
      personnelStats,
      globalStats,
      ticketCount: tickets.length,
    };
  }, [tickets]);

  return {
    ...stats,
    isLoading,
    error,
  };
}

// Hook pour obtenir les stats d'un agent spécifique
export function usePersonnelAffectationStats(
  personnelRef: string,
  sessionId: string | null
) {
  const { personnelStats, isLoading } = useAffectationStats(sessionId);
  
  return {
    stats: personnelStats[personnelRef] || {
      personnelRef,
      personnelId: personnelRef.split(':')[1] || '',
      personnelType: personnelRef.split(':')[0] as 'stagiaire' | 'manoeuvrant',
      CA: 0,
      COND: 0,
      CE: 0,
      EQ: 0,
      total: 0,
    },
    isLoading,
  };
}

// Hook pour récupérer les stats de tous les agents avec leur infos
export function useAllPersonnelWithStats(sessionId: string | null) {
  const { personnelStats, globalStats, isLoading } = useAffectationStats(sessionId);
  
  // Trier par total d'affectations (croissant = ceux qui ont le moins passent en premier)
  const sortedByNeed = useMemo(() => {
    return Object.values(personnelStats).sort((a, b) => a.total - b.total);
  }, [personnelStats]);
  
  return {
    personnelStats,
    globalStats,
    sortedByNeed,
    isLoading,
  };
}
