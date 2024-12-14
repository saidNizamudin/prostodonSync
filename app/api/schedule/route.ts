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

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const { name: title, description: desc, date } = await req.json();

  if (!title) {
    return NextResponse.json(
      { message: "Name and description are required" },
      { status: 400 }
    );
  }

  try {
    const newSchedule = await prisma.schedule.create({
      data: {
        title,
        desc,
        status: ScheduleStatusEnum.ACTIVE,
        date: date ? new Date(date) : undefined,
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
