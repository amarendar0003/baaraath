// Shared filter configuration for the services page.
// Used by the server page (filtering + counts) and the client filter components.

export const VENUE_TYPES = [
  { key: "banquet_hall", label: "Banquet Hall", categorySlug: "banquet_hall", pattern: /banquet/ },
  { key: "convention_center", label: "Convention Center", categorySlug: "", pattern: /convention/ },
  { key: "resort", label: "Resort", categorySlug: "", pattern: /resort/ },
] as const;

export const CAPACITY_OPTIONS = [
  { key: "lt100", label: "<100" },
  { key: "100_300", label: "100 - 300" },
  { key: "300_500", label: "300 - 500" },
  { key: "500_800", label: "500 - 800" },
  { key: "gt800", label: ">800" },
] as const;

export const AMENITIES = [
  { key: "ac", label: "AC / Air Conditioned", pattern: /\b(ac|a\/c|air[\s-]?condition(ed|ing)?)\b/ },
  { key: "parking", label: "Parking", pattern: /\bparking\b/ },
  { key: "power_backup", label: "Power Backup", pattern: /(power[\s-]?backup|generator|\bups\b|inverter)/ },
  { key: "rooms", label: "Rooms", pattern: /\brooms?\b/ },
] as const;

// "pattern" is a regex source; it is prefixed with in-house / outside when matching.
// Air-conditioning type for banquet halls (the "Any Type" dropdown).
export const AC_TYPES = [
  { key: "ac", label: "AC" },
  { key: "non_ac", label: "Non-AC" },
] as const;

const NON_AC_PATTERN =
  /(non[\s-]?a\/?c\b|non[\s-]?air[\s-]?condition(ed|ing)?|without\s+(ac|a\/c|air[\s-]?condition(ed|ing)?))/;

const NON_AC_PATTERN_GLOBAL = new RegExp(NON_AC_PATTERN.source, "g");

export const OTHER_SERVICES = [
  { key: "catering", label: "Catering", pattern: "catering" },
  { key: "decoration", label: "Decoration", pattern: "decoration" },
  { key: "event_management", label: "Event Management", pattern: "event[\\s-]?management" },
  { key: "priests", label: "Priests", pattern: "priests?" },
  { key: "music", label: "Music", pattern: "music" },
  { key: "dance_floor", label: "Dance Floor", pattern: "dance[\\s-]?floor" },
] as const;

// Country > State > District > Cities (used for the cascading location filters).
export const LOCATION_MAP: Record<string, Record<string, string[]>> = {
  Telangana: {
    Hyderabad: ["Hyderabad"],
    Warangal: ["Warangal"],
    Khammam: ["Khammam"],
    Nalgonda: ["Nalgonda"],
    Karimnagar: ["Karimnagar"],
    Adilabad: ["Adilabad"],
  },
  "Andhra Pradesh": {
    NTR: ["Vijayawada"],
    Visakhapatnam: ["Visakhapatnam"],
  },
  Karnataka: { "Bengaluru Urban": ["Bengaluru"] },
  "Tamil Nadu": { Chennai: ["Chennai"] },
  Maharashtra: { "Mumbai City": ["Mumbai"] },
  Delhi: { Delhi: ["Delhi"] },
};

export function findLocationForCity(city: string) {
  const target = city.trim().toLowerCase();

  for (const [state, districts] of Object.entries(LOCATION_MAP)) {
    for (const [district, cities] of Object.entries(districts)) {
      if (cities.some((item) => item.toLowerCase() === target)) {
        return { state, district };
      }
    }
  }

  return null;
}

export function findStateForDistrict(district: string) {
  for (const [state, districts] of Object.entries(LOCATION_MAP)) {
    if (district in districts) return state;
  }

  return "";
}

export function citiesForLocation(state: string, district: string) {
  const result: string[] = [];

  for (const [stateName, districts] of Object.entries(LOCATION_MAP)) {
    if (state && stateName !== state) continue;

    for (const [districtName, cities] of Object.entries(districts)) {
      if (district && districtName !== district) continue;
      result.push(...cities);
    }
  }

  return result;
}

export type Facets = {
  ac: boolean;
  nonAc: boolean;
  venueType: string[];
  amenities: string[];
  inhouse: string[];
  outside: string[];
  capacity: number | null;
};

export type FacetSelection = {
  acType: string;
  venueType: string[];
  capacity: string;
  amenities: string[];
  inhouse: string[];
  outside: string[];
};

