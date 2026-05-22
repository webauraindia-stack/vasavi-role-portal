import { NextRequest, NextResponse } from "next/server";
import { searchRooms } from "@/lib/data/hotels";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hotels = searchParams.get("hotels")?.split(",").filter(Boolean);
  const roomTypes = searchParams.get("roomTypes")?.split(",").filter(Boolean);
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const donorExclusive = searchParams.get("donorExclusive") === "true";

  const rooms = searchRooms({
    hotels,
    roomTypes,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    donorExclusive,
  });

  return NextResponse.json(rooms);
}
