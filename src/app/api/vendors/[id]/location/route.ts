import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid latitude or longitude",
        },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        {
          success: false,
          error: "Latitude must be between -90 and 90",
        },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Longitude must be between -180 and 180",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        latitude: number;
        longitude: number;
      }>
    >`
      UPDATE "Vendor"
      SET "location" =
        ST_SetSRID(
          ST_MakePoint(${longitude}, ${latitude}),
          4326
        )::geography
      WHERE "id" = ${id}
      RETURNING
        "id",
        "name",
        ST_Y("location"::geometry) AS latitude,
        ST_X("location"::geometry) AS longitude
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vendor: result[0],
    });
  } catch (error) {
    console.error("Vendor location update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update vendor location",
      },
      { status: 500 }
    );
  }
}