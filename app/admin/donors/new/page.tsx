"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PlatformDonor } from "@/lib/donor-types";
import { useAdminStore } from "@/stores/admin-store";

export default function NewDonorPage() {
  const router = useRouter();
  const addDonor = useAdminStore((s) => s.addDonor);
  const [name, setName] = useState("");
  const [donorId, setDonorId] = useState("");
  const [city, setCity] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `donor-${Date.now()}`;
    const donor: PlatformDonor = {
      id,
      donorId: donorId || `DH-NEW-${Date.now().toString().slice(-4)}`,
      profilePhoto:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      name,
      city,
      email: "new@vasavi.example",
      phone: "+91 90000 00000",
      donationCategory: "New Donor",
      totalContribution: 0,
      sponsorshipTypes: ["room_sponsor"],
      membershipLevel: "Gold Donor",
      status: "pending_approval",
      notes: "Created via Super Admin",
      validityStart: new Date().toISOString().slice(0, 10),
      validityEnd: "2027-12-31",
      rewardEligibility: ["percentage_discount"],
      freeStayAllocation: 0,
      compensationAllocation: 0,
      coupons: [],
      transactions: [],
      documents: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    addDonor(donor);
    router.push(`/admin/donors/${id}`);
  }

  return (
    <div>
      <Link href="/admin/donors" className="mb-4 inline-flex items-center gap-1 text-sm text-admin">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-admin">Create donor profile</h1>
      <form onSubmit={handleSubmit} className="admin-card max-w-lg space-y-4">
        <div>
          <label className="text-sm font-medium">Donor name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Donor ID</label>
          <input
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="DH-2026-XXXX"
          />
        </div>
        <div>
          <label className="text-sm font-medium">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="btn-admin">
          Create & pending approval
        </button>
      </form>
    </div>
  );
}
