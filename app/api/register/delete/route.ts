import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const { peopleId, type } = await req.json();

    if (!peopleId || !type) {
      return NextResponse.json(
        { error: "People ID or type is missing" },
        { status: 400 }
      );
    }

    const people = await prisma.people.findUnique({
      where: {
        id: peopleId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!people) {
      return NextResponse.json({ error: "People not found" }, { status: 404 });
    }

    if (type === "delete") {
      await prisma.people.update({
        where: {
          id: peopleId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } else if (type === "bring-back") {
      await prisma.people.update({
        where: {
          id: peopleId,
        },
        data: {
          deletedAt: null,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({
      message: type === "delete" ? "Deleted" : "Brought back",
    });
  } catch (error) {
    console.error("Failed to delete or bring-back", error);
    return NextResponse.json(
      { message: "Failed to delete or bring-back" },
      { status: 500 }
    );
  }
};
