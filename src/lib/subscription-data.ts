export const MAG_IMG = {
  oli: "https://kj2.outlookindia.com/assets/covers/ole-sep-26_w-655.jpg",
  olm: "https://kj2.outlookindia.com/assets/covers/olm-sep-26_w-655.jpg",
  olt: "https://kj2.outlookindia.com/assets/covers/OLTcoverAugSept2026.jpg",
  olb: "https://kj2.outlookindia.com/assets/covers/olb-sep-26_w-655.jpg",
  olh: "https://kj2.outlookindia.com/assets/covers/olh-sep-26_w-655.jpg",
};

export const BANNERS = {
  limitedDesktop:"https://img-2.outlookindia.com/outlookindia/banners/2026/05/18/1368-365.jpg",
  limitedMobile:"https://img-2.outlookindia.com/outlookindia/banners/2026/03/23/370-495-SM.jpg",
  printDesktop:"https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/d_1536-5125.jpg",
  printMobile:"https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/m-800-10673.jpg",
  digitalDesktop:"https://img-2.outlookindia.com/outlookindia/banners/2026/03/23/1536-512-E.jpg",
  digitalMobile:"https://img-2.outlookindia.com/outlookindia/banners/2026/05/11/m-800-10673.jpg",
};

export const LOGO = "https://kj2.outlookindia.com/easyqr/img/outlook-group.jpg";

/* ---------------- Domestic: limited period combo plans ---------------- */

export type PlanKey = "gold" | "silver";

export const RATE_CARD: Record<
  PlanKey,
  {
    label: string;
    totalMRP: number;
    offerPrice: number;
    duration: string;
    durCode: string;
    gift: number;
    save: number;
    magazines: Record<string, { print: number; digital: number; name: string; img: string }>;
  }
> = {
  gold: {
    label: "Gold Plan",
    totalMRP: 24640,
    offerPrice: 9999,
    duration: "2 Years",
    durCode: "2yr",
    gift: 1000,
    save: 16641,
    magazines: {
      OLE: { print: 2239, digital: 2040, name: "Outlook India", img: MAG_IMG.oli },
      OLM: { print: 1020, digital: 790, name: "Outlook Money", img: MAG_IMG.olm },
      OLT: { print: 920, digital: 720, name: "Outlook Traveller", img: MAG_IMG.olt },
      OLB: { print: 1250, digital: 1020, name: "Outlook Business", img: MAG_IMG.olb },
    },
  },
  silver: {
    label: "Silver Plan",
    totalMRP: 12320,
    offerPrice: 5999,
    duration: "1 Year",
    durCode: "1yr",
    gift: 500,
    save: 7321,
    magazines: {
      OLE: { print: 1319, digital: 1249, name: "Outlook India", img: MAG_IMG.oli },
      OLM: { print: 589, digital: 509, name: "Outlook Money", img: MAG_IMG.olm },
      OLT: { print: 529, digital: 445, name: "Outlook Traveller", img: MAG_IMG.olt },
      OLB: { print: 739, digital: 620, name: "Outlook Business", img: MAG_IMG.olb },
    },
  },
};

/* ---------------- Domestic: print & digital rate cards ---------------- */

export type MagazineOption = { duration: number; price: number; mrp: number };

export type Magazine = {
  key: string;
  code: string;
  name: string;
  details: string;
  img: string;
  edition: "print" | "digital";
  options: MagazineOption[];
};

export const PRINT_MAGAZINES: Magazine[] = [
  {
    key: "ol-print",
    code: "OLE",
    name: "Outlook India",
    details: "26 Issues / Year | In-depth news analysis",
    img: MAG_IMG.oli,
    edition: "print",
    options: [
      { duration: 1, price: 1799, mrp: 2600 },
      { duration: 2, price: 3399, mrp: 5200 },
      { duration: 3, price: 4899, mrp: 7800 },
    ],
  },
  {
    key: "ii-print",
    code: "OLM",
    name: "Outlook Money",
    details: "12 Issues / Year | Financial guidance",
    img: MAG_IMG.olm,
    edition: "print",
    options: [
      { duration: 1, price: 799, mrp: 960 },
      { duration: 2, price: 1549, mrp: 1920 },
      { duration: 3, price: 2199, mrp: 2880 },
    ],
  },
  {
    key: "olt-print",
    code: "OLT",
    name: "Outlook Traveller",
    details: "6 Issues / Year | Travel inspiration",
    img: MAG_IMG.olt,
    edition: "print",
    options: [
      { duration: 1, price: 725, mrp: 900 },
      { duration: 2, price: 1400, mrp: 1800 },
      { duration: 3, price: 2100, mrp: 2700 },
    ],
  },
  {
    key: "ob-print",
    code: "OLB",
    name: "Outlook Business",
    details: "12 Issues / Year | Business insights",
    img: MAG_IMG.olb,
    edition: "print",
    options: [
      { duration: 1, price: 999, mrp: 1200 },
      { duration: 2, price: 1899, mrp: 2400 },
      { duration: 3, price: 2599, mrp: 3600 },
    ],
  },
  {
    key: "olh-print",
    code: "OLH",
    name: "Outlook Hindi",
    details: "12 Issues / Year | Hindi content",
    img: MAG_IMG.olh,
    edition: "print",
    options: [
      { duration: 1, price: 499, mrp: 600 },
      { duration: 2, price: 999, mrp: 1200 },
      { duration: 3, price: 1399, mrp: 1800 },
    ],
  },
];

