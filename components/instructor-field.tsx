"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import axios from "axios";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { formInputClassName } from "@/components/form-field-styles";
import { cn } from "@/lib/utils";
import { Instructor, ScheduleTypeEnum } from "@/lib/types";

interface InstructorFieldProps {
  value: string;
  onChange: (value: string) => void;
  scheduleType: ScheduleTypeEnum;
  saveToCatalog?: boolean;
  onSaveToCatalogChange?: (checked: boolean) => void;
}

export function InstructorField({
  value,
  onChange,
  scheduleType,
  saveToCatalog = false,
  onSaveToCatalogChange,
}: InstructorFieldProps) {
  const [suggestions, setSuggestions] = useState<Instructor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(value.trim(), 300);

  useEffect(() => {
    if (!debouncedValue) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    axios
      .get<Instructor[]>("/api/instructor", {
        params: {
          type: scheduleType,
          q: debouncedValue,
          limit: 5,
        },
      })
      .then((response) => {
        if (!cancelled) {
          setSuggestions(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedValue, scheduleType]);

  const exactCatalogMatch = useMemo(
    () => suggestions.some((suggestion) => suggestion.name === value),
    [suggestions, value],
  );

  const canSaveToCatalog =
    Boolean(value.trim()) && !exactCatalogMatch && onSaveToCatalogChange;

  useEffect(() => {
    if (!canSaveToCatalog && saveToCatalog) {
      onSaveToCatalogChange?.(false);
    }
  }, [canSaveToCatalog, saveToCatalog, onSaveToCatalogChange]);

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium">Instructor</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            window.setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder="Input instructor name"
          className={formInputClassName}
          autoComplete="off"
        />
        {showSuggestions &&
          debouncedValue &&
          (suggestions.length > 0 || isSearching) && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md">
              {isSearching && suggestions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">Searching...</p>
              ) : (
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100",
                      suggestion.name === value && "bg-gray-50 font-medium",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(suggestion.name);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion.name}
                  </button>
                ))
              )}
            </div>
          )}
      </div>
      {canSaveToCatalog && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={saveToCatalog}
            onChange={(e) => onSaveToCatalogChange?.(e.target.checked)}
            className={cn(
              "size-4 shrink-0 cursor-pointer appearance-none rounded border border-gray-900 bg-white",
              "checked:bg-white checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%208l3%203%207-7%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-900 focus-visible:ring-offset-1",
            )}
          />
          Save instructor for future suggestions
        </label>
      )}
    </div>
  );
}
