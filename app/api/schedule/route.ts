import supabase from "@/lib/supabase";
import { parseScheduleTypeParam } from "@/lib/schedule-type";
import { getIsActive } from "@/lib/schedule-status";
import { ScheduleTypeEnum } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = new URL(req.url).searchParams;
    const typeParam = searchParams.get("type");

    let query = supabase
      .from("Schedule")
      .select("*, categories:Category(count)")
      .order("createdAt", { ascending: false });

    if (typeParam) {
      const type = parseScheduleTypeParam(typeParam);
      if (!type) {
        return NextResponse.json(
          { message: "Invalid schedule type" },
          { status: 400 },
        );
      }
      query = query.eq("type", type);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    const response = (schedules ?? []).map((schedule) => {
      const categoryCount = Array.isArray(schedule.categories)
        ? (schedule.categories[0]?.count ?? 0)
        : 0;

      const { categories: _categories, ...rest } = schedule;

      return {
        ...rest,
        _count: {
          categories: categoryCount,
        },
        isActive: getIsActive(rest.status, rest.open, rest.closed),
      };
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  const { name: title, description: desc, open, closed, type } = await req.json();

  if (!title || !open || !closed || !type) {
    return NextResponse.json(
      { message: "Name, dates, and type are required" },
      { status: 400 },
    );
  }

  const parsedType = parseScheduleTypeParam(type);
  if (
    !parsedType ||
    !Object.values(ScheduleTypeEnum).includes(parsedType)
  ) {
    return NextResponse.json(
      { message: "Invalid schedule type" },
      { status: 400 },
    );
  }

  if (new Date(open) > new Date(closed)) {
    return NextResponse.json(
      { message: "Closed date must be after open date" },
      { status: 400 },
    );
  }

  try {
    const { data: newSchedule, error } = await supabase
      .from("Schedule")
      .insert({
        title,
        desc,
        open: new Date(open).toISOString(),
        closed: new Date(closed).toISOString(),
        type: parsedType,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule", error);
    return NextResponse.json(
      { message: "Failed to create schedule" },
      { status: 500 },
    );
  }
};
