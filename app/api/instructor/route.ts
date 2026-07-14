import supabase from "@/lib/supabase";
import { escapeIlikePattern } from "@/lib/instructor-search";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/require-admin-request";
import { parseScheduleTypeParam } from "@/lib/schedule-type";
import { ScheduleTypeEnum } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  if (!isAdminRequest(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const searchParams = new URL(req.url).searchParams;
    const typeParam = searchParams.get("type");
    const query = searchParams.get("q")?.trim() ?? "";
    const limitParam = searchParams.get("limit");

    let dbQuery = supabase
      .from("Instructor")
      .select("*")
      .is("deletedAt", null)
      .order("name", { ascending: true });

    if (typeParam) {
      const type = parseScheduleTypeParam(typeParam);
      if (!type) {
        return NextResponse.json(
          { message: "Invalid schedule type" },
          { status: 400 },
        );
      }
      dbQuery = dbQuery.eq("type", type);
    }

    if (query) {
      dbQuery = dbQuery.ilike("name", `%${escapeIlikePattern(query)}%`);
    }

    if (limitParam) {
      const limit = Number.parseInt(limitParam, 10);
      if (!Number.isFinite(limit) || limit < 1) {
        return NextResponse.json(
          { message: "Invalid limit parameter" },
          { status: 400 },
        );
      }
      dbQuery = dbQuery.limit(limit);
    } else if (query) {
      dbQuery = dbQuery.limit(5);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error("Failed to fetch instructors", error);
    return NextResponse.json(
      { message: "Failed to fetch instructors" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  if (!isAdminRequest(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { name, type } = await req.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName || !type) {
      return NextResponse.json(
        { message: "Name and type are required" },
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

    const { data: existing, error: existingError } = await supabase
      .from("Instructor")
      .select("*")
      .is("deletedAt", null)
      .eq("name", trimmedName)
      .eq("type", parsedType)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const { data: created, error } = await supabase
      .from("Instructor")
      .insert({
        name: trimmedName,
        type: parsedType,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create instructor", error);
    return NextResponse.json(
      { message: "Failed to create instructor" },
      { status: 500 },
    );
  }
};
