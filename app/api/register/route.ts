import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ScheduleStatusEnum } from "@prisma/client";

export const POST = async (req: NextRequest) => {
  try {
    const { categoryId, payload } = await req.json();

    if (!categoryId || !payload) {
      return NextResponse.json(
        { error: "Category ID or payload is missing" },
        { status: 400 }
      );
    }

    const { name1, name2, notes } = payload;
    if (!name1) {
      return NextResponse.json({ error: "Name is missing" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        schedule: {
          select: {
            status: true,
            open: true,
            closed: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category.schedule.status === ScheduleStatusEnum.CLOSED) {
      return NextResponse.json(
        { error: "Schedule is closed" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (
      (now < category.schedule.open || now > category.schedule.closed) &&
      category.schedule.status !== ScheduleStatusEnum.ACTIVE
    ) {
      return NextResponse.json(
        { error: "Schedule is not active" },
        { status: 400 }
      );
    }

    let couple = null;
    if (name2) {
      couple = await prisma.couple.create({
        data: {},
      });

      await prisma.people.create({
        data: {
          name: name2,
          notes,
          category: {
            connect: {
              id: category.id,
            },
          },
          couple: {
            connect: {
              id: couple.id,
            },
          },
        },
      });
    }

    await prisma.people.create({
      data: {
        name: name1,
        notes,
        category: {
          connect: {
            id: category.id,
          },
        },
        ...(couple && {
          couple: {
            connect: {
              id: couple.id,
            },
          },
        }),
      },
    });

    return NextResponse.json({ message: "Data created" });
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 }
    );
  }
};
