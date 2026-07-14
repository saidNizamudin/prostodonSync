import supabase from "@/lib/supabase";
import { fetchCategoriesWithParticipants } from "@/lib/category-queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = new URL(req.url).searchParams;
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID is missing" },
        { status: 400 },
      );
    }

    const data = await fetchCategoriesWithParticipants(scheduleId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { scheduleId, payload } = await req.json();

    if (!scheduleId || !payload) {
      return NextResponse.json(
        { error: "Schedule ID or payload is missing" },
        { status: 400 },
      );
    }

    const { title, instructor, slot, desc } = payload;
    if (!title || !instructor || !slot) {
      return NextResponse.json(
        { error: "Name, instructor, slot, is missing" },
        { status: 400 },
      );
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from("Schedule")
      .select("id")
      .eq("id", scheduleId)
      .maybeSingle();

    if (scheduleError) {
      throw scheduleError;
    }

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("Category")
      .insert({
        title,
        instructor,
        slot,
        desc,
        scheduleId: schedule.id,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 },
    );
  }
};
