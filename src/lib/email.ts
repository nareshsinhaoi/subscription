// src/lib/email.ts
import Sib from "sib-api-v3-sdk";
import type { CustomerDetails, OrderDraft } from "./order-store";

/* ---------- Brevo client ---------- */
function getClient() {
  const defaultClient = Sib.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY ?? "";
  return new Sib.TransactionalEmailsApi();
}

const SENDER = {
  name: process.env.BREVO_SENDER_NAME ?? "Outlook Subscription",
  email: process.env.BREVO_SENDER_EMAIL ?? "noreply@outlookindia.co.in",
};

export type TransactionInfo = {
  sessionId: string;
  gateway: string;
  gatewayTxnId?: string;
  status: string;
  amount: number;
  currencySymbol: string;
  locale: string;
  rawResponse?: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/*  Customer invoice                                                   */
/* ------------------------------------------------------------------ */
export async function sendCustomerInvoice(
  customer: CustomerDetails,
  order: OrderDraft,
  txn: TransactionInfo,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const api = getClient();

    const amount = `${txn.currencySymbol} ${txn.amount.toLocaleString(txn.locale)}`;

    const itemsRows = order.selectionList
      .map(
        (item) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #ececec;color:#3b424c;font-size:14px;">${escapeHtml(item)}</td>
          </tr>`,
      )
      .join("");

    const htmlContent = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:24px;background:#f5f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1f2328;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px -12px rgba(16,24,40,0.2);">
      <tr>
        <td style="background:linear-gradient(135deg,#b81016,#7d090d);padding:28px 28px 24px;color:#ffffff;">
          <h1 style="margin:0;font-size:22px;letter-spacing:-0.01em;">Payment Successful 🎉</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Thank you for subscribing to Outlook</p>
        </td>
      </tr>

      <tr>
        <td style="padding:26px 28px 8px;">
          <p style="margin:0 0 4px;color:#8a929c;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">Reference</p>
          <p style="margin:0 0 18px;font-size:15px;font-weight:700;">${escapeHtml(txn.sessionId)}</p>

          <p style="margin:0 0 4px;color:#8a929c;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">Subscriber</p>
          <p style="margin:0 0 18px;font-size:15px;">${escapeHtml(customer.fname)} ${escapeHtml(customer.lname)}</p>

          <p style="margin:0 0 4px;color:#8a929c;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">Paid via</p>
          <p style="margin:0 0 18px;font-size:15px;">${escapeHtml(txn.gateway)}${
            txn.gatewayTxnId ? ` &middot; Txn ID <strong>${escapeHtml(txn.gatewayTxnId)}</strong>` : ""
          }</p>

          <h2 style="margin:24px 0 10px;font-size:16px;border-bottom:1px dashed #d3d7dd;padding-bottom:8px;color:#1f2328;">Your Subscription</h2>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
            ${itemsRows}
          </table>

          <p style="margin:22px 0 0;padding:14px 16px;background:#fff1f1;border:1px solid rgba(165,13,18,0.16);border-radius:10px;font-size:16px;font-weight:800;color:#a50d12;display:flex;justify-content:space-between;">
            <span>Amount Paid</span>
            <span>${escapeHtml(amount)}</span>
          </p>

          ${
            order.gift
              ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f1faf3;border:1px solid rgba(40,114,61,0.18);border-radius:10px;font-size:13px;color:#1e6b35;font-weight:600;">🎁 ${escapeHtml(
                  order.gift,
                )}</p>`
              : ""
          }

          <p style="margin:22px 0 6px;font-size:13px;color:#5b6470;line-height:1.55;">
            Please keep this email for your records. If you have any questions, reply to this email
            or contact us at <a href="mailto:subscriptions@outlookindia.com" style="color:#a50d12;font-weight:700;text-decoration:none;">subscriptions@outlookindia.com</a>.
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#fafbfc;padding:18px 28px;border-top:1px solid #e6e8ec;color:#8a929c;font-size:12px;text-align:center;">
          &copy; ${new Date().getFullYear()} Outlook Group &middot; All rights reserved
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const textContent = [
      `Payment Successful — ${txn.sessionId}`,
      `Subscriber: ${customer.fname} ${customer.lname}`,
      `Paid via: ${txn.gateway}${txn.gatewayTxnId ? ` (Txn ID: ${txn.gatewayTxnId})` : ""}`,
      "",
      "Items:",
      ...order.selectionList.map((i) => `  • ${i}`),
      "",
      `Amount Paid: ${amount}`,
      order.gift ? `Gift: ${order.gift}` : "",
      "",
      "Thank you for subscribing to Outlook.",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await api.sendTransacEmail({
      sender: SENDER,
      to: [{ email: customer.email, name: `${customer.fname} ${customer.lname}` }],
      subject: `Your Outlook Subscription is confirmed — ${txn.sessionId}`,
      htmlContent,
      textContent,
    });

    return { ok: true };
  } catch (err: unknown) {
    const detail =
      (err as { response?: { text?: string; body?: unknown } })?.response?.text ??
      (err as { message?: string })?.message ??
      String(err);
    console.error("sendCustomerInvoice FAILED:", detail);
    return { ok: false, error: String(detail) };
  }
}

/* ------------------------------------------------------------------ */
/*  Admin notification (compact)                                       */
/* ------------------------------------------------------------------ */
export async function sendAdminNotification(
  customer: CustomerDetails,
  order: OrderDraft,
  txn: TransactionInfo,
): Promise<{ ok: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "nareshsinha3@gmail.com";

  try {
    const api = getClient();

    const amount = `${txn.currencySymbol} ${txn.amount.toLocaleString(txn.locale)}`;

    const htmlContent = `<!doctype html>
<html>
  <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1f2328;background:#f5f6f8;padding:20px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:22px;box-shadow:0 6px 20px -12px rgba(0,0,0,0.15);">
      <h2 style="margin:0 0 6px;color:#a50d12;font-size:18px;">New Subscription Order</h2>
      <p style="margin:0 0 14px;color:#5b6470;font-size:13px;">A customer just completed payment.</p>

      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#8a929c;width:130px;">Reference</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(txn.sessionId)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Gateway</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(txn.gateway)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Txn ID</td><td style="padding:6px 0;">${escapeHtml(txn.gatewayTxnId ?? "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Amount</td><td style="padding:6px 0;font-weight:800;color:#a50d12;">${escapeHtml(amount)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Customer</td><td style="padding:6px 0;">${escapeHtml(customer.fname)} ${escapeHtml(customer.lname)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Email</td><td style="padding:6px 0;">${escapeHtml(customer.email)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Mobile</td><td style="padding:6px 0;">${escapeHtml(customer.phoneoff)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a929c;">Items</td><td style="padding:6px 0;">${order.selectionList
          .map(escapeHtml)
          .join("<br/>")}</td></tr>
      </table>

      <p style="margin:16px 0 0;font-size:12px;color:#8a929c;">Automated message — please do not reply.</p>
    </div>
  </body>
</html>`;

    const textContent = [
      "New Subscription Order",
      `Reference: ${txn.sessionId}`,
      `Gateway: ${txn.gateway}${txn.gatewayTxnId ? ` (Txn ID: ${txn.gatewayTxnId})` : ""}`,
      `Amount: ${amount}`,
      `Customer: ${customer.fname} ${customer.lname} <${customer.email}>`,
      `Mobile: ${customer.phoneoff}`,
      "",
      "Items:",
      ...order.selectionList.map((i) => `  • ${i}`),
    ].join("\n");

    const result = await api.sendTransacEmail({
      sender: SENDER,
      to: [{ email: adminEmail, name: "Outlook Subscriptions Admin" }],
      subject: `[New Order] ${txn.sessionId} — ${amount} via ${txn.gateway}`,
      htmlContent,
      textContent,
    });

    return { ok: true };
  } catch (err: unknown) {
    const detail =
      (err as { response?: { text?: string } })?.response?.text ??
      (err as { message?: string })?.message ??
      String(err);
    console.error("sendAdminNotification FAILED:", detail);
    return { ok: false, error: String(detail) };
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}