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

interface ScheduleType extends Schedule {
  _count?: {
    categories: number;
  };
}

export default function ScheduleAdminPage() {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

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
    setDate(undefined);
  };

  const handleCreate = async () => {
    resetCreateMode();
    const toastId = toast.loading("Creating event...");
    try {
      const newEvent = await axios.post("/api/schedule", {
        name,
        description,
        date,
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
          date: selectedSchedule?.date,
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
    <div className="flex flex-col gap-5 w-full h-full p-5">
      <div className="flex items-end w-max ml-auto">
        <Button variant={"success"} onClick={() => setIsCreateMode(true)}>
          <PlusCircle size={16} />
          Create Event
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[400px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-nowrap">Total Categories</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((schedule, index) => (
            <TableRow
              key={schedule.id}
              className="cursor-pointer group"
              onClick={() => {
                router.push(`/admin/${schedule.id}`);
              }}
            >
              <TableCell className="font-medium h-10">{index + 1}</TableCell>
              <TableCell className="text-nowrap">{schedule.title}</TableCell>
              <TableCell className="min-w-[500px]">{schedule.desc}</TableCell>
              <TableCell className="text-nowrap">
                {schedule.date
                  ? format(new Date(schedule.date), "dd MMMM, yyyy")
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {schedule._count?.categories}
                <Badge
                  variant={
                    schedule.status === "ACTIVE" ? "success" : "destructive"
                  }
                  className="ml-2"
                >
                  {schedule.status}
                </Badge>
              </TableCell>
              <TableCell className="flex items-center justify-center gap-2 px-5">
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
                <Button
                  className="w-flex items-center"
                  onClick={() => router.push(`/admin/${schedule.id}`)}
                >
                  Go to schedule
                  <ArrowRightCircle className="group-hover:translate-x-0.5 transition-all duration-300 ease-in-out" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Sheet open={isCreateMode} onOpenChange={() => setIsCreateMode(false)}>
        <SheetContent className="min-w-[600px]">
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
            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-2 rounded-md p-2 outline-none text-sm",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
            <Button size={"lg"} onClick={handleCreate}>
              Create
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={isEditMode} onOpenChange={() => setIsEditMode(false)}>
        <SheetContent className="min-w-[600px]">
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
            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-2 rounded-md p-2 outline-none text-sm",
                      !selectedSchedule?.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {selectedSchedule?.date ? (
                      format(selectedSchedule?.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedSchedule?.date ?? undefined}
                    onSelect={(date) =>
                      setSelecteSchedule((prev) =>
                        prev
                          ? {
                              ...prev,
                              date: date as Date,
                            }
                          : undefined
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
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
