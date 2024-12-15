import prisma from "@/lib/prisma";
import { ScheduleStatusEnum } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET request to fetch all events
export const GET = async () => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categories: true,
        _count: {
          select: {
            categories: true,
          },
        },
      },
    });

    if (!schedules) {
      return NextResponse.json("No schedules found", { status: 404 });
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

    const response = schedules.map((schedule) => ({
      ...schedule,
      isActive: generateStatus(schedule.status, schedule.open, schedule.closed),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const { name: title, description: desc, open, closed } = await req.json();

  if (!title || !open || !closed) {
    return NextResponse.json(
      { message: "Name and date are required" },
      { status: 400 }
    );
  }

  if (new Date(open) > new Date(closed)) {
    return NextResponse.json(
      { message: "Closed date must be after open date" },
      { status: 400 }
    );
  }

  try {
    const newSchedule = await prisma.schedule.create({
      data: {
        title,
        desc,
        open: new Date(open),
        closed: new Date(closed),
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule", error);
    return NextResponse.json(
      { message: "Failed to create schedule" },
      { status: 500 }
    );
  }
};
