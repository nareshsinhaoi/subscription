import { createServerFn } from "@tanstack/react-start";
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";

type CCAvenueInput = {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  email: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
};

function getKey(workingKey: string) {
  return createHash("md5").update(workingKey).digest();
}

function encrypt(plain: string, workingKey: string) {
  const key = getKey(workingKey);
  const cipher = createCipheriv("aes-128-cbc", key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]).toString("hex");
}

function decrypt(encHex: string, workingKey: string) {
  const key = getKey(workingKey);
  const decipher = createDecipheriv("aes-128-cbc", key, Buffer.alloc(16));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

/* --------------------------- INITIATE --------------------------- */

export const initiateCCAvenueSandboxPayment = createServerFn({ method: "POST" })
  .inputValidator((data: CCAvenueInput) => data)
  .handler(async ({ data }) => {
    const merchantId = process.env.CCAVENUE_MERCHANT_ID;
    const accessCode = process.env.CCAVENUE_ACCESS_CODE;
    const workingKey = process.env.CCAVENUE_WORKING_KEY;
    const redirectUrl =
      process.env.CCAVENUE_REDIRECT_URL ??
      `${process.env.APP_BASE_URL ?? "http://localhost:8080"}/payment-response`;
    const cancelUrl =
      process.env.CCAVENUE_CANCEL_URL ??
      `${process.env.APP_BASE_URL ?? "http://localhost:8080"}/payment-response`;

    if (!merchantId || !accessCode || !workingKey) {
      return {
        ok: false as const,
        error: "CCAvenue sandbox is not configured on the server.",
      };
    }

    // CCAvenue requires specific parameter names, sorted and URL-encoded
    const request = new URLSearchParams({
      merchant_id: merchantId,
      order_id: data.orderId,
      currency: data.currency,
      amount: data.amount.toFixed(2),
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      language: "EN",
      billing_name: data.customerName,
      billing_email: data.email,
      billing_tel: data.mobile,
      billing_address: data.address ?? "",
      billing_city: data.city ?? "",
      billing_state: data.state ?? "",
      billing_zip: data.zip ?? "",
      billing_country: data.country ?? "",
      delivery_name: data.customerName,
      delivery_email: data.email,
      delivery_tel: data.mobile,
    }).toString();

    const encRequest = encrypt(request, workingKey);

    return {
      ok: true as const,
      encRequest,
      accessCode,
      paymentUrl:
        process.env.CCAVENUE_PAYMENT_URL ??
        "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    };
  });

/* --------------------------- VERIFY --------------------------- */

export const verifyCCAvenuePayment = createServerFn({ method: "POST" })
  .inputValidator((data: { encResp: string }) => data)
  .handler(async ({ data }) => {
    const workingKey = process.env.CCAVENUE_WORKING_KEY;
    if (!workingKey) {
      return {
        ok: false as const,
        error: "CCAvenue working key is not configured.",
      };
    }
    if (!data.encResp) {
      return { ok: false as const, error: "Missing encResp from CCAvenue." };
    }

    try {
      const plain = decrypt(data.encResp, workingKey);
      const params = new URLSearchParams(plain);
      const parsed: Record<string, string> = {};
      for (const [k, v] of params.entries()) parsed[k] = v;

      const orderStatus = parsed["order_status"] ?? "";
      const success =
        orderStatus.toLowerCase() === "success" ||
        orderStatus.toLowerCase() === "shipped" ||
        orderStatus.toLowerCase() === "settled";

      return {
        ok: true as const,
        success,
        status: orderStatus,
        orderId: parsed["order_id"] ?? "",
        trackingId: parsed["tracking_id"] ?? "",
        amount: parsed["amount"] ?? "",
        currency: parsed["currency"] ?? "",
        message: parsed["status_message"] ?? "",
        failureMessage: parsed["failure_message"] ?? "",
        raw: parsed,
      };
    } catch (error) {
      return {
        ok: false as const,
        error:
          error instanceof Error
            ? `Failed to decrypt CCAvenue response: ${error.message}`
            : "Failed to decrypt CCAvenue response.",
      };
    }
  });