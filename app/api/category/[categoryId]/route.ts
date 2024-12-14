import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) => {
  const { categoryId } = params;

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is missing" },
      { status: 400 }
    );
  }

  try {
    const data = await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to delete data", error);
    return NextResponse.json(
      { message: "Failed to delete data" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) => {
  const { categoryId } = params;

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is missing" },
      { status: 400 }
    );
  }

  try {
    const { title, instructor, slot, desc } = await req.json();

    if (!title || !instructor || !slot) {
      return NextResponse.json(
        { error: "Name, instructor, slot, or schedule ID is missing" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const data = await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        title,
        instructor,
        slot,
        desc,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update data", error);
    return NextResponse.json(
      { message: "Failed to update data" },
      { status: 500 }
    );
  }
};
