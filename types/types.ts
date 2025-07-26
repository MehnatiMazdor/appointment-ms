export interface Appointment {
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

export interface AppointmentLimits {
  selfCount: number
  totalCount: number
  hasExistingSelfAppointment: boolean
  relativeAppointments: { [key: string]: number }
}

export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
}

export interface Pagination {
  currentPage: number
  totalPages: number
}

export interface AppointmentStats {
  total: number
  pending: number
  scheduled: number
  cancelled: number
}

export type StatusFilterOption = "pending" | "scheduled" | "cancelled";


export type AppointmentResult = 
  | { success: true; data: any }
  | { success: false; error: string | string[] }
  | { 
      success: false; 
      limitExceeded: true; 
      existingAppointments: Appointment[]; 
      limitType: "self" | "relative" | "family";
      error: string;
    }