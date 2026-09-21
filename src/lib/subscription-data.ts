// lib/subscription-data.ts
//
// Central data + helpers for the Outlook subscription pages.
// Consumed by:
//   routes/bundle-subscription.tsx
//   routes/international-subscription.tsx

/* ------------------------------------------------------------------ */
/*  Remote covers JSON                                                */
/* ------------------------------------------------------------------ */

// const MAG_COVERS_URL = "https://kj2.outlookindia.com/assets/covers/mag_covers.json";
const MAG_COVERS_URL = "/api/mag-covers";

/** Keys of the MAG_IMG object in the remote JSON. */
export type MagCovers = {
  oli: string;
  olm: string;
  olt: string;
  olb: string;
  olh: string;
};

/** Keys of the BANNERS object in the remote JSON. */
export type Banners = {
  limitedDesktop: string;
  limitedMobile: string;
  printDesktop: string;
  printMobile: string;
  digitalDesktop: string;
  digitalMobile: string;
};

export type MagazineAssets = {
  MAG_IMG: MagCovers;
  BANNERS: Banners;

  INTL_MAGAZINES: IntlMagazine[];
};

/** Fallback covers — used before the fetch resolves, or if it fails. */
export const MAG_IMG_FALLBACK: MagCovers = {
  oli: "https://kj2.outlookindia.com/assets/covers/OLI4.jpg",
  olm: "https://kj2.outlookindia.com/assets/covers/olm-sep-26_w-655.jpg",
  olt: "https://kj2.outlookindia.com/assets/covers/OLTcoverAugSept2026.jpg",
  olb: "https://kj2.outlookindia.com/assets/covers/olb-sep-26_w-655.jpg",
  olh: "https://kj2.outlookindia.com/assets/covers/olh-sep-26_w-655.jpg",
};

/** Fallback banners — mirror of the values in the remote JSON. */
export const BANNERS_FALLBACK: Banners = {
  limitedDesktop: "https://img-2.outlookindia.com/outlookindia/banners/2026/05/18/1368-365.jpg",
  limitedMobile: "https://img-2.outlookindia.com/outlookindia/banners/2026/03/23/370-495-SM.jpg",
  printDesktop: "https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/d_1536-5125.jpg",
  printMobile: "https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/m-800-10673.jpg",
  digitalDesktop: "https://img-2.outlookindia.com/outlookindia/banners/2026/03/23/1536-512-E.jpg",
  digitalMobile: "https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/m-800-10673.jpg",
};

// export async function fetchMagazineAssets2222(): Promise<MagazineAssets> {
//   const bucket = Math.floor(Date.now() / (60 * 60 * 1000));
//   const url = `${MAG_COVERS_URL}?t=${bucket}`;
//   //console.log("Fetching magazine assets from:", url);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//     });
//     console.log ("HTTP response status:", res.status, res.statusText);
//     //if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const data = (await res.json()) as Partial<MagazineAssets>;
//     console.log("Data fetched from:", JSON.stringify(data, null, 2));
//     return {
//       MAG_IMG: { ...MAG_IMG_FALLBACK, ...(data.MAG_IMG ?? {}) },
//       BANNERS: { ...BANNERS_FALLBACK, ...(data.BANNERS ?? {}) },
//     };
//   } catch {
//     return { MAG_IMG: MAG_IMG_FALLBACK, BANNERS: BANNERS_FALLBACK };
//   }
// }

