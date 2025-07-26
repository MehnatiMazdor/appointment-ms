// components/filter-select.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface FilterSelectProps<T extends string> {
  value: T | ""
  onFilterChange: (value: T | "") => void // Renamed to be more explicit
  options: {
    value: T
    label: string
  }[]
  placeholder?: string
  className?: string
}

export function FilterSelect<T extends string>({
  value,
  onFilterChange,
  options,
  placeholder = "Filter",
  className = "w-[180px]"
}: FilterSelectProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onFilterChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFilterChange("")}
          className="h-9 w-9 p-0"
          aria-label={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}