/**
 * Requires from "@/lib/subscription-data":
 *   RATE_CARD, PRINT_MAGAZINES, DIGITAL_MAGAZINES,
 *   MAG_IMG_FALLBACK, BANNERS_FALLBACK,
 *   coverKeyForCode(code) -> "oli" | "olm" | "olt" | "olb" | "olh",
 *   fetchMagazineAssets() -> Promise<{ MAG_IMG: MagCovers; BANNERS: Banners }>
 * Types: Magazine, PlanKey, MagCovers, Banners
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  BANNERS_FALLBACK,
  DIGITAL_MAGAZINES,
  MAG_IMG_FALLBACK,
  PRINT_MAGAZINES,
  RATE_CARD,
  coverKeyForCode,
  fetchMagazineAssets,
  type Banners,
  type MagCovers,
  type Magazine,
  type PlanKey,
} from "@/lib/subscription-data";

import { saveDraft } from "@/lib/order-store";

export const Route = createFileRoute("/bundle-subscription")({
  head: () => ({
    meta: [
      { title: "Outlook Magazine Subscription for Domestic Readers" },
      {
        name: "description",
        content:
          "Subscribe to Outlook India, Money, Traveller, Business and Hindi magazines. Combo, print and digital plans delivered across India.",
      },
      { property: "og:title", content: "Outlook Magazine Subscription — Domestic" },
      {
        property: "og:description",
        content: "Choose combo, print or digital Outlook magazine plans and subscribe online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.source;
    const source =
      typeof raw === "string" && raw.trim() ? raw.trim() : "DELH100030";
    return { source };
  },
  component: BundleSubscription,
});

type TabKey = "limited" | "print" | "digital";
type Picked = Record<string, { duration: number; checked: boolean }>;

function initPicked(list: Magazine[]): Picked {
  const out: Picked = {};
  for (const m of list) out[m.key] = { duration: 1, checked: false };
  return out;
}

const inr = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

function BundleSubscription() {
  const navigate = useNavigate();
  const { source } = Route.useSearch();

  const [tab, setTab] = useState<TabKey>("limited");
  const [plan, setPlan] = useState<PlanKey>("gold");
  const [limitedSelected, setLimitedSelected] = useState(true);
  const [printPick, setPrintPick] = useState<Picked>(() => initPicked(PRINT_MAGAZINES));
  const [digitalPick, setDigitalPick] = useState<Picked>(() => initPicked(DIGITAL_MAGAZINES));
  const [error, setError] = useState(false);

  const [covers, setCovers] = useState<MagCovers>(MAG_IMG_FALLBACK);
  const [banners, setBanners] = useState<Banners>(BANNERS_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const assets = await fetchMagazineAssets();
      console.log("Fetched magazine assets:", assets);
      
      if (cancelled) return;
      setCovers(assets.MAG_IMG);
      setBanners(assets.BANNERS);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  //console.log( "BundleSubscription: covers:", covers, "banners:", banners);
  const banner =
    tab === "print"
      ? { d: banners.printDesktop, m: banners.printMobile }
      : tab === "digital"
        ? { d: banners.digitalDesktop, m: banners.digitalMobile }
        : { d: banners.limitedDesktop, m: banners.limitedMobile };

  const list = tab === "print" ? PRINT_MAGAZINES : DIGITAL_MAGAZINES;
  const pick = tab === "print" ? printPick : digitalPick;
  const setPick = tab === "print" ? setPrintPick : setDigitalPick;

  const summary = useMemo(() => {
    if (tab === "limited") {
      const p = RATE_CARD[plan];
      if (!limitedSelected) return null;
      const items = Object.values(p.magazines).map(
        (m) => `${m.name} — Print + Digital (${p.duration})`,
      );
      return {
        items,
        mrp: p.totalMRP,
        pay: p.offerPrice,
        save: p.totalMRP - p.offerPrice,
        benefit: `Free Shopping Voucher worth Rs. ${p.gift.toLocaleString("en-IN")}`,
      };
    }
    const items: string[] = [];
    let mrp = 0;
    let pay = 0;
    for (const m of list) {
      const sel = pick[m.key];
      if (!sel?.checked) continue;
      const opt = m.options.find((o) => o.duration === sel.duration);
      if (!opt) continue;
      mrp += opt.mrp;
      pay += opt.price;
      items.push(
        `${m.name} - ${opt.duration} Year${opt.duration > 1 ? "s" : ""} - ${
          m.edition === "print" ? "Print" : "Digital"
        } Edition at Rs. ${opt.price}`,
      );
    }
    if (!items.length) return null;
    return { items, mrp, pay, save: Math.max(mrp - pay, 0), benefit: "None" };
  }, [tab, plan, limitedSelected, list, pick]);

  function proceed() {
    if (!summary) {
      setError(true);
      return;
    }
    setError(false);

    let magSelect = "";
    let selectionList: string[] = [];
    let dura = "";
    let gift = "";

    if (tab === "limited") {
      const p = RATE_CARD[plan];
      dura = p.durCode;
      gift = `Amazon Shopping Voucher worth Rs. ${p.gift.toLocaleString("en-IN")}`;
      magSelect = Object.keys(p.magazines)
        .map((code) => `${code}-${plan === "gold" ? "2" : "1"}C`)
        .join(", ");
      selectionList = Object.values(p.magazines).flatMap((m) => [
        `${m.name} - ${p.duration} - Print Edition`,
        `${m.name} - ${p.duration} - Digital Edition`,
      ]);
    } else {
      const chosen = list.filter((m) => pick[m.key]?.checked);
      magSelect = chosen
        .map((m) => `${m.code}-${pick[m.key]!.duration}${tab === "print" ? "P" : "D"}`)
        .join(", ");
      selectionList = summary.items;
      dura = `${chosen[0]?.options.find((o) => o.duration === pick[chosen[0]!.key]!.duration)?.duration ?? 1}yr`;
    }

    const mag = `OL-TEO-KJ-IND-${source}`;

    saveDraft({
      scope: "domestic",
      amt: summary.pay,
      dura,
      gift,
      mag,
      magSelect,
      selectionList,
      currency: "INR",
      toCurrency: "INR",
      currencySymbol: "Rs.",
      languagesSymbol: "en-IN",
      magazineCode: "15",
      subscriptionType: tab,
      source,
    });
    navigate({ to: "/order-form" });
  }

  return (
    <div className="ol-page">
      <SiteHeader />
      <div className="ol-container">
        <div className="banner-container1">
          <div className="subdsk-img">
            <img src={banner.d} alt="Outlook subscription offer" />
          </div>
          <div className="submob-img">
            <img src={banner.m} alt="Outlook subscription offer" />
          </div>
        </div>

        <header className="ol-header">
          <h1>Subscription for Domestic Readers</h1>
          <p className="subtitle">
            Select your favorite magazines and enjoy delivery through Registered Post
          </p>
        </header>

        <div className="subscription-tabs">
          {(
            [
              ["limited", "Exclusive Offer"],
              ["print", "Print"],
              ["digital", "Digital"],
            ] as [TabKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`subscription-tab ${tab === key ? "active" : ""}`}
              onClick={() => {
                setTab(key);
                setError(false);
                if (key === "limited") {
                  setPlan("gold");
                  setLimitedSelected(true);
                } else {
                  setPrintPick(initPicked(PRINT_MAGAZINES));
                  setDigitalPick(initPicked(DIGITAL_MAGAZINES));
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "limited" ? (
          <section>
            <div className="section-badge">Exclusive Offer — Valid for Limited Period</div>
            <div className="plan-selector">
              {(Object.keys(RATE_CARD) as PlanKey[]).map((key) => (
                <label key={key} className={`plan-radio ${plan === key ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="limited_plan"
                    checked={plan === key}
                    onChange={() => {
                      setPlan(key);
                      setLimitedSelected(true);
                    }}
                  />
                  <span>{RATE_CARD[key].label}</span>
                  <small>Save ₹{RATE_CARD[key].save.toLocaleString("en-IN")}</small>
                </label>
              ))}
            </div>
            <div className="magazine-list">
              {Object.entries(RATE_CARD[plan].magazines).map(([code, m]) => (
                <div
                  key={code}
                  className={`magazine-list-item ${limitedSelected ? "selected" : ""}`}
                  onClick={() => setLimitedSelected(true)}
                >
                  <div className="image-container">
                    <img
                      src={covers[coverKeyForCode(code)]}
                      alt={m.name}
                      className="mag-image"
                    />
                    <span className="offer-tag">{RATE_CARD[plan].duration}</span>
                  </div>
                  <div className="content">
                    <span className="mag-name">{m.name}</span>
                    <span className="mag-desc">Print + Digital</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div className="section-badge">
              {tab === "print" ? "Delivered to your doorstep" : "Access e-magazines"}
            </div>
            <p className="scroll-hint">
              <strong>&larr; Scroll horizontally &rarr;</strong>
            </p>
            <div className="magazine-grid">
              {list.map((m) => {
                const sel = pick[m.key]!;
                const opt = m.options.find((o) => o.duration === sel.duration)!;
                return (
                  <div key={m.key} className={`magazine-card ${sel.checked ? "selected" : ""}`}>
                    <img
                      src={covers[coverKeyForCode(m.code)]}
                      alt={m.name}
                      className="magazine-image"
                    />
                    <div className="magazine-info">
                      <div className="magazine-name">{m.name}</div>
                      <div className="magazine-details">{m.details}</div>
                    </div>
                    <select
                      className="duration-select"
                      value={sel.duration}
                      onChange={(e) =>
                        setPick((prev) => ({
                          ...prev,
                          [m.key]: { duration: Number(e.target.value), checked: false },
                        }))
                      }
                    >
                      {m.options.map((o) => (
                        <option key={o.duration} value={o.duration}>
                          {o.duration} Year{o.duration > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="edition-options">
                      <label className="edition-option">
                        <input
                          type="checkbox"
                          checked={sel.checked}
                          onChange={(e) => {
                            setError(false);
                            setPick((prev) => ({
                              ...prev,
                              [m.key]: { ...prev[m.key]!, checked: e.target.checked },
                            }));
                          }}
                        />
                        <span className="edition-label">
                          {tab === "print" ? "Print" : "Digital"} Edition
                        </span>
                        <span className="edition-price">₹{opt.price}</span>
                      </label>
                    </div>
                    <div className="magazine-price">₹{sel.checked ? opt.price : 0}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="selection-summary">
          <h2 className="summary-title">Your Selection Summary</h2>
          <div className="selected-items">
            {summary ? (
              <>
                {tab === "limited" && (
                  <div className="plan-title">
                    {RATE_CARD[plan].label} (Combo Offer)
                  </div>
                )}
                {summary.items.map((item) => (
                  <div className="selected-item" key={item}>
                    <span>{item}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-selection">No magazines selected yet</div>
            )}
          </div>

          <div className="deal-summary">
            <div className="deal-row">
              <span style={{ fontWeight: 600 }}>Total MRP:</span>
              <span style={{ fontWeight: 600 }}>{inr(summary?.mrp ?? 0)}</span>
            </div>
            <div className="deal-row">
              <span style={{ fontWeight: 600 }}>You Pay:</span>
              <span style={{ fontWeight: 700, color: "#d60810", fontSize: "1.2rem" }}>
                {inr(summary?.pay ?? 0)}
              </span>
            </div>
            <div className="deal-row">
              <span style={{ fontWeight: 600 }}>You Save:</span>
              <span style={{ fontWeight: 600, color: "#2e7d32" }}>{inr(summary?.save ?? 0)}</span>
            </div>
            <div className="deal-row">
              <span style={{ fontWeight: 600, color: "#d60810" }}>Member only benefits:</span>
              <span style={{ fontWeight: 600, textAlign: "right" }}>
                {summary?.benefit ?? "None"}
              </span>
            </div>
          </div>

          {error && (
            <div className="validation-error">Please select at least one magazine to continue.</div>
          )}
          <button type="button" className="submit-btn pulse" onClick={proceed}>
            Proceed to Checkout
          </button>
        </div>

        <div className="terms">
          <a href="/international-subscription">Subscribing from outside India? Click here</a>
        </div>
      </div>
    </div>
  );
}