export const DIGITAL_MAGAZINES: Magazine[] = [
  {
    key: "ol-digital",
    code: "OLE",
    name: "Outlook India",
    details: "26 Issues / Year | In-depth news analysis",
    img: MAG_IMG.oli,
    edition: "digital",
    options: [
      { duration: 1, price: 1699, mrp: 2600 },
      { duration: 2, price: 3099, mrp: 5200 },
    ],
  },
  {
    key: "ii-digital",
    code: "OLM",
    name: "Outlook Money",
    details: "12 Issues / Year | Financial guidance",
    img: MAG_IMG.olm,
    edition: "digital",
    options: [
      { duration: 1, price: 699, mrp: 960 },
      { duration: 2, price: 1199, mrp: 1920 },
    ],
  },
  {
    key: "olt-digital",
    code: "OLT",
    name: "Outlook Traveller",
    details: "6 Issues / Year | Travel inspiration",
    img: MAG_IMG.olt,
    edition: "digital",
    options: [
      { duration: 1, price: 599, mrp: 900 },
      { duration: 2, price: 1099, mrp: 1800 },
    ],
  },
  {
    key: "ob-digital",
    code: "OLB",
    name: "Outlook Business",
    details: "12 Issues / Year | Business insights",
    img: MAG_IMG.olb,
    edition: "digital",
    options: [
      { duration: 1, price: 849, mrp: 1200 },
      { duration: 2, price: 1549, mrp: 2400 },
    ],
  },
  {
    key: "olh-digital",
    code: "OLH",
    name: "Outlook Hindi",
    details: "12 Issues / Year | Hindi content",
    img: MAG_IMG.olh,
    edition: "digital",
    options: [
      { duration: 1, price: 449, mrp: 600 },
      { duration: 2, price: 899, mrp: 1200 },
    ],
  },
];

/* ---------------- International rate card (base INR) ---------------- */

export type IntlMagazine = {
  key: string;
  code: string;
  name: string;
  details: string;
  img: string;
  print1: number;
  digital1: number;
  digital2: number;
};

export const INTL_MAGAZINES: IntlMagazine[] = [
  { key: "ol", code: "OLE", name: "Outlook India", details: "26 Issues / Year", img: MAG_IMG.oli, print1: 11000, digital1: 2600, digital2: 5200 },
  { key: "ii", code: "OLM", name: "Outlook Money", details: "12 Issues / Year", img: MAG_IMG.olm, print1: 5050, digital1: 960, digital2: 1920 },
  { key: "olt", code: "OLT", name: "Outlook Traveller", details: "6 Issues / Year", img: MAG_IMG.olt, print1: 2850, digital1: 900, digital2: 1800 },
  { key: "ob", code: "OLB", name: "Outlook Business", details: "12 Issues / Year", img: MAG_IMG.olb, print1: 5200, digital1: 1200, digital2: 2400 },
  { key: "olh", code: "OLH", name: "Outlook Hindi", details: "12 Issues / Year", img: MAG_IMG.olh, print1: 5000, digital1: 600, digital2: 1200 },
  //{ key: "olx", code: "OLX", name: "Outlook Luxe", details: "4 Issues / Year", img: MAG_IMG.oli, print1: 2500, digital1: 2500, digital2: 4800 },
];

/**
 * Display metadata for currencies we support in the dropdown.
 * Actual conversion factors come from the live exchange-rates API —
 * see EXCHANGE_RATES_URL below.
 */
export const SUPPORTED_CURRENCIES: Record<
  string,
  { symbol: string; locale: string }
