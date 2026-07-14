"use client";

import useSWR from "swr";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import AppCard, { cardGridClass } from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import { Button } from "@/components/button";
import EmptyState from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/skeleton";
import {
  getTypeLabel,
  isScheduleTypeSlug,
  slugToType,
} from "@/lib/schedule-type";
import { axiosFetcher, isSwrPending, swrDefaults } from "@/lib/swr";
import { cn } from "@/lib/utils";
import type { ScheduleWithMeta } from "@/lib/types";

export default function TypeSchedulePage() {
  const params = useParams();
  const typeParam = params.type;
  const typeSlug =
    typeof typeParam === "string" && isScheduleTypeSlug(typeParam)
      ? typeParam
      : null;

  const apiType = typeSlug ? slugToType(typeSlug) : null;
  const swrKey = apiType ? `/api/schedule?type=${apiType}` : null;

  const { data, isLoading, isValidating, mutate } = useSWR<ScheduleWithMeta[]>(
    swrKey,
    axiosFetcher,
    swrDefaults,
  );

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await mutate();
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  const isPending = isSwrPending(isLoading, isValidating);
  const typeLabel = apiType ? getTypeLabel(apiType) : "Schedule";

  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title={typeLabel}
          subtitle="Choose the schedule you want to access"
          backLink={{ href: "/", label: "All fields" }}
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isPending}
              className="gap-1.5 h-10 w-10"
              aria-label="Refresh data"
            >
              <RefreshCcw
                className={cn("size-4", isPending && "animate-spin")}
              />
            </Button>
          }
        />
      }
    >
      {isPending ? (
        <CardGridSkeleton count={3} variant="schedule" />
      ) : (
        <div className={cardGridClass}>
          {data?.map((schedule) => (
            <AppCard
              key={schedule.id}
              href={
                typeSlug ? `/${typeSlug}/${schedule.id}` : `/${schedule.id}`
              }
              className={cn(
                "border-gray-200 shadow-md transition duration-300 ease-in-out",
                schedule.isActive
                  ? "hover:border-green-500"
                  : "hover:border-red-500",
              )}
              ribbonLabel={schedule.isActive ? "Active" : "Inactive"}
              ribbonVariant={schedule.isActive ? "active" : "inactive"}
              title={schedule.title}
              subtitle={schedule.desc ?? undefined}
              description={
                format(new Date(schedule.open), "dd MMM yyyy, HH:mm") +
                " – " +
                format(new Date(schedule.closed), "HH:mm")
              }
            >
              <span className="text-xs text-gray-700 font-medium">
                {schedule._count?.categories} Categories
              </span>
            </AppCard>
          ))}
        </div>
      )}

      {!isPending && data?.length === 0 && (
        <EmptyState
          title="No Schedule Created Yet"
          description="Ask an admin to make one"
        />
      )}
    </AppDashboard>
  );
}
