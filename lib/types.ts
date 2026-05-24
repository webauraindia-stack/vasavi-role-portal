export type GuestType =
  | "visitor"
  | "vci_member"
  | "kcgf_donor"
  | "vksp_member"
  | "service_volunteer"
  | "sponsorship_patron"
  | "free_stay_eligible"
  | "compensation_holder";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type PaymentStatus = "paid" | "partial" | "pending" | "refunded" | "free_stay";

export type RoomStatus = "available" | "occupied" | "blocked" | "maintenance";

export type NotificationType =
  | "new_booking"
  | "vip_arrival"
  | "coupon_expiry"
  | "payment_pending"
  | "low_inventory"
  | "festival_rush"
  | "stay_extension";

export interface ManagerHotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  managerName: string;
}

export interface AppliedCouponLog {
  code: string;
  name: string;
  type: string;
  amountDeducted: number;
  redeemedAt: string;
}

export interface ManagerBooking {
  id: string;
  reference: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  memberId?: string;
  guestType: GuestType;
  guestTypeLabel: string;
  donorTier?: string;
  roomType: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  subtotal: number;
  tierDiscount: number;
  couponDiscount: number;
  walletApplied: number;
  taxes: number;
  total: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCode: string;
  specialRequests?: string;
  source: "website" | "walk_in" | "phone" | "donor_portal" | "in_house";
  appliedCoupons: AppliedCouponLog[];
  isVip: boolean;
  isInHouse: boolean;
  roomId?: string;
  guestCount?: number;
  notes?: string;
  paymentReference?: string;
  paymentGateway?: string;
  paymentPaidAt?: string;
  baseAmountDisplay?: string;
  discountDisplay?: string;
  finalAmountDisplay?: string;
  createdAt: string;
}

export interface DonorHotelBookingRecord {
  bookingRef: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  benefitsApplied: string;
  amountPaid: number;
  paymentStatus: string;
}

/** View-only donor snapshot for hotel manager — balances managed by Super Admin */
export interface DonorProfile {
  id: string;
  donorId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  tier: string;
  donationCategory: string;
  sponsorshipTypes: string[];
  totalDonation: number;
  annadanamContribution: number;
  sponsoredRooms: string[];
  freeStaysRemaining: number;
  compensationBalance: number;
  freeStayEligible: boolean;
  donorSponsored: boolean;
  activeCoupons: number;
  expiryNearest?: string;
  hotelId: string;
  specialInstructions?: string;
  remainingEligibility: string;
  usageHistory: { date: string; bookingRef: string; benefit: string; amount: number }[];
  hotelBookingHistory: DonorHotelBookingRecord[];
}

export interface MemberProfile {
  id: string;
  memberId: string;
  name: string;
  clubName: string;
  category: string;
  phone: string;
  freeStaysRemaining: number;
  compensationBalance: number;
  status: "active" | "expired";
}

export interface RoomInventory {
  id: string;
  hotelId: string;
  number: string;
  name: string;
  category: string;
  status: RoomStatus;
  floor: number;
  maxOccupancy: number;
  isDonorExclusive: boolean;
  imageUrl?: string;
  basePricePerNight?: number;
  description?: string;
  isActive?: boolean;
  operationalStatus?: "available" | "blocked" | "maintenance";
  blockedReason?: string;
  blockedUntil?: string;
  maintenanceUntil?: string;
}

export interface ManagerNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  hotelId: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  guestName: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  hotelId: string;
}

export interface CommunityActivity {
  id: string;
  title: string;
  type: "satsang" | "annadanam" | "festival" | "seva";
  date: string;
  attendees: number;
  hotelId: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
  donorSavings: number;
}
