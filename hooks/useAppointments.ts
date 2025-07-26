"use client";

import { useState, useCallback } from "react";
import {
  DateFilterOption,
} from "@/components/date-filter-select";
import { Appointment, PaginationState, AppointmentStats, StatusFilterOption, AppointmentResult } from "@/types/types";


export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterOption | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption | "">("");
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    scheduled: 0,
    cancelled: 0,
  });

  // Update fetchAllAppointments to handle the new date filters
  const fetchAllAppointments = useCallback(
    async (
      page = 1,
      status?: "pending" | "scheduled" | "cancelled",
      date?: DateFilterOption | ""
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "7",
        });

        if (status) params.append("status", status);
        if (date) params.append("date", date);

        const response = await fetch(`/api/appointments?${params}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        setAppointments(result.appointments);
        setAllAppointments(result.appointments);
        setPagination(result.pagination);
        setStats(result.stats);
        return result.appointments;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch appointments";
        setError(errorMessage);
        console.error("Error fetching appointments:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get last self appointment
  const getLastSelfAppointment = useCallback(async (userId: string) => {
    try {
      const response = await fetch(
        `/api/appointments/last-self?userId=${userId}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result.appointment;
    } catch (err) {
      console.error("Error fetching last self appointment:", err);
      return null;
    }
  }, []);

  // Create appointment
  // const createAppointment = useCallback(
  //   async (
  //     appointmentData: Omit<Appointment, "id" | "created_at" | "updated_at">
  //   ): Promise<AppointmentResult> => {
  //     try {
  //       setError(null);

  //       const response = await fetch("/api/appointments", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(appointmentData),
  //       });

  //       const result = await response.json();

  //       if (!response.ok) {
  //         if (result.limitExceeded) {
  //           return {
  //             success: false,
  //             limitExceeded: true,
  //             existingAppointments: result.existingAppointments || [],
  //             limitType: result.limitType,
  //             error: result.error,
  //           };
            
  //         }
  //         return { 
  //           success: false, 
  //           error: result.error 
  //         };
  //       }

  //       console.log("Appointment created successfully:", result.appointment);

  //       return { success: true, data: result.appointment, error: null };
  //     } catch (err: any) {
  //       const errorMessage = err.message || "Failed to create appointment";
  //       setError(errorMessage);
  //       console.error("Error creating appointment:", err);
  //       return { success: false, data: null, error: errorMessage };
  //     }
  //   },
  //   []
  // );
  // First, define the types at the top of your file or in a types file
type AppointmentBase = Omit<Appointment, "id" | "created_at" | "updated_at">;

type AppointmentSuccess = {
  success: true;
  data: Appointment;
  error: null;
};

type AppointmentError = {
  success: false;
  error: string | string[];
  data: null;
};

type AppointmentLimitExceeded = {
  success: false;
  limitExceeded: true;
  existingAppointments: Appointment[];
  limitType: "self" | "relative" | "family";
  error: string;
  data: null;
};

type AppointmentResult = AppointmentSuccess | AppointmentError | AppointmentLimitExceeded;

// Then update your createAppointment function
const createAppointment = useCallback(
  async (appointmentData: AppointmentBase): Promise<AppointmentResult> => {
    try {
      setError(null);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.limitExceeded) {
          return {
            success: false,
            limitExceeded: true,
            existingAppointments: result.existingAppointments || [],
            limitType: result.limitType,
            error: result.error,
            data: null,
          };
        }
        return { 
          success: false, 
          error: result.error,
          data: null,
        };
      }

      console.log("Appointment created successfully:", result.appointment);
      return { 
        success: true, 
        data: result.appointment, 
        error: null 
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create appointment";
      setError(errorMessage);
      console.error("Error creating appointment:", err);
      return { 
        success: false, 
        error: errorMessage,
        data: null,
      };
    }
  },
  []
);

  // Update appointment status
  const updateAppointmentStatus = useCallback(
    async (
      appointmentId: string,
      newStatus: "pending" | "scheduled" | "cancelled"
    ) => {
      try {
        setError(null);

        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, data: null, error: result.error };
        }

        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );

        console.log(
          "Appointment status updated successfully:",
          result.appointment
        );

        return { success: true, data: result.appointment, error: null };
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update appointment";
        setError(errorMessage);
        console.error("Error updating appointment:", err);
        return { success: false, data: null, error: errorMessage };
      }
    },
    []
  );

 
  // Function to get available dates (today + next 3 days, excluding Sundays)
  const getAvailableDates = (): string[] => {
      const dates: string[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      for (let i = 0; i < 4; i++) { // Loop for today and next 3 days (total 4)
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Check if it's not a Sunday (Sunday is 0)
        if (date.getDay() !== 0) {
          dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        } else {
          // If it's a Sunday, we still want 4 valid days, so decrement 'i' to skip Sunday
          i--;
        }
      }
      return dates;
    };



  return {
    appointments,
    allAppointments,
    loading,
    error,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    stats,
    fetchAllAppointments,
    getLastSelfAppointment,
    createAppointment,
    updateAppointmentStatus,
    getAvailableDates,
  };
}
