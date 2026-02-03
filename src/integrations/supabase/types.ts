export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          actif: boolean | null
          code: string
          couleur: string | null
          created_at: string
          description: string | null
          id: string
          libelle: string
        }
        Insert: {
          actif?: boolean | null
          code: string
          couleur?: string | null
          created_at?: string
          description?: string | null
          id?: string
          libelle: string
        }
        Update: {
          actif?: boolean | null
          code?: string
          couleur?: string | null
          created_at?: string
          description?: string | null
          id?: string
          libelle?: string
        }
        Relationships: []
      }
      centres: {
        Row: {
          actif: boolean | null
          adresse: string | null
          code: string
          commune: string | null
          created_at: string
          id: string
          nom: string
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          code: string
          commune?: string | null
          created_at?: string
          id?: string
          nom: string
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          code?: string
          commune?: string | null
          created_at?: string
          id?: string
          nom?: string
        }
        Relationships: []
      }
      communes: {
        Row: {
          actif: boolean | null
          code: string | null
          code_postal: string | null
          created_at: string
          id: string
          nom: string
        }
        Insert: {
          actif?: boolean | null
          code?: string | null
          code_postal?: string | null
          created_at?: string
          id?: string
          nom: string
        }
        Update: {
          actif?: boolean | null
          code?: string | null
          code_postal?: string | null
          created_at?: string
          id?: string
          nom?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string
          id: string
          libelle: string
          ordre: number
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string
          id?: string
          libelle: string
          ordre?: number
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number
        }
        Relationships: []
      }
      manoeuvrants: {
        Row: {
          created_at: string
          grade_id: string | null
          id: string
          nom: string
          poste: string
          prenom: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          grade_id?: string | null
          id?: string
          nom: string
          poste: string
          prenom: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          grade_id?: string | null
          id?: string
          nom?: string
          poste?: string
          prenom?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manoeuvrants_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manoeuvrants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_formation"
            referencedColumns: ["id"]
          },
        ]
      }
      natures: {
        Row: {
          actif: boolean | null
          categorie_id: string | null
          code: string | null
          created_at: string
          description: string | null
          id: string
          libelle: string
        }
        Insert: {
          actif?: boolean | null
          categorie_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          libelle: string
        }
        Update: {
          actif?: boolean | null
          categorie_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          libelle?: string
        }
        Relationships: [
          {
            foreignKeyName: "natures_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      origines: {
        Row: {
          actif: boolean | null
          created_at: string
          id: string
          libelle: string
        }
        Insert: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle: string
        }
        Update: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle?: string
        }
        Relationships: []
      }
      personnel: {
        Row: {
          actif: boolean | null
          centre_id: string | null
          created_at: string
          grade_id: string | null
          id: string
          matricule: string | null
          nom: string
          prenom: string
          updated_at: string
        }
        Insert: {
          actif?: boolean | null
          centre_id?: string | null
          created_at?: string
          grade_id?: string | null
          id?: string
          matricule?: string | null
          nom: string
          prenom: string
          updated_at?: string
        }
        Update: {
          actif?: boolean | null
          centre_id?: string | null
          created_at?: string
          grade_id?: string | null
          id?: string
          matricule?: string | null
          nom?: string
          prenom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personnel_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions_formation: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string
          created_by: string | null
          date_debut: string | null
          date_fin: string | null
          description: string | null
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string
          created_by?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string
          created_by?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites_temporaires: {
        Row: {
          adresse: string | null
          commune_id: string | null
          complement: string | null
          created_at: string
          created_by: string | null
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          commune_id?: string | null
          complement?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          commune_id?: string | null
          complement?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_temporaires_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
        ]
      }
      stagiaires: {
        Row: {
          created_at: string
          date_ajout: string | null
          grade_id: string | null
          id: string
          nom: string
          prenom: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          date_ajout?: string | null
          grade_id?: string | null
          id?: string
          nom: string
          prenom: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          date_ajout?: string | null
          grade_id?: string | null
          id?: string
          nom?: string
          prenom?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stagiaires_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stagiaires_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_formation"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          appelant: string | null
          categorie_id: string | null
          commune_id: string | null
          complement_adresse: string | null
          complement_nature: string | null
          coordonnees: string | null
          created_at: string
          created_by: string | null
          date_intervention: string
          etat: string | null
          id: string
          moyens: Json
          nature_id: string | null
          nom_voie: string | null
          num_inter: string
          num_voie: string | null
          origine_id: string | null
          pts_eau_indispo: string | null
          renfort: string | null
          rens_compl: string | null
          site_id: string | null
          talkgroup: string | null
          transit: string | null
          type_lieu_id: string | null
          type_voie_id: string | null
          updated_at: string
          victime: string | null
        }
        Insert: {
          appelant?: string | null
          categorie_id?: string | null
          commune_id?: string | null
          complement_adresse?: string | null
          complement_nature?: string | null
          coordonnees?: string | null
          created_at?: string
          created_by?: string | null
          date_intervention?: string
          etat?: string | null
          id?: string
          moyens?: Json
          nature_id?: string | null
          nom_voie?: string | null
          num_inter: string
          num_voie?: string | null
          origine_id?: string | null
          pts_eau_indispo?: string | null
          renfort?: string | null
          rens_compl?: string | null
          site_id?: string | null
          talkgroup?: string | null
          transit?: string | null
          type_lieu_id?: string | null
          type_voie_id?: string | null
          updated_at?: string
          victime?: string | null
        }
        Update: {
          appelant?: string | null
          categorie_id?: string | null
          commune_id?: string | null
          complement_adresse?: string | null
          complement_nature?: string | null
          coordonnees?: string | null
          created_at?: string
          created_by?: string | null
          date_intervention?: string
          etat?: string | null
          id?: string
          moyens?: Json
          nature_id?: string | null
          nom_voie?: string | null
          num_inter?: string
          num_voie?: string | null
          origine_id?: string | null
          pts_eau_indispo?: string | null
          renfort?: string | null
          rens_compl?: string | null
          site_id?: string | null
          talkgroup?: string | null
          transit?: string | null
          type_lieu_id?: string | null
          type_voie_id?: string | null
          updated_at?: string
          victime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_nature_id_fkey"
            columns: ["nature_id"]
            isOneToOne: false
            referencedRelation: "natures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_origine_id_fkey"
            columns: ["origine_id"]
            isOneToOne: false
            referencedRelation: "origines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_type_lieu_id_fkey"
            columns: ["type_lieu_id"]
            isOneToOne: false
            referencedRelation: "types_lieux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_type_voie_id_fkey"
            columns: ["type_voie_id"]
            isOneToOne: false
            referencedRelation: "types_voies"
            referencedColumns: ["id"]
          },
        ]
      }
      types_lieux: {
        Row: {
          actif: boolean | null
          created_at: string
          id: string
          libelle: string
          ordre: number | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle: string
          ordre?: number | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number | null
        }
        Relationships: []
      }
      types_voies: {
        Row: {
          actif: boolean | null
          created_at: string
          id: string
          libelle: string
          ordre: number | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle: string
          ordre?: number | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicules: {
        Row: {
          actif: boolean | null
          centre_id: string | null
          code: string
          created_at: string
          id: string
          immatriculation: string | null
          postes: Json
          taille_equipage: number
          talkgroup: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean | null
          centre_id?: string | null
          code: string
          created_at?: string
          id?: string
          immatriculation?: string | null
          postes?: Json
          taille_equipage?: number
          talkgroup?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean | null
          centre_id?: string | null
          code?: string
          created_at?: string
          id?: string
          immatriculation?: string | null
          postes?: Json
          taille_equipage?: number
          talkgroup?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicules_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
