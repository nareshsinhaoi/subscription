import { createFileRoute } from "@tanstack/react-router";

import { OrderForm } from "@/components/OrderForm";

export const Route = createFileRoute("/order-form")({
  head: () => ({
    meta: [
      { title: "Order Form — Outlook Subscription (India)" },
      {
        name: "description",
        content: "Enter your mailing details and choose Paytm, CCAvenue or PhonePe to complete your Outlook subscription.",
      },
      { property: "og:title", content: "Order Form — Outlook Subscription" },
      { property: "og:description", content: "Complete your Outlook magazine subscription order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <OrderForm scope="domestic" />,
});
