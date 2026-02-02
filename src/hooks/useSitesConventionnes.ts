import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteConventionne {
  id: string;
  name: string;
  address?: string | null;
  commune?: string | null;
  postal_code?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  site_type?: string | null;
  created_at?: string;
}

export function useSitesConventionnes() {
  return useQuery({
    queryKey: ['sites-conventionnes'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-sites-conventionnes');
      
      if (error) {
        console.error('Error fetching sites:', error);
        throw error;
      }
      
      return (data?.sites || []) as SiteConventionne[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
