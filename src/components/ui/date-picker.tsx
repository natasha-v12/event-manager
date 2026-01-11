"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: Date | undefined
  onChange?: (d?: Date) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', className = '' }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  return (
    <Popover>
        <PopoverTrigger asChild>
        <Button
          variant="ghost"
          data-empty={!date}
          className={cn('data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal border-none overflow-hidden', className)}
        >
          <CalendarIcon />
          <span className="ml-2 truncate">{date ? format(date, 'MMM d, yyyy') : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-neutral-900 text-white rounded-md">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d as Date | undefined)
            onChange?.(d as Date | undefined)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}