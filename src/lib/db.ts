// src/lib/db.ts
import { createPool, type Pool, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  pool = createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    dateStrings: true,
  });
  return pool;
}

export type SubscribeUserRow = {
  SUBTYPE: string;
  LOCATION: string;
  FNAME: string;
  LNAME: string;
  DOB: string;
  ADD1: string;
  ADD2: string;
  PIN: string;
  PHONEOFF: string;
  PHONERES: string;
  EMAIL: string;
  OCCUPA: string;
  SEX: string;
  CITY: string;
  INCOME: string | null;
  DESIG: string;
  ORGAN: string;
  GIFT_DESC: string;
  MERCHAT_ID: string;
  SESSION_ID: string;
  AMOUNT: number;
  MAGAZINE: string;
  DURATION: string;
  STATUS: string;
  DATE_SUB: string;
  RECIPTNO: string | null;
  TRANSAC_NO: string | null;
  RESPONSE_CODE: string;
  AUTH_RESPONSE_CODE: string | null;
  REFID: string | null;
  SERVERIP: string;
  TXN_REF_NO: string | null;
  AUTH_CODE: string | null;
  RRN_NO: string | null;
  ORDER_REF_NO: string | null;
  INVOICE_NO: string | null;
  MER_TAX_NO: string | null;
  RESP_MSG: string;
  ADD_CHANGE: string;
  MODE_SUBS: string;
  MAG_SELECTED: string;
  PHONERES_TEMP: string | null;
  PHONEOFF_TEMP: string | null;
  SOURCE1: string | null;
  SOURCE2: string | null;
  PAYMENT_DETAILS: string | null;
  hathwayrefno: string | null;
  USERSTATE: string;
};

export async function insertSubscribeUser(row: SubscribeUserRow): Promise<void> {
  const db = getPool();

  // Check for an existing row with the same SESSION_ID — makes the insert idempotent.
  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT SESSION_ID FROM subscribe_user_master WHERE SESSION_ID = ? LIMIT 1",
    [row.SESSION_ID],
  );

  if (existing.length > 0) {
    // Update status + txn fields on retry.
    await db.execute(
      `UPDATE subscribe_user_master
       SET STATUS = ?, TXN_REF_NO = ?, RESP_MSG = ?, PAYMENT_DETAILS = ?
       WHERE SESSION_ID = ?`,
      [row.STATUS, row.TXN_REF_NO, row.RESP_MSG, row.PAYMENT_DETAILS, row.SESSION_ID],
    );
    return;
  }

  await db.execute(
    `INSERT INTO subscribe_user_master
     (SUBTYPE, LOCATION, FNAME, LNAME, DOB, ADD1, ADD2, PIN, PHONEOFF, PHONERES,
      EMAIL, OCCUPA, SEX, CITY, INCOME, DESIG, ORGAN, GIFT_DESC, MERCHAT_ID,
      SESSION_ID, AMOUNT, MAGAZINE, DURATION, STATUS, DATE_SUB, RECIPTNO,
      TRANSAC_NO, RESPONSE_CODE, AUTH_RESPONSE_CODE, REFID, SERVERIP, TXN_REF_NO,
      AUTH_CODE, RRN_NO, ORDER_REF_NO, INVOICE_NO, MER_TAX_NO, RESP_MSG,
      ADD_CHANGE, MODE_SUBS, MAG_SELECTED, PHONERES_TEMP, PHONEOFF_TEMP,
      SOURCE1, SOURCE2, PAYMENT_DETAILS, hathwayrefno, USERSTATE)
     VALUES (?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`,
    [
      row.SUBTYPE, row.LOCATION, row.FNAME, row.LNAME, row.DOB, row.ADD1, row.ADD2,
      row.PIN, row.PHONEOFF, row.PHONERES, row.EMAIL, row.OCCUPA, row.SEX, row.CITY,
      row.INCOME, row.DESIG, row.ORGAN, row.GIFT_DESC, row.MERCHAT_ID, row.SESSION_ID,
      row.AMOUNT, row.MAGAZINE, row.DURATION, row.STATUS, row.DATE_SUB, row.RECIPTNO,
      row.TRANSAC_NO, row.RESPONSE_CODE, row.AUTH_RESPONSE_CODE, row.REFID,
      row.SERVERIP, row.TXN_REF_NO, row.AUTH_CODE, row.RRN_NO, row.ORDER_REF_NO,
      row.INVOICE_NO, row.MER_TAX_NO, row.RESP_MSG, row.ADD_CHANGE, row.MODE_SUBS,
      row.MAG_SELECTED, row.PHONERES_TEMP, row.PHONEOFF_TEMP, row.SOURCE1,
      row.SOURCE2, row.PAYMENT_DETAILS, row.hathwayrefno, row.USERSTATE,
    ],
  );
}

export async function findSubscribeUser(sessionId: string): Promise<RowDataPacket | null> {
  const db = getPool();
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM subscribe_user_master WHERE SESSION_ID = ? LIMIT 1",
    [sessionId],
  );
  return rows[0] ?? null;
}