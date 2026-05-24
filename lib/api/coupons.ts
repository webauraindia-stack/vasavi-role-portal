import { apiFetch } from "@/lib/api/client";
import { fetchAllResults, fetchPage } from "@/lib/api/paginate";
import type { DonorCoupon } from "@/lib/donor-types";

export type BackendCoupon = {
  id: string;
  serial_number: number;
  coupon_type: "concession" | "free";
  status: "issued" | "dispatched" | "redeemed";
  batch?: {
    id: string;
    coupon_type: string;
    serial_start: number;
    serial_end: number;
    extra_benefit?: string;
    donation?: {
      id: string;
      amount_paise: number;
      amount_display?: string;
    };
  };
  redeemed_at_booking_reference?: string | null;
  redeemed_on?: string | null;
  created_at?: string;
};

export type BackendCouponBatch = {
  id: string;
  coupon_type: "concession" | "free";
  serial_start: number;
  serial_end: number;
  count: number;
  extra_benefit?: string;
  donation?: { id: string; amount_display?: string };
  created_at?: string;
};

export function mapBackendCoupon(c: BackendCoupon): DonorCoupon {
  const statusMap: Record<BackendCoupon["status"], DonorCoupon["status"]> = {
    issued: "active",
    dispatched: "active",
    redeemed: "used",
  };
  return {
    id: c.id,
    code: String(c.serial_number),
    benefitType: c.coupon_type === "free" ? "free_stay" : "percentage_discount",
    label:
      c.batch?.extra_benefit?.trim() ||
      (c.coupon_type === "free" ? "Free stay coupon" : "Concession coupon"),
    issuedAt: c.created_at?.slice(0, 10) ?? "",
    expiresAt: "",
    initialValue: 0,
    remainingBalance: c.status === "redeemed" ? 0 : 1,
    status: statusMap[c.status] ?? "active",
    usageHistory: c.redeemed_at_booking_reference
      ? [
          {
            usedAt: c.redeemed_on?.slice(0, 10) ?? "",
            hotelId: "",
            hotelName: "—",
            bookingRef: c.redeemed_at_booking_reference,
            amountApplied: 0,
            remainingAfter: 0,
          },
        ]
      : [],
  };
}

export async function listCoupons(
  accessToken: string,
  params?: { donorProfileId?: string; status?: string }
): Promise<BackendCoupon[]> {
  const qs = new URLSearchParams();
  if (params?.donorProfileId) qs.set("donor_profile_id", params.donorProfileId);
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  const path = query ? `coupons/?${query}` : "coupons/";
  return fetchAllResults<BackendCoupon>(path, accessToken, { pageSize: 100, maxPages: 20 });
}

export async function listCouponBatches(
  accessToken: string,
  donationId?: string
): Promise<BackendCouponBatch[]> {
  const path = donationId
    ? `coupons/batches/?donation_id=${donationId}`
    : "coupons/batches/";
  const first = await fetchPage<BackendCouponBatch>(path, accessToken, 1, 50);
  return first.results ?? [];
}

export type CreateCouponBatchPayload = {
  donation_id: string;
  coupon_type: "concession" | "free";
  serial_start: number;
  serial_end: number;
  extra_benefit?: string;
  assigned_donor_ids?: string[];
};

export async function createCouponBatch(
  accessToken: string,
  payload: CreateCouponBatchPayload
): Promise<BackendCouponBatch> {
  return apiFetch<BackendCouponBatch>("coupons/batches/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function dispatchCoupons(
  accessToken: string,
  couponIds: string[]
): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>("coupons/dispatch/", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ coupon_ids: couponIds }),
    idempotencyKey: crypto.randomUUID(),
  });
}
