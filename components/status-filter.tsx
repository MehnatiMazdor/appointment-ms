// components/status-filter-select.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export const STATUS_FILTER_OPTIONS = [
  "pending",
  "scheduled", 
  "cancelled",
] as const

export type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number]

interface StatusFilterSelectProps {
  value: string
  onChange: (value: StatusFilterOption | "") => void
}

export function StatusFilterSelect({ value, onChange }: StatusFilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="h-9 w-9 p-0"
          aria-label="Clear status filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}