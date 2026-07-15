"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const stepperButtonClassName =
  "flex h-full w-11 shrink-0 items-center justify-center border-input bg-gray-200 text-muted-foreground transition-colors hover:bg-gray-300 disabled:pointer-events-none disabled:opacity-40";

export function QuantityInput({
  value,
  onChange,
  min = 0,
  max,
  className,
}: QuantityInputProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () =>
    onChange(max !== undefined ? Math.min(max, value + 1) : value + 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (Number.isNaN(parsed)) {
      onChange(min);
      return;
    }
    let next = parsed;
    if (max !== undefined) next = Math.min(max, next);
    onChange(Math.max(min, next));
  };

  return (
    <div
      className={cn(
        "flex h-11 w-full overflow-hidden rounded-md border border-input",
        className,
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={cn(stepperButtonClassName, "border-r")}
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={max !== undefined && value >= max}
        className={cn(stepperButtonClassName, "border-l")}
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
