import { cardBase, cardGridClass } from "@/components/card";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
      {...props}
    />
  );
}

export function PageHeaderSkeleton({ showBackLink = false }: { showBackLink?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white p-4 shadow-md sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {showBackLink && <Skeleton className="h-4 w-24" />}
        <Skeleton className="h-7 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

export function ScheduleCardSkeleton() {
  return (
    <div className={cn(cardBase, "h-full")}>
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col gap-4 p-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-200 pt-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="-mx-3 -mb-3 flex border-t border-slate-500">
          <Skeleton className="h-10 flex-1 rounded-none" />
          <Skeleton className="h-10 flex-1 rounded-none" />
          <Skeleton className="h-10 flex-1 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className={cn(cardBase, "h-full")}>
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col gap-4 p-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
        <div className="-mx-3 -mb-3 flex border-t border-slate-500">
          <Skeleton className="h-10 flex-1 rounded-none" />
          <Skeleton className="h-10 flex-1 rounded-none" />
          <Skeleton className="h-10 flex-1 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function ActiveCategoryCardSkeleton() {
  return (
    <div className={cn(cardBase, "h-full")}>
      <Skeleton className="h-10 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md sm:w-24" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  variant = "category",
}: {
  count?: number;
  variant?: "schedule" | "category" | "active";
}) {
  const SkeletonCard =
    variant === "schedule"
      ? ScheduleCardSkeleton
      : variant === "active"
        ? ActiveCategoryCardSkeleton
        : CategoryCardSkeleton;

  return (
    <div className={cardGridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
