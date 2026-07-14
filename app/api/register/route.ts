import { NextResponse, NextRequest } from "next/server";
import supabase from "@/lib/supabase";
import { ScheduleStatusEnum } from "@/lib/types";

export const POST = async (req: NextRequest) => {
  try {
    const { categoryId, payload } = await req.json();

    if (!categoryId || !payload) {
      return NextResponse.json(
        { error: "Category ID or payload is missing" },
        { status: 400 },
      );
    }

    const { name1, name2, notes } = payload;
    if (!name1) {
      return NextResponse.json({ error: "Name is missing" }, { status: 400 });
    }

    const { data: category, error: categoryError } = await supabase
      .from("Category")
      .select("id, scheduleId")
      .eq("id", categoryId)
      .maybeSingle();

    if (categoryError) {
      throw categoryError;
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from("Schedule")
      .select("status, open, closed")
      .eq("id", category.scheduleId)
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

    if (schedule.status === ScheduleStatusEnum.CLOSED) {
      return NextResponse.json(
        { error: "Schedule is closed" },
        { status: 400 },
      );
    }

    const now = new Date();
    if (
      (now < new Date(schedule.open) || now > new Date(schedule.closed)) &&
      schedule.status !== ScheduleStatusEnum.ACTIVE
    ) {
      return NextResponse.json(
        { error: "Schedule is not active" },
        { status: 400 },
      );
    }

    let coupleId: string | null = null;

    if (name2) {
      const { data: couple, error: coupleError } = await supabase
        .from("Couple")
        .insert({})
        .select("id")
        .single();

      if (coupleError) {
        throw coupleError;
      }

      coupleId = couple.id;

      const { error: secondPersonError } = await supabase.from("People").insert({
        name: name2,
        notes,
        categoryId: category.id,
        coupleId,
      });

      if (secondPersonError) {
        throw secondPersonError;
      }
    }

    const { error: firstPersonError } = await supabase.from("People").insert({
      name: name1,
      notes,
      categoryId: category.id,
      ...(coupleId ? { coupleId } : {}),
    });

    if (firstPersonError) {
      throw firstPersonError;
    }

    return NextResponse.json({ message: "Data created" });
  } catch (error) {
    console.error("Failed to create data", error);
    return NextResponse.json(
      { message: "Failed to create data" },
      { status: 500 },
    );
  }
};
