"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Phone, FileText, Plus, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Pagination } from "@/components/pagination"
import { CancellationDialog } from "@/components/cancellation-dialog"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/providers/authContext"
import { useAppointments } from "@/hooks/useAppointments"
import { DateFilterOption } from "@/components/date-filter-select"
import { DateFilterSelect } from "@/components/date-filter-select"
import { StatusFilterSelect } from "@/components/status-filter"
import { StatusFilterOption } from "@/components/status-filter"

export default function PatientDashboard() {
  const [updating, setUpdating] = useState<string | null>(null)
  const [cancellationDialog, setCancellationDialog] = useState<{
    open: boolean
    appointmentId: string
    patientName: string
  }>({
    open: false,
    appointmentId: "",
    patientName: "",
  })

  const router = useRouter()
  const initialized = useRef(false)
  const searchParams = useSearchParams()
  const success = searchParams.get("success")

  const { user, profile, loading: authLoading, signOut } = useAuth()
  const {
    appointments,
    loading: appointmentsLoading,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    stats,
    fetchAllAppointments,
    updateAppointmentStatus,
  } = useAppointments()

  // Handle date filter changes
  const handleDateFilterChange =
    (filter: DateFilterOption | "") => {
      setDateFilter(filter)
      fetchAllAppointments(undefined, undefined, filter)
    }

  const handleStatusFilterChange = (
    status: StatusFilterOption | ""
  ) => {
    setStatusFilter(status)
    fetchAllAppointments(1, status === "" ? undefined : status, dateFilter)
  }


  // Authentication and authorization check
  useEffect(() => {
    if (authLoading) return // Wait for auth to initialize

    // Redirect if not authenticated or not admin
    if (!user) {
      router.push("/auth")
      return
    }

    if (profile?.role !== "patient") {
      router.push(profile?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/admin")
      return
    }

    // Only fetch appointments once when component mounts and user is authenticated as patient
    if (!initialized.current) {
      initialized.current = true
      fetchAllAppointments()
    }
  }, [authLoading, user, profile, router]) // Only depend on auth state


  const handleUpdateStatus = async (appointmentId: string, newStatus: "pending" | "scheduled" | "cancelled") => {
    // Show confirmation dialog for cancellation
    if (newStatus === "cancelled") {
      const appointment = appointments.find((apt) => apt.id === appointmentId)
      if (appointment) {
        setCancellationDialog({
          open: true,
          appointmentId,
          patientName: appointment.patient_name,
        })
      }
      return
    }

    setUpdating(appointmentId)
    const result = await updateAppointmentStatus(appointmentId, newStatus)

    if (result.success && user) {
      // Refresh data
      await fetchAllAppointments()
    } else {
      console.error("Error updating appointment:", result.error)
    }

    setUpdating(null)
  }

  const handleConfirmCancellation = async () => {
    setUpdating(cancellationDialog.appointmentId)
    const result = await updateAppointmentStatus(cancellationDialog.appointmentId, "cancelled")

    if (result.success && user) {
      // Refresh data
      await fetchAllAppointments()
    } else {
      console.error("Error cancelling appointment:", result.error)
    }

    setUpdating(null)
    setCancellationDialog({ open: false, appointmentId: "", patientName: "" })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
      case "scheduled":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Patient can only change pending to cancelled or cancelled back to pending
  const getAvailableStatuses = (currentStatus: string) => {
    if (currentStatus === "pending") {
      return [
        { value: "pending", label: "Pending" },
        { value: "cancelled", label: "Cancel Appointment" },
      ]
    } else if (currentStatus === "cancelled") {
      return [
        { value: "cancelled", label: "Cancelled" },
        { value: "pending", label: "Reactivate" },
      ]
    }
    // Scheduled appointments cannot be changed by patients
    return [{ value: currentStatus, label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) }]
  }

  // Loading states
  if (authLoading || (appointmentsLoading && !initialized.current)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {authLoading ? "Checking authentication..." : "Loading appointments..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="xl:px-8 px-4 mx-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Dr</span>
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-white">Patient Portal</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Welcome, {user?.email?.split("@")[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
      <div className="container mx-auto px-4 py-8">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg mb-6"
          >
            ✅ Appointment booked successfully! We&apos;ll contact you soon to confirm.
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Appointments</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your healthcare appointments</p>
          </div>

          <Link href="/book">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-green-600">Scheduled</p>
                <p className="text-2xl font-bold text-green-700">{stats.scheduled}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Search */}
        {/* Date Search */}
        <div className="mb-6 flex items-center justify-between">
          <DateFilterSelect
            value={dateFilter}
            onChange={handleDateFilterChange}
          />

          <StatusFilterSelect
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />
        </div>


        {/* Tab Navigation - Shows only active filtered tab when statusFilter exists */}
        {statusFilter && (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mb-6">
            <div className="flex justify-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-md ${statusFilter === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : statusFilter === "scheduled"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                <span className="font-medium capitalize">
                  {statusFilter} {appointmentsLoading ? "(...)" : (appointments.length)}
                </span>
              </div>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {dateFilter ? "No appointments found for this date" : "No appointments yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {dateFilter ? "Try selecting a different date" : "Book your first appointment to get started"}
            </p>
            {!dateFilter && (
              <Link href="/book">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-gray-800 dark:text-white">
                            {appointment.patient_name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1 dark:text-gray-300">
                            <User className="h-4 w-4 mr-1" />
                            {appointment.relation === "self"
                              ? "Yourself"
                              : `${appointment.relation} (${appointment.age} years)`}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div>
                            <div className="flex items-start text-gray-600 dark:text-gray-300">
                              <FileText className="h-4 w-4 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium mb-1">Notes:</p>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Update - Patient can cancel pending or reactivate cancelled */}
                      {(appointment.status === "pending" || appointment.status === "cancelled") && (
                        <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage:</label>
                          <Select
                            value={appointment.status}
                            onValueChange={(value) =>
                              handleUpdateStatus(appointment.id, value as "pending" | "scheduled" | "cancelled")
                            }
                            disabled={updating === appointment.id}
                          >
                            <SelectTrigger className="w-40 dark:bg-gray-700 dark:border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableStatuses(appointment.status).map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {updating === appointment.id && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Updating...
                            </div>
                          )}
                        </div>
                      )}

                      {appointment.status === "scheduled" && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            ✅ Appointment confirmed! Please arrive 15 minutes early.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={fetchAllAppointments}
            />
          </>
        )}
      </div>
      </div>

      {/* Cancellation Dialog */}
      <CancellationDialog
        open={cancellationDialog.open}
        onOpenChange={(open) => setCancellationDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleConfirmCancellation}
        patientName={cancellationDialog.patientName}
      />
    </div>
  )
}

