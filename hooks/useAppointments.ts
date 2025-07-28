"use client";

import { useState, useCallback } from "react";
import { DateFilterOption } from "@/components/date-filter-select";
import {
  Appointment,
  PaginationState,
  AppointmentStats,
  StatusFilterOption,
} from "@/types/types";

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
  //   ) => {
  //     try {
  //       setError(null);

  //       const response = await fetch("/api/appointments", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(appointmentData),
  //       });

  //       console.log("Response status:", response.status);

  //       const result = await response.json();
  //       console.log("Create appointment response:", result);

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
  const createAppointment = useCallback(
    async (
      appointmentData: Omit<Appointment, "id" | "created_at" | "updated_at" | "user_id" | "status"> 
    ) => {
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
          // Handle both the daily total limit and policy violation cases
          if (
            result.code === "DAILY_TOTAL_LIMIT_REACHED" ||
            result.code === "DAILY_APPOINTMENT_POLICY_VIOLATION"
          ) {
            return {
              success: false,
              limitExceeded: true,
              error: Array.isArray(result.error)
                ? result.error.join(" ")
                : result.error,
              code: result.code,
            };
          }
          return {
            success: false,
            error: Array.isArray(result.error)
              ? result.error.join(" ")
              : result.error,
          };
        }

        return { success: true, data: result.appointment };
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create appointment";
        setError(errorMessage);
        return { success: false, error: errorMessage };
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
  // const getAvailableDates = useCallback((): string[] => {
  //   const dates: string[] = [];
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // Normalize to start of day

  //   for (let i = 0; i < 4; i++) {
  //     const date = new Date(today);
  //     date.setDate(today.getDate() + i);

  //     // Skip Sunday (0)
  //     if (date.getDay() !== 0) {
  //       dates.push(date.toISOString().split("T")[0]);
  //     } else {
  //       i--; // Ensure we still get 4 valid days
  //     }
  //   }

  //   return dates;
  // }, []);

  // Get available appointment dates (today + 3 days, excluding Sundays)
  // const getAvailableDates = useCallback(() => {
  //   const dates: string[] = []
  //   const today = new Date()

  //   // Set to local timezone to avoid date shifting issues
  //   today.setHours(0, 0, 0, 0)

  //   for (let i = 0; i < 10; i++) {
  //     const date = new Date(today)
  //     date.setDate(today.getDate() + i)

  //     // Skip Sundays (0 = Sunday)
  //     if (date.getDay() !== 0) {
  //       // Format as YYYY-MM-DD in local timezone
  //       const year = date.getFullYear()
  //       const month = String(date.getMonth() + 1).padStart(2, "0")
  //       const day = String(date.getDate()).padStart(2, "0")
  //       dates.push(`${year}-${month}-${day}`)
  //     }

  //     // Stop when we have 4 valid dates
  //     if (dates.length >= 2) break
  //   }

  //   return dates
  // }, [])

  const getAvailableDates = useCallback(() => {
    const dates: string[] = [];
    // Use UTC methods to avoid timezone issues
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight

    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() + i);

      // Skip Sundays (0 = Sunday)
      if (date.getUTCDay() !== 0) {
        // Format as YYYY-MM-DD using UTC values
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
      }

      if (dates.length >= 2) break;
    }

    return dates;
  }, []);

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
