import { apiFetch } from "@/lib/api/client";
import { fetchAllResults, fetchPage } from "@/lib/api/paginate";
import type { DonationTransaction, PlatformDonor } from "@/lib/donor-types";

export type BackendDonorProfile = {
  id: string;
  user_id?: string;
  phone: string;
  name: string;
  donor_id: string;
  tier?: { id: string; name: string } | null;
  club_name?: string;
  district_code?: string;
  for_place?: { id: string; name: string; city: string };
  total_donated_paise?: number;
  total_donated_display?: string;
  available_coupons_count?: number;
  used_coupons_count?: number;
  date_joined?: string;
};

export type BackendDonorListItem = {
  id: string;
  phone: string;
  name: string;
  donor_id: string;
  tier?: string;
  club_name?: string;
  city?: string;
  total_donated_paise?: number;
  total_donated_display?: string;
  date_joined?: string;
};

export type BackendDonation = {
  id: string;
  amount_paise: number;
  amount_display?: string;
  purpose?: { id: string; name: string };
  receipts?: { id: string; receipt_number: string }[];
  dispatch_date?: string | null;
  dispatch_method?: string;
  dispatch_notes?: string;
  created_at: string;
  donor?: { id: string; name: string; phone: string };
};

export type BackendTier = { id: string; name: string };
export type BackendPurpose = { id: string; name: string };

export type InitialDonationInput = {
  amount_paise: number;
  purpose_id: string;
  receipt_numbers: string[];
  dispatch_date?: string | null;
  dispatch_method?: string;
  dispatch_notes?: string;
};

export type CreateDonorPayload = {
  phone: string;
  name: string;
  tier_id: string;
  for_place_id: string;
  donor_id?: string;
  club_name?: string;
  district_code?: string;
  initial_donation?: InitialDonationInput;
};

export type CreateDonationPayload = {
  donor_id: string;
  amount_paise: number;
  purpose_id: string;
  receipt_numbers: string[];
  dispatch_date?: string | null;
  dispatch_method?: string;
  dispatch_notes?: string;
};

export function mapDonationToTransaction(d: BackendDonation): DonationTransaction {
  const receipts = d.receipts?.map((r) => r.receipt_number).join(", ") ?? "—";
  return {
    id: d.id,
    date: d.created_at?.slice(0, 10) ?? "",
    amount: Math.round((d.amount_paise ?? 0) / 100),
    category: d.purpose?.name ?? "Donation",
    paymentMethod: d.dispatch_method?.replace(/_/g, " ") || "Manual entry",
    receiptNo: receipts,
    notes: d.dispatch_notes,
  };
}

export function mapListDonorToPlatform(d: BackendDonorListItem): PlatformDonor {
  const joined = d.date_joined?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  return {
    id: d.id,
    donorId: d.donor_id,
    profilePhoto: "",
    name: d.name,
    city: d.city ?? "",
    email: `${d.phone}@vasavi.local`,
    phone: d.phone,
    donationCategory: d.tier ?? "Donor",
    totalContribution: Math.round((d.total_donated_paise ?? 0) / 100),
    sponsorshipTypes: [],
    membershipLevel: d.tier ?? "Member",
    status: "active",
    notes: d.club_name ? `Club: ${d.club_name}` : "",
    validityStart: joined,
    validityEnd: "2099-12-31",
    rewardEligibility: [],
    freeStayAllocation: 0,
    compensationAllocation: 0,
    coupons: [],
    transactions: [],
    documents: [],
    createdAt: joined,
    updatedAt: joined,
  };
}

export function mapDonorProfileToPlatform(
  d: BackendDonorProfile,
  extras?: Partial<PlatformDonor>
): PlatformDonor {
  const joined = d.date_joined?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const tierName = d.tier?.name ?? "Donor";
  return {
    id: d.id,
    userId: d.user_id,
    donorId: d.donor_id,
    profilePhoto: "",
    name: d.name,
    city: d.for_place?.city ?? "",
    email: `${d.phone}@vasavi.local`,
    phone: d.phone,
    donationCategory: tierName,
    totalContribution: Math.round((d.total_donated_paise ?? 0) / 100),
    sponsorshipTypes: [],
    membershipLevel: tierName,
    status: "active",
    notes: d.club_name ? `Club: ${d.club_name}` : "",
    validityStart: joined,
    validityEnd: "2099-12-31",
    rewardEligibility: [],
    freeStayAllocation: d.available_coupons_count ?? 0,
    compensationAllocation: 0,
    coupons: [],
    transactions: [],
    documents: [],
    createdAt: joined,
    updatedAt: joined,
    ...extras,
  };
}

export async function listDonors(accessToken: string): Promise<BackendDonorListItem[]> {
  const first = await fetchPage<BackendDonorListItem>("donors/", accessToken, 1, 100);
  if (!first.next) return first.results ?? [];
  return fetchAllResults<BackendDonorListItem>("donors/", accessToken, {
    pageSize: 100,
    maxPages: 20,
  });
}

export async function getDonor(
  accessToken: string,
  id: string
): Promise<BackendDonorProfile> {
  return apiFetch<BackendDonorProfile>(`donors/${id}/`, {
    method: "GET",
    accessToken,
  });
}

export async function createDonor(
  accessToken: string,
  payload: CreateDonorPayload
): Promise<BackendDonorProfile> {
  return apiFetch<BackendDonorProfile>("donors/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function updateDonor(
  accessToken: string,
  id: string,
  payload: Record<string, unknown>
): Promise<BackendDonorProfile> {
  return apiFetch<BackendDonorProfile>(`donors/${id}/`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function listDonations(
  accessToken: string,
  donorProfileId?: string
): Promise<BackendDonation[]> {
  const path = donorProfileId
    ? `donors/donations/?donor_id=${donorProfileId}`
    : "donors/donations/";
  const first = await fetchPage<BackendDonation>(path, accessToken, 1, 100);
  if (!first.next) return first.results ?? [];
  return fetchAllResults<BackendDonation>(path, accessToken, { pageSize: 100, maxPages: 10 });
}

export async function createDonation(
  accessToken: string,
  payload: CreateDonationPayload
): Promise<BackendDonation> {
  return apiFetch<BackendDonation>("donors/donations/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function listTiers(accessToken: string): Promise<BackendTier[]> {
  const first = await fetchPage<BackendTier>("donors/tiers/", accessToken, 1, 100);
  return first.results ?? [];
}

export async function listDonationPurposes(
  accessToken: string
): Promise<BackendPurpose[]> {
  const first = await fetchPage<BackendPurpose>("donors/purposes/", accessToken, 1, 100);
  return first.results ?? [];
}
