/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  HeartHandshake,
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
import ActiveCategoryCard from "@/components/active-ctg-card";

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

export default function ActiveCategoryPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });

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

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={
        isMobile
          ? "flex flex-col py-5 mx-auto container items-center justify-center gap-5"
          : "flex flex-col p-5 mx-auto items-center justify-center gap-5"
      }
    >
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
      <div
        className={
          isMobile
            ? "flex flex-col w-full gap-5 items-center justify-center p-5"
            : "flex flex-wrap w-full gap-5 items-center justify-center"
        }
      >
        {data?.map((category) => {
          return (
            <ActiveCategoryCard
              key={category.id}
              category={category}
              mutate={mutate}
            />
          );
        })}
      </div>
    </div>
  );
}
