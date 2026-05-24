import { cn } from "@/lib/utils";

export const cardBase =
  "relative flex w-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md transition-shadow duration-200";

export const cardGridClass =
  "grid w-full grid-cols-1 gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))]";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(cardBase, className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-4 p-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto border-t border-gray-200 pt-3 text-sm text-gray-600",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "-mx-3 -mb-3 flex flex-wrap border-t border-slate-500",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}
