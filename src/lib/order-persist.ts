// src/lib/order-persist.ts
import { createServerFn } from "@tanstack/react-start";
import { insertSubscribeUser } from "./db";
import { sendCustomerInvoice, sendAdminNotification } from "./email";
import type { CustomerDetails, OrderDraft } from "./order-store";

type PersistInput = {
  order: OrderDraft;
  customer: CustomerDetails;
  sessionId: string;
  gateway: string;
  gatewayTxnId?: string;
  gatewayStatus: string; // e.g. "SUCCESS" | "TXN_SUCCESS" | "COMPLETED"
  success: boolean;
  amount: number;
  currencySymbol: string;
  locale: string;
  rawResponse?: Record<string, string>;
  clientIp?: string;
};

export const persistPaidOrder = createServerFn({ method: "POST" })
  .inputValidator((data: PersistInput) => data)
  .handler(async ({ data }) => {
    const {
      order,
      customer,
      sessionId,
      gateway,
      gatewayTxnId,
      gatewayStatus,
      success,
      amount,
      currencySymbol,
      locale,
      rawResponse,
      clientIp,
    } = data;

    /* -------------------------- 1. DB insert -------------------------- */
    let dbError: string | undefined;
    try {
      // Derive exec code from mag — last segment after final dash.
      const execCode = order.mag?.split("-").pop() ?? "";
      const location =
        order.scope === "domestic" ? "Ind" : "Intl";

      await insertSubscribeUser({
        SUBTYPE: order.subscriptionType === "international" ? "sub" : order.subscriptionType || "sub",
        LOCATION: location,
        FNAME: customer.fname,
        LNAME: customer.lname,
        DOB: customer.dob ?? "",
        ADD1: customer.address1 ?? "",
        ADD2: "",
        PIN: customer.pin ?? "",
        PHONEOFF: customer.phoneoff ?? "",
        PHONERES: customer.phoneres ?? "",
        EMAIL: customer.email ?? "",
        OCCUPA: customer.occupa ?? "",
        SEX: customer.sex ?? "",
        CITY: customer.city ?? "",
        INCOME: null,
        DESIG: customer.desig ?? "",
        ORGAN: customer.org ?? "",
        GIFT_DESC: order.gift ?? "",
        MERCHAT_ID: order.mag ?? "",
        SESSION_ID: sessionId,
        AMOUNT: amount,
        MAGAZINE: order.magSelect ?? "",
        DURATION: order.dura ?? "",
        STATUS: success ? "Yes" : "No",
        DATE_SUB: new Date().toISOString().slice(0, 19).replace("T", " "),
        RECIPTNO: null,
        TRANSAC_NO: null,
        RESPONSE_CODE: gatewayStatus,
        AUTH_RESPONSE_CODE: null,
        REFID: null,
        SERVERIP: clientIp ?? "0.0.0.0",
        TXN_REF_NO: gatewayTxnId ?? null,
        AUTH_CODE: null,
        RRN_NO: null,
        ORDER_REF_NO: null,
        INVOICE_NO: null,
        MER_TAX_NO: null,
        RESP_MSG: success ? "COMPLETED" : "FAILED",
        ADD_CHANGE: "",
        MODE_SUBS: "subscription",
        MAG_SELECTED: order.selectionList.join(" | "),
        PHONERES_TEMP: null,
        PHONEOFF_TEMP: null,
        SOURCE1: order.source ?? null,
        SOURCE2: null,
        PAYMENT_DETAILS: gateway,
        hathwayrefno: null,
        USERSTATE: (customer.state ?? "").toUpperCase(),
      });
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
      console.error("persistPaidOrder → DB insert failed:", dbError);
    }

    /* -------------------------- 2. Emails -------------------------- */
    let customerEmailOk = false;
    let adminEmailOk = false;

    if (success) {
      const txn = {
        sessionId,
        gateway,
        gatewayTxnId,
        status: gatewayStatus,
        amount,
        currencySymbol,
        locale,
        rawResponse,
      };

      const [c, a] = await Promise.all([
        sendCustomerInvoice(customer, order, txn),
        sendAdminNotification(customer, order, txn),
      ]);
      customerEmailOk = c.ok;
      adminEmailOk = a.ok;
    }

    return {
      ok: !dbError,
      dbError,
      customerEmailOk,
      adminEmailOk,
      execCodeUsed: order.mag?.split("-").pop() ?? "",
    };
  });