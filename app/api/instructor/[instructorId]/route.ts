import supabase from "@/lib/supabase";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/require-admin-request";
import { parseScheduleTypeParam } from "@/lib/schedule-type";
import { ScheduleTypeEnum } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  if (!isAdminRequest(req)) {
    return unauthorizedAdminResponse();
  }

  const instructorId = req.nextUrl.pathname.split("/").pop();

  if (!instructorId) {
    return NextResponse.json(
      { error: "Instructor ID is missing" },
      { status: 400 },
    );
  }

  try {
    const { data: instructor, error: fetchError } = await supabase
      .from("Instructor")
      .select("id")
      .eq("id", instructorId)
      .is("deletedAt", null)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("Instructor")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", instructor.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to delete instructor", error);
    return NextResponse.json(
      { message: "Failed to delete instructor" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest) => {
  if (!isAdminRequest(req)) {
    return unauthorizedAdminResponse();
  }

  const instructorId = req.nextUrl.pathname.split("/").pop();

  if (!instructorId) {
    return NextResponse.json(
      { error: "Instructor ID is missing" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const trimmedName =
      typeof body.name === "string" ? body.name.trim() : undefined;
    const typeParam = body.type;

    if (!trimmedName && !typeParam) {
      return NextResponse.json(
        { error: "Name or type is required" },
        { status: 400 },
      );
    }

    const { data: instructor, error: fetchError } = await supabase
      .from("Instructor")
      .select("*")
      .eq("id", instructorId)
      .is("deletedAt", null)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    const nextName = trimmedName ?? instructor.name;
    let nextType = instructor.type as ScheduleTypeEnum;

    if (typeParam) {
      const parsedType = parseScheduleTypeParam(typeParam);
      if (
        !parsedType ||
        !Object.values(ScheduleTypeEnum).includes(parsedType)
      ) {
        return NextResponse.json(
          { message: "Invalid schedule type" },
          { status: 400 },
        );
      }
      nextType = parsedType;
    }

    if (!nextName) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 },
      );
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from("Instructor")
      .select("id")
      .is("deletedAt", null)
      .eq("name", nextName)
      .eq("type", nextType)
      .neq("id", instructor.id)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicate) {
      return NextResponse.json(
        { error: "An instructor with this name and type already exists" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("Instructor")
      .update({
        name: nextName,
        type: nextType,
      })
      .eq("id", instructor.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update instructor", error);
    return NextResponse.json(
      { message: "Failed to update instructor" },
      { status: 500 },
    );
  }
};
