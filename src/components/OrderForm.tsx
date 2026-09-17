import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  COUNTRIES,
  INDIAN_STATES,
  PAYMENT_MODES,
} from "@/lib/subscription-data";
import {
  getDraft,
  saveDraft,
  savePlacedOrder,
  generateSessionId,
  type CustomerDetails,
  type OrderDraft,
} from "@/lib/order-store";

// Field of work / Occupation options (shared for domestic + international)
const OCCUPATIONS = [
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "IT & Engineering",
  "Operations",
  "Legal & Consulting",
  "Education",
  "Entrepreneur",
  "Medical Professional",
  "Others",
];

// Level of seniority / Designation options (shared for domestic + international)
const SENIORITY_LEVELS = [
  "Entrepreneur",
  "Senior Leadership",
  "Middle Management",
  "Entry Level",
  "Others",
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDobBounds() {
  const today = new Date();
  const max = new Date(today);
  max.setFullYear(today.getFullYear() - 10); // must be at least 10 years old
  const min = new Date(today);
  min.setFullYear(today.getFullYear() - 100); // at most 100 years old
  return { min: toISODate(min), max: toISODate(max) };
}

const emptyCustomer: CustomerDetails = {
  fname: "", lname: "", sex: "M", dob: "",
  address1: "", pin: "", state: "", country: "", city: "",
  phoneoff: "", phoneres: "", email: "", occupa: "", desig: "", org: "",
  paymentchoice: "CCAVENUE",
};

export function OrderForm({ scope }: { scope: "domestic" | "international" }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [form, setForm] = useState<CustomerDetails>(emptyCustomer);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);

  const backTo =
    scope === "domestic" ? "/bundle-subscription" : "/international-subscription";

  useEffect(() => {
    const d = getDraft();
    if (!d) {
      navigate({ to: backTo });
      return;
    }
    setDraft(d);
  }, [navigate, backTo]);

  const set = (key: keyof CustomerDetails, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  const digitsOnly = (key: keyof CustomerDetails) => (value: string) =>
    set(key, value.replace(/\D/g, ""));

  // Organization: letters, numbers and spaces only, max 28
  const orgOnly = (value: string) =>
    set("org", value.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 28));

  /** Navigate back to the subscription picker (draft stays intact). */
  function goBackToSelection() {
    if (draft) saveDraft(draft);
    navigate({ to: backTo });
  }

  function validate() {
    const next: Record<string, boolean> = {};

    const required: (keyof CustomerDetails)[] = [
      "fname", "lname", "address1", "pin", "city", "phoneoff", "email", "occupa", "desig",
    ];
    for (const key of required) if (!String(form[key] ?? "").trim()) next[key] = true;

    // DOB required + age 10–100
    if (!form.dob) {
      next["dob"] = true;
    } else {
      const dob = new Date(form.dob);
      if (isNaN(dob.getTime())) {
        next["dob"] = true;
      } else {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 10 || age > 100) next["dob"] = true;
      }
    }

    if (scope === "domestic" && !form.state) next["state"] = true;
    if (scope === "international" && !form.country) next["country"] = true;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next["email"] = true;

    setErrors(next);
    if (Object.keys(next).length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    return true;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || !validate()) return;
    saveDraft(draft);
    savePlacedOrder({
      order: draft,
      customer: { ...form, city: form.city || form.country },
      sessionId: generateSessionId(),
      merchantId: "",
      status: "PENDING",
      dateSub: new Date().toISOString(),
    });
    navigate({ to: "/payment" });
  }

  if (!draft) return null;

  const dobBounds = getDobBounds();
  const formattedTotal = `${draft.currencySymbol} ${draft.amt.toLocaleString(draft.languagesSymbol)}`;

  return (
    <div className="ol-page order-form-page">
      <SiteHeader />
      <main className="ol-container-narrow order-form-shell">
        <header className="order-form-header">
          <div>
            {/* Back link — top of the header, before the title */}
            <button
              type="button"
              className="order-form-back"
              onClick={goBackToSelection}
              aria-label="Back to magazine selection"
            >
              <span aria-hidden="true">←</span>
              <span>Back to selection</span>
            </button>

            <span className="order-form-kicker">Secure subscription checkout</span>
            <h1>Complete your order</h1>
            <p>Enter your details below to continue to payment.</p>
          </div>
          <div className="secure-checkout-mark" aria-label="Secure checkout">
            <span aria-hidden="true">⌾</span>
            <span>Secure checkout</span>
          </div>
        </header>

        <form onSubmit={submit} noValidate>
          <div className="order-summary">
            <div className="order-summary-heading">
              <div>
                <span className="summary-eyebrow">Your selection</span>
                <h2 className="summary-title">Order Summary</h2>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formattedTotal}</strong>
              </div>
            </div>
            <div className="summary-content">
              <ul className="order-item-list">
                {draft.selectionList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {draft.gift && (
                <p className="order-benefit">
                  <span aria-hidden="true">✓</span>
                  <strong>{draft.gift}</strong>
                </p>
              )}
            </div>
          </div>

          <div className={`form-container ${shake ? "shake" : ""}`}>
            <h2 className="section-title">Mailing Details</h2>

            {/* Row: First Name | Last Name */}
            <div className="form-row">
              <div className="form-col">
                <label className="required" htmlFor="fname">First Name</label>
                <input
                  id="fname"
                  maxLength={50}
                  value={form.fname}
                  onChange={(e) => set("fname", e.target.value)}
                />
                {errors["fname"] && (
                  <div className="validation-error">Please enter your first name</div>
                )}
              </div>
              <div className="form-col">
                <label className="required" htmlFor="lname">Last Name</label>
                <input
                  id="lname"
                  maxLength={50}
                  value={form.lname}
                  onChange={(e) => set("lname", e.target.value)}
                />
                {errors["lname"] && (
                  <div className="validation-error">Please enter your last name</div>
                )}
              </div>
            </div>

            {/* Row: Gender | Date of Birth */}
            <div className="form-row">
              <div className="form-col">
                <label className="required">Gender</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="male"
                      name="sex"
                      value="M"
                      checked={form.sex === "M"}
                      onChange={() => set("sex", "M")}
                    />
                    <label htmlFor="male" className="label-radio">Male</label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="female"
                      name="sex"
                      value="F"
                      checked={form.sex === "F"}
                      onChange={() => set("sex", "F")}
                    />
                    <label htmlFor="female" className="label-radio">Female</label>
                  </div>
                </div>
                {errors["sex"] && (
                  <div className="validation-error">Please select your gender</div>
                )}
              </div>
              <div className="form-col">
                <label className="required" htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="dob-input"
                  max={dobBounds.max}
                  min={dobBounds.min}
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
                {errors["dob"] && (
                  <div className="validation-error">
                    Please select a valid date of birth (age 10–100)
                  </div>
                )}
              </div>
            </div>

            {/* Mailing Address */}
            <div className="form-group">
              <label className="required" htmlFor="address1">
                {scope === "domestic" ? "Delivery Address" : "Mailing Address"}
              </label>
              <textarea
                id="address1"
                rows={3}
                className="class-textarea"
                placeholder="Enter your mailing address"
                value={form.address1}
                onChange={(e) => set("address1", e.target.value)}
              />
              {errors["address1"] && (
                <div className="validation-error">Please enter your mailing address</div>
              )}
            </div>

            {/* Row: Country/State | Pin/Zip Code */}
            <div className="form-row">
              <div className="form-col">
                {scope === "domestic" ? (
                  <>
                    <label className="required" htmlFor="state">State</label>
                    <select
                      id="state"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors["state"] && (
                      <div className="validation-error">Please select state.</div>
                    )}
                  </>
                ) : (
                  <>
                    <label className="required" htmlFor="country">Country</label>
                    <select
                      id="country"
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                    >
                      <option value="">-- Select Country --</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors["country"] && (
                      <div className="validation-error">Please select your country</div>
                    )}
                  </>
                )}
              </div>
              <div className="form-col">
                <label className="required" htmlFor="pin">Pin/Zip Code</label>
                <input
                  id="pin"
                  maxLength={10}
                  placeholder="Without spaces"
                  className="number-only"
                  value={form.pin}
                  onChange={(e) => digitsOnly("pin")(e.target.value)}
                />
                {errors["pin"] && (
                  <div className="validation-error">Please enter a valid pin/zip code</div>
                )}
              </div>
            </div>

            {/* Row: Mobile | Phone (Residence) */}
            <div className="form-row">
              <div className="form-col">
                <label className="required" htmlFor="phoneoff">Mobile</label>
                <input
                  id="phoneoff"
                  type="tel"
                  maxLength={12}
                  className="number-only"
                  value={form.phoneoff}
                  onChange={(e) => digitsOnly("phoneoff")(e.target.value)}
                />
                {errors["phoneoff"] && (
                  <div className="validation-error">Please enter your mobile number</div>
                )}
              </div>
              <div className="form-col">
                <label htmlFor="phoneres">Phone (Residence)</label>
                <input
                  id="phoneres"
                  maxLength={12}
                  className="number-only"
                  value={form.phoneres}
                  onChange={(e) => digitsOnly("phoneres")(e.target.value)}
                />
              </div>
            </div>

            {/* Row: Email | City */}
            <div className="form-row">
              <div className="form-col">
                <label className="required" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  maxLength={150}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors["email"] && (
                  <div className="validation-error">Please enter a valid email address</div>
                )}
              </div>
              <div className="form-col">
                <label className="required" htmlFor="city">City</label>
                <input
                  id="city"
                  maxLength={99}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                {errors["city"] && (
                  <div className="validation-error">Please enter your city name</div>
                )}
              </div>
            </div>

            {/* Row: Field of work / Occupation | Level of seniority / Designation */}
            <div className="form-row">
              <div className="form-col">
                <label className="required" htmlFor="occupa">
                  {scope === "domestic" ? "Occupation" : "Field of work"}
                </label>
                <select
                  id="occupa"
                  value={form.occupa}
                  onChange={(e) => set("occupa", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {errors["occupa"] && (
                  <div className="validation-error">
                    {scope === "domestic"
                      ? "Please select your occupation"
                      : "Please select your field of work"}
                  </div>
                )}
              </div>
              <div className="form-col">
                <label className="required" htmlFor="desig">
                  {scope === "domestic" ? "Designation" : "Level of seniority"}
                </label>
                <select
                  id="desig"
                  value={form.desig}
                  onChange={(e) => set("desig", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {SENIORITY_LEVELS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors["desig"] && (
                  <div className="validation-error">
                    {scope === "domestic"
                      ? "Please select your designation"
                      : "Please select your level of seniority"}
                  </div>
                )}
              </div>
            </div>

            {/* Organization (optional) */}
            <div className="form-group">
              <label htmlFor="org">Organization</label>
              <input
                id="org"
                maxLength={28}
                pattern="[A-Za-z0-9 ]+"
                title="Only letters, numbers and spaces are allowed (Maximum 28 characters)."
                value={form.org}
                onChange={(e) => orgOnly(e.target.value)}
              />
            </div>

            {/* Payment Options */}
            <div className="form-row">
              <div className="form-col">
                <label className="required">Payment Options</label>
                <div className="radio-group">
                  {PAYMENT_MODES.map((m) => (
                    <div className="radio-option" key={m.value}>
                      <input
                        type="radio"
                        id={m.value.toLowerCase()}
                        name="paymentchoice"
                        value={m.value}
                        checked={form.paymentchoice === m.value}
                        onChange={() => set("paymentchoice", m.value)}
                      />
                      <label htmlFor={m.value.toLowerCase()} className="label-radio">
                        {m.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="btn-container">
              <button type="submit" name="submit1" value="Pay Online" className="submit-btn">
                <span aria-hidden="true">🔒</span>
                Pay Now
              </button>

              {/* Secondary action — go back to change magazines */}
              <button
                type="button"
                className="back-btn"
                onClick={goBackToSelection}
              >
                ← Change magazine selection
              </button>
            </div>

            <div className="payment-info">
              <div className="payment-icons">
                <img
                  src="https://www.logo.wine/a/logo/Visa_Inc./Visa_Inc.-Logo.wine.svg"
                  alt="Visa"
                />
                <img
                  src="https://www.logo.wine/a/logo/Mastercard/Mastercard-Logo.wine.svg"
                  alt="Mastercard"
                />
              </div>
              <p>All Visa and Mastercard credit/debit cards are accepted, irrespective of the bank.</p>
            </div>
          </div>

          <footer className="order-form-footer">
            <button
              type="button"
              className="order-form-footer-back"
              onClick={goBackToSelection}
            >
              ← Back to selection
            </button>
            <a
              href="https://subscription.outlookindia.com/newoffer/terms-and-conditions-international.html"
              target="_blank"
              rel="noreferrer"
            >
              Terms and Conditions
            </a>
            <span>Outlook Group</span>
          </footer>
        </form>
      </main>
    </div>
  );
}