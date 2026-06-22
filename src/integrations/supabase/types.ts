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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          creci: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      developments: {
        Row: {
          address: string | null
          builder: string | null
          city: string | null
          construction_status: string | null
          cover_image: string | null
          created_at: string
          delivery_date: string | null
          description: string | null
          differentials: Json
          gallery: Json
          id: string
          is_featured: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          map_embed: string | null
          name: string
          neighborhood: string | null
          price_from: number | null
          price_to: number | null
          published: boolean
          slug: string
          units_count: number | null
          updated_at: string
          videos: Json
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          builder?: string | null
          city?: string | null
          construction_status?: string | null
          cover_image?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          differentials?: Json
          gallery?: Json
          id?: string
          is_featured?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          map_embed?: string | null
          name: string
          neighborhood?: string | null
          price_from?: number | null
          price_to?: number | null
          published?: boolean
          slug: string
          units_count?: number | null
          updated_at?: string
          videos?: Json
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          builder?: string | null
          city?: string | null
          construction_status?: string | null
          cover_image?: string | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          differentials?: Json
          gallery?: Json
          id?: string
          is_featured?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          map_embed?: string | null
          name?: string
          neighborhood?: string | null
          price_from?: number | null
          price_to?: number | null
          published?: boolean
          slug?: string
          units_count?: number | null
          updated_at?: string
          videos?: Json
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          property_interest: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          property_interest?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          property_interest?: string | null
          source?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agent_id: string | null
          archived: boolean
          bathrooms: number | null
          bedrooms: number | null
          built_area: number | null
          city: string
          condo_fee: number | null
          cover_image: string | null
          created_at: string
          description: string | null
          features: Json
          gallery: Json
          id: string
          iptu: number | null
          is_featured: boolean
          is_launch: boolean
          is_mcmv: boolean
          is_new: boolean
          is_opportunity: boolean
          land_area: number | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number | null
          property_type: string
          published: boolean
          reference: string | null
          slug: string
          state: string | null
          status: string
          suites: number | null
          title: string
          total_area: number | null
          transaction_type: string
          updated_at: string
          videos: Json
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          archived?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string
          condo_fee?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          gallery?: Json
          id?: string
          iptu?: number | null
          is_featured?: boolean
          is_launch?: boolean
          is_mcmv?: boolean
          is_new?: boolean
          is_opportunity?: boolean
          land_area?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_type: string
          published?: boolean
          reference?: string | null
          slug: string
          state?: string | null
          status?: string
          suites?: number | null
          title: string
          total_area?: number | null
          transaction_type?: string
          updated_at?: string
          videos?: Json
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          archived?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string
          condo_fee?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          gallery?: Json
          id?: string
          iptu?: number | null
          is_featured?: boolean
          is_launch?: boolean
          is_mcmv?: boolean
          is_new?: boolean
          is_opportunity?: boolean
          land_area?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_type?: string
          published?: boolean
          reference?: string | null
          slug?: string
          state?: string | null
          status?: string
          suites?: number | null
          title?: string
          total_area?: number | null
          transaction_type?: string
          updated_at?: string
          videos?: Json
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
          role: Database["public"]["Enums"]["app_role"]
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
      slugify: { Args: { v: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
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
