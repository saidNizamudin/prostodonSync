import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        outline:
          "border-black bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface ChipProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        ref={ref}
        className={cn(chipVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
