import { apiFetch } from "@/lib/api/client";
import { fetchAllResults } from "@/lib/api/paginate";

export type StaffAdmin = {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  branch?: {
    id: string;
    name: string;
    city: string;
  } | null;
  permissions: string[];
};

export async function listStaffAdmins(accessToken: string): Promise<StaffAdmin[]> {
  return fetchAllResults<StaffAdmin>("staff/admins/", accessToken);
}

export async function createStaffAdmin(
  accessToken: string,
  payload: { name: string; phone: string; email: string }
): Promise<StaffAdmin> {
  return apiFetch<StaffAdmin>("staff/admins/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function assignAdminToBranch(
  accessToken: string,
  branchId: string,
  userId: string
): Promise<void> {
  await apiFetch(`branches/${branchId}/assign-admin/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ user_id: userId }),
  });
}
