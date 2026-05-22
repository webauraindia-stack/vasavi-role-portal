import type { Hotel, Room, DateAvailability } from "@/types";
import { getHotelImages, ROOM_IMAGES } from "@/lib/data/hotel-images";

type HotelBase = Omit<Hotel, "thumbnail" | "heroImage" | "images">;

function withImages(hotel: HotelBase): Hotel {
  const imgs = getHotelImages(hotel.slug);
  return { ...hotel, ...imgs };
}

const HOTELS_RAW = [
  {
    id: "1",
    slug: "vasavi-nityannadana-residency-hyderabad",
    name: "Sri Vasavi Nityannadana Residency",
    city: "Hyderabad",
    country: "India",
    region: "Telangana",
    description:
      "A premium heritage-style hotel designed for families and corporate visitors of the Vysya community. Offering traditional Satvik dining, luxury suites, and elegant prayer halls near the heritage markets.",
    starRating: 4,
    startingPrice: 2500,
    roomCount: 180,
    amenities: ["Temple View", "Restaurant", "Satsang Hall", "Prasadam", "Room Service", "Community Kitchen"],
    latitude: 17.3850,
    longitude: 78.4867,
    hasDonorRooms: true,
    overallRating: 4.8,
    reviews: [],
    nearbyAttractions: [
      "Charminar & Mecca Masjid (1.2 km)",
      "Birla Mandir (3.5 km)",
      "Sri Kanyaka Parameswari Temple, Secunderabad (6.8 km)"
    ],
  },
  {
    id: "2",
    slug: "tirumala-venkateswara-stay",
    name: "Sri Venkateswara Pilgrim Stay",
    city: "Tirupati",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "Affordable and highly trusted accommodations near Tirumala foothills. Offers special counters for Darshan guidance, community kitchens, and free bus shuttles to Alipiri.",
    starRating: 3,
    startingPrice: 1200,
    roomCount: 200,
    amenities: ["Temple Transport", "Annadanam", "Spiritual Library", "Sacred Corridors", "Pooja Services"],
    latitude: 13.6288,
    longitude: 79.4192,
    hasDonorRooms: true,
    overallRating: 4.7,
    reviews: [],
    nearbyAttractions: [
      "Sri Venkateswara Swamy Temple (0.5 km)",
      "Kapila Theertham Waterfalls (2.0 km)",
      "Alipiri Srivari Padala Mandapam (2.8 km)"
    ],
  },
  {
    id: "3",
    slug: "vasavi-kanyaka-grand-vijayawada",
    name: "Sri Vasavi Kanyaka Grand",
    city: "Vijayawada",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "Overlooking the beautiful Krishna River and near the sacred Kanaka Durga Temple. A luxury traditional hotel offering spiritual suites, pure Satvik food, and community congregation halls.",
    starRating: 4,
    startingPrice: 1800,
    roomCount: 150,
    amenities: ["Temple View", "Restaurant", "Pooja Services", "Heritage", "Rooftop"],
    latitude: 16.5062,
    longitude: 80.6480,
    hasDonorRooms: true,
    overallRating: 4.6,
    reviews: [],
    nearbyAttractions: [
      "Kanaka Durga Temple (0.8 km)",
      "Prakasam Barrage (1.5 km)",
      "Undavalli Caves (4.2 km)"
    ],
  },
  {
    id: "4",
    slug: "vizag-ocean-view-retreat",
    name: "Vizag Ocean View Vasavi Retreat",
    city: "Visakhapatnam",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "A clean, family-friendly hotel facing the scenic RK Beach. Melding coastal wellness with rich South Indian cultural aesthetics, perfect for weekend pilgrim getaways.",
    starRating: 4,
    startingPrice: 2200,
    roomCount: 110,
    amenities: ["WiFi", "Meditation Room", "Restaurant", "Airport Shuttle", "Satsang Hall"],
    latitude: 17.6868,
    longitude: 83.2185,
    hasDonorRooms: false,
    overallRating: 4.5,
    reviews: [],
    nearbyAttractions: [
      "Rama Krishna Beach (0.1 km)",
      "Simhachalam Varaha Lakshmi Narasimha Temple (12.0 km)",
      "Kailasagiri Hill Park (6.5 km)"
    ],
  },
  {
    id: "5",
    slug: "bengaluru-vasavi-royal-heritage",
    name: "Bengaluru Vasavi Royal Heritage",
    city: "Bengaluru",
    country: "India",
    region: "Karnataka",
    description:
      "Located near traditional business hubs, offering majestic rosewood interiors and traditional South Indian temple architecture coupled with elite donor suites.",
    starRating: 4,
    startingPrice: 2800,
    roomCount: 140,
    amenities: ["Restaurant", "Pooja Services", "Gym", "Conference", "WiFi"],
    latitude: 12.9716,
    longitude: 77.5946,
    hasDonorRooms: true,
    overallRating: 4.9,
    reviews: [],
    nearbyAttractions: [
      "Bull Temple Basavanagudi (2.0 km)",
      "Sri Banashankari Amma Temple (4.5 km)",
      "Lalbagh Botanical Garden (3.0 km)"
    ],
  },
  {
    id: "6",
    slug: "chennai-kanyaka-parameswari-lodge",
    name: "Chennai Kanyaka Parameswari Lodge",
    city: "Chennai",
    country: "India",
    region: "Tamil Nadu",
    description:
      "Located in the bustling heritage streets of George Town, this lodge provides sacred comfort, traditional pure-vegetarian catering, and proximity to local temples.",
    starRating: 3,
    startingPrice: 1600,
    roomCount: 120,
    amenities: ["Sacred Corridors", "Restaurant", "Satsang Hall", "WiFi"],
    latitude: 13.0827,
    longitude: 80.2707,
    hasDonorRooms: true,
    overallRating: 4.4,
    reviews: [],
    nearbyAttractions: [
      "Sri Kalikambal Temple (0.4 km)",
      "Kapaleeshwarar Temple Mylapore (6.8 km)",
      "Marina Beach (4.0 km)"
    ],
  },
  {
    id: "7",
    slug: "srisailam-mallikarjuna-retreat",
    name: "Srisailam Mallikarjuna Devotee Stay",
    city: "Srisailam",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "A calm devotional guest property amidst the sacred forests. Connect with Lord Shiva in absolute spiritual peace with basic, clean amenities for pilgrims.",
    starRating: 3,
    startingPrice: 900,
    roomCount: 80,
    amenities: ["Sacred Corridors", "Meditation Room", "Prasadam", "Temple View"],
    latitude: 16.0717,
    longitude: 78.8669,
    hasDonorRooms: false,
    overallRating: 4.5,
    reviews: [],
    nearbyAttractions: [
      "Bhramaramba Mallikarjuna Temple (0.5 km)",
      "Pathala Ganga Ghats (1.8 km)",
      "Srisailam Dam Viewpoint (3.2 km)"
    ],
  },
  {
    id: "8",
    slug: "warangal-bhadrakali-niwas",
    name: "Warangal Vasavi Bhadrakali Niwas",
    city: "Warangal",
    country: "India",
    region: "Telangana",
    description:
      "Exquisite hotel highlighting the Kakatiya stone art aesthetics, located adjacent to the ancient Bhadrakali Temple. Enjoy peaceful chanting views and traditional community dining.",
    starRating: 3,
    startingPrice: 1300,
    roomCount: 95,
    amenities: ["Temple View", "Heritage", "Restaurant", "Satsang Hall"],
    latitude: 17.9784,
    longitude: 79.5941,
    hasDonorRooms: true,
    overallRating: 4.5,
    reviews: [],
    nearbyAttractions: [
      "Bhadrakali Temple (0.2 km)",
      "Thousand Pillar Temple (3.0 km)",
      "Warangal Fort Ruins (5.5 km)"
    ],
  },
  {
    id: "9",
    slug: "rajahmundry-vasavi-godavari-sadan",
    name: "Rajahmundry Vasavi Godavari Sadan",
    city: "Rajahmundry",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "Perfect for families coming for Pushkaram ghat rituals. Enjoy panoramic river views, clean marble-floored AC rooms, and pure Satvik meals cooked by community chefs.",
    starRating: 3,
    startingPrice: 1400,
    roomCount: 110,
    amenities: ["Rooftop", "Temple Transport", "Restaurant", "Annadanam", "Pooja Services"],
    latitude: 17.0005,
    longitude: 81.8040,
    hasDonorRooms: true,
    overallRating: 4.7,
    reviews: [],
    nearbyAttractions: [
      "Kotilingeshwara Temple (0.9 km)",
      "Godavari River Bridge View (1.5 km)",
      "Iskcon Rajahmundry (2.6 km)"
    ],
  },
  {
    id: "10",
    slug: "kakinada-vasavi-grand",
    name: "Kakinada Vasavi Grand Stay",
    city: "Kakinada",
    country: "India",
    region: "Andhra Pradesh",
    description:
      "A modern-traditional business and pilgrim hybrid hotel in the heart of Kakinada, popular for its rich Andhra-style hospitality, warm interiors, and spacious community function halls.",
    starRating: 3,
    startingPrice: 1500,
    roomCount: 105,
    amenities: ["Satsang Hall", "Restaurant", "Conference", "WiFi"],
    latitude: 16.9891,
    longitude: 82.2475,
    hasDonorRooms: true,
    overallRating: 4.5,
    reviews: [],
    nearbyAttractions: [
      "Kakinada Beach & Port (4.5 km)",
      "Sri Bhimeswara Swamy Temple Samalkot (13.5 km)",
      "Coringa Wildlife Sanctuary (15.0 km)"
    ],
  },
  {
    id: "11",
    slug: "mysore-vasavi-chamundeshwari-palace",
    name: "Mysore Vasavi Chamundeshwari Palace",
    city: "Mysore",
    country: "India",
    region: "Karnataka",
    description:
      "A royal palace-inspired heritage stay located close to the Chamundi Hills. Embellished with beautiful traditional rosewood carvings, courtyard gardens, and spiritual luxury.",
    starRating: 4,
    startingPrice: 2000,
    roomCount: 130,
    amenities: ["Heritage", "Restaurant", "Pooja Services", "WiFi"],
    latitude: 12.2958,
    longitude: 76.6394,
    hasDonorRooms: true,
    overallRating: 4.8,
    reviews: [],
    nearbyAttractions: [
      "Mysore Palace (2.2 km)",
      "Chamundeshwari Temple (7.5 km)",
      "Brindavan Gardens (16.0 km)"
    ],
  },
];

