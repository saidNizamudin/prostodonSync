"use client";

import { Button } from "@/components/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2Icon, PlusCircle, RefreshCcw, Trash } from "lucide-react";
import useSWR from "swr";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { getIsActive, getScheduleMode } from "@/lib/schedule-status";
import {
  getTypeLabel,
  isScheduleTypeSlug,
  slugToType,
} from "@/lib/schedule-type";
import FormDrawer from "@/components/form-drawer";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
import { Select } from "@/components/select";
import { DateTimeField } from "@/components/date-time-field";
import {
  formInputClassName,
  formTextareaClassName,
} from "@/components/form-field-styles";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { axiosFetcher, isSwrPending, swrDefaults } from "@/lib/swr";
import AppCard, { cardGridClass } from "@/components/app-card";
import { CardGridSkeleton } from "@/components/skeleton";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import EmptyState from "@/components/empty-state";
import { ScheduleTypeEnum, type ScheduleWithMeta } from "@/lib/types";

const scheduleTypeOptions = [
  {
    value: ScheduleTypeEnum.PROSTHODONTIST,
    label: "Prostodonsia",
  },
  {
    value: ScheduleTypeEnum.MAKSILOFASIAL,
    label: "Bedah Mulut",
  },
];

export default function AdminScheduleTypePage() {
  const params = useParams();
  const typeParam = params.type;
  const typeSlug =
    typeof typeParam === "string" && isScheduleTypeSlug(typeParam)
      ? typeParam
      : null;
  const apiType = typeSlug ? slugToType(typeSlug) : null;

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState<Date | undefined>(undefined);
  const [closed, setClosed] = useState<Date | undefined>(undefined);
  const [scheduleType, setScheduleType] = useState<ScheduleTypeEnum | "">(
    apiType ?? "",
  );

  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  const [selectedSchedule, setSelecteSchedule] = useState<
    ScheduleWithMeta | undefined
  >(undefined);

  const router = useRouter();

  useEffect(() => {
    if (apiType) {
      setScheduleType(apiType);
    }
  }, [apiType]);

  const swrKey = apiType ? `/api/schedule?type=${apiType}` : null;

  const { data, isLoading, isValidating, mutate } = useSWR<ScheduleWithMeta[]>(
    swrKey,
    axiosFetcher,
    swrDefaults,
  );

  const resetCreateMode = () => {
    setIsCreateMode(false);
    setName("");
    setDescription("");
    setOpen(undefined);
    setClosed(undefined);
    setScheduleType(apiType ?? "");
  };

  const handleCreate = async () => {
    if (!scheduleType) return;

    const payload = {
      name,
      description,
      open,
      closed,
      type: scheduleType,
    };

    resetCreateMode();
    const toastId = toast.loading("Creating event...");
    try {
      const newEvent = await axios.post("/api/schedule", payload);

      mutate((data) => {
        const newData = {
          ...newEvent.data,
          _count: {
            categories: 0,
          },
        };

        return data ? [newData, ...data] : [newData];
      });
      toast.success("Event created successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    const toastId = toast.loading("Deleting event...");
    try {
      await axios.delete(`/api/schedule/${id}`);
      mutate((data) => data?.filter((schedule) => schedule.id !== id));
      toast.success("Event deleted successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleEdit = async () => {
    setIsEditMode(false);
    const toastId = toast.loading("Updating event...");
    try {
      const updatedEvent = await axios.put(
        `/api/schedule/${selectedSchedule?.id}`,
        {
          name: selectedSchedule?.title,
          description: selectedSchedule?.desc,
          open: selectedSchedule?.open,
          closed: selectedSchedule?.closed,
          type: selectedSchedule?.type,
        },
      );

      mutate((data) => {
        if (!data) return;

        const index = data.findIndex(
          (schedule) => schedule.id === selectedSchedule?.id,
        );

        if (index === -1) return data;

        const newData = [...data];
        newData[index] = {
          ...updatedEvent.data,
          _count: {
            categories: data[index]._count?.categories ?? 0,
          },
        };

        return newData;
      });

      toast.success("Event updated successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleSetStatus = async (
    id: string,
    action: "ACTIVE" | "CLOSED" | "AUTOMATIC",
  ) => {
    const schedule = data?.find((schedule) => schedule.id === id);
    if (!schedule) return;

    const actionLabels = {
      ACTIVE: "Forcing schedule open",
      CLOSED: "Forcing schedule closed",
      AUTOMATIC: "Resetting to scheduled times",
    };

    const toastId = toast.loading(`${actionLabels[action]}...`);
    try {
      setTogglingIds((prev) => [...prev, id]);
      const updatedSchedule = await axios.patch(`/api/schedule/${id}`, {
        action,
      });

      mutate((data) => {
        if (!data) return;

        const index = data.findIndex((schedule) => schedule.id === id);

        if (index === -1) return data;

        const newData = [...data];
        newData[index] = {
          ...updatedSchedule.data,
          isActive: getIsActive(
            updatedSchedule.data.status,
            new Date(updatedSchedule.data.open),
            new Date(updatedSchedule.data.closed),
          ),
          _count: {
            categories: data[index]._count?.categories ?? 0,
          },
        };

        return newData;
      });

      toast.success("Schedule updated successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update schedule", { id: toastId });
    } finally {
      setTogglingIds((prev) => prev.filter((toggledId) => toggledId !== id));
      mutate();
    }
  };

  const isPending = isSwrPending(isLoading, isValidating);

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await mutate();
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  const typeLabel = apiType ? getTypeLabel(apiType) : "Schedules";

  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title={typeLabel}
          subtitle="Manage events and their categories"
          backLink={{ href: "/admin/schedule", label: "All fields" }}
          actions={
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsCreateMode(true)}
                className="gap-1.5"
              >
                <PlusCircle className="size-4" />
                Create Event
              </Button>
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
            </>
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
              className={cn(
                "cursor-pointer hover:shadow-md border-gray-300 transition-all duration-200",
                schedule.isActive
                  ? "hover:border-green-500 "
                  : "hover:border-red-500",
              )}
              onClick={() => {
                if (typeSlug) {
                  router.push(`/admin/schedule/${typeSlug}/${schedule.id}`);
                }
              }}
              ribbonLabel={`${getTypeLabel(schedule.type).toUpperCase()} · ${
                schedule.isActive ? "ACTIVE" : "INACTIVE"
              } · ${
                getScheduleMode(schedule.status) === "automatic"
                  ? "NATURALLY"
                  : "FORCED"
              }`}
              ribbonVariant={schedule.isActive ? "active" : "inactive"}
              title={schedule.title}
              subtitle={schedule.desc ?? undefined}
              description={
                format(new Date(schedule.open), "dd MMM yyyy, HH:mm") +
                " – " +
                format(new Date(schedule.closed), "HH:mm")
              }
              actionsClassName="flex flex-col gap-0"
              actions={
                <>
                  <div className="flex w-full flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 flex-1 rounded-none !text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStatus(schedule.id, "ACTIVE");
                      }}
                      disabled={
                        togglingIds.includes(schedule.id) ||
                        schedule.status === "ACTIVE"
                      }
                    >
                      Force open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 flex-1 rounded-none !text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStatus(schedule.id, "CLOSED");
                      }}
                      disabled={
                        togglingIds.includes(schedule.id) ||
                        schedule.status === "CLOSED"
                      }
                    >
                      Force close
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 flex-1 rounded-none text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStatus(schedule.id, "AUTOMATIC");
                      }}
                      disabled={
                        togglingIds.includes(schedule.id) ||
                        schedule.status === null
                      }
                    >
                      Use schedule
                    </Button>
                  </div>
                  <div className="flex w-full flex-wrap border-t border-slate-500">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="flex-1 min-w-0 w-full rounded-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelecteSchedule(schedule);
                        setIsEditMode(true);
                      }}
                    >
                      <Edit2Icon size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="flex-1 min-w-0 w-full hover:bg-red-100 !text-red-600 rounded-none transition-bg duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(schedule.id);
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </>
              }
            >
              <div className="flex flex-col gap-1 text-xs text-gray-700 font-medium">
                <span>{schedule._count?.categories} Categories</span>
              </div>
            </AppCard>
          ))}
        </div>
      )}

      {!isPending && data?.length === 0 && (
        <EmptyState
          title="No schedules yet"
          description="Create one to get started."
          ctaLabel="Create Event"
          onCtaClick={() => setIsCreateMode(true)}
        />
      )}
      <FormDrawer
        open={isCreateMode}
        onOpenChange={(open) => {
          setIsCreateMode(open);
          if (!open) {
            setName("");
            setDescription("");
            setOpen(undefined);
            setClosed(undefined);
            setScheduleType(apiType ?? "");
          }
        }}
        title="Create a Schedule"
        description="This action will create a new schedule"
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleCreate}
            disabled={!name || !open || !closed || !scheduleType}
          >
            Create
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="schedule-type"
            className="text-sm font-medium text-gray-700"
          >
            Field
          </Label>
          <Select
            id="schedule-type"
            aria-label="Field"
            value={scheduleType}
            onValueChange={(value) =>
              setScheduleType(value as ScheduleTypeEnum)
            }
            placeholder="Select field"
            options={scheduleTypeOptions}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="create-name"
            className="text-sm font-medium text-gray-700"
          >
            Event Name
          </Label>
          <Input
            id="create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Input event name"
            className={formInputClassName}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="create-desc"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </Label>
          <Textarea
            id="create-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Input event description"
            rows={5}
            className={formTextareaClassName}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateTimeField
            id="open-date"
            label="Open at"
            value={open}
            onChange={setOpen}
            placeholder="Set open time"
          />
          <DateTimeField
            id="closed-date"
            label="Closed at"
            value={closed}
            onChange={setClosed}
            placeholder="Set closing time"
          />
        </div>
      </FormDrawer>
      <FormDrawer
        open={isEditMode}
        onOpenChange={setIsEditMode}
        title="Update a Schedule"
        description="This action will update the selected schedule"
        footer={
          <Button size="xl" className="rounded-sm" onClick={handleEdit}>
            Update
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-schedule-type"
            className="text-sm font-medium text-gray-700"
          >
            Field
          </Label>
          <Select
            id="edit-schedule-type"
            aria-label="Field"
            value={selectedSchedule?.type ?? ""}
            onValueChange={(value) =>
              setSelecteSchedule((prev) =>
                prev ? { ...prev, type: value as ScheduleTypeEnum } : prev,
              )
            }
            placeholder="Select field"
            options={scheduleTypeOptions}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-name"
            className="text-sm font-medium text-gray-700"
          >
            Event Name
          </Label>
          <Input
            id="edit-name"
            value={selectedSchedule?.title ?? ""}
            onChange={(e) =>
              setSelecteSchedule((prev) =>
                prev
                  ? {
                      ...prev,
                      title: e.target.value,
                    }
                  : undefined,
              )
            }
            placeholder="Input event name"
            className={formInputClassName}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-desc"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </Label>
          <Textarea
            id="edit-desc"
            value={selectedSchedule?.desc ?? ""}
            onChange={(e) =>
              setSelecteSchedule((prev) =>
                prev
                  ? {
                      ...prev,
                      desc: e.target.value,
                    }
                  : undefined,
              )
            }
            placeholder="Input event description"
            rows={5}
            className={formTextareaClassName}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateTimeField
            id="edit-open-date"
            label="Open at"
            placeholder="Set open time"
            value={
              selectedSchedule?.open
                ? new Date(selectedSchedule.open)
                : undefined
            }
            onChange={(date) =>
              setSelecteSchedule((prev) =>
                prev && date ? { ...prev, open: date.toISOString() } : prev,
              )
            }
          />
          <DateTimeField
            id="edit-closed-date"
            label="Closed at"
            placeholder="Set closing time"
            value={
              selectedSchedule?.closed
                ? new Date(selectedSchedule.closed)
                : undefined
            }
            onChange={(date) =>
              setSelecteSchedule((prev) =>
                prev && date ? { ...prev, closed: date.toISOString() } : prev,
              )
            }
          />
        </div>
      </FormDrawer>
    </AppDashboard>
  );
}
