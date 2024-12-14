/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Edit2Icon, Lamp, Lightbulb, PlusCircle, Trash } from "lucide-react";
import { Button } from "@/components/button";
import { Category } from "@prisma/client";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Calendar } from "@/components/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CategoryType {
  id?: string;
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string;
  scheduleId?: string;
}

export default function ScheduleAdmin() {
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

  const handleCreate = () => async () => {
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-full p-5">
      <Button
        onClick={() => setIsCreateMode(true)}
        className="mb-5"
        variant={"success"}
      >
        <PlusCircle size={20} />
        Add Category
      </Button>
      <div className="flex flex-wrap gap-5">
        {data?.map((category) => (
          <div
            key={category.id}
            className="flex flex-col border border-gray-300 rounded-md p-5 w-[500px] h-[200px] cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => {
              console.log(category);
            }}
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
              <Badge className="w-max mt-auto">
                {category.slot} slots open
              </Badge>
              <div className="flex gap-2">
                <Button size={"icon"}>
                  <Lightbulb size={20} />
                </Button>
                <Button
                  size={"icon"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditMode(true);
                    setSelectCategory(category);
                  }}
                >
                  <Edit2Icon size={20} />
                </Button>
                <Button
                  size={"icon"}
                  variant={"destructive"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id);
                  }}
                >
                  <Trash size={20} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Sheet open={isCreateMode} onOpenChange={() => setIsCreateMode(false)}>
        <SheetContent className="min-w-[600px]">
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
                value={newCategory.title}
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
                value={newCategory.instructor}
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
                value={newCategory.slot}
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
                value={newCategory.desc}
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
              onClick={handleCreate()}
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
        <SheetContent className="min-w-[600px]">
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
                value={selectCategory?.title}
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
                value={selectCategory?.instructor}
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
                value={selectCategory?.slot}
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
                value={selectCategory?.desc}
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
    </div>
  );
}
