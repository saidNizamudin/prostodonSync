import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const { categoryId, payload } = await req.json();

    if (!categoryId || !payload) {
      return NextResponse.json(
        { error: "Category ID or payload is missing" },
        { status: 400 }
      );
    }

    const { name, notes } = payload;
    if (!name) {
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

    if (category.schedule.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Schedule is not active" },
        { status: 400 }
      );
    }

    const data = await prisma.people.create({
      data: {
        name,
        notes,
        category: {
          connect: {
            id: category.id,
          },
        },
      },
      include: {
        category: {
          include: {
            participants: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(data.category);
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 }
    );
  }
};
