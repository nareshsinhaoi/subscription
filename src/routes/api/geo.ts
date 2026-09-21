// src/routes/api/geo.ts
import { createFileRoute } from "@tanstack/react-router";

const IPGEO_API_KEY = process.env.IPGEO_API_KEY ?? "";

type GeoResult = {
  country_code: string | null;
  country_name: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
};

export const Route = createFileRoute("/api/geo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Client IP: trust the first hop in x-forwarded-for when behind a proxy.
        const fwd = request.headers.get("x-forwarded-for") ?? "";
        // const ip = fwd.split(",")[0].trim();
        const ip = '102.129.157.255'

        const url = new URL("https://api.ipgeolocation.io/ipgeo");
        url.searchParams.set("apiKey", IPGEO_API_KEY);
        if (ip) url.searchParams.set("ip", ip);

        try {
          const res = await fetch(url.toString(), { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as {
            country_code2?: string;
            country_name?: string;
            currency?: { code?: string; symbol?: string };
          };

          const out: GeoResult = {
            country_code: data.country_code2 ?? null,
            country_name: data.country_name ?? null,
            currency_code: data.currency?.code ?? null,
            currency_symbol: data.currency?.symbol ?? null,
          };

          return Response.json(out, {
            headers: { "Cache-Control": "public, max-age=600" },
          });
        } catch (err) {
          console.error("[api/geo] failed:", err);
          return Response.json(
            {
              country_code: null,
              country_name: null,
              currency_code: null,
              currency_symbol: null,
            } satisfies GeoResult,
            { status: 200 },
          );
        }
      },
    },
  },
});

// export const Route = createFileRoute("/api/geo")({
//   server: {
//     handlers: {
//       GET: async ({ request }) => {
//         const ip =
//           request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
//         const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}${ip ? `&ip=${ip}` : ""}`;
//         try {
//           const res = await fetch(url);
//           if (!res.ok) throw new Error(`HTTP ${res.status}`);
//           const data = await res.json();
//           return Response.json({
//             country_code: data.country_code2,
//             country_name: data.country_name,
//             currency: data.currency ?? null,
//           });
//         } catch (err) {
//           console.error("[api/geo]", err);
//           return Response.json({ currency: null }, { status: 200 });
//         }
//       },
//     },
//   },
// });