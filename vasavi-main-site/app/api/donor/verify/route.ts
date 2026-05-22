import { NextRequest, NextResponse } from "next/server";
import { MOCK_DONOR } from "@/lib/data/hotels";
import { getDiscountPercent, getMonthlyQuota } from "@/lib/donor-engine";

export async function POST(request: NextRequest) {
  const { email, donorId } = await request.json();

  if (
    email?.toLowerCase() === MOCK_DONOR.email.toLowerCase() &&
    donorId?.toUpperCase() === MOCK_DONOR.donorId.toUpperCase()
  ) {
    const tier = MOCK_DONOR.tier;
    return NextResponse.json({
      success: true,
      donor: {
        ...MOCK_DONOR,
        discountPercent: getDiscountPercent(tier),
        monthlyBookingQuota: getMonthlyQuota(tier),
      },
    });
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
