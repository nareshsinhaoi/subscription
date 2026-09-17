import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";

type PhonePeInput = {
  orderId: string;
  customerId: string;
  amount: number;
  mobile: string;
  currencyCode: string;
  currencySymbol: string;
};

/* --------------------------- INITIATE --------------------------- */

export const initiatePhonePeSandboxPayment = createServerFn({ method: "POST" })
  .inputValidator((data: PhonePeInput) => data)
  .handler(async ({ data }) => {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const redirectUrl =
      process.env.PHONEPE_REDIRECT_URL ??
      `${process.env.APP_BASE_URL ?? "http://localhost:8080"}/payment-response`;
    const callbackUrl = process.env.PHONEPE_CALLBACK_URL ?? redirectUrl;
    const host =
      process.env.PHONEPE_HOST ??
      "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!merchantId || !saltKey || !saltIndex) {
      return {
        ok: false as const,
        error: "PhonePe sandbox is not configured on the server.",
      };
    }

    const payload = {
      merchantId,
      merchantTransactionId: data.orderId,
      merchantUserId: data.customerId,
      amount: Math.round(data.amount * 100), // paise
      redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl,
      mobileNumber: data.mobile,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum =
      createHash("sha256")
        .update(`${base64Payload}/pg/v1/pay${saltKey}`)
        .digest("hex") + `###${saltIndex}`;

    const response = await fetch(`${host}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const result = (await response.json()) as {
      success?: boolean;
      code?: string;
      message?: string;
      data?: {
        instrumentResponse?: { redirectInfo?: { url?: string } };
      };
    };

    const paymentUrl = result.data?.instrumentResponse?.redirectInfo?.url;
    if (!response.ok || !result.success || !paymentUrl) {
      return {
        ok: false as const,
        error: result.message ?? "PhonePe payment initiation failed.",
      };
    }

    return { ok: true as const, paymentUrl };
  });

/* ------------------------ STATUS CHECK ------------------------ */

export const checkPhonePePaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { merchantTransactionId: string }) => data)
  .handler(async ({ data }) => {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const host =
      process.env.PHONEPE_HOST ??
      "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!merchantId || !saltKey || !saltIndex) {
      return {
        ok: false as const,
        error: "PhonePe sandbox is not configured on the server.",
      };
    }

    const path = `/pg/v1/status/${merchantId}/${data.merchantTransactionId}`;
    const checksum =
      createHash("sha256").update(`${path}${saltKey}`).digest("hex") +
      `###${saltIndex}`;

    const response = await fetch(`${host}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    });

    const result = (await response.json()) as {
      success?: boolean;
      code?: string;
      message?: string;
      data?: {
        state?: string;
        transactionId?: string;
        amount?: number;
        responseCode?: string;
      };
    };

    if (!response.ok || !result.success) {
      return {
        ok: false as const,
        error: result.message ?? "PhonePe status check failed.",
      };
    }

    const state = (result.data?.state ?? "").toUpperCase();
    const success = state === "COMPLETED";

    return {
      ok: true as const,
      success,
      status: state,
      trackingId: result.data?.transactionId ?? "",
      amount: result.data?.amount ? String(result.data.amount / 100) : "",
      message: result.message ?? "",
      raw: result.data as Record<string, unknown>,
    };
  });