export async function fetchMagazineAssets(): Promise<MagazineAssets> {
  try {
    const res = await fetch(MAG_COVERS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Partial<MagazineAssets>;
    return {
      MAG_IMG: { ...MAG_IMG_FALLBACK, ...(data.MAG_IMG ?? {}) },
      BANNERS: { ...BANNERS_FALLBACK, ...(data.BANNERS ?? {}) },
      INTL_MAGAZINES: data.INTL_MAGAZINES?.length ? data.INTL_MAGAZINES : INTL_MAGAZINES_FALLBACK,
    };
  } catch (err) {
    console.error("[fetchMagazineAssets] falling back:", err);
    return { MAG_IMG: MAG_IMG_FALLBACK, BANNERS: BANNERS_FALLBACK,       INTL_MAGAZINES: INTL_MAGAZINES_FALLBACK };
  }
}

/* ------------------------------------------------------------------ */
/*  Magazine code → cover key                                         */
/* ------------------------------------------------------------------ */

/**
 * Maps a magazine code used in the data below (e.g. "OLI", "OLM", "OLT",
 * "OLB", "OLH") to a key of the MAG_IMG object in the remote JSON.
 */
export function coverKeyForCode(code: string): keyof MagCovers {
  const c = code.trim().toUpperCase();
  if (c === "OLI" || c === "OLIN" || c === "OUTLOOKINDIA") return "oli";
  if (c === "OLM" || c === "OLMO" || c === "OUTLOOKMONEY") return "olm";
  if (c === "OLT" || c === "OLTR" || c === "OUTLOOKTRAVELLER") return "olt";
  if (c === "OLB" || c === "OLBU" || c === "OUTLOOKBUSINESS") return "olb";
  if (c === "OLH" || c === "OLHI" || c === "OUTLOOKHINDI") return "olh";
  // Unknown code — default to Outlook India cover.
  return "oli";
}

export const LOGO = "https://kj2.outlookindia.com/easyqr/img/outlook-group.jpg";

/* ------------------------------------------------------------------ */
/*  Domestic magazines + rate card                                    */
/* ------------------------------------------------------------------ */

export type Magazine = {
  key: string;
  code: string;
  name: string;
  details: string;
  edition: "print" | "digital";
  options: { duration: number; mrp: number; price: number }[];
};

/** Domestic print magazines. */
export const PRINT_MAGAZINES: Magazine[] = [
  {
    key: "oli-print",
    code: "OLI",
    name: "Outlook India",
    details: "Weekly news magazine",
    edition: "print",
    options: [
      { duration: 1, mrp: 2600, price: 1799 },
      { duration: 2, mrp: 5200, price: 3399 },
      { duration: 3, mrp: 7800, price: 4899 },
    ],
  },
  {
    key: "olm-print",
    code: "OLM",
    name: "Outlook Money",
    details: "Personal finance monthly",
    edition: "print",
    options: [
      { duration: 1, mrp: 960, price: 799 },
      { duration: 2, mrp: 1920, price: 1549 },
      { duration: 3, mrp: 2880, price: 2199 },
    ],
  },
  {
    key: "olt-print",
    code: "OLT",
    name: "Outlook Traveller",
    details: "Travel monthly",
    edition: "print",
    options: [
      { duration: 1, mrp: 900, price: 725 },
      { duration: 2, mrp: 1800, price: 1400 },
      { duration: 3, mrp: 2700, price: 2100 },
    ],
  },
  {
    key: "olb-print",
    code: "OLB",
    name: "Outlook Business",
    details: "Business fortnightly",
    edition: "print",
    options: [
      { duration: 1, mrp: 1200, price: 999 },
      { duration: 2, mrp: 2400, price: 1899 },
      { duration: 3, mrp: 3600, price: 2599 },
    ],
  },
  {
    key: "olh-print",
    code: "OLH",
    name: "Outlook Hindi",
    details: "Weekly Hindi news magazine",
    edition: "print",
    options: [
      { duration: 1, mrp: 600, price: 499 },
      { duration: 2, mrp: 1200, price: 999 },
      { duration: 3, mrp: 1800, price: 1399 },
    ],
  },
];

/** Domestic digital (e-magazine) editions. */
export const DIGITAL_MAGAZINES: Magazine[] = [
  {
    key: "oli-digital",
    code: "OLI",
    name: "Outlook India",
    details: "Weekly news magazine — e-mag",
    edition: "digital",
    options: [
      { duration: 1, mrp: 2600, price: 1699 },
      { duration: 2, mrp: 5200, price: 3099 }, 
    ],
  },
  {
    key: "olm-digital",
    code: "OLM",
    name: "Outlook Money",
    details: "Personal finance monthly — e-mag",
    edition: "digital",
    options: [
      { duration: 1, mrp: 960, price: 699 },
      { duration: 2, mrp: 1920, price: 1199 },
    ],
  },
  {
    key: "olt-digital",
    code: "OLT",
    name: "Outlook Traveller",
    details: "Travel monthly — e-mag",
    edition: "digital",
    options: [
      { duration: 1, mrp: 900, price: 599 },
      { duration: 2, mrp: 1800, price: 1099 },
    ],
  },
  {
    key: "olb-digital",
    code: "OLB",
    name: "Outlook Business",
    details: "Business fortnightly — e-mag",
    edition: "digital",
    options: [
      { duration: 1, mrp: 1200, price: 849 },
      { duration: 2, mrp: 2400, price: 1549 },
    ],
  },
  {
    key: "olh-digital",
    code: "OLH",
    name: "Outlook Hindi",
    details: "Weekly Hindi news — e-mag",
    edition: "digital",
    options: [
      { duration: 1, mrp: 600, price: 449 },
      { duration: 2, mrp: 1200, price: 899 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Combo (limited offer) rate card                                   */
/* ------------------------------------------------------------------ */

export type PlanKey = "gold" | "silver" | "star";

export type RatePlan = {
  label: string;
  duration: string;   // human-readable, e.g. "2 Years"
  durCode: string;    // short code saved into the order draft
  totalMRP: number;
  offerPrice: number;
  save: number;
  gift: number;       // shopping voucher value in INR
  /** Magazine code -> basic info for the combo. */
  magazines: Record<string, { name: string }>;
};

export const RATE_CARD: Record<PlanKey, RatePlan> = {
  gold: {
    label: "Gold Combo",
    duration: "2 Years",
    durCode: "2yr",
    totalMRP: 22640,
    offerPrice: 9999,
    save: 12641,
    gift: 1500,
    magazines: {
      OLI: { name: "Outlook India" },
      OLM: { name: "Outlook Money" },
      OLT: { name: "Outlook Traveller" },
      OLB: { name: "Outlook Business" },
    },
  },
  silver: {
    label: "Silver Combo",
    duration: "1 Year",
    durCode: "1yr",
    totalMRP: 11320,
    offerPrice: 5999,
    save: 5321,
    gift: 500,
    magazines: {
      OLI: { name: "Outlook India" },
      OLM: { name: "Outlook Money" },
      OLT: { name: "Outlook Traveller" },
      OLB: { name: "Outlook Business" },
    },
  },
  star: {
    label: "Star Combo",
    duration: "9 Months",
    durCode: "9M",
    totalMRP: 3420,
    offerPrice: 2999,
    save: 421,
    gift: 250,
    magazines: {
      OLI: { name: "Outlook India" },
      OLM: { name: "Outlook Money" },
      //OLT: { name: "Outlook Traveller" },
      OLB: { name: "Outlook Business" },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  International magazines                                           */
/* ------------------------------------------------------------------ */

export type IntlMagazine = {
  key: string;
  code: string;
  name: string;
  details: string;
  /** Base INR prices. */
  print1: number;
   print2: number;
  digital1: number;
  //digital2: number;
};

export const INTL_MAGAZINES_FALLBACK: IntlMagazine[] = [
  {
    key: "oli",
    code: "OLI",
    name: "Outlook India",
    details: "Weekly news magazine",
    print1: 11000,
    digital1: 2600,
    print2: 5200,
  },
  {
    key: "olm",
    code: "OLM",
    name: "Outlook Money",
    details: "Personal finance monthly",
    print1: 3500,
    print2: 960,
    digital1: 1920,
    //digital2: 2599,
  },
  {
    key: "olt",
    code: "OLT",
    name: "Outlook Traveller",
    details: "Travel monthly",
    print1: 2850,
    print2: 900,
    digital1: 1800,
    //digital2: 2599,
  },
  {
    key: "olb",
    code: "OLB",
    name: "Outlook Business",
    details: "Business fortnightly",
    print1: 5200,
    print2: 1200,
    digital1: 2400,
    //digital2: 2599,
  },
  {
    key: "olh",
    code: "OLH",
    name: "Outlook Hindi",
    details: "Weekly Hindi news magazine",
    print1: 5000,
    print2: 600,
    digital1: 1200,
  },
];

/* ------------------------------------------------------------------ */
/*  Currencies + exchange rates                                       */
/* ------------------------------------------------------------------ */

export type CurrencyInfo = { symbol: string; locale: string };

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "de-DE" },
  AED: { symbol: "AED ", locale: "en-AE" },
  AUD: { symbol: "A$", locale: "en-AU" },
  CAD: { symbol: "C$", locale: "en-CA" },
  SGD: { symbol: "S$", locale: "en-SG" },
  INR: { symbol: "₹", locale: "en-IN" },
};

/** Safe defaults if the live rate fetch fails (base = INR). */
const RATES_FALLBACK: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
  EUR: 0.011,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
};

const RATES_URL = "https://open.er-api.com/v6/latest/INR";

/**
 * Fetches live exchange rates with base INR.
 * Returns a map of { CURRENCY_CODE: rate } where rate = units of that
 * currency per 1 INR.
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch(RATES_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rates = data?.rates ?? {};
    const out: Record<string, number> = { ...RATES_FALLBACK };
    for (const code of Object.keys(SUPPORTED_CURRENCIES)) {
      if (typeof rates[code] === "number") out[code] = rates[code];
    }
    return out;
  } catch {
    return { ...RATES_FALLBACK };
  }
}

/**
 * Converts an INR amount to the target currency using the supplied rates.
 * Rate meaning: 1 INR = `rate` units of target currency.
 */
export function convertWithRates(
  amountINR: number,
  currency: string,
  rates: Record<string, number>,
): number {
  const rate = rates[currency] ?? 1;
  const converted = amountINR * rate;
  return Math.round(converted * 100) / 100;
}

/* ------------------------------------------------------------------ */
/*  Geo detection (user's country + native currency)                  */
/* ------------------------------------------------------------------ */

export type GeoCurrency = {
  code: string;
  symbol: string;
};

export type GeoResult = {
  country_code: string | null;
  country_name: string | null;
  currency: GeoCurrency | null;
};

/**
 * Detects the user's native currency via our own /api/geo proxy.
 * The API key stays server-side. Returns null currency on any failure.
 */
export async function fetchGeoCurrency(): Promise<GeoResult> {
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      country_code: string | null;
      country_name: string | null;
      currency_code: string | null;
      currency_symbol: string | null;
    };
    return {
      country_code: data.country_code,
      country_name: data.country_name,
      currency:
        data.currency_code && data.currency_symbol
          ? { code: data.currency_code, symbol: data.currency_symbol }
          : null,
    };
  } catch (err) {
    console.error("[fetchGeoCurrency] falling back:", err);
    return { country_code: null, country_name: null, currency: null };
  }
}

/* ------------------------------------------------------------------ */
/*  Currency option builder for the international checkout            */
/* ------------------------------------------------------------------ */

export type CurrencyOption = {
  code: string;
  symbol: string;
  locale: string;
};

/**
 * Returns the currencies to show in the international dropdown:
 *   - [native, INR] if the native currency has a live rate
 *   - [INR] otherwise
 */
export function buildCurrencyOptions(
  native: GeoCurrency | null,
  rates: Record<string, number>,
): CurrencyOption[] {
  const inr: CurrencyOption = { code: "INR", symbol: "₹", locale: "en-IN" };

  if (!native || native.code === "INR") return [inr];

  const rate = rates[native.code];
  if (typeof rate !== "number" || rate <= 0) return [inr];

  const locale = SUPPORTED_CURRENCIES[native.code]?.locale ?? "en-US";
  return [{ code: native.code, symbol: native.symbol, locale }, inr];
}

/* ------------------------------------------------------------------ */
/*  Amount formatting                                                 */
/* ------------------------------------------------------------------ */

/**
 * Formats an amount for display.
 *   - 3-letter codes (AED, SAR) → "AED 494.47"
 *   - Symbol currencies (₹, $) → "₹12,920"
 *   - INR = 0 decimals; others = up to 2 decimals.
 */
export function formatCurrencyAmount(
  amount: number,
  code: string,
  symbol: string,
  locale = "en-US",
): string {
  const needsSpace = /^[A-Z]{3}$/.test(symbol.trim());
  const isINR = code === "INR";
  const value = amount.toLocaleString(locale, {
    minimumFractionDigits: isINR ? 0 : 2,
    maximumFractionDigits: isINR ? 0 : 2,
  });
  return needsSpace ? `${symbol.trim()} ${value}` : `${symbol}${value}`;
}




export const INDIAN_STATES = [
  "Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

export const COUNTRIES = [
  "Australia", "Bahrain", "Bangladesh", "Belgium", "Canada", "China", "Denmark",
  "Egypt", "France", "Germany", "Hong Kong", "Indonesia", "Ireland", "Italy",
  "Japan", "Kenya", "Kuwait", "Malaysia", "Maldives", "Mauritius", "Nepal",
  "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan",
  "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

export const PAYMENT_MODES = [
  { value: "PAYTM", label: "PAYTM" },
  { value: "CCAVENUE", label: "CCAVENUE" },
  { value: "PHONEPE", label: "PHONEPE" },
];

export const MERCHANT_IDS: Record<string, string> = {
  ICICI: "00001102",
  CCAVENUE: "326",
  PAYTM: "PAYTM",
  PHONEPE: "PHONEPE",
};