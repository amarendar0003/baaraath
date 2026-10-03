import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude
      )}&lon=${encodeURIComponent(longitude)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Baaraath/1.0 location service",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to determine location." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const address = data.address || {};

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.county ||
      "";

    return NextResponse.json({
      city,
      displayName: data.display_name || "",
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Reverse location error:", error);

    return NextResponse.json(
      { error: "Unable to determine location." },
      { status: 500 }
    );
  }
}
