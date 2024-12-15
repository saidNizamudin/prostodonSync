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
import { ArrowRightCircle } from "lucide-react";
import useSWR from "swr";
import { format } from "date-fns";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import { Badge } from "@/components/badge";

interface ScheduleType extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function SchedulePage() {
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full h-full p-10 px-3 container mx-auto">
      <span className="text-center text-2xl font-semibold">
        Welcome to ProstodonSync. Choose the schedule you want to access
      </span>
      {data?.map((schedule, index) => (
        <Link
          key={schedule.id}
          href={`/${schedule.id}`}
          className="border w-full rounded-md overflow-hidden cursor-pointer group flex flex-col justify-start items-start gap-2 p-5 hover:shadow-lg transition-all duration-300"
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
          <span className="text-gray-500 text-sm line-clamp-3">
            {schedule.desc}
          </span>
          <span className="text-start">
            {`${format(
              new Date(schedule.open),
              "dd MMMM yyyy hh:mm a"
            )} - ${format(new Date(schedule.closed), "hh:mm a")}`}
          </span>
          <Badge variant={"success"}>
            {schedule._count?.categories} Categories
          </Badge>
        </Link>
      ))}
    </div>
  );
}
