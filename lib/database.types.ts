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
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: number
          initiator_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: number
          initiator_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: number
          initiator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_initiator_id_fkey"
            columns: ["initiator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
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
