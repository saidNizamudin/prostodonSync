/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/button";
import axios from "axios";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { useRouter } from "next/navigation";
import { Schedule } from "@prisma/client";
import { Edit2Icon, PlusCircle, RefreshCcw, Trash } from "lucide-react";
import useSWR from "swr";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import {
  getIsActive,
  getScheduleMode,
  getScheduleModeLabel,
} from "@/lib/schedule-status";
import FormDrawer from "@/components/form-drawer";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
import { Calendar } from "@/components/calendar";
import {
  formCalendarClassName,
  formInputClassName,
  formTextareaClassName,
  formTimeInputClassName,
} from "@/components/form-field-styles";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { cardGridClass } from "@/components/card";
import AppCard from "@/components/app-card";
import { CardGridSkeleton } from "@/components/skeleton";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";

interface ScheduleType extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function ScheduleAdminPage() {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState<Date | undefined>(undefined);
  const [closed, setClosed] = useState<Date | undefined>(undefined);

  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  const [selectedSchedule, setSelecteSchedule] = useState<
    ScheduleType | undefined
  >(undefined);

  const router = useRouter();

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
      keepPreviousData: true,
    },
  );

  const resetCreateMode = () => {
    setIsCreateMode(false);
    setName("");
    setDescription("");
    setOpen(undefined);
  };

  const handleCreate = async () => {
    resetCreateMode();
    const toastId = toast.loading("Creating event...");
    try {
      const newEvent = await axios.post("/api/schedule", {
        name,
        description,
        open,
        closed,
      });

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

  const showSkeleton = isLoading && !data;

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await mutate();
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  return (
    <AppDashboard
      isHeaderLoading={showSkeleton}
      header={
        <AppDashboardHeader
          title="Schedules"
          subtitle="Manage events and their categories"
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
            <AppCard
              key={schedule.id}
              className={cn(
                "cursor-pointer hover:shadow-md border-gray-300 transition-all duration-200",
                schedule.isActive
                  ? "hover:border-green-500 "
                  : "hover:border-red-500",
              )}
              onClick={() => {
                router.push(`/admin/${schedule.id}`);
              }}
              ribbonLabel={schedule.isActive ? "Active" : "Inactive"}
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
                <span>
                  {getScheduleModeLabel(getScheduleMode(schedule.status))}
                </span>
                <span>{schedule._count?.categories} Categories</span>
              </div>
            </AppCard>
          ))}
        </div>
      )}

      {!showSkeleton && data?.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No schedules yet. Create one to get started.
        </p>
      )}
      <FormDrawer
        open={isCreateMode}
        onOpenChange={setIsCreateMode}
        title="Create a Schedule"
        description="This action will create a new schedule"
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleCreate}
            disabled={!name || !open || !closed}
          >
            Create
          </Button>
        }
      >
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Event Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Input event name"
            className={formInputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Input event description"
            rows={5}
            className={formTextareaClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="open-date" className="text-sm font-medium underline">
            Open at
          </label>
          <div className="flex flex-col gap-1">
            {open ? (
              format(open, "dd MMMM yyyy - hh:mm a")
            ) : (
              <span className="text-sm text-gray-500">
                No open date selected
              </span>
            )}
            <div className="flex flex-col gap-1 border border-gray-400 rounded-md w-max">
              <Calendar
                mode="single"
                selected={open}
                onSelect={setOpen}
                className={formCalendarClassName}
              />
              <div className="flex gap-2 p-3 items-center border-t border-gray-400 ">
                <Label className="text-sm font-medium">Time:</Label>
                <Input
                  id="open-date"
                  type="time"
                  className={formTimeInputClassName}
                  value={open ? format(open, "HH:mm") : ""}
                  onChange={(e) => {
                    const time = e.target.value;
                    if (!open) return;
                    const [hour, minute] = time.split(":");
                    const newDate = new Date(open);
                    newDate.setHours(Number(hour));
                    newDate.setMinutes(Number(minute));
                    setOpen(newDate);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="closed-date"
            className="text-sm font-medium underline"
          >
            Closed at
          </label>
          <div className="flex flex-col gap-1">
            {closed ? (
              format(closed, "dd MMMM yyyy - hh:mm a")
            ) : (
              <span className="text-sm text-gray-500">
                No closed date selected
              </span>
            )}
            <div className="flex flex-col gap-1 border border-gray-400 rounded-md w-max">
              <Calendar
                mode="single"
                selected={closed}
                onSelect={setClosed}
                className={formCalendarClassName}
              />
              <div className="flex gap-2 p-3 items-center border-t border-gray-400 ">
                <Label className="text-sm font-medium">Time:</Label>
                <Input
                  id="closed-date"
                  type="time"
                  className={formTimeInputClassName}
                  value={closed ? format(closed, "HH:mm") : ""}
                  onChange={(e) => {
                    const time = e.target.value;
                    if (!closed) return;
                    const [hour, minute] = time.split(":");
                    const newDate = new Date(closed);
                    newDate.setHours(Number(hour));
                    newDate.setMinutes(Number(minute));
                    setClosed(newDate);
                  }}
                />
              </div>
            </div>
          </div>
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
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Event Name</Label>
          <Input
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
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
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
        <div className="flex flex-col gap-1">
          <label
            htmlFor="edit-open-date"
            className="text-sm font-medium underline"
          >
            Open at
          </label>
          <div className="flex flex-col gap-1">
            {selectedSchedule?.open ? (
              format(selectedSchedule.open, "dd MMMM yyyy - hh:mm a")
            ) : (
              <span className="text-sm text-gray-500">
                No open date selected
              </span>
            )}
            <Calendar
              mode="single"
              selected={selectedSchedule?.open}
              onSelect={(date) =>
                setSelecteSchedule((prev) =>
                  prev
                    ? {
                        ...prev,
                        open: date as Date,
                      }
                    : undefined,
                )
              }
              className={formCalendarClassName}
            />
            <Input
              id="edit-open-date"
              type="time"
              className={formTimeInputClassName}
              value={
                selectedSchedule?.open
                  ? format(selectedSchedule.open, "HH:mm")
                  : ""
              }
              onChange={(e) => {
                const time = e.target.value;
                if (!selectedSchedule?.open) return;
                const [hour, minute] = time.split(":");
                const newDate = new Date(selectedSchedule.open);
                newDate.setHours(Number(hour));
                newDate.setMinutes(Number(minute));
                setSelecteSchedule((prev) =>
                  prev
                    ? {
                        ...prev,
                        open: newDate,
                      }
                    : undefined,
                );
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="edit-closed-date"
            className="text-sm font-medium underline"
          >
            Closed at
          </label>
          <div className="flex flex-col gap-1">
            {selectedSchedule?.closed ? (
              format(selectedSchedule.closed, "dd MMMM yyyy - hh:mm a")
            ) : (
              <span className="text-sm text-gray-500">
                No closed date selected
              </span>
            )}
            <Calendar
              mode="single"
              selected={selectedSchedule?.closed}
              onSelect={(date) =>
                setSelecteSchedule((prev) =>
                  prev
                    ? {
                        ...prev,
                        closed: date as Date,
                      }
                    : undefined,
                )
              }
              className={formCalendarClassName}
            />
            <Input
              id="edit-closed-date"
              type="time"
              className={formTimeInputClassName}
              value={
                selectedSchedule?.closed
                  ? format(selectedSchedule.closed, "HH:mm")
                  : ""
              }
              onChange={(e) => {
                const time = e.target.value;
                if (!selectedSchedule?.closed) return;
                const [hour, minute] = time.split(":");
                const newDate = new Date(selectedSchedule.closed);
                newDate.setHours(Number(hour));
                newDate.setMinutes(Number(minute));
                setSelecteSchedule((prev) =>
                  prev
                    ? {
                        ...prev,
                        closed: newDate,
                      }
                    : undefined,
                );
              }}
            />
          </div>
        </div>
      </FormDrawer>
    </AppDashboard>
  );
}
