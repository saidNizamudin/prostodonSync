import { NextRequest, NextResponse } from "next/server";
import { hardDeleteCategory } from "@/lib/hard-delete";
import supabase from "@/lib/supabase";

export const DELETE = async (req: NextRequest) => {
  const categoryId = req.nextUrl.pathname.split("/").pop();

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is missing" },
      { status: 400 },
    );
  }

  try {
    const data = await hardDeleteCategory(categoryId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to delete data", error);
    return NextResponse.json(
      { message: "Failed to delete data" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest) => {
  const categoryId = req.nextUrl.pathname.split("/").pop();

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is missing" },
      { status: 400 },
    );
  }

  try {
    const { title, instructor, slot, desc } = await req.json();

    if (!title || !instructor || !slot) {
      return NextResponse.json(
        { error: "Name, instructor, slot, or schedule ID is missing" },
        { status: 400 },
      );
    }

    const { data: category, error: fetchError } = await supabase
      .from("Category")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("Category")
      .update({
        title,
        instructor,
        slot,
        desc,
      })
      .eq("id", category.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update data", error);
    return NextResponse.json(
      { message: "Failed to update data" },
      { status: 500 },
    );
  }
};
