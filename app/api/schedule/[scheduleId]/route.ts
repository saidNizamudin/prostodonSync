import { NextRequest, NextResponse } from "next/server";
import { hardDeleteSchedule } from "@/lib/hard-delete";
import supabase from "@/lib/supabase";
import { getIsActive } from "@/lib/schedule-status";
import { ScheduleStatusEnum } from "@/lib/types";

export const GET = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  try {
    const { data: schedule, error } = await supabase
      .from("Schedule")
      .select("*")
      .eq("id", scheduleId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    const isActive = getIsActive(
      schedule.status,
      schedule.open,
      schedule.closed,
    );

    return NextResponse.json(
      {
        ...schedule,
        isActive,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch schedule", error);
    return NextResponse.json(
      { message: "Failed to fetch schedule" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  if (!scheduleId) {
    return NextResponse.json(
      { message: "Schedule ID is missing" },
      { status: 400 },
    );
  }

  try {
    const schedule = await hardDeleteSchedule(scheduleId);
    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error("Failed to delete schedule", error);
    return NextResponse.json(
      { message: "Failed to delete schedule" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();
  const {
    name: title,
    description: desc,
    open,
    closed,
    type,
  } = await req.json();

  if (!title || !open || !closed) {
    return NextResponse.json(
      { message: "Name and date are required" },
      { status: 400 },
    );
  }

  try {
    const { data: existingSchedule, error: fetchError } = await supabase
      .from("Schedule")
      .select("id")
      .eq("id", scheduleId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingSchedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    const { data: updatedSchedule, error } = await supabase
      .from("Schedule")
      .update({
        title,
        desc,
        open: new Date(open).toISOString(),
        closed: new Date(closed).toISOString(),
        ...(type ? { type } : {}),
      })
      .eq("id", scheduleId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Failed to update schedule", error);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 },
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const scheduleId = req.nextUrl.pathname.split("/").pop();

  try {
    const { data: schedule, error: fetchError } = await supabase
      .from("Schedule")
      .select("*")
      .eq("id", scheduleId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as
      | "ACTIVE"
      | "CLOSED"
      | "AUTOMATIC"
      | undefined;

    let status: ScheduleStatusEnum | null;

    if (action === "AUTOMATIC") {
      status = null;
    } else if (action === "ACTIVE") {
      status = ScheduleStatusEnum.ACTIVE;
    } else if (action === "CLOSED") {
      status = ScheduleStatusEnum.CLOSED;
    } else {
      status =
        schedule.status === ScheduleStatusEnum.ACTIVE
          ? ScheduleStatusEnum.CLOSED
          : ScheduleStatusEnum.ACTIVE;
    }

    const { data: updatedSchedule, error } = await supabase
      .from("Schedule")
      .update({ status })
      .eq("id", scheduleId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Failed to update schedule", error);
    return NextResponse.json(
      { message: "Failed to update schedule" },
      { status: 500 },
    );
  }
};
