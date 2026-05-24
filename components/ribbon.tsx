import { cn } from "@/lib/utils";

const variantStyles = {
  active: "bg-green-700",
  inactive: "bg-red-500",
  open: "bg-green-700",
  full: "bg-red-500",
  closed: "bg-red-500",
} as const;

export type RibbonVariant = keyof typeof variantStyles;

interface RibbonProps {
  children: React.ReactNode;
  variant?: RibbonVariant;
  className?: string;
}

export default function Ribbon({
  children,
  variant = "active",
  className,
}: RibbonProps) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 items-center justify-center px-3 py-2.5 text-center text-sm font-medium text-white",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
