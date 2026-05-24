/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import axios from "axios";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { format } from "date-fns";
import { Schedule } from "@prisma/client";
import AppCard from "@/components/app-card";
import { Badge } from "@/components/badge";
import { cardGridClass } from "@/components/card";
import { cn } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/skeleton";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import { Button } from "@/components/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";

interface ScheduleType extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function SchedulePage() {
  const { data, isLoading, isValidating, mutate } = useSWR<ScheduleType[]>(
    "/api/schedule",
    async (link: string) => {
      try {
        const { data } = await axios.get(link);
        return data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data");
      }
    },
    {
      revalidateOnFocus: false,
    },
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

  const showSkeleton = isLoading && !data;

  return (
    <AppDashboard
      isHeaderLoading={showSkeleton}
      header={
        <AppDashboardHeader
          title="Welcome to ProstodonSync"
          subtitle="Choose the schedule you want to access"
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isValidating}
                className="gap-1.5 h-10 w-10"
                aria-label="Refresh data"
              >
                <RefreshCcw
                  className={cn("size-4", isValidating && "animate-spin")}
                />
              </Button>
            </>
          }
        />
      }
    >
      {showSkeleton ? (
        <CardGridSkeleton count={3} variant="schedule" />
      ) : (
        <div
          className={cn(
            cardGridClass,
            isValidating && data && "pointer-events-none opacity-60",
          )}
        >
          {data?.map((schedule) => (
            <Link
              key={schedule.id}
              href={`/${schedule.id}`}
              className="block w-full min-w-0"
            >
              <AppCard
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
            </Link>
          ))}
        </div>
      )}

      {!showSkeleton && data?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No schedules available right now.
        </p>
      )}
    </AppDashboard>
  );
}
