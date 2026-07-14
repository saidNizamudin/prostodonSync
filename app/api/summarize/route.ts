import supabase from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { scheduleId } = await req.json();

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID or payload is missing" },
        { status: 400 },
      );
    }

    const { data: schedule, error } = await supabase
      .from("Schedule")
      .select(
        `
        id,
        categories:Category (
          title,
          instructor,
          slot,
          participants:People (
            deletedAt,
            name,
            createdAt
          )
        )
      `,
      )
      .eq("id", scheduleId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    const categories = Array.isArray(schedule.categories)
      ? schedule.categories
      : [];

    const resultArr: string[] = [];

    categories.forEach((category) => {
      let categorySummary = `*${category.title.trim()}*\n`;
      categorySummary += `*INSTRUKTUR:* ${category.instructor.trim()}\n`;

      const participants = Array.isArray(category.participants)
        ? category.participants
        : [];

      const activeParticipants = participants
        .filter((participant) => !participant.deletedAt)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      if (activeParticipants.length === 0) {
        categorySummary += "Belum ada peserta";
      } else {
        const participatSummary: string[] = [];
        const confirmed = activeParticipants.slice(0, category.slot);

        confirmed.forEach((participant, index) => {
          participatSummary.push(`${index + 1}. ${participant.name.trim()}`);
        });
        categorySummary += participatSummary.join("\n");

        const waitlist = activeParticipants.slice(category.slot);
        if (waitlist.length > 0) {
          categorySummary += `\n*-----------WAITLIST-----------*`;
          waitlist.forEach((participant, index) => {
            categorySummary += `\n${index + 1}. ${participant.name.trim()}`;
          });
        }
      }

      resultArr.push(categorySummary);
    });

    const response = resultArr.join("\n\n");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 },
    );
  }
};
