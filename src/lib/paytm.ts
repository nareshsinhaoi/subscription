import { createServerFn } from "@tanstack/react-start";
import PaytmChecksum from "paytmchecksum";

type PaytmInput = {
  orderId: string;
  customerId: string;
  amount: string;
  email: string;
  mobile: string;
};

/* --------------------------- INITIATE --------------------------- */

export const initiatePaytmSandboxPayment = createServerFn({ method: "POST" })
  .inputValidator((data: PaytmInput) => data)
  .handler(async ({ data }) => {
    const merchantId = process.env.PAYTM_MID;
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    const website = process.env.PAYTM_WEBSITE ?? "WEBSTAGING";
    const callbackUrl =
      process.env.PAYTM_CALLBACK_URL ??
      `${process.env.APP_BASE_URL ?? "http://localhost:8080"}/payment-response`;
    const host = process.env.PAYTM_HOST ?? "https://securegw-stage.paytm.in";

    if (!merchantId || !merchantKey || !callbackUrl) {
      return {
        ok: false as const,
        error: "Paytm sandbox is not configured on the server.",
      };
    }

    const body = {
      requestType: "Payment",
      mid: merchantId,
      websiteName: website,
      orderId: data.orderId,
      callbackUrl,
      txnAmount: {
        value: data.amount,
        currency: "INR",
      },
      userInfo: {
        custId: data.customerId,
        email: data.email,
        mobile: data.mobile,
      },
    };

    const signature = await PaytmChecksum.generateSignature(
      JSON.stringify(body),
      merchantKey,
    );

    const response = await fetch(
      `${host}/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(
        merchantId,
      )}&orderId=${encodeURIComponent(data.orderId)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, head: { signature } }),
      },
    );

    const result = (await response.json()) as {
      body?: {
        resultInfo?: { resultStatus?: string; resultMsg?: string };
        txnToken?: string;
      };
    };

    const token = result.body?.txnToken;
    const status = result.body?.resultInfo?.resultStatus;

    if (!response.ok || status !== "S" || !token) {
      return {
        ok: false as const,
        error:
          result.body?.resultInfo?.resultMsg ??
          "Paytm payment initiation failed.",
      };
    }

    return {
      ok: true as const,
      txnToken: token,
      merchantId,
      paymentUrl: `${host}/theia/api/v1/showPaymentPage?mid=${encodeURIComponent(
        merchantId,
      )}&orderId=${encodeURIComponent(data.orderId)}`,
    };
  });

/* --------------------------- VERIFY --------------------------- */

export const verifyPaytmPayment = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, string>) => data)
  .handler(async ({ data }) => {
    const merchantKey = process.env.PAYTM_MERCHANT_KEY;
    if (!merchantKey) {
      return {
        ok: false as const,
        error: "Paytm merchant key is not configured.",
      };
    }

    // Extract the checksum sent by Paytm
    const receivedChecksum = data["CHECKSUMHASH"] ?? "";
    const copy: Record<string, string> = { ...data };
    delete copy["CHECKSUMHASH"];

    const isValid = PaytmChecksum.verifySignature(
      copy,
      merchantKey,
      receivedChecksum,
    );

    if (!isValid) {
      return {
        ok: false as const,
        error: "Paytm checksum verification failed.",
      };
    }

    const status = (data["STATUS"] ?? "").toUpperCase();
    const success = status === "TXN_SUCCESS";

    return {
      ok: true as const,
      success,
      status: data["STATUS"] ?? "",
      orderId: data["ORDERID"] ?? "",
      trackingId: data["TXNID"] ?? "",
      amount: data["TXNAMOUNT"] ?? "",
      message: data["RESPMSG"] ?? "",
      raw: data,
    };
  });