export const HOTELS: Hotel[] = HOTELS_RAW.map((h) => withImages(h as HotelBase));

export const MOCK_REVIEWS = [
  {
    id: "r1",
    guestName: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    dateOfStay: "2025-03-12",
    text: "Very peaceful and clean. Perfect for families. The temple view from the corridor was beautiful, and the prasadam was divine.",
    roomType: "Family Room",
    helpful: 24,
  },
  {
    id: "r2",
    guestName: "Srinivas Rao",
    city: "Hyderabad",
    rating: 4,
    dateOfStay: "2025-02-28",
    text: "Simple, affordable, and neat. Felt very safe for my elderly parents. Highly recommended for Vysha community members.",
    roomType: "Standard Non-AC",
    helpful: 12,
  },
];

HOTELS.forEach((h) => {
  h.reviews = MOCK_REVIEWS;
});

export function getHotelBySlug(slug: string): Hotel | undefined {
  return HOTELS.find((h) => h.slug === slug);
}

export function getAllHotelSlugs(): string[] {
  return HOTELS.map((h) => h.slug);
}

export function getRoomsForHotel(hotelId: string): Room[] {
  const hotel = HOTELS.find((h) => h.id === hotelId);
  if (!hotel) return [];

  const baseRooms: Omit<Room, "id" | "hotelId" | "hotelSlug" | "hotelName">[] = [
    {
      name: "Standard Non-AC",
      category: "Standard",
      description: "Simple, clean room with twin beds and a fan. Ideal for single pilgrims or budget travelers.",
      pricePerNight: hotel.startingPrice,
      bedType: "Twin",
      sizeSqFt: 150,
      maxOccupancy: 2,
      floor: 1,
      amenities: ["Fan", "Attached Bath", "Hot Water"],
      images: [ROOM_IMAGES.standard],
      isDonorExclusive: false,
      isFullyBooked: false,
    },
    {
      name: "Standard AC",
      category: "Deluxe",
      description: "Comfortable air-conditioned room with simple wooden furniture.",
      pricePerNight: Math.round(hotel.startingPrice * 1.5),
      bedType: "Queen",
      sizeSqFt: 180,
      maxOccupancy: 2,
      floor: 2,
      amenities: ["Air Conditioning", "Attached Bath", "Hot Water"],
      images: [ROOM_IMAGES.deluxe],
      isDonorExclusive: false,
      isFullyBooked: Math.random() > 0.85,
    },
    {
      name: "Family Room",
      category: "Suite",
      description: "Spacious room with multiple beds, perfect for families traveling together for Darshan.",
      pricePerNight: Math.round(hotel.startingPrice * 2),
      bedType: "2 Queen",
      sizeSqFt: 300,
      maxOccupancy: 4,
      floor: 2,
      amenities: ["Air Conditioning", "Attached Bath", "Extra Beds Available"],
      images: [ROOM_IMAGES.family],
      isDonorExclusive: false,
      isFullyBooked: false,
    },
    {
      name: "Donor AC Room",
      category: "Suite",
      description: "Reserved AC accommodation for our community donors.",
      pricePerNight: Math.round(hotel.startingPrice * 1.2),
      bedType: "Queen",
      sizeSqFt: 200,
      maxOccupancy: 3,
      floor: 3,
      amenities: ["Air Conditioning", "Priority Darshan Info", "Prasadam Delivery"],
      images: [ROOM_IMAGES.deluxe],
      isDonorExclusive: true,
      donorTierRequired: "gold",
      isFullyBooked: false,
    },
  ];

  if (hotel.starRating >= 4) {
    baseRooms.push({
      name: "Penthouse Suite",
      category: "Penthouse",
      description: "Premium top-floor suite with panoramic views and dedicated seva desk.",
      pricePerNight: Math.round(hotel.startingPrice * 3.5),
      bedType: "King",
      sizeSqFt: 520,
      maxOccupancy: 4,
      floor: 5,
      amenities: ["Air Conditioning", "Temple View", "Room Service", "Lounge Access"],
      images: [ROOM_IMAGES.suite],
      isDonorExclusive: false,
      isFullyBooked: false,
    });
  }

  const propertyThumb = getHotelImages(hotel.slug).thumbnail;

  return baseRooms.map((r, i) => ({
    ...r,
    id: `${hotelId}-room-${i}`,
    hotelId: hotel.id,
    hotelSlug: hotel.slug,
    hotelName: hotel.name,
    images: r.images.length > 0 ? r.images : [propertyThumb],
  }));
}

