export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      labels: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      releases: {
        Row: {
          artwork_url: string | null
          catalog_number: string | null
          copyright_line: string | null
          created_at: string | null
          created_by: string | null
          featured_artists: string[] | null
          format: string | null
          genre: string | null
          id: string
          label: string | null
          metadata_language: string | null
          presave_date: string | null
          presave_option: string | null
          pricing: string | null
          primary_artists: string[] | null
          publisher_name: string | null
          publishing_type: string | null
          release_date: string | null
          release_name: string
          sales_start_date: string | null
          selected_services: string[] | null
          selected_territories: string[] | null
          status: Database["public"]["Enums"]["release_status"] | null
          subgenre: string | null
          upc: string | null
          updated_at: string | null
        }
        Insert: {
          artwork_url?: string | null
          catalog_number?: string | null
          copyright_line?: string | null
          created_at?: string | null
          created_by?: string | null
          featured_artists?: string[] | null
          format?: string | null
          genre?: string | null
          id?: string
          label?: string | null
          metadata_language?: string | null
          presave_date?: string | null
          presave_option?: string | null
          pricing?: string | null
          primary_artists?: string[] | null
          publisher_name?: string | null
          publishing_type?: string | null
          release_date?: string | null
          release_name: string
          sales_start_date?: string | null
          selected_services?: string[] | null
          selected_territories?: string[] | null
          status?: Database["public"]["Enums"]["release_status"] | null
          subgenre?: string | null
          upc?: string | null
          updated_at?: string | null
        }
        Update: {
          artwork_url?: string | null
          catalog_number?: string | null
          copyright_line?: string | null
          created_at?: string | null
          created_by?: string | null
          featured_artists?: string[] | null
          format?: string | null
          genre?: string | null
          id?: string
          label?: string | null
          metadata_language?: string | null
          presave_date?: string | null
          presave_option?: string | null
          pricing?: string | null
          primary_artists?: string[] | null
          publisher_name?: string | null
          publishing_type?: string | null
          release_date?: string | null
          release_name?: string
          sales_start_date?: string | null
          selected_services?: string[] | null
          selected_territories?: string[] | null
          status?: Database["public"]["Enums"]["release_status"] | null
          subgenre?: string | null
          upc?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_initial_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_roles: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          role_to_check: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "regular_user" | "label_admin" | "moderator" | "system_admin"
      release_status: "In Progress" | "Ready" | "Moderation" | "Sent to Stores"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
