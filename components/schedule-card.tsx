import Link from "next/link";
import { Badge } from "./badge";
import { format } from "date-fns";
import { Schedule } from "@prisma/client";

interface ScheduleType extends Schedule {
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function ScheduleCard({ schedule }: { schedule: ScheduleType }) {
  return (
    <Link
      key={schedule.id}
      href={`/${schedule.id}`}
      className="border border-input w-full rounded-md overflow-hidden cursor-pointer group flex flex-col justify-start items-start gap-2 p-5 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center w-full gap-1">
        <div
          className={`w-4 h-4 aspect-square rounded-full ${
            schedule.isActive ? "bg-success animate-pulse" : "bg-destructive"
          }`}
        />
        <span className="text-xl font-semibold max-[500px]:text-base">
          {schedule.title}
        </span>
      </div>
      <span className="text-gray-500 text-sm line-clamp-3">
        {schedule.desc}
      </span>
      <span className="text-start mt-auto">
        {`${format(new Date(schedule.open), "dd MMMM yyyy hh:mm a")} - ${format(
          new Date(schedule.closed),
          "hh:mm a"
        )}`}
      </span>
      <Badge variant={"success"}>
        {schedule._count?.categories} Categories
      </Badge>
    </Link>
  );
}
