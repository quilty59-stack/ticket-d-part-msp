import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionFormation {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  date_debut: string | null;
  date_fin: string | null;
  actif: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StagiaireWithSession {
  id: string;
  grade_id: string | null;
  nom: string;
  prenom: string;
  session_id: string | null;
  date_ajout: string;
  created_at: string;
  grades?: {
    id: string;
    code: string;
    libelle: string;
  };
  sessions_formation?: SessionFormation;
}

export interface ManoeuvrantWithSession {
  id: string;
  grade_id: string | null;
  nom: string;
  prenom: string;
  poste: 'CA' | 'COND' | 'CE' | 'EQ';
  session_id: string | null;
  created_at: string;
  grades?: {
    id: string;
    code: string;
    libelle: string;
  };
  sessions_formation?: SessionFormation;
}

export function useSessionsFormation() {
  return useQuery({
    queryKey: ['sessions_formation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions_formation')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SessionFormation[];
    },
  });
}

export function useActiveSessionsFormation() {
  return useQuery({
    queryKey: ['sessions_formation', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions_formation')
        .select('*')
        .eq('actif', true)
        .order('code');
      if (error) throw error;
      return data as SessionFormation[];
    },
  });
}

export function useStagiairesBySession(sessionId: string | null) {
  return useQuery({
    queryKey: ['stagiaires', 'by-session', sessionId],
    queryFn: async () => {
      let query = supabase
        .from('stagiaires')
        .select('*, grades(*), sessions_formation(*)')
        .order('nom');
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as StagiaireWithSession[];
    },
    enabled: sessionId !== undefined,
  });
}

export function useManoeuvrantsBySession(sessionId: string | null) {
  return useQuery({
    queryKey: ['manoeuvrants', 'by-session', sessionId],
    queryFn: async () => {
      let query = supabase
        .from('manoeuvrants')
        .select('*, grades(*), sessions_formation(*)')
        .order('nom');
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ManoeuvrantWithSession[];
    },
    enabled: sessionId !== undefined,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { code: string; nom: string; description?: string; date_debut?: string; date_fin?: string; created_by?: string }) => {
      const { error, data: result } = await supabase
        .from('sessions_formation')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions_formation'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; code?: string; nom?: string; description?: string; date_debut?: string; date_fin?: string; actif?: boolean }) => {
      const { error } = await supabase
        .from('sessions_formation')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions_formation'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First, remove session_id from related stagiaires and manoeuvrants
      await supabase.from('stagiaires').update({ session_id: null }).eq('session_id', id);
      await supabase.from('manoeuvrants').update({ session_id: null }).eq('session_id', id);
      
      const { error } = await supabase
        .from('sessions_formation')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions_formation'] });
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      queryClient.invalidateQueries({ queryKey: ['manoeuvrants'] });
    },
  });
}

export function useAddStagiaireToSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { grade_id?: string | null; nom: string; prenom: string; session_id: string | null }) => {
      const { error } = await supabase.from('stagiaires').insert({
        grade_id: data.grade_id || null,
        nom: data.nom.toUpperCase(),
        prenom: data.prenom,
        session_id: data.session_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
    },
  });
}

export function useAddManoeuvrantToSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { grade_id?: string | null; nom: string; prenom: string; poste: string; session_id: string | null }) => {
      const { error } = await supabase.from('manoeuvrants').insert({
        grade_id: data.grade_id || null,
        nom: data.nom.toUpperCase(),
        prenom: data.prenom,
        poste: data.poste,
        session_id: data.session_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manoeuvrants'] });
    },
  });
}

export function useDeleteStagiaire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stagiaires').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
    },
  });
}

export function useDeleteManoeuvrant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('manoeuvrants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manoeuvrants'] });
    },
  });
}
