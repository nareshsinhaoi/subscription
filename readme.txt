========================================================================
MAGAZINE SUBSCRIPTION  (TanStack Start + Vite + Nitro)
========================================================================

A subscription checkout flow for magazines (domestic + international)
with online payment integration (CCAvenue, Paytm, PhonePe) and MySQL
persistence.

------------------------------------------------------------------------
STACK
------------------------------------------------------------------------
- TanStack Start (React 19) + Vite 8
- Nitro (Node server preset for production)
- Tailwind CSS 4 + custom design system (src/styles.css)
- MySQL 8 (mysql2/promise)
- Brevo (sib-api-v3-sdk) for transactional email
- Payment gateways: CCAvenue, Paytm, PhonePe (sandbox + production)

------------------------------------------------------------------------
REQUIREMENTS
------------------------------------------------------------------------
- Node.js >= 20.6  (needed for `node --env-file`)
- npm >= 10
- MySQL 8.x

------------------------------------------------------------------------
INSTALL
------------------------------------------------------------------------
    npm install

Create a `.env` file in the project root (see ENVIRONMENT below).

------------------------------------------------------------------------
DEVELOPMENT
------------------------------------------------------------------------
    npm run dev

Dev server runs on http://localhost:8080 by default.

------------------------------------------------------------------------
BUILD
------------------------------------------------------------------------
    npm run build

Produces a production bundle under `.output/`.

The build is configured with the **node-server** Nitro preset so the
output runs anywhere Node runs (VPS, Docker, Railway, Render, etc.).

------------------------------------------------------------------------
RUN PRODUCTION BUILD LOCALLY
------------------------------------------------------------------------
    node --env-file=.env .output/server/index.mjs

Server listens on http://localhost:3000 (override with PORT env var).

On Windows PowerShell:
    $env:PORT="4000"; node --env-file=.env .output/server/index.mjs

If Node < 20.6, use dotenv instead:
    npm install -D dotenv
    node -r dotenv/config .output/server/index.mjs

------------------------------------------------------------------------
ENVIRONMENT VARIABLES (.env)
------------------------------------------------------------------------

--- Database (MySQL) ---
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

--- App ---
APP_BASE_URL=http://localhost:8080

--- CCAvenue ---
CCAVENUE_MERCHANT_ID=
CCAVENUE_ACCESS_CODE=
CCAVENUE_WORKING_KEY=
CCAVENUE_PAYMENT_URL=https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction
CCAVENUE_REDIRECT_URL=http://localhost:8080/payment-response
CCAVENUE_CANCEL_URL=http://localhost:8080/payment-response

--- Paytm ---
PAYTM_MID=
PAYTM_MERCHANT_KEY=
PAYTM_WEBSITE=WEBSTAGING
PAYTM_HOST=https://securegw-stage.paytm.in
PAYTM_CALLBACK_URL=http://localhost:8080/payment-response

--- PhonePe ---
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=
PHONEPE_HOST=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:8080/payment-response
PHONEPE_CALLBACK_URL=http://localhost:8080/payment-response

--- Brevo (email) ---
BREVO_API_KEY=
BREVO_SENDER_EMAIL=noreply@yourwebsite.co.in
BREVO_SENDER_NAME=magazine Subscription
ADMIN_EMAIL=

IMPORTANT: Never commit `.env` to git. Keep it local and inject via your
host's secrets manager in production.

------------------------------------------------------------------------
DATABASE
------------------------------------------------------------------------
Create the target table before the first run:

    CREATE TABLE subscribe_user_master ( ... );   -- see schema.sql

The server writes one row per transaction into `subscribe_user_master`.
Ensure the DB user has INSERT / UPDATE / SELECT privileges on it.

------------------------------------------------------------------------
PAYMENT GATEWAYS (SANDBOX)
------------------------------------------------------------------------

CCAvenue test card:  4916 2246 0101 1119  |  any future expiry  |  any CVV
                     OTP: 123456

Paytm UPI:           success@paytm  |  any 4-6 digit PIN
Paytm card:          4111 1111 1111 1111  |  any expiry / CVV  |  OTP 489871

PhonePe UPI:         success@ybl  |  any PIN

All three gateways are configured to hit their **sandbox** endpoints by
default. Switch to production URLs and credentials before go-live.

------------------------------------------------------------------------
ROUTES
------------------------------------------------------------------------
/                        -> redirects to /bundle-subscription
/bundle-subscription     -> Domestic magazine picker (India)
/international-subscription -> International picker (multi-currency)
/order-form              -> Domestic customer form
/order-form-international -> International customer form
/payment                 -> Gateway launcher (CCAvenue / Paytm / PhonePe)
/payment-response        -> Gateway callback + verification + DB + email

------------------------------------------------------------------------
PROJECT STRUCTURE
------------------------------------------------------------------------
src/
  components/
    SiteHeader.tsx
    OrderForm.tsx
  lib/
    subscription-data.ts    All plans, prices, currencies, exchange rates
    order-store.ts          Draft + placed-order session storage
    ccavenue.ts             CCAvenue server functions (init + verify)
    paytm.ts                Paytm server functions
    phonepe.ts              PhonePe server functions
    order-persist.ts        DB insert + email orchestration
    db.ts                   MySQL pool + insert helper
    email.ts                Brevo invoice + admin notification
  routes/                   All TanStack Router file-based routes
  styles.css                Global design system + page styles

------------------------------------------------------------------------
SCRIPTS
------------------------------------------------------------------------
npm run dev      Start dev server
npm run build    Production build (.output/)
npm run preview  Static preview (no server functions)
npm run lint     ESLint
npm run format   Prettier write

------------------------------------------------------------------------
NOTES
------------------------------------------------------------------------
- The production build output (`.output/`) is generated. Do NOT commit it.
- `node_modules/`, `.env`, `.output/`, `.wrangler/`, and `dist/` are
  already git-ignored.
- If you deploy to a Node host (Railway / Render / Fly / VPS), use the
  `node-server` preset and run `.output/server/index.mjs`.
- If you switch to Cloudflare Workers, replace the MySQL client with
  Cloudflare Hyperdrive (`mysql2` cannot talk to MySQL over TCP from
  Workers).

------------------------------------------------------------------------
LICENSE
------------------------------------------------------------------------
Proprietary — (c) Outlook Group. All rights reserved.
========================================================================