export type FacetCounts = {
  venueType: Record<string, number>;
  amenities: Record<string, number>;
  inhouse: Record<string, number>;
  outside: Record<string, number>;
};

function extractCapacity(text: string) {
  const numbers: number[] = [];

  for (const match of text.matchAll(
    /(\d[\d,]{1,5})\s*\+?\s*(?:guests?|pax|people|persons|seats?|seating)/g,
  )) {
    numbers.push(parseInt(match[1].replace(/,/g, ""), 10));
  }

  for (const match of text.matchAll(
    /capacity(?:\s*(?:of|:|-))?\s*(\d[\d,]{1,5})/g,
  )) {
    numbers.push(parseInt(match[1].replace(/,/g, ""), 10));
  }

  const valid = numbers.filter((value) => Number.isFinite(value));

  return valid.length ? Math.max(...valid) : null;
}

// The database has no venue-specific columns, so these are read from the
// service title / description text (and the category for venue type).
export function getFacets(input: {
  title: string;
  description: string | null;
  categorySlug: string;
}): Facets {
  const text = `${input.title} ${input.description ?? ""}`.toLowerCase();

  const nonAc = NON_AC_PATTERN.test(text);

  // "Non-AC" must not be counted as AC.
  const ac = AMENITIES[0].pattern.test(
    text.replace(NON_AC_PATTERN_GLOBAL, " "),
  );

  return {
    ac,
    nonAc,

    venueType: VENUE_TYPES.filter(
      (item) =>
        item.pattern.test(text) ||
        item.pattern.test(input.categorySlug.toLowerCase().replace(/[_-]+/g, " ")),
    ).map((item) => item.key),

    amenities: AMENITIES.filter((item) =>
      item.key === "ac" ? ac : item.pattern.test(text),
    ).map((item) => item.key),

    inhouse: OTHER_SERVICES.filter((item) =>
      new RegExp(`in[\\s-]?house\\s+${item.pattern}`).test(text),
    ).map((item) => item.key),

    outside: OTHER_SERVICES.filter((item) =>
      new RegExp(`(outside|external)\\s+${item.pattern}`).test(text),
    ).map((item) => item.key),

    capacity: extractCapacity(text),
  };
}

function capacityMatches(capacity: number | null, key: string) {
  if (capacity === null) return false;

  switch (key) {
    case "lt100":
      return capacity < 100;
    case "100_300":
      return capacity >= 100 && capacity <= 300;
    case "300_500":
      return capacity > 300 && capacity <= 500;
    case "500_800":
      return capacity > 500 && capacity <= 800;
    case "gt800":
      return capacity > 800;
    default:
      return true;
  }
}

export function hasFacetSelection(selection: FacetSelection) {
  return Boolean(
    selection.acType ||
      selection.venueType.length ||
      selection.capacity ||
      selection.amenities.length ||
      selection.inhouse.length ||
      selection.outside.length,
  );
}

export function matchesSelection(facets: Facets, selection: FacetSelection) {
  if (selection.acType === "ac" && !facets.ac) {
    return false;
  }

  if (selection.acType === "non_ac" && !facets.nonAc) {
    return false;
  }

  if (
    selection.venueType.length &&
    !selection.venueType.some((key) => facets.venueType.includes(key))
  ) {
    return false;
  }

  if (selection.capacity && !capacityMatches(facets.capacity, selection.capacity)) {
    return false;
  }

  if (!selection.amenities.every((key) => facets.amenities.includes(key))) {
    return false;
  }

  if (!selection.inhouse.every((key) => facets.inhouse.includes(key))) {
    return false;
  }

  if (!selection.outside.every((key) => facets.outside.includes(key))) {
    return false;
  }

  return true;
}

export function countFacets(list: Facets[]): FacetCounts {
  const counts: FacetCounts = {
    venueType: {},
    amenities: {},
    inhouse: {},
    outside: {},
  };

  for (const facets of list) {
    for (const key of facets.venueType) {
      counts.venueType[key] = (counts.venueType[key] || 0) + 1;
    }
    for (const key of facets.amenities) {
      counts.amenities[key] = (counts.amenities[key] || 0) + 1;
    }
    for (const key of facets.inhouse) {
      counts.inhouse[key] = (counts.inhouse[key] || 0) + 1;
    }
    for (const key of facets.outside) {
      counts.outside[key] = (counts.outside[key] || 0) + 1;
    }
  }

  return counts;
}