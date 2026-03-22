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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alert_notifications: {
        Row: {
          alert_id: string | null
          contact_name: string
          id: string
          message_text: string
          phone: string
          sent_at: string
          status: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          alert_id?: string | null
          contact_name: string
          id?: string
          message_text: string
          phone: string
          sent_at?: string
          status?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          alert_id?: string | null
          contact_name?: string
          id?: string
          message_text?: string
          phone?: string
          sent_at?: string
          status?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          guardian_user_id: string | null
          id: string
          media_url: string | null
          message: string
          message_type: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          created_at?: string | null
          guardian_user_id?: string | null
          id?: string
          media_url?: string | null
          message: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          created_at?: string | null
          guardian_user_id?: string | null
          id?: string
          media_url?: string | null
          message?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_escalate: boolean | null
          created_at: string | null
          escalate_delay_minutes: number | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          auto_escalate?: boolean | null
          created_at?: string | null
          escalate_delay_minutes?: number | null
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_escalate?: boolean | null
          created_at?: string | null
          escalate_delay_minutes?: number | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safe_zones: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_24_7: boolean | null
          latitude: number
          longitude: number
          name: string
          phone_number: string | null
          type: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_24_7?: boolean | null
          latitude: number
          longitude: number
          name: string
          phone_number?: string | null
          type: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_24_7?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          phone_number?: string | null
          type?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          address: string | null
          alert_type: string
          created_at: string | null
          detected_keywords: string[] | null
          id: string
          latitude: number | null
          longitude: number | null
          resolved_at: string | null
          status: string | null
          threat_level: string
          user_id: string
        }
        Insert: {
          address?: string | null
          alert_type?: string
          created_at?: string | null
          detected_keywords?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          status?: string | null
          threat_level?: string
          user_id: string
        }
        Update: {
          address?: string | null
          alert_type?: string
          created_at?: string | null
          detected_keywords?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          status?: string | null
          threat_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          name: string
          phone_number: string
          priority: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          name: string
          phone_number: string
          priority?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          name?: string
          phone_number?: string
          priority?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
