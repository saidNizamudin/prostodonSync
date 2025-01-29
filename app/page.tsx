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
import ScheduleCard from "@/components/schedule-card";

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
    <div className="flex flex-col gap-5 w-full md:px-10 py-5">
      <span className="text-center text-2xl font-semibold">
        Welcome to ProstodonSync. Choose the schedule you want to access
      </span>
      <span className="text-center">
        Created by{" "}
        <Link className="underline" href="https://said-nizamudin.netlify.app/">
          @Bingbong
        </Link>
      </span>
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(500px, 1fr))",
        }}
      >
        {data?.map((schedule, index) => (
          <ScheduleCard key={index} schedule={schedule} />
        ))}
      </div>
    </div>
  );
}
