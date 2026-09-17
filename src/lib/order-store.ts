export type OrderDraft = {
  scope: "domestic" | "international";
  amt: number;
  dura: string;
  gift: string;
  mag: string;
  magSelect: string;
  selectionList: string[];
  currency: string;
  currencySymbol: string;
  toCurrency: string;
  languagesSymbol: string;
  magazineCode: string;
  subscriptionType: string;
  source?: string;
  vouchercode?: string;
};

export type CustomerDetails = {
  fname: string;
  lname: string;
  sex: string;
  dob: string; // ISO YYYY-MM-DD
  address1: string;
  pin: string;
  state?: string;
  country?: string;
  city: string;
  phoneoff: string;
  phoneres: string;
  email: string;
  occupa: string;
  desig: string;
  org: string;
  paymentchoice: string;
};

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export type PlacedOrder = {
  order: OrderDraft;
  customer: CustomerDetails;
  sessionId: string;
  merchantId: string;
  status: PaymentStatus;
  dateSub: string;
  gatewayTxnId?: string;
  gatewayResponse?: Record<string, string>;
};

const DRAFT_KEY = "outlook_order_draft";
const PLACED_KEY = "outlook_placed_order";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export const saveDraft = (d: OrderDraft) => write(DRAFT_KEY, d);
export const getDraft = () => read<OrderDraft>(DRAFT_KEY);
export const savePlacedOrder = (o: PlacedOrder) => write(PLACED_KEY, o);
export const getPlacedOrder = () => read<PlacedOrder>(PLACED_KEY);

export function updatePlacedOrderStatus(
  status: PaymentStatus,
  extras: Partial<PlacedOrder> = {},
) {
  const current = getPlacedOrder();
  if (!current) return;
  write(PLACED_KEY, { ...current, status, ...extras });
}

/** Mirrors PHP session id: date("Ymdhis") + 8 random digits */
export function generateSessionId() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const h12 = d.getHours() % 12 || 12;
  const stamp =
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(h12)}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return stamp + String(Math.floor(10000000 + Math.random() * 89999999));
}

export function formatMoney(value: number, symbol: string, locale = "en-IN") {
  return `${symbol}${symbol === "Rs." ? " " : ""}${value.toLocaleString(locale)}`;
}