import type { ManagerBooking, RoomInventory } from "@/lib/types";

export type ExtensionStatus =
  | "draft"
  | "pending_approval"
  | "pending_payment"
  | "payment_failed"
  | "approved"
  | "completed"
  | "rejected"
  | "alternative_offered"
  | "cancelled";

export type ExtensionApprovalSource = "auto" | "admin" | "super_admin";

export interface ExtensionPricing {
  extraNights: number;
  nightlyRate: number;
  subtotal: number;
  tierDiscount: number;
  taxes: number;
  waivedAmount: number;
  totalDue: number;
  currency: "INR";
}

export interface AlternativeRoomOffer {
  roomId: string;
  roomNumber: string;
  roomName: string;
  category: string;
  priceDifference: number;
  available: boolean;
}

export interface StayExtensionAuditEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  at: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface StayExtensionRequest {
  id: string;
  bookingReference: string;
  bookingId: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber?: string;
  roomType: string;
  originalCheckOut: string;
  requestedCheckOut: string;
  status: ExtensionStatus;
  availabilityStatus: "available" | "conflict" | "maintenance" | "unknown";
  conflictReason?: string;
  pricing?: ExtensionPricing;
  alternativeRooms?: AlternativeRoomOffer[];
  selectedAlternativeRoomId?: string;
  paymentMethod?: "upi" | "card" | "netbanking";
  paymentTransactionId?: string;
  approvalSource?: ExtensionApprovalSource;
  approvedBy?: string;
  rejectionReason?: string;
  adminNote?: string;
  notificationsSent: string[];
  auditLog: StayExtensionAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtensionAnalytics {
  totalRequests: number;
  completed: number;
  pending: number;
  rejected: number;
  failedConflict: number;
  additionalRevenue: number;
  approvalRate: number;
  byHotel: { hotelId: string; hotelName: string; count: number; revenue: number }[];
  byStatus: Record<string, number>;
}

/** Subset of booking fields used by stay-extension engine (rupees for pricing). */
export interface ExtensionBookingContext {
  id: string;
  reference: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  subtotal: number;
  taxes: number;
  total: number;
  bookingStatus: ManagerBooking["bookingStatus"];
  paymentStatus: ManagerBooking["paymentStatus"];
}

export type ExtensionRoomContext = Pick<
  RoomInventory,
  "id" | "hotelId" | "number" | "name" | "category" | "status"
>;
