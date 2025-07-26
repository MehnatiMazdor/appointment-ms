"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, FileText, LogOut, CheckCircle, XCircle, Phone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/pagination"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/authContext"
import { useAppointments } from "@/hooks/useAppointments"
import { DateFilterSelect } from "@/components/date-filter-select"
import { StatusFilterOption, StatusFilterSelect } from "@/components/status-filter"
import { DateFilterOption } from "@/components/date-filter-select"

export default function DoctorDashboard() {
  const [updating, setUpdating] = useState<string | null>(null)
  // const [activeTab, setActiveTab] = useState<"pending" | "scheduled" | "cancelled">("pending")

  const initialized = useRef(false)
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const {
    appointments,
    loading: appointmentsLoading,
    stats,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    fetchAllAppointments,
    updateAppointmentStatus,
  } = useAppointments()

  // Handle date filter changes
  const handleDateFilterChange =
    (filter: DateFilterOption | "") => {
      setDateFilter(filter)
      fetchAllAppointments(1, statusFilter === "" ? undefined : statusFilter, filter)
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

    if (profile?.role !== "doctor") {
      router.push(profile?.role === "admin" ? "/dashboard/admin" : "/dashboard/patient")
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

    const result = await updateAppointmentStatus(appointmentId, newStatus)

    if (!result.success) {
      console.error("Error updating appointment:", result.error)
    }

    setUpdating(null)
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
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Doctor has full access to all status changes
  const getAllStatuses = () => [
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
  ]


  if (authLoading || (appointmentsLoading && !initialized.current)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
                <span className="text-xl font-bold text-gray-800 dark:text-white">Doctor Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Dr. Tariq Ahmed</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Patient Overview</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Your appointment dashboard with full management access
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card
              className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-shadow cursor-pointer"
            // onClick={() => handleTabChange("pending")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-700 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow cursor-pointer"
            // onClick={() => handleTabChange("scheduled")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Scheduled</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.scheduled}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700 hover:shadow-lg transition-shadow cursor-pointer"
            // onClick={() => handleTabChange("cancelled")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Cancelled</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.cancelled}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-200 dark:bg-red-700 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-700 dark:text-red-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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

        {/* Tabbed Appointment Lists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Appointment Management</CardTitle>
              <CardDescription className="dark:text-gray-300">Manage all patient appointments</CardDescription>
            </CardHeader>
            <CardContent>
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

              {/* Tab Content */}
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      {statusFilter === "pending" && <Clock className="h-8 w-8 text-gray-400" />}
                      {statusFilter === "scheduled" && <CheckCircle className="h-8 w-8 text-gray-400" />}
                      {statusFilter === "cancelled" && <XCircle className="h-8 w-8 text-gray-400" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {dateFilter ? `No ${statusFilter} appointments for this date` : `No ${statusFilter} appointments`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {dateFilter
                        ? "Try selecting a different date"
                        : statusFilter === "pending"
                          ? "No appointments are waiting for confirmation."
                          : statusFilter === "scheduled"
                            ? "No appointments are currently scheduled."
                            : "No appointments have been cancelled."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:gap-6">
                      {appointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {appointment.patient_name}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {appointment.relation === "self"
                                      ? "Patient"
                                      : `${appointment.relation} (${appointment.age} years)`}
                                  </p>
                                </div>
                                <Badge className={`${getStatusColor(appointment.status)} self-start`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="text-sm">{appointment.appointment_time}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="text-sm">
                                      {appointment.age} years, {appointment.gender}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-sm break-all">{appointment.phone}</span>
                                </div>

                                {appointment.notes && (
                                  <div className="sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-start text-gray-600 dark:text-gray-300">
                                      <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium mb-1">Notes:</p>
                                        <p className="text-sm break-words">{appointment.notes}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Doctor Status Control */}
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Update Status:
                                </label>
                                <div className="flex items-center space-x-2">
                                  <Select
                                    value={appointment.status}
                                    onValueChange={(value) =>
                                      handleUpdateStatus(appointment.id, value as "pending" | "scheduled" | "cancelled")
                                    }
                                    disabled={updating === appointment.id}
                                  >
                                    <SelectTrigger className="w-full sm:w-40 dark:bg-gray-700 dark:border-gray-600">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAllStatuses().map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                          {status.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  {updating === appointment.id && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                      <span className="hidden sm:inline">Updating...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  )
}


