/**
 * Verified image URLs only (HTTP 200 tested).
 * Indian temples, Charminar, pilgrim stays, heritage — no broken or generic mismatched IDs.
 */

const q = "auto=format&fit=crop&w=800&q=80";

function img(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${q}`;
}

/** All IDs below return 200 from images.unsplash.com */
export const U = {
  charminarDay: "photo-1750834115164-8c2658f18dd0",
  charminarNight: "photo-1753068863517-a38273f2d7bd",
  charminarSilhouette: "photo-1743884092589-cbfe3689ebcf",
  templeFestival: "photo-1548013146-72479768bada",
  familyGathering: "photo-1511895426328-dc8714191300",
  heritageInterior: "photo-1618773928121-c32242e63f39",
  hotelLobby: "photo-1542314831-068cd1dbfeeb",
  hotelExterior: "photo-1551882547-ff40c63fe5fa",
  resortPool: "photo-1566073771259-6a8506099945",
  coastalHotel: "photo-1582719508461-905c673771fd",
  resortAerial: "photo-1571896349842-33c89424de2d",
  beachResort: "photo-1520250497591-112f2f40a3f4",
  hillLandscape: "photo-1606046604972-77cc76aee944",
  hotelRoom: "photo-1590490360182-c33d57733427",
  roomBalcony: "photo-1596394516093-501ba68a0ba6",
  andhraHotel: "photo-1584132967334-10e028bd69f7",
} as const;

export function unsplash(photoId: string): string {
  return img(photoId);
}

export const ROOM_IMAGES = {
  standard: img(U.hotelRoom),
  deluxe: img(U.roomBalcony),
  family: img(U.hotelLobby),
  suite: img(U.heritageInterior),
} as const;

export interface HotelImageSet {
  thumbnail: string;
  heroImage: string;
  images: string[];
}

export const HOTEL_IMAGES_BY_SLUG: Record<string, HotelImageSet> = {
  "vasavi-nityannadana-residency-hyderabad": {
    thumbnail: img(U.charminarDay),
    heroImage: img(U.charminarDay),
    images: [img(U.charminarDay), img(U.charminarNight), img(U.heritageInterior)],
  },
  "tirumala-venkateswara-stay": {
    thumbnail: img(U.templeFestival),
    heroImage: img(U.templeFestival),
    images: [img(U.templeFestival), img(U.hillLandscape), img(U.familyGathering)],
  },
  "vasavi-kanyaka-grand-vijayawada": {
    thumbnail: img(U.charminarSilhouette),
    heroImage: img(U.charminarSilhouette),
    images: [img(U.charminarSilhouette), img(U.resortAerial), img(U.heritageInterior)],
  },
  "vizag-ocean-view-retreat": {
    thumbnail: img(U.coastalHotel),
    heroImage: img(U.coastalHotel),
    images: [img(U.coastalHotel), img(U.beachResort), img(U.resortAerial)],
  },
  "bengaluru-vasavi-royal-heritage": {
    thumbnail: img(U.hotelLobby),
    heroImage: img(U.hotelLobby),
    images: [img(U.hotelLobby), img(U.heritageInterior), img(U.hotelExterior)],
  },
  "chennai-kanyaka-parameswari-lodge": {
    thumbnail: img(U.templeFestival),
    heroImage: img(U.templeFestival),
    images: [img(U.templeFestival), img(U.charminarSilhouette), img(U.hotelRoom)],
  },
  "srisailam-mallikarjuna-retreat": {
    thumbnail: img(U.hillLandscape),
    heroImage: img(U.hillLandscape),
    images: [img(U.hillLandscape), img(U.templeFestival), img(U.hotelRoom)],
  },
  "warangal-bhadrakali-niwas": {
    thumbnail: img(U.heritageInterior),
    heroImage: img(U.heritageInterior),
    images: [img(U.heritageInterior), img(U.charminarSilhouette), img(U.hotelExterior)],
  },
  "rajahmundry-vasavi-godavari-sadan": {
    thumbnail: img(U.coastalHotel),
    heroImage: img(U.coastalHotel),
    images: [img(U.coastalHotel), img(U.templeFestival), img(U.familyGathering)],
  },
  "kakinada-vasavi-grand": {
    thumbnail: img(U.andhraHotel),
    heroImage: img(U.andhraHotel),
    images: [img(U.andhraHotel), img(U.coastalHotel), img(U.hotelLobby)],
  },
  "mysore-vasavi-chamundeshwari-palace": {
    thumbnail: img(U.heritageInterior),
    heroImage: img(U.heritageInterior),
    images: [img(U.heritageInterior), img(U.charminarNight), img(U.resortPool)],
  },
};

export function getHotelImages(slug: string): HotelImageSet {
  return (
    HOTEL_IMAGES_BY_SLUG[slug] ?? {
      thumbnail: img(U.hotelExterior),
      heroImage: img(U.hotelExterior),
      images: [img(U.hotelExterior)],
    }
  );
}

