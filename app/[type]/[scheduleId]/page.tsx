"use client";

import axios from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, Clock, Loader, Lock, RefreshCcw } from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import AppCard, {
  CategorySlotMeta,
  cardGridClass,
} from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import EmptyState from "@/components/empty-state";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import ParticipantDialog from "@/components/participant-dialog";
import { CardGridSkeleton } from "@/components/skeleton";
import { Textarea } from "@/components/textarea";
import {
  getInactiveBadgeLabel,
  getInactiveReason,
} from "@/lib/schedule-status";
import { isScheduleTypeSlug } from "@/lib/schedule-type";
import { axiosFetcher, isSwrPending, swrDefaults } from "@/lib/swr";
import { cn } from "@/lib/utils";
import type { CategoryWithParticipants, ScheduleWithMeta } from "@/lib/types";

const compactInputClass = "h-11 px-2 py-1 text-xs";

function getRouteKeys(params: {
  type?: string | string[];
  scheduleId?: string | string[];
}) {
  const type =
    typeof params.type === "string"
      ? params.type
      : Array.isArray(params.type)
        ? params.type[0]
        : undefined;
  const scheduleId =
    typeof params.scheduleId === "string"
      ? params.scheduleId
      : Array.isArray(params.scheduleId)
        ? params.scheduleId[0]
        : undefined;

  return {
    type: type && isScheduleTypeSlug(type) ? type : undefined,
    scheduleId,
  };
}