> = {
  USD: { symbol: "$ ", locale: "en-US" },
  GBP: { symbol: "£ ", locale: "en-GB" },
  EUR: { symbol: "€ ", locale: "en-IE" },
  AUD: { symbol: "A$ ", locale: "en-AU" },
  CAD: { symbol: "C$ ", locale: "en-CA" },
  SGD: { symbol: "S$ ", locale: "en-SG" },
  AED: { symbol: "AED ", locale: "ar-AE" },
  INR: { symbol: "₹ ", locale: "en-IN" }, 
};

/** Live exchange-rate feed (base = INR). */
export const EXCHANGE_RATES_URL = "https://kj2.outlookindia.com/international_subscription/rates/exchange_rates.json";

export type ExchangeRatesPayload = {
  result: string;
  base_code: string;
  time_last_update_utc?: string;
  conversion_rates: Record<string, number>;
};

/**
 * Fetch live exchange rates. Base is INR — the API returns
 * `conversion_rates[<CUR>]` as "1 INR = <rate> <CUR>".
 *
 * Returns the raw conversion_rates map. Falls back to a small built-in
 * table if the network call fails, so the page never appears broken.
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch(EXCHANGE_RATES_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ExchangeRatesPayload;
    if (data?.result === "success" && data.conversion_rates) {
      return data.conversion_rates;
    }
    throw new Error("Invalid payload");
  } catch (err) {
    console.warn("Falling back to built-in exchange rates:", err);
    return FALLBACK_RATES;
  }
}

/** Safe fallback (approximate) — used only when the API is unreachable. */
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.01041,
  GBP: 0.007758,
  EUR: 0.009051,
  AUD: 0.01464,
  CAD: 0.01454,
  SGD: 0.01329,
  AED: 0.03825,
};

/**
 * Convert a base INR price into the target currency using live rates.
 * Rounds up to the nearest whole unit (never show fractional cents
 * to a customer paying in a foreign currency).
 */
export function convertWithRates(
  inr: number,
  currency: string,
  rates: Record<string, number>,
): number {
  if (currency === "INR") return inr;
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  return Math.ceil(inr * rate);
}

/* ---------------- International rate card (base INR) ---------------- */
/*
export type IntlMagazine = {
  key: string;
  code: string;
  name: string;
  details: string;
  img: string;
  print1: number;
  digital1: number;
  digital2: number;
};

export const INTL_MAGAZINES: IntlMagazine[] = [
  { key: "ol", code: "OLE", name: "Outlook India", details: "26 Issues / Year", img: MAG_IMG.oli, print1: 11000, digital1: 2600, digital2: 5200 },
  { key: "ii", code: "OLM", name: "Outlook Money", details: "12 Issues / Year", img: MAG_IMG.olm, print1: 5050, digital1: 960, digital2: 1920 },
  { key: "olt", code: "OLT", name: "Outlook Traveller", details: "6 Issues / Year", img: MAG_IMG.olt, print1: 2850, digital1: 900, digital2: 1800 },
  { key: "ob", code: "OLB", name: "Outlook Business", details: "12 Issues / Year", img: MAG_IMG.olb, print1: 5200, digital1: 1200, digital2: 2400 },
  { key: "olh", code: "OLH", name: "Outlook Hindi", details: "12 Issues / Year", img: MAG_IMG.olh, print1: 5000, digital1: 600, digital2: 1200 },
  //{ key: "olx", code: "OLX", name: "Outlook Luxe", details: "4 Issues / Year", img: MAG_IMG.oli, print1: 2500, digital1: 2500, digital2: 4800 },
];

export const CURRENCIES: Record<string, { symbol: string; rate: number; locale: string }> = {
  USD: { symbol: "$", rate: 0.0115, locale: "en-US" },
  GBP: { symbol: "£", rate: 0.009, locale: "en-GB" },
  EUR: { symbol: "€", rate: 0.0105, locale: "en-IE" },
  AUD: { symbol: "A$", rate: 0.0175, locale: "en-AU" },
  CAD: { symbol: "C$", rate: 0.0158, locale: "en-CA" },
  SGD: { symbol: "S$", rate: 0.0155, locale: "en-SG" },
  AED: { symbol: "AED ", rate: 0.0423, locale: "ar-AE" },
  INR: { symbol: "Rs.", rate: 1, locale: "en-IN" },
};

export function convertCurrency(inr: number, currency: string) {
  const c = CURRENCIES[currency] ?? CURRENCIES["USD"]!;
  return currency === "INR" ? inr : Math.ceil(inr * c.rate);
}
*/
/* ---------------- Form option lists ---------------- */

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
