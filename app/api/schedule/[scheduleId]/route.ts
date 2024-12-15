import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    const generateStatus = (
      status: ScheduleStatusEnum | null,
      open: Date,
      closed: Date
    ): boolean => {
      const now = new Date();
      if (status === ScheduleStatusEnum.ACTIVE) {
        return true;
      } else if (status === ScheduleStatusEnum.CLOSED) {
        return false;
      } else {
        return now > open && now < closed;
      }
    };

    const isActive = generateStatus(
      schedule.status,
      schedule.open,
      schedule.closed
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

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        status:
          schedule.status === "ACTIVE"
            ? ScheduleStatusEnum.CLOSED
            : ScheduleStatusEnum.ACTIVE,
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
