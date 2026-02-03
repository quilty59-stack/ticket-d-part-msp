import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteTemporaire {
  id: string;
  nom: string;
  adresse: string | null;
  commune_id: string | null;
  complement: string | null;
  commune?: {
    id: string;
    nom: string;
    code_postal: string | null;
  } | null;
}

export function useSitesTemporaires() {
  return useQuery({
    queryKey: ['sites-temporaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites_temporaires')
        .select(`
          id,
          nom,
          adresse,
          commune_id,
          complement,
          communes:commune_id (
            id,
            nom,
            code_postal
          )
        `)
        .order('nom');

      if (error) throw error;

      return (data || []).map((site) => ({
        id: site.id,
        nom: site.nom,
        adresse: site.adresse,
        commune_id: site.commune_id,
        complement: site.complement,
        commune: Array.isArray(site.communes) ? site.communes[0] : site.communes,
      })) as SiteTemporaire[];
    },
  });
}

export function useCreateSiteTemporaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nom: string;
      adresse?: string;
      commune_id?: string;
      complement?: string;
    }) => {
      const { data: site, error } = await supabase
        .from('sites_temporaires')
        .insert({
          nom: data.nom,
          adresse: data.adresse || null,
          commune_id: data.commune_id || null,
          complement: data.complement || null,
        })
        .select()
        .single();

      if (error) throw error;
      return site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-temporaires'] });
    },
  });
}

export function useUpdateSiteTemporaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      nom: string;
      adresse?: string;
      commune_id?: string;
      complement?: string;
    }) => {
      const { data: site, error } = await supabase
        .from('sites_temporaires')
        .update({
          nom: data.nom,
          adresse: data.adresse || null,
          commune_id: data.commune_id || null,
          complement: data.complement || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-temporaires'] });
    },
  });
}

export function useDeleteSiteTemporaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sites_temporaires')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-temporaires'] });
    },
  });
}
