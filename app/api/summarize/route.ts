import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { scheduleId } = await req.json();

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID or payload is missing" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
      select: {
        categories: {
          select: {
            title: true,
            instructor: true,
            slot: true,
            participants: {
              select: {
                name: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const resultArr: string[] = [];
    schedule.categories.forEach((category) => {
      let categorySummary = `*${category.title.trim()}*\n`;
      categorySummary += `*INSTRUKTUR:* ${category.instructor.trim()}\n`;

      if (category.participants.length === 0) {
        categorySummary += "Belum ada peserta";
      } else {
        const participatSummary: string[] = [];
        category.participants
          .slice(0, category.slot)
          .forEach((participant, index) => {
            participatSummary.push(`${index + 1}. ${participant.name.trim()}`);
          });
        categorySummary += participatSummary.join("\n");
      }

      resultArr.push(categorySummary);
    });

    const response = resultArr.join("\n\n");

    console.log("Summarize", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 }
    );
  }
};
