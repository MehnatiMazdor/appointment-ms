// components/date-filter-select.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export const DATE_FILTER_OPTIONS = [
  "today",
  "tomorrow",
  "next-three-days",
  "next-week",
  "this-week",
  "this-month",
  "this-year",
] as const

export type DateFilterOption = (typeof DATE_FILTER_OPTIONS)[number]

interface DateFilterSelectProps {
  value: string
  onChange: (value: DateFilterOption | "") => void
}

export function DateFilterSelect({ value, onChange }: DateFilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by date" />
        </SelectTrigger>
        <SelectContent>
          {DATE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
