"use client"

import { Appointment } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface LimitExceededModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingAppointments: Appointment[]
  limitType: "self" | "relative" | "family"
  errorMessage: string
}

export function LimitExceededModal({
  open,
  onOpenChange,
  existingAppointments,
  limitType,
  errorMessage
}: LimitExceededModalProps) {
  const router = useRouter()

  // Direct date formatting function
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInstruction = () => {
    switch (limitType) {
      case "self":
        return "Please cancel your existing self appointment to book a new one:"
      case "relative":
        return "Please cancel the existing appointment for this person to book a new one:"
      case "family":
        return "You can only have 3 pending appointments for family members. Please cancel one to proceed:"
      default:
        return "Please cancel one of your existing appointments to proceed:"
    }
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? "block" : "hidden"}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Appointment Limit Reached</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">{errorMessage}</p>
          <p className="text-gray-700 dark:text-gray-300">{getInstruction()}</p>
        </div>

        <div className="space-y-4">
          {existingAppointments.map((appointment) => (
            <Card key={appointment.id} className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{appointment.patient_name}</CardTitle>
                    <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <User className="h-4 w-4 mr-1" />
                      {appointment.relation === "self" ? "Yourself" : appointment.relation}
                    </div>
                  </div>
                  <Badge variant="destructive">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatAppointmentDate(appointment.appointment_date)}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  {appointment.appointment_time}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              router.push("/dashboard/patient")
            }}
          >
            Go to Dashboard to Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}