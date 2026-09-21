import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  BANNERS_FALLBACK,
  INTL_MAGAZINES_FALLBACK,
  MAG_IMG_FALLBACK,
  buildCurrencyOptions,
  convertWithRates,
  coverKeyForCode,
  fetchExchangeRates,
  fetchGeoCurrency,
  fetchMagazineAssets,
  formatCurrencyAmount,
  type Banners,
  type GeoCurrency,
  type IntlMagazine,
  type MagCovers,
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

type EditionCode = "1P" | "1D" | "2D";
type Duration = 1 | 2;

type MagazineSelection = {
  duration: Duration | 0;
  editions: EditionCode[];
};

type Picked = Record<string, MagazineSelection>;

function initPicked(list: IntlMagazine[]): Picked {
  const out: Picked = {};
  for (const m of list) {
    out[m.key] = { duration: 0, editions: [] };
  }
  return out;
}

function InternationalSubscription() {
  const navigate = useNavigate();

  /* ------------------------------------------------------------------
     Remote data: covers, banners, magazine list, rates, geo currency.
     ------------------------------------------------------------------ */
  const [covers, setCovers] = useState<MagCovers>(MAG_IMG_FALLBACK);
  const [banners, setBanners] = useState<Banners>(BANNERS_FALLBACK);
  const [intlMagazines, setIntlMagazines] = useState<IntlMagazine[]>(
    INTL_MAGAZINES_FALLBACK,
  );
  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [nativeCurrency, setNativeCurrency] = useState<GeoCurrency | null>(null);

  /** User's picked display currency. Defaults to INR until geo resolves. */
  const [currency, setCurrency] = useState("INR");

  const [picked, setPicked] = useState<Picked>(() =>
    initPicked(INTL_MAGAZINES_FALLBACK),
  );

  const [error, setError] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  /* ------------------------- Initial fetch ------------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [r, assets, geo] = await Promise.all([
        fetchExchangeRates(),
        fetchMagazineAssets(),
        fetchGeoCurrency(),
      ]);
      if (cancelled) return;

      setRates(r);
      setCovers(assets.MAG_IMG);
      setBanners(assets.BANNERS);
      setIntlMagazines(assets.INTL_MAGAZINES);
      setNativeCurrency(geo.currency);
      setRatesLoaded(true);

      // Default to the user's native currency if we support it,
      // otherwise stay on INR.
      if (geo.currency && geo.currency.code !== "INR" && r[geo?.currency.code] > 0) {
        setCurrency(geo.currency.code);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Re-seed picked map when remote magazines arrive. */
  useEffect(() => {
    setPicked(initPicked(intlMagazines));
  }, [intlMagazines]);

  /* ------------------------ Currency options ----------------------- */
  const currencyOptions = useMemo(
    () => buildCurrencyOptions(nativeCurrency, rates),
    [nativeCurrency, rates],
  );

  const current = currencyOptions.find((c) => c.code === currency) ?? currencyOptions[0]!;
  const symbol = current.symbol;
  const locale = current.locale;

  /* --------------------------- Pricing ----------------------------- */
  const basePriceOf = (mag: IntlMagazine, edition: EditionCode): number => {
    if (edition === "1P") return mag.print1;
    if (edition === "1D") return mag.digital1;
    return mag.print2;
  };

  const convertedPriceOf = (mag: IntlMagazine, edition: EditionCode) =>
    convertWithRates(basePriceOf(mag, edition), currency, rates);

  const magazineInrTotal = (mag: IntlMagazine) => {
    const sel = picked[mag.key];
    if (!sel) return 0;
    return sel.editions.reduce((sum, e) => sum + basePriceOf(mag, e), 0);
  };

  const magazineConvertedTotal = (mag: IntlMagazine) => {
    const sel = picked[mag.key];
    if (!sel) return 0;
    return sel.editions.reduce((sum, e) => sum + convertedPriceOf(mag, e), 0);
  };

  /* ------------------------- Order summary ------------------------- */
  const summary = useMemo(() => {
    const items: string[] = [];
    let inrTotal = 0;
    let convertedTotal = 0;

    for (const mag of intlMagazines) {
      const sel = picked[mag.key];
      if (!sel || !sel.duration || sel.editions.length === 0) continue;

      for (const ed of sel.editions) {
        const inr = basePriceOf(mag, ed);
        const conv = convertedPriceOf(mag, ed);
        inrTotal += inr;
        convertedTotal += conv;

        const label =
          ed === "1P"
            ? "1 Year - Print Edition"
            : ed === "1D"
              ? "1 Year - Digital Edition"
              : "2 Years - Digital Edition";

        items.push(
          `${mag.name} - ${label} at ${formatCurrencyAmount(conv, currency, symbol, locale)} (₹${inr})`,
        );
      }
    }
    return items.length
      ? { items, inrTotal, convertedTotal }
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, currency, rates, intlMagazines, symbol, locale]);

  /* -------------------------- Interactions ------------------------- */
  function setDuration(magKey: string, value: string) {
    const duration = (value === "1" ? 1 : value === "2" ? 2 : 0) as Duration | 0;
    setError(false);
    setPicked((prev) => ({
      ...prev,
      [magKey]: { duration, editions: [] },
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
      const cur = prev[magKey]!;
      const has = cur.editions.includes(edition);
      return {
        ...prev,
        [magKey]: {
          ...cur,
          editions: has
            ? cur.editions.filter((e) => e !== edition)
            : [...cur.editions, edition],
        },
      };
    });
  }

  /* --------------------------- Checkout ---------------------------- */
  function proceed() {
    if (!summary) {
      setError(true);
      return;
    }
    setError(false);

    const magSelect = intlMagazines
      .filter((m) => picked[m.key]?.editions.length)
      .flatMap((m) =>
        picked[m.key]!.editions.map((ed) => `${m.code}-${ed}`),
      )
      .join(", ");

    const anyTwoYear = intlMagazines.some(
      (m) => picked[m.key]?.duration === 2 && picked[m.key]!.editions.length > 0,
    );
    const anyOneYear = intlMagazines.some(
      (m) => picked[m.key]?.duration === 1 && picked[m.key]!.editions.length > 0,
    );
    const dura = anyTwoYear && !anyOneYear ? "2yr" : "1yr";

    saveDraft({
      scope: "international",
      // Gateway charges in INR — always store the INR amount here.
      amt: summary.inrTotal,
      dura,
      gift: "",
      mag: "OL-TEO-KJ-INT",
      magSelect,
      selectionList: summary.items,
      currency: "INR",
      toCurrency: "INR",           // charge INR
      currencySymbol: "₹",         // gateway + payment page use ₹
      languagesSymbol: "en-IN",
      magazineCode: "15",
      subscriptionType: "international",
    });
    navigate({ to: "/order-form-international" });
  }

  /* ------------------------------ UI ------------------------------- */
  return (
    <div className="ol-page">
      <SiteHeader />
      <div className="ol-container">
        {/* <div className="banner-container1">
          <div className="subdsk-img">
            <img src={banners.digitalDesktop} alt="Outlook international subscription" />
          </div>
          <div className="submob-img">
            <img src={banners.digitalMobile} alt="Outlook international subscription" />
          </div>
        </div> */}

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
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </label>

          {!ratesLoaded && (
            <p
              className="scroll-hint"
              style={{ marginLeft: 12, marginTop: 6, fontSize: ".72rem" }}
            >
              Loading live rates…
            </p>
          )}
        </div>

        <p className="scroll-hint text-center text-sm text-gray-500 mt-4 lg:hidden scroll-hint">
          <strong>&larr; Scroll horizontally &rarr;</strong>
        </p>

        <div className="magazine-grid">
          {intlMagazines.map((mag) => {
            const sel = picked[mag.key]!;
            const durationSelected = sel.duration !== 0;
            const isOneYear = sel.duration === 1;
            const isTwoYear = sel.duration === 2;
            const cardSelected = sel.editions.length > 0;
            const flashing = flash === mag.key;

            const show1P = !durationSelected || isOneYear;
            const show1D = !durationSelected || isOneYear;
            const show2D = isTwoYear;

            const inrTotal = magazineInrTotal(mag);
            const convTotal = magazineConvertedTotal(mag);

            return (
              <div
                key={mag.key}
                className={`magazine-card ${cardSelected ? "selected" : ""}`}
              >
                <img
                  src={covers[coverKeyForCode(mag.code)]}
                  alt={mag.name}
                  className="magazine-image"
                />
                <div className="magazine-info">
                  <div className="magazine-name">{mag.name}</div>
                  <div className="magazine-details">{mag.details}</div>
                </div>

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

                <div className="edition-options">
                  {/* PRINT EDITION (1 Year) */}
                  <label
                    className={`edition-option ${show1P ? "" : "edition-option--hidden"}`}
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
                      {!durationSelected ? "Print Edition" : "Print Edition"}
                    </span>
                    <span className="edition-price">
                      {formatCurrencyAmount(
                        convertedPriceOf(mag, "1P"),
                        currency,
                        symbol,
                        locale,
                      )}
                      <small className="edition-base">
                        {" "}(₹{mag.print1 })
                      </small>
                    </span>
                  </label>

                  {/* E-MAG EDITION (1 Year) */}
                  <label
                    className={`edition-option ${show1D ? "" : "edition-option--hidden"}`}
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
                      {!durationSelected ? "e-Mag Edition" : "e-Mag Edition"}
                    </span>
                    <span className="edition-price">
                      {formatCurrencyAmount(
                        convertedPriceOf(mag, "1D"),
                        currency,
                        symbol,
                        locale,
                      )}
                      <small className="edition-base">
                        {" "}(₹{mag.digital1 })
                      </small>
                    </span>
                  </label>

                  {/* E-MAG EDITION (2 Years) */}
                  <label className={`edition-option ${show2D ? "" : "edition-option--hidden"}`}>
                    <input
                      type="checkbox"
                      checked={sel.editions.includes("2D")}
                      onChange={() => toggleEdition(mag.key, "2D")}
                    />
                    <span className="edition-label">e-Mag Edition</span>
                    <span className="edition-price">
                      {formatCurrencyAmount(
                        convertedPriceOf(mag, "2D"),
                        currency,
                        symbol,
                        locale,
                      )}
                      <small className="edition-base">
                        {" "}(₹{mag.print2 })
                      </small>
                    </span>
                  </label>
                </div>

                <div className="magazine-price">
                  {formatCurrencyAmount(convTotal, currency, symbol, locale)}
                  {inrTotal > 0 && (
                    <small className="magazine-price-inr">
                      {" "}/ ₹{inrTotal}
                    </small>
                  )}
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
                {summary
                  ? `${formatCurrencyAmount(summary.convertedTotal, currency, symbol, locale)} / ₹${summary.inrTotal }`
                  : `${symbol}0`}
              </span>
            </div>
            <div className="deal-row">
              <span style={{ fontSize: ".8rem", color: "#666" }}>
                You will be charged in INR at checkout.
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