export function getAllRooms(): Room[] {
  return HOTELS.flatMap((h) => getRoomsForHotel(h.id));
}

export function searchRooms(filters: {
  hotels?: string[];
  roomTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  donorExclusive?: boolean;
}): Room[] {
  let rooms = getAllRooms();

  if (!filters.donorExclusive) {
    rooms = rooms.filter((r) => !r.isFullyBooked);
  }

  if (filters.hotels?.length) {
    rooms = rooms.filter((r) => filters.hotels!.includes(r.hotelId));
  }
  if (filters.roomTypes?.length) {
    rooms = rooms.filter((r) => filters.roomTypes!.includes(r.category));
  }
  if (filters.priceMin !== undefined) {
    rooms = rooms.filter((r) => r.pricePerNight >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    rooms = rooms.filter((r) => r.pricePerNight <= filters.priceMax!);
  }
  if (filters.donorExclusive) {
    rooms = rooms.filter((r) => r.isDonorExclusive);
  }

  return rooms;
}

export function getAvailabilityCalendar(
  _hotelId: string,
  months = 3
): DateAvailability[] {
  const result: DateAvailability[] = [];
  const today = new Date();
  const totalDays = months * 31;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const rand = Math.random();
    const status =
      rand > 0.7 ? "available" : rand > 0.4 ? "limited" : "booked";
    result.push({
      date: d.toISOString().split("T")[0],
      status,
    });
  }
  return result;
}

