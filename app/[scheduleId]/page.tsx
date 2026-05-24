/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, Clock, Lock, RefreshCcw } from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Schedule } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import ActiveCategoryCard from "@/components/active-ctg-card";
import ClosedCategoryCard from "@/components/closed-ctg-card";
import { cardGridClass } from "@/components/card";
import { CardGridSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import {
  getInactiveBadgeLabel,
  getInactiveReason,
} from "@/lib/schedule-status";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";

interface CategoryType {
  id?: string;
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string;
  scheduleId?: string;
  participants?: {
    id: string;
    name: string;
    notes?: string;
    couple?: {
      members: {
        id: string;
        name: string;
      }[];
    };
    createdAt: string;
    deletedAt?: string;
  }[];
}

interface ScheduleType extends Schedule {
  isActive: boolean;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function getScheduleKey(scheduleId: string | string[] | undefined) {
  return typeof scheduleId === "string"
    ? scheduleId
    : Array.isArray(scheduleId)
      ? scheduleId[0]
      : undefined;
}

function ScheduleStatusAlert({ schedule }: { schedule: ScheduleType }) {
  const reason = getInactiveReason(
    schedule.status,
    new Date(schedule.open),
    new Date(schedule.closed),
  );

  if (!reason) return null;

  const openLabel = format(new Date(schedule.open), "dd MMMM yyyy, hh:mm a");
  const closedLabel = format(
    new Date(schedule.closed),
    "dd MMMM yyyy, hh:mm a",
  );

  if (reason === "not_yet_open") {
    return (
      <Alert variant="warning" className="border-amber-200 bg-amber-50/80">
        <CalendarClock className="size-5 text-amber-600" />
        <AlertTitle className="text-base font-semibold text-amber-950">
          Registration has not opened yet
        </AlertTitle>
        <AlertDescription className="space-y-2 text-amber-900/90">
          <p>
            This schedule is waiting for its opening time. Registration will
            begin automatically on{" "}
            <span className="font-medium">{openLabel}</span>.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (reason === "manual_closed") {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-100">
        <Lock className="size-5 text-red-600" />
        <AlertTitle className="text-base font-semibold">
          Manually closed by admin
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            An admin forced this schedule closed, so registration is disabled
            even if the scheduled window ({openLabel} – {closedLabel}) would
            still allow it.{" "}
            <b>You can still browse categories and view participants below.</b>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50/80">
      <Clock className="size-5 text-red-600" />
      <AlertTitle className="text-base font-semibold">
        Registration period has ended
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          The registration window closed on{" "}
          <span className="font-medium">{closedLabel}</span>. New sign-ups are
          no longer accepted.
        </p>
      </AlertDescription>
    </Alert>
  );
}

function OpeningCountdown({
  openTime,
  timeLeft,
}: {
  openTime: Date;
  timeLeft: number;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-300 bg-white p-6 shadow-md">
      <span className="mb-4 text-sm text-gray-600">
        Opening on {format(openTime, "dd MMMM, yyyy - hh:mm a")}
      </span>
      <div className="grid auto-cols-max grid-flow-col gap-5 text-center">
        {[
          { label: "days", value: Math.floor(timeLeft / 86400) },
          { label: "hours", value: Math.floor((timeLeft % 86400) / 3600) },
          { label: "min", value: Math.floor((timeLeft % 3600) / 60) },
          { label: "sec", value: Math.floor(timeLeft % 60) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="countdown font-mono text-5xl">
              <span style={{ "--value": value } as React.CSSProperties} />
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { scheduleId } = useParams();
  const scheduleKey = getScheduleKey(scheduleId);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const {
    data: schedule,
    isLoading: scheduleLoading,
    isValidating: scheduleValidating,
    mutate: mutateSchedule,
  } = useSWR<ScheduleType>(
    scheduleKey ? `/api/schedule/${scheduleKey}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const {
    data: categories,
    isLoading: categoriesLoading,
    isValidating: categoriesValidating,
    mutate: mutateCategories,
  } = useSWR<CategoryType[]>(
    scheduleKey ? `/api/category?scheduleId=${scheduleKey}` : null,
    () =>
      axios
        .get("/api/category", { params: { scheduleId: scheduleKey } })
        .then((res) => res.data),
    { revalidateOnFocus: false },
  );

  const isActive = schedule?.isActive ?? false;
  const openTime = useMemo(
    () => (schedule ? new Date(schedule.open) : null),
    [schedule],
  );
  const shouldSchedule =
    schedule &&
    schedule.status === null &&
    !schedule.isActive &&
    openTime &&
    Date.now() < openTime.getTime();

  useEffect(() => {
    if (!shouldSchedule || !openTime) {
      return;
    }

    const updateCountdown = () => {
      const timeToOpen = openTime.getTime() - new Date().getTime();
      if (timeToOpen > 0) {
        setTimeLeft(Math.ceil(timeToOpen / 1000));
      } else {
        setTimeLeft(0);
        window.location.reload();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [openTime, shouldSchedule]);

  const showSkeleton = categoriesLoading && !categories;
  const isRefreshing = scheduleValidating || categoriesValidating;

  const scheduleDateMeta = schedule
    ? `${format(new Date(schedule.open), "dd MMM yyyy, hh:mm a")} – ${format(
        new Date(schedule.closed),
        "hh:mm a",
      )}`
    : undefined;

  const inactiveReason = schedule
    ? getInactiveReason(
        schedule.status,
        new Date(schedule.open),
        new Date(schedule.closed),
      )
    : null;

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await Promise.all([mutateSchedule(), mutateCategories()]);
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  const header = schedule ? (
    <AppDashboardHeader
      backLink={{ href: "/", label: "All schedules" }}
      title={schedule.title}
      subtitle={schedule.desc ?? undefined}
      meta={scheduleDateMeta}
      badges={
        isActive ? (
          <Badge variant={schedule.isActive ? "success" : "destructive"}>
            {schedule.isActive ? "Active" : "Inactive"}
          </Badge>
        ) : (
          <Badge
            variant={
              inactiveReason === "not_yet_open" ? "warning" : "destructive"
            }
          >
            {inactiveReason
              ? getInactiveBadgeLabel(inactiveReason)
              : "Inactive"}
          </Badge>
        )
      }
      actions={
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-1.5 h-10 w-10"
          aria-label="Refresh data"
        >
          <RefreshCcw
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
        </Button>
      }
    />
  ) : (
    <AppDashboardHeader
      backLink={{ href: "/", label: "All schedules" }}
      title=""
    >
      <p className="text-sm text-destructive">Schedule not found</p>
    </AppDashboardHeader>
  );

  const beforeContent =
    !isActive && schedule ? (
      <>
        {shouldSchedule && timeLeft !== null && openTime && (
          <OpeningCountdown openTime={openTime} timeLeft={timeLeft} />
        )}
      </>
    ) : undefined;

  if (scheduleLoading && !schedule) {
    return <AppDashboard isHeaderLoading headerLoadingShowBackLink />;
  }

  return (
    <AppDashboard
      isHeaderLoading={scheduleLoading && !schedule}
      headerLoadingShowBackLink
      header={header}
      beforeContent={beforeContent}
    >
      {showSkeleton ? (
        <CardGridSkeleton
          count={3}
          variant={isActive ? "active" : "category"}
        />
      ) : (
        <div
          className={cn(
            cardGridClass,
            isRefreshing && categories && "pointer-events-none opacity-60",
          )}
        >
          {categories?.map((category) =>
            isActive ? (
              <ActiveCategoryCard
                key={category.id}
                category={category}
                mutate={mutateCategories}
              />
            ) : (
              <ClosedCategoryCard
                key={category.id}
                category={category}
                mutate={mutateCategories}
              />
            ),
          )}
        </div>
      )}

      {!showSkeleton && categories?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No categories available for this schedule.
        </p>
      )}
    </AppDashboard>
  );
}
