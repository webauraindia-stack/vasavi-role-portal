import { apiFetch } from "@/lib/api/client";
import { fetchAllResults } from "@/lib/api/paginate";
import type { ManagerHotel } from "@/lib/types";

export type BackendBranch = {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
};

export function mapBranchToManagerHotel(branch: BackendBranch): ManagerHotel {
  const slug = branch.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    id: branch.id,
    slug,
    name: branch.name,
    city: branch.city,
    managerName: "Branch Manager",
  };
}

export async function listBranches(accessToken?: string | null): Promise<BackendBranch[]> {
  if (accessToken) {
    return fetchAllResults<BackendBranch>("branches/", accessToken);
  }
  const data = await apiFetch<PagePayload>("branches/", { method: "GET" });
  return data.results ?? [];
}

type PagePayload = { results: BackendBranch[] };

export async function listManagerHotels(
  accessToken?: string | null
): Promise<ManagerHotel[]> {
  const branches = await listBranches(accessToken);
  return branches
    .filter((b) => b.is_active !== false)
    .map(mapBranchToManagerHotel);
}

export async function createBranch(
  accessToken: string,
  payload: { name: string; city: string; address: string; phone: string }
): Promise<BackendBranch> {
  return apiFetch<BackendBranch>("branches/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}
