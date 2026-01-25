import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/lib/supabase-types';

export function useTickets() {
  return useQuery({
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
          natures (libelle)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Ticket;
    },
    enabled: !!id,
  });
}
