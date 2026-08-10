import type { Board } from "./types";

export const seedBoard: Board = {
  title: "Product Launch",
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cards: [
        {
          id: "card-1",
          title: "Define launch messaging",
          details: "Draft headline, subcopy, and CTA variants for the landing page.",
        },
        {
          id: "card-2",
          title: "Competitor teardown",
          details: "Document pricing, feature gaps, and positioning notes.",
        },
        {
          id: "card-3",
          title: "Press kit assets",
          details: "Collect logos, screenshots, and founder bios for media.",
        },
      ],
    },
    {
      id: "col-ready",
      title: "Ready",
      cards: [
        {
          id: "card-4",
          title: "Onboarding email sequence",
          details: "Three-part welcome series for early signup users.",
        },
        {
          id: "card-5",
          title: "Analytics events map",
          details: "List funnel events for signup, activation, and conversion.",
        },
      ],
    },
    {
      id: "col-progress",
      title: "In Progress",
      cards: [
        {
          id: "card-6",
          title: "Landing page hero",
          details: "Ship the hero section with brand photography and CTA.",
        },
        {
          id: "card-7",
          title: "Waitlist form",
          details: "Validate email capture and confirmation toast states.",
        },
      ],
    },
    {
      id: "col-review",
      title: "Review",
      cards: [
        {
          id: "card-8",
          title: "Pricing page copy",
          details: "Legal and marketing review before publish.",
        },
      ],
    },
    {
      id: "col-done",
      title: "Done",
      cards: [
        {
          id: "card-9",
          title: "Brand color tokens",
          details: "Published CSS variables across the design system.",
        },
        {
          id: "card-10",
          title: "Domain + hosting",
          details: "Production domain pointed at the preview environment.",
        },
      ],
    },
  ],
};
