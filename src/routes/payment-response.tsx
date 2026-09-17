// src/routes/payment-response.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

import { verifyCCAvenuePayment } from "@/lib/ccavenue";
import { verifyPaytmPayment } from "@/lib/paytm";
import { checkPhonePePaymentStatus } from "@/lib/phonepe";
import { persistPaidOrder } from "@/lib/order-persist";
import {
  getPlacedOrder,
  updatePlacedOrderStatus,
  type PlacedOrder,
} from "@/lib/order-store";

export const Route = createFileRoute("/payment-response")({
  head: () => ({
    meta: [
      { title: "Payment Result — Outlook Subscription" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentResponsePage,
});

type Result = {
  success: boolean;
  status: string;
  gateway: string;
  trackingId?: string;
  amount?: string;
  message?: string;
};

function PaymentResponsePage() {
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const verifiedRef = useRef(false); // guards against double verification in StrictMode

  useEffect(() => {
    const p = getPlacedOrder();
    if (!p) {
      setError("No order found. Please start a new subscription.");
      setLoading(false);
      return;
    }
    setPlaced(p);
  }, []);

  useEffect(() => {
    if (!placed) return;
    if (verifiedRef.current) return; // idempotent — only verify once per mount
    verifiedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const bodyParams = readCachedPostBody();
        const all: Record<string, string> = {
          ...Object.fromEntries(params.entries()),
          ...bodyParams,
        };

        const gateway = placed.customer.paymentchoice;
        let verifiedSuccess = false;
        let r: Result | null = null;

        /* --------------------------- CCAvenue --------------------------- */
        if (gateway === "CCAVENUE") {
          const encResp = all["encResp"] ?? all["encRequest"] ?? "";
          if (!encResp) throw new Error("No CCAvenue response received.");
          const verify = await verifyCCAvenuePayment({ data: { encResp } });
          if (!verify.ok) throw new Error(verify.error);
          verifiedSuccess = verify.success;
          r = {
            success: verify.success,
            status: verify.status,
            gateway,
            trackingId: verify.trackingId,
            amount: verify.amount,
            message: verify.success ? verify.message : verify.failureMessage || verify.message,
          };
        }

        /* --------------------------- Paytm --------------------------- */
        else if (gateway === "PAYTM") {
          if (!all["STATUS"] && !all["CHECKSUMHASH"]) {
            throw new Error("No Paytm response received.");
          }
          const verify = await verifyPaytmPayment({ data: all });
          if (!verify.ok) throw new Error(verify.error);
          verifiedSuccess = verify.success;
          r = {
            success: verify.success,
            status: verify.status,
            gateway,
            trackingId: verify.trackingId,
            amount: verify.amount,
            message: verify.message,
          };
        }

        /* --------------------------- PhonePe --------------------------- */
        else if (gateway === "PHONEPE") {
          // PhonePe sends `transactionId` back — that's what the status API wants.
          const txnId =
            all["transactionId"] ??
            all["merchantTransactionId"] ??
            placed.sessionId;
          const verify = await checkPhonePePaymentStatus({
            data: { merchantTransactionId: txnId },
          });
          if (!verify.ok) throw new Error(verify.error);
          verifiedSuccess = verify.success;
          r = {
            success: verify.success,
            status: verify.status,
            gateway,
            trackingId: verify.trackingId,
            amount: verify.amount,
            message: verify.message,
          };
        } else {
          throw new Error(`Unknown payment gateway: ${gateway}`);
        }

        if (cancelled || !r) return;

        setResult(r);
        updatePlacedOrderStatus(r.success ? "PAID" : "FAILED", {
          gatewayTxnId: r.trackingId,
          gatewayResponse: { ...all },
        });

        /* ---------- DB + Email on every transaction ---------- */
        try {
          const persist = await persistPaidOrder({
            data: {
              order: placed.order,
              customer: placed.customer,
              sessionId: placed.sessionId,
              gateway,
              gatewayTxnId: r.trackingId,
              gatewayStatus: r.status,
              success: r.success,
              amount: placed.order.amt,
              currencySymbol: placed.order.currencySymbol,
              locale: placed.order.languagesSymbol,
              rawResponse: all,
            },
          });
          if (!persist.ok && persist.dbError) {
            console.error("DB persist failed:", persist.dbError);
          }
        } catch (persistErr) {
          console.error("persistPaidOrder threw:", persistErr);
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Payment verification failed.";
        setError(msg);
        // Only mark FAILED if we're sure the gateway told us so.
        // A missing param (e.g. user refresh) shouldn't flip status.
        if (placed.status !== "PAID") {
          updatePlacedOrderStatus("FAILED");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placed]);

  if (!placed) {
    return (
      <div className="ol-page payment-page">
        <SiteHeader />
        <div className="ol-container-narrow">
          <div className="ol-header payment-header payment-header--error">
            <h1>Payment Result</h1>
            <p className="subtitle">{error || "Loading…"}</p>
          </div>
        </div>
      </div>
    );
  }

  const success = result?.success === true;
  const stageClass = loading ? "processing" : success ? "done" : "error";

  return (
    <div className="ol-page payment-page">
      <SiteHeader />
      <div className="ol-container-narrow">
        <div className={`ol-header payment-header payment-header--${stageClass}`}>
          <h1>
            {loading
              ? "Verifying Payment"
              : success
                ? "Payment Successful"
                : "Payment Failed"}
          </h1>
          <p className="subtitle">
            {loading
              ? `Confirming your payment with ${placed.customer.paymentchoice}…`
              : success
                ? `Your subscription is confirmed`
                : result?.message || "Your payment was not completed."}
          </p>
        </div>

        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          <ul>
            {placed.order.selectionList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {placed.order.gift && (
            <p>
              <strong>{placed.order.gift}</strong>
            </p>
          )}
        </div>

        <div className="form-container">
          <h2 className="section-title">Transaction Details</h2>
          <div className="deal-row">
            <span style={{ fontWeight: 600 }}>Reference</span>
            <span>{placed.sessionId}</span>
          </div>
          <div className="deal-row">
            <span style={{ fontWeight: 600 }}>Gateway</span>
            <span>{placed.customer.paymentchoice}</span>
          </div>
          {result?.trackingId && (
            <div className="deal-row">
              <span style={{ fontWeight: 600 }}>Gateway Txn ID</span>
              <span>{result.trackingId}</span>
            </div>
          )}
          <div className="deal-row">
            <span style={{ fontWeight: 600 }}>Status</span>
            <span>{loading ? "Verifying…" : result?.status || "—"}</span>
          </div>
          <div className="deal-row">
            <span style={{ fontWeight: 700 }}>Amount</span>
            <span style={{ fontWeight: 700, color: "#d60810", fontSize: "1.2rem" }}>
              {placed.order.currencySymbol}{" "}
              {placed.order.amt.toLocaleString(placed.order.languagesSymbol)}
            </span>
          </div>

          {!loading && success && (
            <>
              <p className="payment-info">
                Thank you! A confirmation has been sent to {placed.customer.email}. Please keep
                reference <strong>{placed.sessionId}</strong> for any queries.
              </p>
              <button
                type="button"
                className="submit-btn"
                style={{ maxWidth: "100%", width: "100%", marginLeft: 0, marginRight: 0 }}
                onClick={() =>
                  navigate({
                    to:
                      placed.order.scope === "domestic"
                        ? "/bundle-subscription"
                        : "/international-subscription",
                  })
                }
              >
                Start a new subscription
              </button>
            </>
          )}

          {!loading && !success && (
            <>
              <p className="payment-info">
                {error || result?.message || "Your payment was not completed."}
              </p>
              <button
                type="button"
                className="submit-btn"
                style={{ maxWidth: "100%", width: "100%", marginLeft: 0, marginRight: 0 }}
                onClick={() => navigate({ to: "/payment" })}
              >
                Try again
              </button>
            </>
          )}

          <div className="payment-info">
            Payment gateways are running in test mode — no money is charged.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reads POST body cached by the server middleware (if any).          */
/* ------------------------------------------------------------------ */
function readCachedPostBody(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const cached = (window as unknown as { __paymentPostBody?: Record<string, string> })
      .__paymentPostBody;
    return cached ?? {};
  } catch {
    return {};
  }
}