/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  Edit2Icon,
  Info,
  Lightbulb,
  Loader,
  PlusCircle,
  StickyNote,
  Trash,
} from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
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

export default function CategoryAdminPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryType>({
    title: "",
    instructor: "",
    slot: 0,
    desc: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectCategory, setSelectCategory] = useState<CategoryType | null>(
    null
  );

  const [isSummarizeMode, setIsSummarizeMode] = useState(false);
  const [isLoadingSummarize, setIsLoadingSummarize] = useState(false);
  const [summarizeResult, setSummarizeResult] = useState<string>("");

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

  const handleCreate = async () => {
    const toastId = toast.loading("Creating category...");
    setNewCategory({
      title: "",
      instructor: "",
      slot: 0,
      desc: "",
    });
    setIsCreateMode(false);

    try {
      const newData = await axios.post("/api/category", {
        scheduleId: scheduleId,
        payload: newCategory,
      });
      toast.success("Category has been created", { id: toastId });

      mutate((data) => (data ? [...data, newData.data] : [newData.data]));
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this category?")) return;

    const toastId = toast.loading("Deleting category...");
    try {
      await axios.delete(`/api/category/${id}`);
      toast.success("Category has been deleted", { id: toastId });
      mutate((data) => data?.filter((category) => category.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleEdit = async () => {
    if (!selectCategory?.id) return;
    setIsEditMode(false);
    setSelectCategory(null);

    const toastId = toast.loading("Editing category...");
    try {
      await axios.put(`/api/category/${selectCategory.id}`, {
        title: selectCategory.title,
        instructor: selectCategory.instructor,
        slot: selectCategory.slot,
        desc: selectCategory.desc,
      });

      mutate((data) =>
        data?.map((category) =>
          category.id === selectCategory.id ? selectCategory : category
        )
      );
      toast.success("Category has been edited", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit category", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleSummarize =
    (scheduleId: string | string[] | undefined) => async () => {
      if (!scheduleId) return;

      try {
        setIsLoadingSummarize(true);
        const schId =
          typeof scheduleId === "string" ? scheduleId : scheduleId[0];
        const { data } = await axios.post(`/api/summarize`, {
          scheduleId: schId,
        });

        if (data) {
          setIsSummarizeMode(true);
          setSummarizeResult(data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to summarize data");
      } finally {
        setIsLoadingSummarize(false);
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
    <div className="flex flex-col p-5 mx-auto container items-center justify-center gap-5">
      <div className="flex items-center gap-5 mb-5">
        <Button onClick={() => setIsCreateMode(true)} variant={"success"}>
          <PlusCircle size={20} />
          Add Category
        </Button>
        <Button
          onClick={handleSummarize(scheduleId)}
          disabled={isLoadingSummarize}
        >
          {isLoadingSummarize ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Info size={20} />
          )}
          Summarize
        </Button>
      </div>
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
                className="flex border border-gray-300 rounded-md p-5 w-[300px] h-[200px] justify-center items-center cursor-not-allowed shadow-lg"
              >
                <span className="text-xl font-semibold leading-tight">
                  Something went wrong with this category
                </span>
              </div>
            );
          }
          const slotLeft = category.slot - (category.participants?.length || 0);

          return (
            <div
              key={category.id}
              className="flex flex-col border border-gray-300 rounded-md p-5 w-[500px] h-[200px]"
            >
              <span className="text-xl font-semibold leading-tight">
                {category.title}
              </span>
              <span className="flex items-center gap-2 text-base font-semibold leading-none">
                {`INSTRUKTUR: ${category.instructor}`}
              </span>
              <span className="text-sm text-black/80 mb-auto overflow-hidden text-ellipsis line-clamp-3">
                {category.desc}
              </span>
              <div className="flex justify-between mt-5 items-center gap-2">
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
                  <Button
                    size={"icon"}
                    variant={"destructive"}
                    onClick={(e) => {
                      handleDelete(category.id);
                    }}
                  >
                    <Trash size={20} />
                  </Button>
                  <Button
                    size={"icon"}
                    onClick={(e) => {
                      setIsEditMode(true);
                      setSelectCategory(category);
                    }}
                  >
                    <Edit2Icon size={20} />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size={"icon"}>
                        <Lightbulb size={20} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[400px] p-5 max-h-[400px] overflow-y-auto max-[500px]:w-[250px]"
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
                                  {isMobile ? (
                                    <span className="text-sm">
                                      {participant.name}
                                    </span>
                                  ) : (
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
                                  )}
                                  <span className="text-xs text-black/60">
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
            </div>
          );
        })}
      </div>
      <Sheet open={isCreateMode} onOpenChange={() => setIsCreateMode(false)}>
        <SheetContent className="min-w-[600px] max-[500px]:min-w-[300px]">
          <SheetHeader>
            <SheetTitle>Create a Category</SheetTitle>
            <SheetDescription className="text-wrap break-all">
              This action will create a new category
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Category Name</Label>
              <Input
                value={newCategory.title ?? ""}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, title: e.target.value })
                }
                placeholder="Input category name"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Instructor</Label>
              <Input
                value={newCategory.instructor ?? ""}
                onChange={(e) => {
                  setNewCategory({
                    ...newCategory,
                    instructor: e.target.value,
                  });
                }}
                placeholder="Input category instructor"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Slot</Label>
              <Input
                value={newCategory.slot ?? 0}
                type="number"
                min={0}
                onChange={(e) => {
                  setNewCategory({
                    ...newCategory,
                    slot: parseInt(e.target.value),
                  });
                }}
                placeholder="Input category slot"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={newCategory.desc ?? ""}
                onChange={(e) => {
                  setNewCategory({ ...newCategory, desc: e.target.value });
                }}
                placeholder="Input category description"
                rows={5}
                className="border-2 rounded-md p-2 outline-none text-sm"
                style={{
                  resize: "none",
                }}
              />
            </div>
            <Button
              size={"lg"}
              onClick={handleCreate}
              disabled={
                !newCategory.title ||
                !newCategory.instructor ||
                !newCategory.slot
              }
            >
              Create
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={isEditMode} onOpenChange={() => setIsEditMode(false)}>
        <SheetContent className="min-w-[600px] max-[500px]:min-w-[300px]">
          <SheetHeader>
            <SheetTitle>Update a Category</SheetTitle>
            <SheetDescription className="text-wrap break-all">
              This action will update the selected category
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Category Name</Label>
              <Input
                value={selectCategory?.title ?? ""}
                onChange={(e) =>
                  setSelectCategory({
                    ...selectCategory,
                    title: e.target.value,
                  })
                }
                placeholder="Input category name"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Instructor</Label>
              <Input
                value={selectCategory?.instructor ?? ""}
                onChange={(e) => {
                  setSelectCategory({
                    ...selectCategory,
                    instructor: e.target.value,
                  });
                }}
                placeholder="Input category instructor"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Slot</Label>
              <Input
                value={selectCategory?.slot ?? 0}
                type="number"
                min={0}
                onChange={(e) => {
                  setSelectCategory({
                    ...selectCategory,
                    slot: parseInt(e.target.value),
                  });
                }}
                placeholder="Input category slot"
                className="border-2 rounded-md p-2 outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={selectCategory?.desc ?? ""}
                onChange={(e) => {
                  setSelectCategory({
                    ...selectCategory,
                    desc: e.target.value,
                  });
                }}
                placeholder="Input category description"
                rows={5}
                className="border-2 rounded-md p-2 outline-none text-sm"
                style={{
                  resize: "none",
                }}
              />
            </div>
            <Button
              size={"lg"}
              onClick={handleEdit}
              disabled={
                !selectCategory?.title ||
                !selectCategory?.instructor ||
                !selectCategory?.slot
              }
            >
              Update
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog
        open={isSummarizeMode}
        onOpenChange={() => setIsSummarizeMode(false)}
      >
        <DialogContent className="min-w-[600px] !w-3/4 max-w-none max-[500px]:min-w-[300px] max-[500px]:pt-10">
          <DialogHeader>
            <DialogTitle>
              Adjust and Copy to Clipboard the Summarize Data
            </DialogTitle>
            <div>
              <Textarea
                value={summarizeResult}
                onChange={(e) => setSummarizeResult(e.target.value)}
                rows={30}
                className="border-2 rounded-md p-2 outline-none text-sm"
                style={{
                  resize: "none",
                }}
              />
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(summarizeResult);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy size={20} />
              Copy to Clipboard
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
