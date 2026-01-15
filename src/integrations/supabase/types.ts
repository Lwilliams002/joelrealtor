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
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          listing_id: string | null
          message: string | null
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          listing_id?: string | null
          message?: string | null
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          device_json: Json | null
          event_type: string
          geo_json: Json | null
          id: string
          listing_id: string | null
          page_path: string | null
          referrer: string | null
          session_id: string | null
          utm_json: Json | null
        }
        Insert: {
          created_at?: string
          device_json?: Json | null
          event_type: string
          geo_json?: Json | null
          id?: string
          listing_id?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_json?: Json | null
        }
        Update: {
          created_at?: string
          device_json?: Json | null
          event_type?: string
          geo_json?: Json | null
          id?: string
          listing_id?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          listing_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          listing_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          listing_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string
          baths: number | null
          beds: number | null
          city: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          features_json: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          lot_size: string | null
          mls_number: string | null
          open_house_schedule: Json | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          published: boolean
          slug: string
          source: Database["public"]["Enums"]["listing_source"]
          sqft: number | null
          state: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          user_id: string
          zillow_url: string | null
          zip: string
        }
        Insert: {
          address: string
          baths?: number | null
          beds?: number | null
          city: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          features_json?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_size?: string | null
          mls_number?: string | null
          open_house_schedule?: Json | null
          price: number
          property_type?: Database["public"]["Enums"]["property_type"]
          published?: boolean
          slug: string
          source?: Database["public"]["Enums"]["listing_source"]
          sqft?: number | null
          state: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          user_id: string
          zillow_url?: string | null
          zip: string
        }
        Update: {
          address?: string
          baths?: number | null
          beds?: number | null
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          features_json?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_size?: string | null
          mls_number?: string | null
          open_house_schedule?: Json | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          published?: boolean
          slug?: string
          source?: Database["public"]["Enums"]["listing_source"]
          sqft?: number | null
          state?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          user_id?: string
          zillow_url?: string | null
          zip?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          daily_digest: boolean
          immediate_email: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          created_at?: string
          daily_digest?: boolean
          immediate_email?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          created_at?: string
          daily_digest?: boolean
          immediate_email?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      realtor_profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          headshot_url: string | null
          id: string
          name: string
          phone: string | null
          social_links: Json | null
          updated_at: string
          zillow_profile_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          headshot_url?: string | null
          id: string
          name?: string
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          zillow_profile_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          headshot_url?: string | null
          id?: string
          name?: string
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          zillow_profile_url?: string | null
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
      is_listing_owner: { Args: { _listing_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      listing_source: "manual" | "idx" | "csv"
      listing_status: "for_sale" | "for_rent" | "sold" | "pending"
      property_type:
        | "house"
        | "condo"
        | "townhouse"
        | "land"
        | "multi_family"
        | "commercial"
        | "other"
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
      listing_source: ["manual", "idx", "csv"],
      listing_status: ["for_sale", "for_rent", "sold", "pending"],
      property_type: [
        "house",
        "condo",
        "townhouse",
        "land",
        "multi_family",
        "commercial",
        "other",
      ],
    },
  },
} as const
