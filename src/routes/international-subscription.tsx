import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  BANNERS,
  INTL_MAGAZINES,
  SUPPORTED_CURRENCIES,
  convertWithRates,
  fetchExchangeRates,
} from "@/lib/subscription-data";
import { saveDraft } from "@/lib/order-store";

export const Route = createFileRoute("/international-subscription")({
  head: () => ({
    meta: [
      { title: "Outlook Magazine Subscription for International Readers" },
      {
        name: "description",
        content:
          "Subscribe to Outlook magazines from anywhere in the world. Print and digital editions with prices in your local currency.",
      },
      { property: "og:title", content: "Outlook Magazine Subscription — International" },
      {
        property: "og:description",
        content: "Print and digital Outlook magazine plans for readers outside India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InternationalSubscription,
});

/**
 * Edition codes:
 *   "1P"   → 1 Year, Print Edition
 *   "1D"   → 1 Year, Digital (e-Mag) Edition
 *   "2D"   → 2 Years, Digital (e-Mag) Edition
 */
type EditionCode = "1P" | "1D" | "2D";
type Duration = 1 | 2;

type MagazineSelection = {
  duration: Duration | 0;
  editions: EditionCode[];
};

type Picked = Record<string, MagazineSelection>;

function initPicked(): Picked {
  const out: Picked = {};
  for (const m of INTL_MAGAZINES) {
    out[m.key] = { duration: 0, editions: [] };
  }
  return out;
}

function InternationalSubscription() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState("USD");
  const [picked, setPicked] = useState<Picked>(() => initPicked());
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  /** Live exchange rates (base INR). Falls back to safe defaults. */
  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchExchangeRates();
      if (cancelled) return;
      setRates(r);
      console.log("Exchange rates loaded:", r);
      setRatesLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const symbol = SUPPORTED_CURRENCIES[currency]!.symbol;
  const locale = SUPPORTED_CURRENCIES[currency]!.locale;

  /** Base INR price for a given edition code. */
  const basePriceOf = (
    mag: (typeof INTL_MAGAZINES)[number],
    edition: EditionCode,
  ): number => {
    if (edition === "1P") return mag.print1;
    if (edition === "1D") return mag.digital1;
    return mag.digital2;
  };

  /** Converted price for the current currency using live rates. */
  const priceOf = (
    mag: (typeof INTL_MAGAZINES)[number],
    edition: EditionCode,
  ) => convertWithRates(basePriceOf(mag, edition), currency, rates);

  /** Total per magazine (sum of selected editions). */
  const magazineTotal = (mag: (typeof INTL_MAGAZINES)[number]) => {
    const sel = picked[mag.key];
    if (!sel) return 0;
    return sel.editions.reduce((sum, e) => sum + priceOf(mag, e), 0);
  };

  const summary = useMemo(() => {
    const items: string[] = [];
    let total = 0;
    for (const mag of INTL_MAGAZINES) {
      const sel = picked[mag.key];
      if (!sel || !sel.duration || sel.editions.length === 0) continue;

      for (const ed of sel.editions) {
        const price = priceOf(mag, ed);
        total += price;

        const label =
          ed === "1P"
            ? "1 Year - Print Edition"
            : ed === "1D"
              ? "1 Year - Digital Edition"
              : "2 Years - Digital Edition";

        items.push(`${mag.name} - ${label} at ${symbol}${price}`);
      }
    }
    return items.length ? { items, total } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, currency, rates]);

  function setDuration(magKey: string, value: string) {
    const duration = (value === "1" ? 1 : value === "2" ? 2 : 0) as Duration | 0;
    setError(false);
    setPicked((prev) => ({
      ...prev,
      [magKey]: { duration, editions: [] }, // reset editions on duration change
    }));
  }

  function toggleEdition(magKey: string, edition: EditionCode) {
    const sel = picked[magKey];
    if (!sel || !sel.duration) return;

    const allowed =
      (sel.duration === 1 && (edition === "1P" || edition === "1D")) ||
      (sel.duration === 2 && edition === "2D");
    if (!allowed) return;

    setError(false);
    setPicked((prev) => {
      const current = prev[magKey]!;
      const has = current.editions.includes(edition);
      return {
        ...prev,
        [magKey]: {
          ...current,
          editions: has
            ? current.editions.filter((e) => e !== edition)
            : [...current.editions, edition],
        },
      };
    });
  }

  function proceed() {
    if (!summary) {
      setError(true);
      return;
    }
    setError(false);

    const magSelect = INTL_MAGAZINES.filter(
      (m) => picked[m.key]?.editions.length,
    )
      .flatMap((m) =>
        picked[m.key]!.editions.map((ed) => `${m.code}-${ed}`),
      )
      .join(", ");

    const anyTwoYear = INTL_MAGAZINES.some(
      (m) => picked[m.key]?.duration === 2 && picked[m.key]!.editions.length > 0,
    );
    const anyOneYear = INTL_MAGAZINES.some(
      (m) => picked[m.key]?.duration === 1 && picked[m.key]!.editions.length > 0,
    );
    const dura = anyTwoYear && !anyOneYear ? "2yr" : "1yr";

    saveDraft({
      scope: "international",
      amt: summary.total,
      dura,
      gift: "",
      mag: "OL-TEO-KJ-INT",
      magSelect,
      selectionList: summary.items,
      currency: "INR",
      toCurrency: currency,
      currencySymbol: symbol,
      languagesSymbol: locale,
      magazineCode: "15",
      subscriptionType: "international",
    });
    navigate({ to: "/order-form-international" });
  }

  return (
    <div className="ol-page">
      <SiteHeader />
      <div className="ol-container">
        <div className="banner-container1">
          <div className="subdsk-img">
            <img src={BANNERS.digitalDesktop} alt="Outlook international subscription" />
          </div>
          <div className="submob-img">
            <img src={BANNERS.digitalMobile} alt="Outlook international subscription" />
          </div>
        </div>

        <header className="ol-header">
          <h1>Subscription for International Readers</h1>
          <p className="subtitle">
            Select your favorite magazines — prices shown in your currency
          </p>
        </header>

        <div className="subscription-tabs">
          <label className="plan-radio">
            <span>Currency</span>
            <select
              className="ol-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ margin: 0, width: "auto" }}
            >
              {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Optional: show when live rates are loading */}
          {!ratesLoaded && (
            <p
              className="scroll-hint"
              style={{ marginLeft: 12, marginTop: 6, fontSize: ".72rem" }}
            >
              Loading live rates…
            </p>
          )}
        </div>

        <p className="scroll-hint">
          <strong>&larr; Scroll horizontally &rarr;</strong>
        </p>

        <div className="magazine-grid">
          {INTL_MAGAZINES.map((mag) => {
            const sel = picked[mag.key]!;
            const durationSelected = sel.duration !== 0;
            const isOneYear = sel.duration === 1;
            const isTwoYear = sel.duration === 2;
            const cardSelected = sel.editions.length > 0;
            const flashing = flash === mag.key;

            /** Precompute which edition rows to show for this card. */
            const show1P = !durationSelected || isOneYear; // visible before pick, or when 1Y
            const show1D = !durationSelected || isOneYear;
            const show2D = isTwoYear;

            return (
              <div
                key={mag.key}
                className={`magazine-card ${cardSelected ? "selected" : ""}`}
              >
                <img src={mag.img} alt={mag.name} className="magazine-image" />
                <div className="magazine-info">
                  <div className="magazine-name">{mag.name}</div>
                  <div className="magazine-details">{mag.details}</div>
                </div>

                {/* Duration dropdown */}
                <select
                  className="duration-select"
                  data-magazine={mag.key}
                  value={sel.duration === 0 ? "" : String(sel.duration)}
                  onChange={(e) => setDuration(mag.key, e.target.value)}
                  style={
                    flashing
                      ? {
                          border: "2px solid #ff0000",
                          boxShadow: "0 0 5px rgba(255,0,0,0.5)",
                        }
                      : undefined
                  }
                >
                  <option value="">Select Duration</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                </select>

                {/* Edition options — rows are hidden (display:none) when not applicable */}
                <div className="edition-options">
                  {/* PRINT EDITION (1 Year) */}
                  <label
                    className={`edition-option ${
                      show1P ? "" : "edition-option--hidden"
                    }`}
                    onClick={(ev) => {
                      if (!durationSelected) {
                        ev.preventDefault();
                        setFlash(mag.key);
                        setTimeout(() => setFlash(null), 1200);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sel.editions.includes("1P")}
                      disabled={!durationSelected}
                      onChange={() => toggleEdition(mag.key, "1P")}
                    />
                    <span className="edition-label">
                      {!durationSelected ? "Print Edition" : "Print Edition (1 Year)"}
                    </span>
                    <span className="edition-price">
                      {symbol}
                      {priceOf(mag, "1P")}
                    </span>
                  </label>

                  {/* E-MAG EDITION (1 Year) */}
                  <label
                    className={`edition-option ${
                      show1D ? "" : "edition-option--hidden"
                    }`}
                    onClick={(ev) => {
                      if (!durationSelected) {
                        ev.preventDefault();
                        setFlash(mag.key);
                        setTimeout(() => setFlash(null), 1200);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sel.editions.includes("1D")}
                      disabled={!durationSelected}
                      onChange={() => toggleEdition(mag.key, "1D")}
                    />
                    <span className="edition-label">
                      {!durationSelected ? "e-Mag Edition" : "e-Mag Edition (1 Year)"}
                    </span>
                    <span className="edition-price">
                      {symbol}
                      {priceOf(mag, "1D")}
                    </span>
                  </label>

                  {/* E-MAG EDITION (2 Years) */}
                  <label
                    className={`edition-option ${
                      show2D ? "" : "edition-option--hidden"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sel.editions.includes("2D")}
                      onChange={() => toggleEdition(mag.key, "2D")}
                    />
                    <span className="edition-label">e-Mag Edition (2 Years)</span>
                    <span className="edition-price">
                      {symbol}
                      {priceOf(mag, "2D")}
                    </span>
                  </label>
                </div>

                <div className="magazine-price">
                  {symbol}
                  {magazineTotal(mag)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="selection-summary">
          <h2 className="summary-title">Your Selection Summary</h2>
          <div className="selected-items">
            {summary ? (
              summary.items.map((item) => (
                <div className="selected-item" key={item}>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="empty-selection">No magazines selected yet</div>
            )}
          </div>
          <div className="deal-summary">
            <div className="deal-row">
              <span style={{ fontWeight: 600 }}>You Pay:</span>
              <span style={{ fontWeight: 700, color: "#d60810", fontSize: "1.2rem" }}>
                {symbol}
                {(summary?.total ?? 0).toLocaleString(locale)}
              </span>
            </div>
          </div>
          {error && (
            <div className="validation-error">
              Please select at least one magazine to continue.
            </div>
          )}
          <button type="button" className="submit-btn pulse" onClick={proceed}>
            Proceed to Checkout
          </button>
        </div>

        <div className="terms">
          <a href="/bundle-subscription">Subscribing from within India? Click here</a>
        </div>
      </div>
    </div>
  );
}