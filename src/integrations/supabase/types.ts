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
      ai_editor_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          model: string | null
          prompt: string | null
          response: string | null
          target_row_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt?: string | null
          response?: string | null
          target_row_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt?: string | null
          response?: string | null
          target_row_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          address: string
          company_name: string
          created_at: string
          cta_request_label: string | null
          cta_reserve_label: string | null
          email: string
          hero_video_url: string | null
          hours: string
          id: string
          maintenance_mode: boolean
          phone: string
          show_prices: boolean
          updated_at: string
        }
        Insert: {
          address: string
          company_name: string
          created_at?: string
          cta_request_label?: string | null
          cta_reserve_label?: string | null
          email: string
          hero_video_url?: string | null
          hours: string
          id?: string
          maintenance_mode?: boolean
          phone: string
          show_prices?: boolean
          updated_at?: string
        }
        Update: {
          address?: string
          company_name?: string
          created_at?: string
          cta_request_label?: string | null
          cta_reserve_label?: string | null
          email?: string
          hero_video_url?: string | null
          hours?: string
          id?: string
          maintenance_mode?: boolean
          phone?: string
          show_prices?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_note: string | null
          created_at: string
          customer_name: string
          email: string
          end_date: string
          id: string
          message: string | null
          phone: string
          start_date: string
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          customer_name: string
          email: string
          end_date: string
          id?: string
          message?: string | null
          phone: string
          start_date: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          customer_name?: string
          email?: string
          end_date?: string
          id?: string
          message?: string | null
          phone?: string
          start_date?: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          after: Json | null
          before: Json | null
          created_at: string
          editor_user_id: string
          id: string
          reverted_at: string | null
          row_id: string
          source: string
          table_name: string
        }
        Insert: {
          after?: Json | null
          before?: Json | null
          created_at?: string
          editor_user_id: string
          id?: string
          reverted_at?: string | null
          row_id: string
          source?: string
          table_name: string
        }
        Update: {
          after?: Json | null
          before?: Json | null
          created_at?: string
          editor_user_id?: string
          id?: string
          reverted_at?: string | null
          row_id?: string
          source?: string
          table_name?: string
        }
        Relationships: []
      }
      site_flags: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
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
      vehicles: {
        Row: {
          available: boolean
          category: string
          color: string | null
          created_at: string
          deposit: number | null
          description: string | null
          engine: string | null
          extra_km_price: number | null
          features: string[] | null
          free_km: number | null
          id: string
          images: string[] | null
          min_age: number | null
          min_license_years: number | null
          name: string
          power_ps: number | null
          price_12h: number | null
          price_24h: number | null
          price_3h: number | null
          price_6h: number | null
          price_per_day: number
          sort_order: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          available?: boolean
          category: string
          color?: string | null
          created_at?: string
          deposit?: number | null
          description?: string | null
          engine?: string | null
          extra_km_price?: number | null
          features?: string[] | null
          free_km?: number | null
          id?: string
          images?: string[] | null
          min_age?: number | null
          min_license_years?: number | null
          name: string
          power_ps?: number | null
          price_12h?: number | null
          price_24h?: number | null
          price_3h?: number | null
          price_6h?: number | null
          price_per_day?: number
          sort_order?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          available?: boolean
          category?: string
          color?: string | null
          created_at?: string
          deposit?: number | null
          description?: string | null
          engine?: string | null
          extra_km_price?: number | null
          features?: string[] | null
          free_km?: number | null
          id?: string
          images?: string[] | null
          min_age?: number | null
          min_license_years?: number | null
          name?: string
          power_ps?: number | null
          price_12h?: number | null
          price_24h?: number | null
          price_3h?: number | null
          price_6h?: number | null
          price_per_day?: number
          sort_order?: number | null
          updated_at?: string
          year?: number | null
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
      set_maintenance_mode: { Args: { _enabled: boolean }; Returns: boolean }
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
