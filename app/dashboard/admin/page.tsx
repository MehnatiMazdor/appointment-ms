"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Phone, FileText, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Pagination } from "@/components/pagination"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/authContext"
import { useAppointments } from "@/hooks/useAppointments"
import { DateFilterOption } from "@/components/date-filter-select"
import { DateFilterSelect } from "@/components/date-filter-select"
import { StatusFilterSelect } from "@/components/status-filter"
import { StatusFilterOption } from "@/components/status-filter"
import { Appointment } from "@/types/types"



export default function AdminDashboard() {
  const [updating, setUpdating] = useState<string | null>(null)
  const initialized = useRef(false)
  const router = useRouter()

  const { user, profile, loading: authLoading, signOut } = useAuth()
  const {
    appointments,
    loading: appointmentsLoading,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    stats,
    pagination,
    fetchAllAppointments,
    updateAppointmentStatus,
  } = useAppointments()

  // Handle date filter changes
  const handleDateFilterChange = (filter: DateFilterOption | "") => {
    setDateFilter(filter)
    fetchAllAppointments(undefined, undefined, filter)
  }


  const handleStatusFilterChange = (
    status: StatusFilterOption | ""
  ) => {
    setStatusFilter(status)
    fetchAllAppointments(1, status === "" ? undefined : status, dateFilter)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Authentication and authorization check
  useEffect(() => {
    if (authLoading) return // Wait for auth to initialize

    // Redirect if not authenticated or not admin
    if (!user) {
      router.push("/auth")
      return
    }

    if (profile?.role !== "admin") {
      router.push(profile?.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient")
      return
    }

    // Only fetch appointments once when component mounts and user is authenticated as admin
    if (!initialized.current) {
      initialized.current = true
      fetchAllAppointments()
    }
  }, [authLoading, user, profile, router]) // Only depend on auth state

  const handleUpdateStatus = async (appointmentId: string, newStatus: "pending" | "scheduled" | "cancelled") => {
    setUpdating(appointmentId)
    await updateAppointmentStatus(appointmentId, newStatus)
    setUpdating(null)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Memoized status color getter
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
      case "scheduled": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  // Memoized date formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Status options based on current status
  const getAvailableStatuses = (currentStatus: string) => {
    if (currentStatus === "pending") {
      return [
        { value: "pending", label: "Pending" },
        { value: "scheduled", label: "Scheduled" },
      ]
    }
    return [{
      value: currentStatus,
      label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
    }]
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
        <div className="xl:px-8 px-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Dr</span>
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-white">Admin Portal</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Appointment Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage all patient appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Calendar, title: "Total", value: stats.total, color: "gray" },
            { icon: Clock, title: "Pending", value: stats.pending, color: "yellow" },
            { icon: Calendar, title: "Scheduled", value: stats.scheduled, color: "green" },
            { icon: User, title: "Cancelled", value: stats.cancelled, color: "red" },
          ].map((stat) => (
            <Card key={stat.title} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color !== "gray" ? `text-${stat.color}-600` : "text-gray-800 dark:text-white"}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color !== "gray" ? `bg-${stat.color}-100 dark:bg-${stat.color}-900` : "bg-gray-100 dark:bg-gray-700"} rounded-full flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color !== "gray" ? `text-${stat.color}-600` : "text-gray-600"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {dateFilter ? "No appointments found for this date" : "No appointments"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {dateFilter ? "Try selecting a different date" : "No appointments have been booked yet."}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  updating={updating}
                  handleUpdateStatus={handleUpdateStatus}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  getAvailableStatuses={getAvailableStatuses}
                />
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
    </div>
  )
}

// Extracted Appointment Card Component
type AppointmentCardProps = {
  appointment: Appointment
  updating: string | null
  handleUpdateStatus: (appointmentId: string, newStatus: "pending" | "scheduled" | "cancelled") => void
  getStatusColor: (status: string) => string
  formatDate: (dateString: string) => string
  getAvailableStatuses: (currentStatus: string) => { value: string; label: string }[]
}

const AppointmentCard = ({
  appointment,
  updating,
  handleUpdateStatus,
  getStatusColor,
  formatDate,
  getAvailableStatuses,
}: AppointmentCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
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
              {appointment.relation === "self" ? "Patient" : `${appointment.relation} (${appointment.age} years)`}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
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
            <div className="md:col-span-2">
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

        <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</label>
          <Select
            value={appointment.status}
            onValueChange={(value) => handleUpdateStatus(appointment.id, value as "pending" | "scheduled" | "cancelled")}
            disabled={updating === appointment.id || appointment.status !== "pending"}
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
      </CardContent>
    </Card>
  </motion.div>
)

