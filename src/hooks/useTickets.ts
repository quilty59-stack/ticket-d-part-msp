import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/lib/supabase-types';

export function useTickets(sessionFilter?: string | null) {
  return useQuery({
    queryKey: ['tickets', sessionFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          origines (libelle),
          communes (nom, code_postal),
          types_lieux (libelle),
          types_voies (libelle),
          categories (code, libelle, couleur),
          natures (libelle),
          sessions_formation (id, code, nom)
        `)
        .order('created_at', { ascending: false });

      if (sessionFilter) {
        query = query.eq('session_id', sessionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Ticket[];
    },
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          origines (libelle),
          communes (nom, code_postal),
          types_lieux (libelle),
          types_voies (libelle),
          categories (code, libelle, couleur),
          natures (libelle),
          sessions_formation (id, code, nom)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Ticket;
    },
    enabled: !!id,
  });
}
