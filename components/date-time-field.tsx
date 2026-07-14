"use client";

import * as React from "react";
import { CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Calendar } from "@/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { formCalendarClassName } from "@/components/form-field-styles";

interface DateTimeFieldProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
}

export function DateTimeField({
  label,
  value,
  onChange,
  placeholder = "Pick a date & time",
  id,
}: DateTimeFieldProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) {
      onChange(undefined);
      return;
    }
    const next = new Date(day);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }
    onChange(next);
  };

  const handleTimeChange = (time: string) => {
    if (!value || !time) return;
    const [hour, minute] = time.split(":");
    const next = new Date(value);
    next.setHours(Number(hour), Number(minute), 0, 0);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            className={cn(
              "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "data-[state=open]:ring-1 data-[state=open]:ring-ring",
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "truncate text-left",
                !value && "text-muted-foreground",
              )}
            >
              {value ? format(value, "dd MMM yyyy · HH:mm") : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelectDay}
            className={formCalendarClassName}
          />
          <div className="flex items-center gap-2 border-t border-gray-200 p-3">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <Label className="text-sm font-medium text-gray-700">Time</Label>
            <Input
              type="time"
              disabled={!value}
              className="ml-auto h-9 w-32 rounded-md text-sm"
              value={value ? format(value, "HH:mm") : ""}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
