export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          date_of_birth: string
          room_number: string | null
          facility_name: string | null
          facility_phone: string | null
          facility_address: string | null
          admission_date: string | null
          primary_diagnosis: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date_of_birth: string
          room_number?: string | null
          facility_name?: string | null
          facility_phone?: string | null
          facility_address?: string | null
          admission_date?: string | null
          primary_diagnosis?: string | null
          photo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          date_of_birth?: string
          room_number?: string | null
          facility_name?: string | null
          facility_phone?: string | null
          facility_address?: string | null
          admission_date?: string | null
          primary_diagnosis?: string | null
          photo_url?: string | null
        }
      }
      care_circle_members: {
        Row: {
          id: string
          patient_id: string
          name: string
          email: string
          phone: string | null
          role: string
          relationship: string | null
          avatar: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          email: string
          phone?: string | null
          role: string
          relationship?: string | null
          avatar?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: string
          relationship?: string | null
          avatar?: string | null
          joined_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          patient_id: string
          title: string
          description: string | null
          type: string
          date: string
          time: string | null
          end_time: string | null
          location: string | null
          patient_mood: string | null
          visit_window: boolean
          claimed_by: string | null
          claimed_by_name: string | null
          created_by: string
          created_at: string
          reminder: number | null
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          description?: string | null
          type: string
          date: string
          time?: string | null
          end_time?: string | null
          location?: string | null
          patient_mood?: string | null
          visit_window?: boolean
          claimed_by?: string | null
          claimed_by_name?: string | null
          created_by: string
          reminder?: number | null
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          description?: string | null
          type?: string
          date?: string
          time?: string | null
          end_time?: string | null
          location?: string | null
          patient_mood?: string | null
          visit_window?: boolean
          claimed_by?: string | null
          claimed_by_name?: string | null
          created_by?: string
          reminder?: number | null
        }
      }
      insurance_cards: {
        Row: {
          id: string
          patient_id: string
          name: string
          member_id: string
          group_number: string | null
          front_image_url: string | null
          back_image_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          member_id: string
          group_number?: string | null
          front_image_url?: string | null
          back_image_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          member_id?: string
          group_number?: string | null
          front_image_url?: string | null
          back_image_url?: string | null
          notes?: string | null
        }
      }
      medications: {
        Row: {
          id: string
          patient_id: string
          name: string
          dosage: string
          frequency: string
          prescribed_by: string | null
          start_date: string | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          dosage: string
          frequency: string
          prescribed_by?: string | null
          start_date?: string | null
          notes?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          dosage?: string
          frequency?: string
          prescribed_by?: string | null
          start_date?: string | null
          notes?: string | null
          active?: boolean
        }
      }
      provider_contacts: {
        Row: {
          id: string
          patient_id: string
          name: string
          specialty: string
          phone: string
          address: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          specialty: string
          phone: string
          address?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          specialty?: string
          phone?: string
          address?: string | null
          notes?: string | null
        }
      }
      facility_info: {
        Row: {
          id: string
          patient_id: string
          room_number: string | null
          floor: string | null
          wing: string | null
          facility_name: string | null
          facility_phone: string | null
          facility_address: string | null
          nurse_station: string | null
          visiting_hours: string | null
          wifi_network: string | null
          wifi_password: string | null
          parking_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          room_number?: string | null
          floor?: string | null
          wing?: string | null
          facility_name?: string | null
          facility_phone?: string | null
          facility_address?: string | null
          nurse_station?: string | null
          visiting_hours?: string | null
          wifi_network?: string | null
          wifi_password?: string | null
          parking_info?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          room_number?: string | null
          floor?: string | null
          wing?: string | null
          facility_name?: string | null
          facility_phone?: string | null
          facility_address?: string | null
          nurse_station?: string | null
          visiting_hours?: string | null
          wifi_network?: string | null
          wifi_password?: string | null
          parking_info?: string | null
        }
      }
      vault_documents: {
        Row: {
          id: string
          patient_id: string
          name: string
          category: string
          file_url: string | null
          file_type: string | null
          file_size: number | null
          uploaded_by: string
          uploaded_by_name: string
          uploaded_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          category: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          uploaded_by: string
          uploaded_by_name: string
          notes?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          category?: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string
          uploaded_by_name?: string
          notes?: string | null
        }
      }
      log_entries: {
        Row: {
          id: string
          patient_id: string
          category: string
          title: string
          notes: string | null
          entered_by: string
          entered_by_name: string
          entered_by_role: string
          created_at: string
          photos: string[]
        }
        Insert: {
          id?: string
          patient_id: string
          category: string
          title: string
          notes?: string | null
          entered_by: string
          entered_by_name: string
          entered_by_role: string
          photos?: string[]
        }
        Update: {
          id?: string
          patient_id?: string
          category?: string
          title?: string
          notes?: string | null
          entered_by?: string
          entered_by_name?: string
          entered_by_role?: string
          photos?: string[]
        }
      }
      vitals_data: {
        Row: {
          id: string
          log_entry_id: string
          blood_pressure_systolic: number | null
          blood_pressure_diastolic: number | null
          heart_rate: number | null
          temperature: number | null
          oxygen_saturation: number | null
          weight: number | null
          respiratory_rate: number | null
        }
        Insert: {
          id?: string
          log_entry_id: string
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          heart_rate?: number | null
          temperature?: number | null
          oxygen_saturation?: number | null
          weight?: number | null
          respiratory_rate?: number | null
        }
        Update: {
          id?: string
          log_entry_id?: string
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          heart_rate?: number | null
          temperature?: number | null
          oxygen_saturation?: number | null
          weight?: number | null
          respiratory_rate?: number | null
        }
      }
      medication_log_data: {
        Row: {
          id: string
          log_entry_id: string
          medication_name: string
          dosage: string
          route: string | null
          administered_by: string
        }
        Insert: {
          id?: string
          log_entry_id: string
          medication_name: string
          dosage: string
          route?: string | null
          administered_by: string
        }
        Update: {
          id?: string
          log_entry_id?: string
          medication_name?: string
          dosage?: string
          route?: string | null
          administered_by?: string
        }
      }
      activity_log_data: {
        Row: {
          id: string
          log_entry_id: string
          activity_type: string
          description: string
          duration: number | null
          participation: string | null
        }
        Insert: {
          id?: string
          log_entry_id: string
          activity_type: string
          description: string
          duration?: number | null
          participation?: string | null
        }
        Update: {
          id?: string
          log_entry_id?: string
          activity_type?: string
          description?: string
          duration?: number | null
          participation?: string | null
        }
      }
      mood_log_data: {
        Row: {
          id: string
          log_entry_id: string
          mood: string
          alertness: string
          appetite: string
          pain_level: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          log_entry_id: string
          mood: string
          alertness: string
          appetite: string
          pain_level?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          log_entry_id?: string
          mood?: string
          alertness?: string
          appetite?: string
          pain_level?: number | null
          notes?: string | null
        }
      }
      incident_log_data: {
        Row: {
          id: string
          log_entry_id: string
          incident_type: string
          severity: string
          description: string
          action_taken: string
          physician_notified: boolean
          family_notified: boolean
        }
        Insert: {
          id?: string
          log_entry_id: string
          incident_type: string
          severity: string
          description: string
          action_taken: string
          physician_notified?: boolean
          family_notified?: boolean
        }
        Update: {
          id?: string
          log_entry_id?: string
          incident_type?: string
          severity?: string
          description?: string
          action_taken?: string
          physician_notified?: boolean
          family_notified?: boolean
        }
      }
      log_comments: {
        Row: {
          id: string
          log_entry_id: string
          author_id: string
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          log_entry_id: string
          author_id: string
          author_name: string
          content: string
        }
        Update: {
          id?: string
          log_entry_id?: string
          author_id?: string
          author_name?: string
          content?: string
        }
      }
      feed_posts: {
        Row: {
          id: string
          patient_id: string
          author_id: string
          author_name: string
          author_initials: string
          author_role: string
          content: string
          post_type: string
          media: Json
          location: string | null
          tagged_members: string[]
          likes: string[]
          created_at: string
          is_pinned: boolean
        }
        Insert: {
          id?: string
          patient_id: string
          author_id: string
          author_name: string
          author_initials: string
          author_role: string
          content: string
          post_type: string
          media?: Json
          location?: string | null
          tagged_members?: string[]
          likes?: string[]
          is_pinned?: boolean
        }
        Update: {
          id?: string
          patient_id?: string
          author_id?: string
          author_name?: string
          author_initials?: string
          author_role?: string
          content?: string
          post_type?: string
          media?: Json
          location?: string | null
          tagged_members?: string[]
          likes?: string[]
          is_pinned?: boolean
        }
      }
      feed_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          author_name: string
          content: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          author_name?: string
          content?: string
        }
      }
      visits: {
        Row: {
          id: string
          patient_id: string
          visitor_id: string
          visitor_name: string
          visitor_relationship: string | null
          check_in_time: string
          check_out_time: string | null
          duration: number | null
          mood: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          visitor_id: string
          visitor_name: string
          visitor_relationship?: string | null
          check_in_time: string
          check_out_time?: string | null
          duration?: number | null
          mood?: string | null
          note?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          visitor_id?: string
          visitor_name?: string
          visitor_relationship?: string | null
          check_in_time?: string
          check_out_time?: string | null
          duration?: number | null
          mood?: string | null
          note?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          patient_id: string
          type: string
          title: string
          message: string
          source_id: string | null
          source_type: string | null
          created_at: string
          read_by: string[]
        }
        Insert: {
          id?: string
          patient_id: string
          type: string
          title: string
          message: string
          source_id?: string | null
          source_type?: string | null
          read_by?: string[]
        }
        Update: {
          id?: string
          patient_id?: string
          type?: string
          title?: string
          message?: string
          source_id?: string | null
          source_type?: string | null
          read_by?: string[]
        }
      }
      wellness_days: {
        Row: {
          id: string
          patient_id: string
          date: string
          overall_score: number | null
          mood_am: string | null
          mood_pm: string | null
          appetite: string | null
          pain_level: number | null
          social_engagement: string | null
          therapy_sessions: number
          visit_count: number
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          overall_score?: number | null
          mood_am?: string | null
          mood_pm?: string | null
          appetite?: string | null
          pain_level?: number | null
          social_engagement?: string | null
          therapy_sessions?: number
          visit_count?: number
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          overall_score?: number | null
          mood_am?: string | null
          mood_pm?: string | null
          appetite?: string | null
          pain_level?: number | null
          social_engagement?: string | null
          therapy_sessions?: number
          visit_count?: number
        }
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
  }
}
