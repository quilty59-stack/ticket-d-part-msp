import { useMemo } from 'react';
import { usePersonnel, useStagiaires, useManoeuvrants } from './useReferenceData';

interface ResolvedPerson {
  grade_code: string;
  nom: string;
  prenom: string;
  type: 'permanent' | 'stagiaire' | 'manoeuvrant';
}

export function usePersonnelResolver() {
  const { data: personnel = [] } = usePersonnel();
  const { data: stagiaires = [] } = useStagiaires();
  const { data: manoeuvrants = [] } = useManoeuvrants();

  const personnelMap = useMemo(() => {
    const map = new Map<string, ResolvedPerson>();

    personnel.forEach((p) => {
      map.set(`permanent:${p.id}`, {
        grade_code: p.grades?.code || '',
        nom: p.nom,
        prenom: p.prenom,
        type: 'permanent',
      });
    });

    stagiaires.forEach((s) => {
      map.set(`stagiaire:${s.id}`, {
        grade_code: s.grades?.code || '',
        nom: s.nom,
        prenom: s.prenom,
        type: 'stagiaire',
      });
    });

    manoeuvrants.forEach((m) => {
      map.set(`manoeuvrant:${m.id}`, {
        grade_code: m.grades?.code || '',
        nom: m.nom,
        prenom: m.prenom,
        type: 'manoeuvrant',
      });
    });

    return map;
  }, [personnel, stagiaires, manoeuvrants]);

  const resolvePerson = (ref: string): ResolvedPerson | null => {
    return personnelMap.get(ref) || null;
  };

  const formatPersonName = (ref: string): string => {
    const person = resolvePerson(ref);
    if (!person) return '';
    return `${person.grade_code} ${person.nom} ${person.prenom}`.trim();
  };

  const formatPostePersonnel = (value: string | string[] | undefined): string => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.map(formatPersonName).filter(Boolean).join(', ') || '';
    }
    return formatPersonName(value) || '';
  };

  return {
    resolvePerson,
    formatPersonName,
    formatPostePersonnel,
    isLoading: personnel.length === 0 && stagiaires.length === 0 && manoeuvrants.length === 0,
  };
}
