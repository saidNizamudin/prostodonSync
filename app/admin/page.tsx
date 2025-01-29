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
import {
  ArrowRightCircle,
  CalendarIcon,
  Edit,
  PlusCircle,
  Trash,
} from "lucide-react";
import useSWR from "swr";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/sheet";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Calendar } from "@/components/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { useMediaQuery } from "react-responsive";

interface ScheduleType extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function ScheduleAdminPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
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

  const { data, isLoading, mutate } = useSWR<ScheduleType[]>(
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
    }
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
        }
      );

      mutate((data) => {
        if (!data) return;

        const index = data.findIndex(
          (schedule) => schedule.id === selectedSchedule?.id
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

  const handleToggleStatus = async (id: string) => {
    const schedule = data?.find((schedule) => schedule.id === id);
    if (!schedule) return;

    const toastId = toast.loading(
      `${schedule.status === "ACTIVE" ? "Closing" : "Activating"} schedule...`
    );
    try {
      setTogglingIds((prev) => [...prev, id]);
      const updatedSchedule = await axios.patch(`/api/schedule/${id}`);

      mutate((data) => {
        if (!data) return;

        const index = data.findIndex((schedule) => schedule.id === id);

        if (index === -1) return data;

        const newData = [...data];
        newData[index] = {
          ...updatedSchedule.data,
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full h-full items-center">
      <Button
        variant={"success"}
        onClick={() => setIsCreateMode(true)}
        className="m-5 mb-0 w-[250px]"
      >
        <PlusCircle size={16} />
        Create Event
      </Button>
      <hr className="w-full border border-gray-300" />
      <div className="flex flex-wrap w-full gap-5 items-center justify-center overflow-auto p-5">
        {data?.map((schedule, index) => (
          <div
            key={schedule.id}
            className="border border-input rounded-lg cursor-pointer flex flex-col items-start gap-3 px-2 py-4 h-[250px] max-w-[500px] w-full"
            onClick={() => {
              router.push(`/admin/${schedule.id}`);
            }}
          >
            <div className="flex items-center w-full gap-1">
              <div
                className={`w-4 h-4 aspect-square rounded-full ${
                  schedule.isActive
                    ? "bg-success animate-pulse"
                    : "bg-destructive"
                }`}
              />
              <span className="text-xl font-semibold max-[500px]:text-base">
                {schedule.title}
              </span>
            </div>
            {schedule.desc && (
              <span className="text-gray-500 text-sm line-clamp-3">
                {schedule.desc}
              </span>
            )}
            <span className="text-start mt-auto">
              {`${format(
                new Date(schedule.open),
                "dd MMMM yyyy hh:mm a"
              )} - ${format(new Date(schedule.closed), "hh:mm a")}`}
            </span>
            <Badge variant={"success"}>
              {schedule._count?.categories} Categories
            </Badge>
            <div className="flex justify-end items-center gap-3 w-full">
              <Button
                variant={"destructive"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(schedule.id);
                }}
              >
                <Trash size={16} />
              </Button>
              <Button
                variant={"default"}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelecteSchedule(schedule);
                  setIsEditMode(true);
                }}
              >
                <Edit size={16} />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(schedule.id);
                }}
                className="w-[80px]"
                disabled={togglingIds.includes(schedule.id)}
              >
                {schedule.status === "ACTIVE" ? "Closed" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Sheet open={isCreateMode} onOpenChange={() => setIsCreateMode(false)}>
        <SheetContent className="min-w-[600px] max-[500px]:min-w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create a Schedule</SheetTitle>
            <SheetDescription className="text-wrap break-all">
              This action will create a new schedule
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Event Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Input event name"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Input event description"
                rows={5}
                className="border-2 rounded-md p-2 outline-none text-sm"
                style={{
                  resize: "none",
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 max-[500px]:grid-cols-1">
              <div>
                <label htmlFor="date" className="text-sm font-medium underline">
                  Open at
                </label>
                <div className="flex flex-col">
                  {open ? (
                    format(open, "dd MMMM yyyy - hh:mm a")
                  ) : (
                    <span>No open date selected</span>
                  )}
                  <div className="flex gap-1 flex-col w-max">
                    <Calendar
                      mode="single"
                      selected={open}
                      onSelect={setOpen}
                      className="!border-2 w-max rounded-md mt-2 mb-1"
                    />
                    <Input
                      type="time"
                      className="border-2"
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
              <div>
                <label htmlFor="date" className="text-sm font-medium underline">
                  Closed at
                </label>
                <div className="flex flex-col">
                  {closed ? (
                    format(closed, "dd MMMM yyyy - hh:mm a")
                  ) : (
                    <span>No closed date selected</span>
                  )}
                  <div className="flex gap-1 flex-col w-max">
                    <Calendar
                      mode="single"
                      selected={closed}
                      onSelect={setClosed}
                      className="!border-2 w-max rounded-md mt-2 mb-1"
                    />
                    <Input
                      type="time"
                      className="border-2"
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
            <Button
              size={"lg"}
              onClick={handleCreate}
              disabled={!name || !open || !closed}
            >
              Create
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={isEditMode} onOpenChange={() => setIsEditMode(false)}>
        <SheetContent className="min-w-[600px] max-[500px]:min-w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update a Schedule</SheetTitle>
            <SheetDescription className="text-wrap break-all">
              This action will update the selected schedule
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 mt-5">
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
                      : undefined
                  )
                }
                placeholder="Input event name"
                className="border-2 rounded-md p-2 outline-none text-sm"
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
                      : undefined
                  )
                }
                placeholder="Input event description"
                rows={5}
                className="border-2 rounded-md p-2 outline-none text-sm"
                style={{
                  resize: "none",
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 max-[500px]:grid-cols-1">
              <div>
                <label htmlFor="date" className="text-sm font-medium underline">
                  Open at
                </label>
                <div className="flex flex-col">
                  {selectedSchedule?.open ? (
                    format(selectedSchedule?.open, "dd MMMM yyyy - hh:mm a")
                  ) : (
                    <span>No open date selected</span>
                  )}
                  <div className="flex gap-1 flex-col w-max">
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
                            : undefined
                        )
                      }
                      className="!border-2 w-max rounded-md mt-2 mb-1"
                    />
                    <Input
                      type="time"
                      className="border-2"
                      value={
                        selectedSchedule?.open
                          ? format(selectedSchedule?.open, "HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        const time = e.target.value;
                        if (!selectedSchedule?.open) return;
                        const [hour, minute] = time.split(":");
                        const newDate = new Date(selectedSchedule?.open);
                        newDate.setHours(Number(hour));
                        newDate.setMinutes(Number(minute));
                        setSelecteSchedule((prev) =>
                          prev
                            ? {
                                ...prev,
                                open: newDate,
                              }
                            : undefined
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="date" className="text-sm font-medium underline">
                  Closed at
                </label>
                <div className="flex flex-col">
                  {selectedSchedule?.closed ? (
                    format(selectedSchedule?.closed, "dd MMMM yyyy - hh:mm a")
                  ) : (
                    <span>No selectedSchedule?.closed date selected</span>
                  )}
                  <div className="flex gap-1 flex-col w-max">
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
                            : undefined
                        )
                      }
                      className="!border-2 w-max rounded-md mt-2 mb-1"
                    />
                    <Input
                      type="time"
                      className="border-2"
                      value={
                        selectedSchedule?.closed
                          ? format(selectedSchedule?.closed, "HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        const time = e.target.value;
                        if (!selectedSchedule?.closed) return;
                        const [hour, minute] = time.split(":");
                        const newDate = new Date(selectedSchedule?.closed);
                        newDate.setHours(Number(hour));
                        newDate.setMinutes(Number(minute));
                        setSelecteSchedule((prev) =>
                          prev
                            ? {
                                ...prev,
                                closed: newDate,
                              }
                            : undefined
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button size={"lg"} onClick={handleEdit}>
              Update
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
