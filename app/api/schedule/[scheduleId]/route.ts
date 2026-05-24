import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIsActive } from "@/lib/schedule-status";
import { ScheduleStatusEnum } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    const isActive = getIsActive(
      schedule.status,
      schedule.open,
      schedule.closed,
    );

    return NextResponse.json(
      {
        ...schedule,
        isActive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch schedule", error);
    return NextResponse.json(
      { message: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  try {
    const schedule = await prisma.schedule.delete({
      where: {
        id: scheduleId,
      },
    });

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error("Failed to delete schedule", error);
    return NextResponse.json(
      { message: "Failed to delete schedule" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();
  const { name: title, description: desc, open, closed } = await req.json();

  if (!title || !open || !closed) {
    return NextResponse.json(
      { message: "Name and date are required" },
      { status: 400 }
    );
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        title,
        desc,
        open: new Date(open),
        closed: new Date(closed),
      },
    });

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Failed to update schedule", error);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as
      | "ACTIVE"
      | "CLOSED"
      | "AUTOMATIC"
      | undefined;

    let status: ScheduleStatusEnum | null;

    if (action === "AUTOMATIC") {
      status = null;
    } else if (action === "ACTIVE") {
      status = ScheduleStatusEnum.ACTIVE;
    } else if (action === "CLOSED") {
      status = ScheduleStatusEnum.CLOSED;
    } else {
      status =
        schedule.status === ScheduleStatusEnum.ACTIVE
          ? ScheduleStatusEnum.CLOSED
          : ScheduleStatusEnum.ACTIVE;
    }

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Failed to update schedule", error);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 }
    );
  }
};
