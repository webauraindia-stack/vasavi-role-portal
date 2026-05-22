import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BookingStatus, GuestType, PaymentStatus, RoomStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatINR = formatCurrency;

export function sponsorshipLabel(t: string) {
  return t.replace(/_/g, " ");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  visitor: "General Visitor",
  vci_member: "VCI Member",
  kcgf_donor: "KCGF Donor",
  vksp_member: "VKSP Member",
  service_volunteer: "Seva Volunteer",
  sponsorship_patron: "Sponsorship Patron",
  free_stay_eligible: "Free Stay Eligible",
  compensation_holder: "Compensation Wallet",
};

export const GUEST_TYPE_COLORS: Record<GuestType, string> = {
  visitor: "bg-slate-100 text-slate-700 border-slate-200",
  vci_member: "bg-blue-50 text-blue-800 border-blue-200",
  kcgf_donor: "bg-amber-50 text-amber-900 border-amber-200",
  vksp_member: "bg-violet-50 text-violet-800 border-violet-200",
  service_volunteer: "bg-emerald-50 text-emerald-800 border-emerald-200",
  sponsorship_patron: "bg-rose-50 text-rose-900 border-rose-200",
  free_stay_eligible: "bg-champagne/10 text-champagne border-champagne/30",
  compensation_holder: "bg-teal-50 text-teal-800 border-teal-200",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-100 text-rose-800",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  pending: "bg-orange-100 text-orange-800",
  refunded: "bg-slate-100 text-slate-600",
  free_stay: "bg-violet-100 text-violet-800",
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  occupied: "bg-blue-100 text-blue-800",
  blocked: "bg-amber-100 text-amber-800",
  maintenance: "bg-rose-100 text-rose-800",
};

export const EXTENSION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_approval: "bg-amber-100 text-amber-800",
  pending_payment: "bg-orange-100 text-orange-800",
  payment_failed: "bg-rose-100 text-rose-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  alternative_offered: "bg-violet-100 text-violet-800",
  cancelled: "bg-slate-100 text-slate-600",
};
