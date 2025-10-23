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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          guide_id: string
          id: string
          num_participants: number
          status: string | null
          total_price: number
          tour_id: string
          tourist_id: string
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          guide_id: string
          id?: string
          num_participants: number
          status?: string | null
          total_price: number
          tour_id: string
          tourist_id: string
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          guide_id?: string
          id?: string
          num_participants?: number
          status?: string | null
          total_price?: number
          tour_id?: string
          tourist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          booking_amount: number
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at: string | null
          guide_id: string
          id: string
          platform_earnings: number
          status: string
          tourist_id: string
          updated_at: string | null
        }
        Insert: {
          booking_amount: number
          booking_id: string
          commission_amount: number
          commission_rate?: number
          created_at?: string | null
          guide_id: string
          id?: string
          platform_earnings: number
          status?: string
          tourist_id: string
          updated_at?: string | null
        }
        Update: {
          booking_amount?: number
          booking_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          guide_id?: string
          id?: string
          platform_earnings?: number
          status?: string
          tourist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          license_number: string
          location_lat: number | null
          location_lng: number | null
          rating: number | null
          total_trips: number | null
          updated_at: string | null
          user_id: string
          vehicle_plate: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          license_number: string
          location_lat?: number | null
          location_lng?: number | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_plate: string
          vehicle_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          license_number?: string
          location_lat?: number | null
          location_lng?: number | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_plate?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          created_at: string | null
          document_url: string
          id: string
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_url: string
          id?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          match_reason: string | null
          matched_user_id: string
          similarity_score: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_reason?: string | null
          matched_user_id: string
          similarity_score?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_reason?: string | null
          matched_user_id?: string
          similarity_score?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          guide_id: string
          id: string
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          guide_id: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          guide_id?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          big_five_agreeableness: number | null
          big_five_conscientiousness: number | null
          big_five_extraversion: number | null
          big_five_neuroticism: number | null
          big_five_openness: number | null
          bio: string | null
          created_at: string | null
          full_name: string
          hobbies: string[] | null
          id: string
          languages: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          music_tastes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          big_five_agreeableness?: number | null
          big_five_conscientiousness?: number | null
          big_five_extraversion?: number | null
          big_five_neuroticism?: number | null
          big_five_openness?: number | null
          bio?: string | null
          created_at?: string | null
          full_name: string
          hobbies?: string[] | null
          id?: string
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          music_tastes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          big_five_agreeableness?: number | null
          big_five_conscientiousness?: number | null
          big_five_extraversion?: number | null
          big_five_neuroticism?: number | null
          big_five_openness?: number | null
          bio?: string | null
          created_at?: string | null
          full_name?: string
          hobbies?: string[] | null
          id?: string
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          music_tastes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ride_requests: {
        Row: {
          actual_fare: number | null
          booking_id: string
          created_at: string | null
          driver_id: string | null
          dropoff_lat: number
          dropoff_lng: number
          dropoff_location_name: string
          estimated_fare: number | null
          id: string
          payment_id: string | null
          payment_status: string | null
          pickup_lat: number
          pickup_lng: number
          pickup_location_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_fare?: number | null
          booking_id: string
          created_at?: string | null
          driver_id?: string | null
          dropoff_lat: number
          dropoff_lng: number
          dropoff_location_name: string
          estimated_fare?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          pickup_lat: number
          pickup_lng: number
          pickup_location_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_fare?: number | null
          booking_id?: string
          created_at?: string | null
          driver_id?: string | null
          dropoff_lat?: number
          dropoff_lng?: number
          dropoff_location_name?: string
          estimated_fare?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          pickup_lat?: number
          pickup_lng?: number
          pickup_location_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          created_at: string | null
          description: string
          difficulty_level: string | null
          duration_hours: number
          guide_id: string
          id: string
          images: string[] | null
          included_items: string[] | null
          is_active: boolean | null
          languages: string[] | null
          location_lat: number
          location_lng: number
          location_name: string
          max_participants: number
          price_per_person: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          duration_hours: number
          guide_id: string
          id?: string
          images?: string[] | null
          included_items?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          location_lat: number
          location_lng: number
          location_name: string
          max_participants: number
          price_per_person: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          duration_hours?: number
          guide_id?: string
          id?: string
          images?: string[] | null
          included_items?: string[] | null
          is_active?: boolean | null
          languages?: string[] | null
          location_lat?: number
          location_lng?: number
          location_name?: string
          max_participants?: number
          price_per_person?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_embeddings: {
        Row: {
          created_at: string | null
          embedding_data: string
          id: string
          interests_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          embedding_data: string
          id?: string
          interests_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          embedding_data?: string
          id?: string
          interests_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          likes: number | null
          thumbnail_url: string | null
          title: string
          tour_id: string | null
          updated_at: string | null
          user_id: string
          video_url: string
          views: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title: string
          tour_id?: string | null
          updated_at?: string | null
          user_id: string
          video_url: string
          views?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title?: string
          tour_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
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
      app_role: "tourist" | "guide" | "admin"
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
      app_role: ["tourist", "guide", "admin"],
    },
  },
} as const
