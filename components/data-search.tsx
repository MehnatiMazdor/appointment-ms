"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, X } from "lucide-react"

interface DateSearchProps {
  searchDate: string
  onDateChange: (date: string) => void
  onClearDate: () => void
}

export function DateSearch({ searchDate, onDateChange, onClearDate }: DateSearchProps) {
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date()
  const minDate = today.toISOString().split("T")[0]

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 mb-6">
      <div className="flex-1 min-w-0">
        <Label htmlFor="search-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Search by Date
        </Label>
        <div className="relative mt-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search-date"
            type="date"
            value={searchDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={minDate}
            className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Select date"
          />
        </div>
      </div>

      {searchDate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearDate}
          className="flex items-center mt-1 sm:mt-0 bg-transparent"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