export const TRUST_STATS = {
  totalBookings: 85450,
  yearsOperating: 42,
  cities: 11,
};

export const MOCK_DONOR = {
  id: "donor-1",
  donorId: "DH-2024-8842",
  name: "Srinivas Rao",
  email: "srinivas@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  memberCategory: "kcgf_donor" as const,
  clubName: "Vasavi Club Hyderabad",
  city: "Hyderabad",
  tier: "gold" as const,
  totalDonation: 55000,
  discountPercent: 30,
  monthlyBookingQuota: 4,
  monthlyBookingsUsed: 1,
  quotaResetDate: "2025-06-01",
  memberSince: "2022-08-15",
  donations: [
    { id: "d1", date: "2025-01-10", amount: 20000, paymentMethod: "UPI" },
  ],
  bookings: [
    {
      id: "bk-001",
      reference: "VH-7K2M9P",
      hotelId: "1",
      hotelName: "Sri Vasavi Nityannadana Residency",
      roomType: "Deluxe AC",
      roomNumber: "204",
      checkIn: "2026-05-22",
      checkOut: "2026-05-24",
      nights: 2,
      subtotal: 7500,
      totalPaid: 3065,
      discountApplied: 4750,
      status: "checked_in" as const,
      guestEmail: "srinivas@example.com",
      guestPhone: "+91 98480 12345",
    },
  ],
};
