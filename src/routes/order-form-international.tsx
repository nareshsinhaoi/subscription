import { createFileRoute } from "@tanstack/react-router";

import { OrderForm } from "@/components/OrderForm";

export const Route = createFileRoute("/order-form-international")({
  head: () => ({
    meta: [
      { title: "Order Form — Outlook Subscription (International)" },
      {
        name: "description",
        content: "Enter your mailing details and choose Paytm, CCAvenue or PhonePe to complete your international Outlook subscription.",
      },
      { property: "og:title", content: "Order Form — Outlook International Subscription" },
      { property: "og:description", content: "Complete your international Outlook magazine subscription order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <OrderForm scope="international" />,
});
