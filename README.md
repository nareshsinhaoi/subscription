# Welcome to your MAGAZINE SUBSCRIPTION project

MAGAZINE SUBSCRIPTION  (TanStack Start + Vite + Nitro)

## Build with  

------------------------------------------------------------------------
### STACK
------------------------------------------------------------------------
- TanStack Start (React 19) + Vite 8
- Nitro (Node server preset for production)
- Tailwind CSS 4 + custom design system (src/styles.css)
- MySQL 8 (mysql2/promise)
- Brevo (sib-api-v3-sdk) for transactional email
- Payment gateways: CCAvenue, Paytm, PhonePe (sandbox + production)

------------------------------------------------------------------------
### REQUIREMENTS
------------------------------------------------------------------------
- Node.js >= 20.6  (needed for `node --env-file`)
- npm >= 10
- MySQL 8.x

------------------------------------------------------------------------
### INSTALL
------------------------------------------------------------------------
    npm install

Create a `.env` file in the project root (see ENVIRONMENT below).

------------------------------------------------------------------------
### DEVELOPMENT
------------------------------------------------------------------------
    npm run dev

Dev server runs on http://localhost:8080 by default.

------------------------------------------------------------------------
###BUILD
------------------------------------------------------------------------
    npm run build

Produces a production bundle under `.output/`.

The build is configured with the **node-server** Nitro preset so the
output runs anywhere Node runs (VPS, Docker, Railway, Render, etc.).

------------------------------------------------------------------------
### RUN PRODUCTION BUILD LOCALLY
------------------------------------------------------------------------
    node --env-file=.env .output/server/index.mjs

Server listens on http://localhost:3000 (override with PORT env var).

On Windows PowerShell:
    $env:PORT="4000"; node --env-file=.env .output/server/index.mjs

If Node < 20.6, use dotenv instead:
    npm install -D dotenv
    node -r dotenv/config .output/server/index.mjs
