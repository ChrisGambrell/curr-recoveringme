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
      posts: {
        Row: {
          body: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          first_name: string
          id: string
          last_name: string
          username: string
        }
        Insert: {
          avatar_url: string
          created_at?: string
          display_name: string
          email: string
          first_name: string
          id?: string
          last_name: string
          username: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          display_name?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          username?: string
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
