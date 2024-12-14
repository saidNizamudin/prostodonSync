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

interface ScheduleType extends Schedule {
  _count?: {
    categories: number;
  };
}

export default function SchedulePage() {
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
      <div className="flex border w-full rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
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
                  router.push(`/${schedule.id}`);
                }}
              >
                <TableCell>
                  <div
                    className={`w-4 h-4 rounded-full mx-auto ${
                      schedule.status === "ACTIVE"
                        ? "bg-success animate-pulse"
                        : "bg-destructive"
                    }`}
                  />
                </TableCell>
                <TableCell className="text-nowrap">{schedule.title}</TableCell>
                <TableCell className="min-w-[500px]">{schedule.desc}</TableCell>
                <TableCell className="text-nowrap">
                  {schedule.date
                    ? format(new Date(schedule.date), "dd MMMM, yyyy")
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {schedule._count?.categories}
                </TableCell>
                <TableCell className="flex items-center justify-center gap-2 px-5">
                  <Button
                    className="w-flex items-center"
                    onClick={() => router.push(`/${schedule.id}`)}
                  >
                    Go to schedule
                    <ArrowRightCircle className="group-hover:translate-x-0.5 transition-all duration-300 ease-in-out" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
