import { NextResponse, NextRequest } from "next/server";
import { hardDeletePerson } from "@/lib/hard-delete";
import supabase from "@/lib/supabase";

export const POST = async (req: NextRequest) => {
  try {
    const { peopleId, type } = await req.json();

    if (!peopleId || !type) {
      return NextResponse.json(
        { error: "People ID or type is missing" },
        { status: 400 },
      );
    }

    if (type === "hard-delete") {
      const person = await hardDeletePerson(peopleId);

      if (!person) {
        return NextResponse.json({ error: "People not found" }, { status: 404 });
      }

      return NextResponse.json({ message: "Permanently deleted" });
    }

    const { data: people, error: fetchError } = await supabase
      .from("People")
      .select("id, deletedAt")
      .eq("id", peopleId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!people) {
      return NextResponse.json({ error: "People not found" }, { status: 404 });
    }

    if (type === "delete") {
      const { error } = await supabase
        .from("People")
        .update({ deletedAt: new Date().toISOString() })
        .eq("id", peopleId);

      if (error) {
        throw error;
      }
    } else if (type === "bring-back") {
      const { error } = await supabase
        .from("People")
        .update({ deletedAt: null })
        .eq("id", peopleId);

      if (error) {
        throw error;
      }
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
      { status: 500 },
    );
  }
};
