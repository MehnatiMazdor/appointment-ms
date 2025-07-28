import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,  // Crucial for automatic refresh
      persistSession: true,    // Maintains session between page reloads
      detectSessionInUrl: true, // Handles session restoration from URL
    },
  }
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          role: "patient" | "doctor" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: "patient" | "doctor" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: "patient" | "doctor" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          patient_name: string
          age: number
          gender: "male" | "female" | "other"
          relation: string
          phone: string
          appointment_date: string
          appointment_time: string
          notes: string | null
          status: "pending" | "scheduled" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patient_name: string
          age: number
          gender: "male" | "female" | "other"
          relation: string
          phone: string
          appointment_date: string
          appointment_time: string
          notes?: string | null
          status?: "pending" | "scheduled" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_name?: string
          age?: number
          gender?: "male" | "female" | "other"
          relation?: string
          phone?: string
          appointment_date?: string
          appointment_time?: string
          notes?: string | null
          status?: "pending" | "scheduled" | "cancelled"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
