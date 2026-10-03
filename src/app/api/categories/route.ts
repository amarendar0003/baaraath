import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}