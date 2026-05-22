export type DonorTier = "bronze" | "silver" | "gold" | "platinum" | "elite" | null;

export type CouponType =
  | "free_booking"
  | "percentage_discount"
  | "fixed_compensation"
  | "special_access"
  | "premium_benefit"
  | "festival_special";

export type MemberCategory =
  | "vci_life_member"
  | "vksp_member"
  | "kcgf_donor"
  | "service_volunteer"
  | "sponsorship_patron"
  | "senior_member"
  | "community_guest";

export interface CommunityMemberProfile {
  id: string;
  memberId: string;
  displayId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  coverImageUrl: string;
  category: MemberCategory;
  categoryLabel: string;
  clubName: string;
  city: string;
  memberSince: string;
  contributionLevel: string;
  totalContribution: number;
  freeStaysRemaining: number;
  compensationWallet: number;
  isDonor: boolean;
  tier: DonorTier;
  sevaHours?: number;
  sponsorshipTier?: string;
  bookingHistoryCount: number;
  donor: Donor;
}

export interface BenefitWalletSummary {
  freeStayCoupons: number;
  discountCoupons: number;
  compensationBalance: number;
  festivalCoupons: number;
  donorRewardActive: boolean;
  tierDiscountPercent: number;
  headlineBenefits: string[];
}

export interface AppliedBenefitLine {
  id: string;
  label: string;
  amount: number;
  type: "tier" | "coupon" | "wallet" | "promo" | "donation_credit";
  detail?: string;
  icon?: string;
}

export interface BookingPricingResult {
  nights: number;
  subtotal: number;
  tierDiscount: number;
  couponDiscount: number;
  walletApplied: number;
  promoDiscount: number;
  taxableBase: number;
  taxes: number;
  sevaDonation: number;
  total: number;
  isFullyCovered: boolean;
  appliedLines: AppliedBenefitLine[];
  remainingFreeStays: number;
  remainingCompensation: number;
  couponsConsumed: string[];
  suggestionMessage: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  value: number;
  minBookingAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: "available" | "redeemed" | "expired" | "pending_approval";
  description: string;
  source: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CouponType;
  rewardValue: number;
  minDonationRequired: number;
  description: string;
  active: boolean;
  expiryDays: number;
  redemptionsCount: number;
}

export type AmenityTag =
  | "Pool"
  | "Rooftop"
  | "Pet-Friendly"
  | "Heritage"
  | "Spa"
  | "Conference"
  | "WiFi"
  | "Restaurant"
  | "Gym"
  | "Parking"
  | "Room Service"
  | "Airport Shuttle"
  | "Temple View"
  | "Prasadam"
  | "Satsang Hall"
  | "Community Kitchen"
  | "Temple Transport"
  | "Annadanam"
  | "Spiritual Library"
  | "Pooja Services"
  | "Sacred Corridors"
  | "Meditation Room";

export type RoomCategory = "Standard" | "Deluxe" | "Suite" | "Penthouse";

export type BookingStatus =
  | "confirmed"
  | "cancelled"
  | "completed"
  | "pending"
  | "checked_in";

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  region: string;
  description: string;
  starRating: number;
  startingPrice: number;
  roomCount: number;
  amenities: AmenityTag[];
  images: string[];
  heroImage: string;
  thumbnail: string;
  latitude: number;
  longitude: number;
  hasDonorRooms: boolean;
  reviews: Review[];
  overallRating: number;
  nearbyAttractions?: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  name: string;
  category: RoomCategory;
  description: string;
  pricePerNight: number;
  bedType: string;
  sizeSqFt: number;
  maxOccupancy: number;
  floor: number;
  amenities: string[];
  images: string[];
  isDonorExclusive: boolean;
  donorTierRequired?: DonorTier;
  isFullyBooked: boolean;
  availableDates?: string[];
}

export interface Review {
  id: string;
  guestName: string;
  city: string;
  rating: number;
  dateOfStay: string;
  text: string;
  roomType: string;
  helpful?: number;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  preferredLanguage?: string;
  isDonor: boolean;
  donorId?: string;
}

export interface Donor {
  id: string;
  donorId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  memberCategory?: MemberCategory;
  clubName?: string;
  city?: string;
  tier: DonorTier;
  totalDonation: number;
  discountPercent: number;
  monthlyBookingQuota: number;
  monthlyBookingsUsed: number;
  quotaResetDate: string;
  memberSince: string;
  donations: DonationRecord[];
  bookings: DonorBooking[];

  // Smart Coupon & Rewards Engine extensions
  rewardPoints: number;
  compensationCredits: number;
  coupons: Coupon[];
  loyaltyStreak: number;
  bookingBenefits: string[];
}

export interface DonationRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
}

export interface DonorBooking {
  id: string;
  reference?: string;
  hotelId?: string;
  hotelName: string;
  roomType: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  subtotal?: number;
  totalPaid: number;
  discountApplied: number;
  status: BookingStatus;
  guestEmail?: string;
  guestPhone?: string;
}

export interface Booking {
  id: string;
  reference: string;
  hotelId: string;
  hotelName: string;
  hotelSlug: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: GuestCount;
  roomCount: number;
  guestDetails: GuestDetails;
  subtotal: number;
  taxes: number;
  donorDiscount: number;
  promoDiscount: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
}

export interface GuestCount {
  adults: number;
  children: number;
  rooms: number;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  arrivalTime: string;
  specialRequests?: string;
}

export interface SearchFilters {
  hotels: string[];
  roomTypes: RoomCategory[];
  priceMin: number;
  priceMax: number;
  guests: GuestCount;
  amenities: AmenityTag[];
  donorExclusive: boolean;
  checkIn?: Date;
  checkOut?: Date;
  hotelId?: string;
}

export interface TierInfo {
  tier: DonorTier;
  name: string;
  minAmount: number;
  maxAmount: number | null;
  discountPercent: number;
  benefits: string[];
  colorClass: string;
}

export type AvailabilityStatus = "available" | "limited" | "booked";

export interface DateAvailability {
  date: string;
  status: AvailabilityStatus;
}
