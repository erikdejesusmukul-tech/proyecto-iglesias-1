export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      churches: {
        Row: {
          id: string;
          name: string;
          slug: string;
          legal_registration_number: string | null;
          verification_status: Database["public"]["Enums"]["verification_status"];
          verification_document_url: string | null;
          logo_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          short: string;
          tagline: string;
          image: string;
          founded: string;
          map_query: string;
          history: string[];
          capillas: Json;
          horarios: Json;
          contacto: Json;
          objetos: Json;
          eventos: Json;
          libros: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          legal_registration_number?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verification_document_url?: string | null;
          logo_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          short: string;
          tagline: string;
          image: string;
          founded: string;
          map_query: string;
          history?: string[];
          capillas?: Json;
          horarios?: Json;
          contacto?: Json;
          objetos?: Json;
          eventos?: Json;
          libros?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          legal_registration_number?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verification_document_url?: string | null;
          logo_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          short?: string;
          tagline?: string;
          image?: string;
          founded?: string;
          map_query?: string;
          history?: string[];
          capillas?: Json;
          horarios?: Json;
          contacto?: Json;
          objetos?: Json;
          eventos?: Json;
          libros?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          church_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          church_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          church_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          church_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["member_status"];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["member_status"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["member_status"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      ministries: {
        Row: {
          id: string;
          church_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          church_id: string;
          name: string;
          description: string | null;
          event_date: string;
          event_time: string;
          ministry_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          name: string;
          description?: string | null;
          event_date: string;
          event_time: string;
          ministry_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          name?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string;
          ministry_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_ministry_id_fkey";
            columns: ["ministry_id"];
            isOneToOne: false;
            referencedRelation: "ministries";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          id: string;
          church_id: string;
          event_id: string;
          member_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          event_id: string;
          member_id: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          event_id?: string;
          member_id?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          church_id: string;
          type: Database["public"]["Enums"]["transaction_type"];
          category: string;
          amount: string;
          transaction_date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          type: Database["public"]["Enums"]["transaction_type"];
          category: string;
          amount: string;
          transaction_date: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          type?: Database["public"]["Enums"]["transaction_type"];
          category?: string;
          amount?: string;
          transaction_date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      register_church: {
        Args: {
          p_name: string;
          p_slug: string;
          p_legal_registration_number?: string | null;
          p_contact_email?: string | null;
          p_contact_phone?: string | null;
          p_address?: string | null;
          p_verification_document_url?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role:
        | "superadmin"
        | "admin"
        | "pastor"
        | "secretario"
        | "tesorero"
        | "coordinador"
        | "miembro"
        | "usuario_web";
      verification_status: "unverified" | "pending_review" | "verified" | "rejected";
      member_status: "activo" | "inactivo";
      attendance_status: "presente" | "ausente" | "justificado";
      transaction_type: "ingreso" | "egreso";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "superadmin",
        "admin",
        "pastor",
        "secretario",
        "tesorero",
        "coordinador",
        "miembro",
        "usuario_web",
      ],
      verification_status: ["unverified", "pending_review", "verified", "rejected"],
      member_status: ["activo", "inactivo"],
      attendance_status: ["presente", "ausente", "justificado"],
      transaction_type: ["ingreso", "egreso"],
    },
  },
} as const;
