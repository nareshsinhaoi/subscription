// src/routes/api/mag-covers.ts
import { createFileRoute } from "@tanstack/react-router";

const MAG_COVERS_URL =
  "https://kj2.outlookindia.com/assets/covers/mag_covers.json";

export const Route = createFileRoute("/api/mag-covers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch(MAG_COVERS_URL, {
            // Let the server cache it — covers change rarely
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = await res.json();

          return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              // Cache for 5 minutes — enough freshness for magazine covers
              "Cache-Control": "public, max-age=300, s-maxage=300",
            },
          });
        } catch (err) {
          // Never break the client — return empty so fallback is used
          console.error("[api/mag-covers] fetch failed:", err);

          return new Response("{}", {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      },
    },
  },
});