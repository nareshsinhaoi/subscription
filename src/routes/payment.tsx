import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

import { initiateCCAvenueSandboxPayment } from "@/lib/ccavenue";
import { initiatePaytmSandboxPayment } from "@/lib/paytm";
import { initiatePhonePeSandboxPayment } from "@/lib/phonepe";

import { MERCHANT_IDS } from "@/lib/subscription-data";
import {
  getPlacedOrder,
  savePlacedOrder,
  type PlacedOrder,
} from "@/lib/order-store";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — Outlook Subscription" },
      { name: "description", content: "Confirm and pay for your Outlook magazine subscription." },
      { property: "og:title", content: "Payment — Outlook Subscription" },
      { property: "og:description", content: "Confirm and pay for your Outlook magazine subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentPage,
});

/** Real staging MIDs — used only for display in the Transaction Details. */
const DISPLAY_MIDS: Record<string, string> = {
  CCAVENUE: "326",
  PAYTM: "DAAPLj11327541593651",
  PHONEPE: "PGTESTPAYUAT86",
};

function PaymentPage() {
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [stage, setStage] = useState<"review" | "processing" | "error">("review");
  const [paymentError, setPaymentError] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    const p = getPlacedOrder();
    if (!p) {
      navigate({ to: "/bundle-subscription" });
      return;
    }
    if (p.status === "PAID") {
      navigate({ to: "/payment-response" });
      return;
    }
    setPlaced(p);
  }, [navigate]);

  if (!placed) return null;

  const { order, customer, sessionId } = placed;
  const displayMid = DISPLAY_MIDS[customer.paymentchoice] ?? merchantIdOf(customer.paymentchoice);

  /** Build a compact delivery string without trailing commas. */
  const deliveryLine = [
    customer.address1,
    `${customer.city ?? ""} ${customer.pin ?? ""}`.trim(),
    customer.state || customer.country || "",
  ]
    .filter((s) => s && s.trim())
    .join(", ");

  /** Where to go to edit the order — domestic vs international. */
  const editOrderTo =
    order.scope === "domestic" ? "/order-form" : "/order-form-international";

  async function payNow() {
    if (!placed) return;
    if (submittingRef.current) return; // guard against double-click
    submittingRef.current = true;

    setStage("processing");
    setPaymentError("");

    // Persist PROCESSING marker; clear stale gateway data on retry.
    savePlacedOrder({
      ...placed,
      status: "PROCESSING",
      gatewayTxnId: undefined,
      gatewayResponse: undefined,
    });

    try {
      /* --------------------------- CCAvenue --------------------------- */
      if (customer.paymentchoice === "CCAVENUE") {
        const payment = await initiateCCAvenueSandboxPayment({
          data: {
            orderId: sessionId,
            amount: placed.order.amt,
            currency: placed.order.toCurrency || placed.order.currency || "INR",
            customerName: `${customer.fname} ${customer.lname}`,
            email: customer.email,
            mobile: customer.phoneoff,
            address: customer.address1,
            city: customer.city,
            state: customer.state,
            country: customer.country,
            zip: customer.pin,
          },
        });

        if (!payment.ok) {
          setPaymentError(payment.error);
          setStage("error");
          submittingRef.current = false;
          return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = payment.paymentUrl;
        form.style.display = "none";
        for (const [name, value] of [
          ["encRequest", payment.encRequest],
          ["access_code", payment.accessCode],
        ]) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return; // browser navigates away; don't reset submittingRef
      }

      /* --------------------------- PhonePe --------------------------- */
      if (customer.paymentchoice === "PHONEPE") {
        const payment = await initiatePhonePeSandboxPayment({
          data: {
            orderId: sessionId,
            customerId: sessionId,
            amount: placed.order.amt,
            mobile: customer.phoneoff,
            currencyCode: placed.order.toCurrency || "INR",
            currencySymbol: placed.order.currencySymbol || "Rs.",
          },
        });
        if (!payment.ok) {
          setPaymentError(payment.error);
          setStage("error");
          submittingRef.current = false;
          return;
        }
        window.location.assign(payment.paymentUrl);
        return;
      }

      /* --------------------------- Paytm --------------------------- */
      const payment = await initiatePaytmSandboxPayment({
        data: {
          orderId: sessionId,
          customerId: sessionId,
          amount: placed.order.amt.toFixed(2),
          email: customer.email,
          mobile: customer.phoneoff,
        },
      });

      if (!payment.ok) {
        setPaymentError(payment.error);
        setStage("error");
        submittingRef.current = false;
        return;
      }

      // Fall back to MERCHANT_IDS if the server function doesn't return one.
      const paytmMid = payment.merchantId || MERCHANT_IDS.PAYTM;

      await loadPaytmCheckoutScript(paytmMid);

      const Paytm = (window as unknown as { Paytm?: PaytmCheckout }).Paytm;
      if (!Paytm?.CheckoutJS) {
        throw new Error("Paytm CheckoutJS failed to load.");
      }

      // Set the token BEFORE init so the SDK can read it.
      (window as unknown as { PmtxTxnToken?: string }).PmtxTxnToken =
        payment.txnToken;

      await Paytm.CheckoutJS.init({
        root: "",
        style: {
          bodyBackgroundColor: "#ffffff",
          themeBackgroundColor: "#a50d12",
          themeColor: "#ffffff",
        },
        flow: "DEFAULT",
        data: {
          orderId: sessionId,
          token: payment.txnToken,
          tokenType: "TXN_TOKEN",
          amount: placed.order.amt.toFixed(2),
        },
        handler: {
          notifyMerchant: function () {
            /* Paytm will redirect to callbackUrl; /payment-response handles it */
          },
          transactionStatus: function () {
            /* status callbacks (optional) */
          },
        },
      });

      // Only now invoke — SDK has the token registered.
      Paytm.CheckoutJS.invoke();
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : `Unable to connect to ${customer.paymentchoice} sandbox.`,
      );
      setStage("error");
      submittingRef.current = false;
    }
  }

  const row = (label: string, value: string) => (
    <div className="deal-row" key={label}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ textAlign: "right" }}>{value}</span>
    </div>
  );

  return (
    <div className="ol-page payment-page">
      <SiteHeader />
      <div className="ol-container-narrow">
        <div className={`ol-header payment-header payment-header--${stage}`}>
          <h1>
            {stage === "error"
              ? "Payment Error"
              : stage === "processing"
                ? "Processing Payment"
                : "Confirm & Pay"}
          </h1>
          <p className="subtitle">
            {stage === "processing"
              ? `Redirecting to ${customer.paymentchoice}…`
              : stage === "error"
                ? "Something went wrong while initiating payment"
                : `Paying through ${customer.paymentchoice}`}
          </p>
        </div>

        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          <ul>
            {order.selectionList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {order.gift && (
            <p>
              <strong>{order.gift}</strong>
            </p>
          )}
        </div>

        <div className="form-container">
          <h2 className="section-title">Transaction Details</h2>
          {row("Reference (Session ID)", sessionId)}
          {row("Subscriber", `${customer.fname} ${customer.lname}`)}
          {row("Email", customer.email)}
          {row("Mobile", customer.phoneoff)}
          {row("Delivery", deliveryLine || "—")}
          {row("Payment Mode", `${customer.paymentchoice} (Merchant ID ${displayMid})`)}
          {row("Duration", order.dura)}
          {row("Status", placed.status)}
          <div className="deal-row">
            <span style={{ fontWeight: 700 }}>Amount Payable</span>
            <span style={{ fontWeight: 700, color: "#d60810", fontSize: "1.2rem" }}>
              {order.currencySymbol} {order.amt.toLocaleString(order.languagesSymbol)}
            </span>
          </div>

          {stage === "review" || stage === "error" ? (
            <>
              <button
                type="button"
                className="submit-btn"
                style={{ maxWidth: "100%", width: "100%", marginLeft: 0, marginRight: 0 }}
                onClick={payNow}
                disabled={submittingRef.current}
              >
                Pay {order.currencySymbol} {order.amt.toLocaleString(order.languagesSymbol)} with{" "}
                {customer.paymentchoice}
              </button>
              <p className="payment-info" style={{ marginTop: 12, textAlign: "center" }}>
                <Link
                  to={editOrderTo}
                  style={{
                    color: "#a50d12",
                    fontWeight: 700,
                    textDecoration: "underline",
                  }}
                >
                  ← Edit order details
                </Link>
              </p>
            </>
          ) : null}

          {stage === "error" && <p className="payment-info">{paymentError}</p>}

          {stage === "processing" && (
            <p className="payment-info processing">
              Redirecting to {customer.paymentchoice}… please do not refresh this page.
            </p>
          )}

          <div className="payment-info">
            Payment gateways are running in test mode — no money is charged.
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fallback MID lookup for non-display cases. */
function merchantIdOf(choice: string): string {
  return MERCHANT_IDS[choice] ?? "";
}

/* ---------------------- Paytm helpers ---------------------- */

type PaytmCheckout = {
  CheckoutJS: {
    onLoad: (cb: () => void) => void;
    init: (config: unknown) => Promise<void>;
    invoke: () => void;
  };
};

async function loadPaytmCheckoutScript(mid: string) {
  if ((window as unknown as { Paytm?: PaytmCheckout }).Paytm) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paytm checkout script."));
    document.head.appendChild(script);
  });
}