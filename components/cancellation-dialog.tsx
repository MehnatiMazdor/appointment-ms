"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface CancellationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  patientName: string
}

export function CancellationDialog({ open, onOpenChange, onConfirm, patientName }: CancellationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-left">Cancel Appointment</DialogTitle>
              <DialogDescription className="text-left">
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">Appointment for: {patientName}</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ <strong>Important:</strong> Once cancelled, this appointment cannot be unlocked. You will need to create
              a new appointment if you want to reschedule.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Appointment
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