function ScheduleStatusAlert({ schedule }: { schedule: ScheduleWithMeta }) {
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
      <Alert
        variant="warning"
        className="bg-amber-200 text-black border-amber-600"
      >
        <CalendarClock className="size-5" color="black" />
        <AlertTitle className="text-base font-semibold">
          Registration has not opened yet
        </AlertTitle>
        <AlertDescription className="space-y-2">
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
      <Alert
        variant="destructive"
        className="bg-red-500 text-white border-red-600"
      >
        <Lock className="size-5" color="white" />
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
    <Alert
      variant="destructive"
      className="bg-red-500 text-white border-red-600"
    >
      <Clock className="size-5" color="white" />
      <AlertTitle className="text-base font-semibold">
        Registration period has ended
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          The registration window closed on{" "}
          <span className="font-medium">{closedLabel}</span>. New sign-ups are
          no longer accepted.{" "}
          <b>You can still browse categories and view participants below.</b>
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

function CategoryRegistrationCard({
  category,
  isActive,
  mutate,
}: {
  category: CategoryWithParticipants;
  isActive: boolean;
  mutate: () => void;
}) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [notes, setNotes] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const activeParticipants = category.participants?.filter(
    (participant) => !participant.deletedAt,
  );
  const slotLeft = (category.slot ?? 0) - (activeParticipants?.length || 0);
  const isFull = slotLeft <= 0;

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (!category.id || !isActive) return;

    const trimmedName1 = name1.trim();
    if (!trimmedName1) return;

    const toastId = toast.loading("Registering...");
    setIsRegistering(true);

    try {
      await axios.post("/api/register", {
        categoryId: category.id,
        payload: {
          name1: trimmedName1,
          name2: name2.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      setName1("");
      setName2("");
      setNotes("");
      toast.success(
        `Successfully registered to ${category.title ?? "this category"}!`,
        { id: toastId },
      );
      mutate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to register", { id: toastId });
    } finally {
      setIsRegistering(false);
    }
  };

  if (
    !category.id ||
    !category.title ||
    !category.instructor ||
    !category.slot
  ) {
    return <AppCard error="Something went wrong with this category" />;
  }

  const formId = `register-${category.id}`;

  return (
    <AppCard
      contentClassName="flex flex-col gap-3"
      ribbonLabel={
        isActive ? (isFull ? "Full" : "Open") : "Registration closed"
      }
      ribbonVariant={isActive ? (isFull ? "full" : "open") : "closed"}
      title={category.title}
      subtitle={category.instructor}
      description={category.desc ?? undefined}
      footer={
        isActive ? (
          <div className="flex flex-col gap-2">
            <form
              id={formId}
              onSubmit={handleRegister}
              className="flex flex-col gap-2"
              noValidate
            >
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor={`${formId}-name1`}
                  className="text-xs text-nowrap"
                >
                  Name 1
                </Label>
                <Input
                  id={`${formId}-name1`}
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Your name - Description"
                  className={compactInputClass}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label
                  htmlFor={`${formId}-name2`}
                  className="text-xs text-nowrap"
                >
                  Name 2
                </Label>
                <Input
                  id={`${formId}-name2`}
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Your name - Description"
                  className={compactInputClass}
                  autoComplete="name"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor={`${formId}-notes`} className="text-xs">
                  Notes (Optional)
                </Label>
                <Textarea
                  id={`${formId}-notes`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Your notes (if any)"
                  className="min-h-0 resize-none px-2 py-1 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="success"
                disabled={isRegistering || !name1.trim()}
                className="h-9 w-full gap-2 text-xs"
              >
                {isRegistering ? (
                  <>
                    <Loader className="size-3.5 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </div>
        ) : undefined
      }
      actions={
        <ParticipantDialog
          category={category}
          mutate={mutate}
          triggerClassName="min-w-0 flex-1 rounded-none"
        />
      }
    >
      <CategorySlotMeta slotLeft={slotLeft} slot={category.slot} />
    </AppCard>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const { type, scheduleId: scheduleKey } = getRouteKeys(params);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const {
    data: schedule,
    isLoading: scheduleLoading,
    isValidating: scheduleValidating,
    mutate: mutateSchedule,
  } = useSWR<ScheduleWithMeta>(
    scheduleKey ? `/api/schedule/${scheduleKey}` : null,
    axiosFetcher,
    swrDefaults,
  );

  const {
    data: categories,
    isLoading: categoriesLoading,
    isValidating: categoriesValidating,
    mutate: mutateCategories,
  } = useSWR<CategoryWithParticipants[]>(
    scheduleKey ? `/api/category?scheduleId=${scheduleKey}` : null,
    axiosFetcher,
    swrDefaults,
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

  const schedulePending = isSwrPending(scheduleLoading, scheduleValidating);
  const categoriesPending = isSwrPending(
    categoriesLoading,
    categoriesValidating,
  );
  const isRefreshing = schedulePending || categoriesPending;

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

  const backHref = type ? `/${type}` : "/";

  const header = schedule ? (
    <AppDashboardHeader
      backLink={{ href: backHref, label: "All schedules" }}
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
      backLink={{ href: backHref, label: "All schedules" }}
      title=""
    >
      <p className="text-sm text-destructive">Schedule not found</p>
    </AppDashboardHeader>
  );

  const beforeContent =
    !isActive && schedule ? (
      <>
        <ScheduleStatusAlert schedule={schedule} />
        {shouldSchedule && timeLeft !== null && openTime && (
          <OpeningCountdown openTime={openTime} timeLeft={timeLeft} />
        )}
      </>
    ) : undefined;

  if (schedulePending) {
    return <AppDashboard isHeaderLoading headerLoadingShowBackLink />;
  }

  return (
    <AppDashboard header={header} beforeContent={beforeContent}>
      {categoriesPending ? (
        <CardGridSkeleton
          count={3}
          variant={isActive ? "active" : "category"}
        />
      ) : (
        <div className={cardGridClass}>
          {categories?.map((category) => (
            <CategoryRegistrationCard
              key={category.id}
              category={category}
              isActive={isActive}
              mutate={mutateCategories}
            />
          ))}
        </div>
      )}

      {!categoriesPending && categories?.length === 0 && (
        <EmptyState
          title="No Categories for This Schedule Yet"
          description="Ask an admin to make one"
        />
      )}
    </AppDashboard>
  );
}
