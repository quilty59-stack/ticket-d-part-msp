import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Grade, Centre, Categorie, Commune, Nature, 
  TypeLieu, TypeVoie, Origine, Vehicule, Personnel, Stagiaire, Manoeuvrant 
} from '@/lib/supabase-types';

export function useGrades() {
  return useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('actif', true)
        .order('ordre');
      if (error) throw error;
      return data as Grade[];
    },
  });
}

export function useCentres() {
  return useQuery({
    queryKey: ['centres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centres')
        .select('*')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return data as Centre[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('actif', true)
        .order('libelle');
      if (error) throw error;
      return data as Categorie[];
    },
  });
}

export function useCommunes() {
  return useQuery({
    queryKey: ['communes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communes')
        .select('*')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return data as Commune[];
    },
  });
}

export function useNatures(categorieId?: string) {
  return useQuery({
    queryKey: ['natures', categorieId],
    queryFn: async () => {
      let query = supabase
        .from('natures')
        .select('*, categories(*)')
        .eq('actif', true)
        .order('libelle');
      
      if (categorieId) {
        query = query.eq('categorie_id', categorieId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Nature[];
    },
  });
}

export function useTypesLieux() {
  return useQuery({
    queryKey: ['types_lieux'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('types_lieux')
        .select('*')
        .eq('actif', true)
        .order('ordre');
      if (error) throw error;
      return data as TypeLieu[];
    },
  });
}

export function useTypesVoies() {
  return useQuery({
    queryKey: ['types_voies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('types_voies')
        .select('*')
        .eq('actif', true)
        .order('ordre');
      if (error) throw error;
      return data as TypeVoie[];
    },
  });
}

export function useOrigines() {
  return useQuery({
    queryKey: ['origines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('origines')
        .select('*')
        .eq('actif', true)
        .order('libelle');
      if (error) throw error;
      return data as Origine[];
    },
  });
}

export function useVehicules() {
  return useQuery({
    queryKey: ['vehicules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicules')
        .select('*, centres(*)')
        .eq('actif', true)
        .order('code');
      if (error) throw error;
      return data as Vehicule[];
    },
  });
}

export function usePersonnel() {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select('*, grades(*), centres(*)')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return data as Personnel[];
    },
  });
}

export function useStagiaires() {
  return useQuery({
    queryKey: ['stagiaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stagiaires')
        .select('*, grades(*)')
        .order('nom');
      if (error) throw error;
      return data as Stagiaire[];
    },
  });
}

export function useManoeuvrants() {
  return useQuery({
    queryKey: ['manoeuvrants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manoeuvrants' as never)
        .select('*, grades(*)')
        .order('nom');
      if (error) throw error;
      return data as unknown as Manoeuvrant[];
    },
  });
}
