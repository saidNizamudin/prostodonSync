/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  Lightbulb,
  Notebook,
  RefreshCcw,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import useSWR from "swr";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { useMediaQuery } from "react-responsive";

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
    createdAt: string;
  }[];
}

export default function ActiveCategoryPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
  const [formData, setFormData] = useState<{
    [key: string]: { name: string; notes?: string };
  }>({});
  const [registerIds, setRegisterIds] = useState<string[]>([]);

  const { scheduleId } = useParams();

  const { data, isLoading, mutate } = useSWR<CategoryType[]>(
    "/api/category",
    async (link: string) => {
      try {
        const { data } = await axios.get(link, {
          params: {
            scheduleId,
          },
        });
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

  const handleRegister = async (payload: {
    name: string;
    notes?: string;
    category: string;
  }) => {
    const toastId = toast.loading("Registering...");
    setFormData((prev) => ({
      ...prev,
      [payload.category]: {
        name: "",
        notes: "",
      },
    }));
    try {
      setRegisterIds((prev) => [...prev, payload.category]);
      const { name, notes, category } = payload;
      await axios.post("/api/register", {
        categoryId: category,
        payload: {
          name,
          notes,
        },
      });

      const selectCategory = data?.find(
        (category: CategoryType) => category.id === payload.category
      );
      toast.success(`Successfully registered to ${selectCategory?.title}`, {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to register", { id: toastId });
    } finally {
      setRegisterIds((prev) => prev.filter((id) => id !== payload.category));
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

  if (isMobile) {
    return (
      <div className="flex flex-col py-5 mx-auto container items-center justify-center gap-5">
        <Button
          className="w-[200px]"
          onClick={async () => {
            const toastId = toast.loading("Refreshing...");
            try {
              await mutate();
            } finally {
              toast.success("Successfully refreshed", { id: toastId });
            }
          }}
        >
          <RefreshCcw size={20} />
          Refresh
        </Button>
        <div className="flex flex-col w-full gap-5 items-center justify-center">
          {data?.map((category) => {
            if (
              !category ||
              !category.id ||
              !category.title ||
              !category.instructor ||
              !category.slot
            ) {
              return (
                <div
                  key={category.id}
                  className="flex border border-gray-300 rounded-md p-5 w-[300px] h-[200px] justify-center items-center cursor-not-allowed shadow-lg"
                >
                  <span className="text-xl font-semibold leading-tight">
                    Something went wrong with this category
                  </span>
                </div>
              );
            }
            const slotLeft =
              category.slot - (category.participants?.length || 0);

            return (
              <div key={category.id} className="flex flex-col">
                {slotLeft <= 0 && (
                  <span className="text-xs text-center text-destructive leading-none w-full">
                    * Eventhough its full, you can still register
                  </span>
                )}
                <div className="flex flex-col border border-gray-300 rounded-md p-5 w-[300px] h-[500px] shadow-lg">
                  <span className="text-xl font-semibold leading-tight">
                    {category.title}
                  </span>
                  <span className="flex items-center gap-2 text-base font-semibold leading-none">
                    {`INSTRUKTUR: ${category.instructor}`}
                  </span>
                  <span className="text-sm text-black/80 mb-auto overflow-hidden text-ellipsis line-clamp-2 mt-2">
                    {category.desc}
                  </span>
                  <div className="flex justify-between mt-5 items-end gap-2">
                    <div className="flex flex-col gap-2">
                      <Badge className="w-max mt-auto">
                        {category.slot} slots open
                      </Badge>
                      <Badge
                        className="w-max mt-auto"
                        variant={slotLeft > 0 ? "success" : "destructive"}
                      >
                        {slotLeft > 0 ? `${slotLeft} slots left` : "Full"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size={"icon"}>
                            <Lightbulb size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[250px] p-5 max-h-[400px] overflow-y-auto"
                          align="end"
                        >
                          {category.participants?.length ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-lg font-semibold">
                                Participants
                              </span>
                              <div className="flex flex-col gap-2">
                                {category.participants
                                  .slice(0, category.slot)
                                  .map((participant) => (
                                    <div
                                      className="flex flex-col items-start"
                                      key={participant.id}
                                    >
                                      <span className="text-sm">
                                        {participant.name}
                                      </span>
                                      <span className="text-xs text-black/60">
                                        {format(
                                          new Date(participant.createdAt),
                                          "dd/MM/yyyy HH:mm:ss"
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                {category.participants.length >
                                  category.slot && (
                                  <>
                                    <hr
                                      className="my-2 h-2 border-black"
                                      style={{
                                        marginInline: -20,
                                      }}
                                    />
                                    <span className="text-xs text-destructive leading-none w-full">
                                      * more participant(s) on waiting list
                                    </span>
                                    {category.participants
                                      .slice(category.slot)
                                      .map((participant) => (
                                        <div
                                          className="flex flex-col items-start"
                                          key={participant.id}
                                        >
                                          <span className="text-sm">
                                            {participant.name}
                                          </span>
                                          <span className="text-xs text-black/60">
                                            {format(
                                              new Date(participant.createdAt),
                                              "dd/MM/yyyy HH:mm:ss"
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold">
                              No participants yet
                            </span>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <hr
                    className="my-5 h-2 border-black"
                    style={{
                      marginInline: -20,
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <div className="w-full space-y-2">
                      <div className="w-full">
                        <Label>Name</Label>
                        <Input
                          value={formData[category.id]?.name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [category.id as string]: {
                                ...formData[category.id as string],
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder="Your name - Description"
                        />
                      </div>
                      <div className="w-full">
                        <Label>Notes (Optional)</Label>
                        <Textarea
                          value={formData[category.id]?.notes || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [category.id as string]: {
                                ...formData[category.id as string],
                                notes: e.target.value,
                              },
                            })
                          }
                          rows={3}
                          placeholder="Your notes (if any)"
                          style={{ resize: "none" }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (!category.id) return;

                        handleRegister({
                          name: formData[category.id]?.name?.trim() || "",
                          notes: formData[category.id]?.notes?.trim() || "",
                          category: category.id,
                        });
                      }}
                      variant={"success"}
                      disabled={
                        registerIds.includes(category.id) ||
                        !formData[category.id]?.name
                      }
                    >
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 mx-auto items-center justify-center gap-5">
      <Button
        className="w-[200px]"
        onClick={async () => {
          const toastId = toast.loading("Refreshing...");
          try {
            await mutate();
          } finally {
            toast.success("Successfully refreshed", { id: toastId });
          }
        }}
      >
        <RefreshCcw size={20} />
        Refresh
      </Button>
      <div className="flex flex-wrap w-full gap-5 items-center justify-center">
        {data?.map((category) => {
          if (
            !category ||
            !category.id ||
            !category.title ||
            !category.instructor ||
            !category.slot
          ) {
            return (
              <div
                key={category.id}
                className="flex border border-gray-300 rounded-md p-5 w-[500px] h-[200px] justify-center items-center cursor-not-allowed"
              >
                <span className="text-xl font-semibold leading-tight">
                  Something went wrong with this category
                </span>
              </div>
            );
          }
          const slotLeft = category.slot - (category.participants?.length || 0);

          return (
            <div key={category.id} className="flex flex-col">
              {slotLeft <= 0 ? (
                <span className="text-xs text-center text-destructive leading-none w-full">
                  * Eventhough its full, you can still register and you will be
                  added to the waiting list.
                </span>
              ) : (
                <span className="text-xs leading-none text-white">.</span>
              )}
              <div className="flex flex-col border border-gray-300 rounded-md p-5 w-[500px] h-[500px]">
                <span className="text-xl font-semibold leading-tight">
                  {category.title}
                </span>
                <span className="flex items-center gap-2 text-base font-semibold leading-none">
                  {`INSTRUKTUR: ${category.instructor}`}
                </span>
                <span className="text-sm text-black/80 mb-auto overflow-hidden text-ellipsis line-clamp-5 mt-2">
                  {category.desc}
                </span>
                <div className="flex justify-between mt-5 items-end gap-2">
                  <div className="flex flex-col gap-2">
                    <Badge className="w-max mt-auto">
                      {category.slot} slots open
                    </Badge>
                    <Badge
                      className="w-max mt-auto"
                      variant={slotLeft > 0 ? "success" : "destructive"}
                    >
                      {slotLeft > 0 ? `${slotLeft} slots left` : "Full"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size={"icon"}>
                          <Lightbulb size={20} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-max p-5 max-h-[400px] overflow-y-auto"
                        align="end"
                      >
                        {category.participants?.length ? (
                          <div className="flex flex-col gap-2">
                            <span className="text-lg font-semibold">
                              Participants
                            </span>
                            <div className="flex flex-col gap-2">
                              {category.participants
                                .slice(0, category.slot)
                                .map((participant) => (
                                  <div
                                    className="flex items-center justify-between gap-5"
                                    key={participant.id}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-nowrap">
                                        {participant.name}
                                      </span>
                                      {participant.notes && (
                                        <TooltipProvider delayDuration={0}>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <StickyNote
                                                size={14}
                                                color="grey"
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {participant.notes}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                    <span className="text-xs text-nowrap text-black/60">
                                      {format(
                                        new Date(participant.createdAt),
                                        "dd/MM/yyyy HH:mm:ss"
                                      )}
                                    </span>
                                  </div>
                                ))}
                              {category.participants.length > category.slot && (
                                <>
                                  <hr
                                    className="my-2 h-2 border-black"
                                    style={{
                                      marginInline: -20,
                                    }}
                                  />
                                  <span className="text-xs text-destructive leading-none w-full">
                                    * more participant(s) on waiting list
                                  </span>
                                  {category.participants
                                    .slice(category.slot)
                                    .map((participant) => (
                                      <div
                                        className="flex items-center justify-between gap-5"
                                        key={participant.id}
                                      >
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm text-nowrap">
                                            {participant.name}
                                          </span>
                                          {participant.notes && (
                                            <TooltipProvider delayDuration={0}>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <StickyNote
                                                    size={14}
                                                    color="grey"
                                                  />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  {participant.notes}
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </div>
                                        <span className="text-xs text-nowrap text-black/60">
                                          {format(
                                            new Date(participant.createdAt),
                                            "dd/MM/yyyy HH:mm:ss"
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-lg font-semibold">
                            No participants yet
                          </span>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <hr
                  className="my-5 h-2 border-black"
                  style={{
                    marginInline: -20,
                  }}
                />
                <div className="flex items-end gap-2">
                  <div className="w-full space-y-2">
                    <div className="w-full">
                      <Label>Name</Label>
                      <Input
                        value={formData[category.id]?.name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category.id as string]: {
                              ...formData[category.id as string],
                              name: e.target.value,
                            },
                          })
                        }
                        placeholder="Your name - Description"
                      />
                    </div>
                    <div className="w-full">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={formData[category.id]?.notes || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category.id as string]: {
                              ...formData[category.id as string],
                              notes: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        placeholder="Your notes (if any)"
                        style={{ resize: "none" }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!category.id) return;

                      handleRegister({
                        name: formData[category.id]?.name?.trim() || "",
                        notes: formData[category.id]?.notes?.trim() || "",
                        category: category.id,
                      });
                    }}
                    className="w-[100px]"
                    variant={"success"}
                    disabled={
                      registerIds.includes(category.id) ||
                      !formData[category.id]?.name
                    }
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
