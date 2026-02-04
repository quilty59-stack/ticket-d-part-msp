// Types personnalisés pour la base de données

export interface Grade {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface Centre {
  id: string;
  code: string;
  nom: string;
  adresse: string | null;
  commune: string | null;
  actif: boolean;
  created_at: string;
}

export interface Categorie {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  couleur: string;
  actif: boolean;
  created_at: string;
}

export interface Commune {
  id: string;
  code: string | null;
  nom: string;
  code_postal: string | null;
  actif: boolean;
  created_at: string;
}

export interface Nature {
  id: string;
  libelle: string;
  code: string | null;
  categorie_id: string | null;
  description: string | null;
  actif: boolean;
  created_at: string;
  categories?: Categorie;
}

export interface TypeLieu {
  id: string;
  libelle: string;
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface TypeVoie {
  id: string;
  libelle: string;
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface Origine {
  id: string;
  libelle: string;
  actif: boolean;
  created_at: string;
}

export interface Vehicule {
  id: string;
  code: string;
  type: string | null;
  immatriculation: string | null;
  centre_id: string | null;
  taille_equipage: number;
  postes: Record<string, number>;
  talkgroup: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
  centres?: Centre;
}

export interface Personnel {
  id: string;
  matricule: string | null;
  grade_id: string | null;
  nom: string;
  prenom: string;
  centre_id: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
  grades?: Grade;
  centres?: Centre;
}

export interface Stagiaire {
  id: string;
  grade_id: string | null;
  nom: string;
  prenom: string;
  date_ajout: string;
  session_id: string | null;
  created_at: string;
  grades?: Grade;
}

export interface Manoeuvrant {
  id: string;
  grade_id: string | null;
  nom: string;
  prenom: string;
  poste: 'CA' | 'COND' | 'CE' | 'EQ';
  session_id: string | null;
  created_at: string;
  grades?: Grade;
}

export interface MoyenAffecte {
  vehicule_id: string;
  vehicule_code: string;
  postes: Record<string, string | string[]>; // poste -> personnel_id ou stagiaire_id
}

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

export interface Ticket {
  id: string;
  num_inter: string;
  date_intervention: string;
  origine_id: string | null;
  commune_id: string | null;
  type_lieu_id: string | null;
  num_voie: string | null;
  type_voie_id: string | null;
  nom_voie: string | null;
  complement_adresse: string | null;
  coordonnees: string | null;
  categorie_id: string | null;
  nature_id: string | null;
  complement_nature: string | null;
  rens_compl: string | null;
  appelant: string | null;
  victime: string | null;
  pts_eau_indispo: string | null;
  transit: string | null;
  talkgroup: string | null;
  renfort: string | null;
  moyens: MoyenAffecte[];
  etat: 'brouillon' | 'valide';
  created_by: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  origines?: Origine;
  communes?: Commune;
  types_lieux?: TypeLieu;
  types_voies?: TypeVoie;
  categories?: Categorie;
  natures?: Nature;
  sessions_formation?: SessionFormation;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Type pour le personnel disponible (combiné) - inclut permanents, stagiaires et manœuvrants
export interface PersonnelDisponible {
  id: string;
  type: 'permanent' | 'stagiaire' | 'manoeuvrant';
  grade_code: string;
  grade_libelle: string;
  nom: string;
  prenom: string;
  poste?: 'CA' | 'COND' | 'CE' | 'EQ'; // Uniquement pour les manœuvrants
  session_code?: string; // Code de la session d'appartenance
  isAffected?: boolean;
}
