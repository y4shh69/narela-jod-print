import openReception from "../assets/Banners/ChatGPT Image Apr 4, 2026, 09_18_23 PM.png";
import openTeam from "../assets/Banners/ChatGPT Image Apr 4, 2026, 09_18_34 PM.png";
import openOffice from "../assets/Banners/file_000000001a3871fabbcc024d2eb2136b.png";
import openMachines from "../assets/Banners/file_000000003d5c71fa904387fd37394ed2.png";
import closedLocking from "../assets/Banners/file_00000000d3e871fa8f247079b3c83937.png";
import closedStreet from "../assets/Banners/file_000000004d9871faa49b280be8a30e2c.png";
import closedFront from "../assets/Banners/file_00000000fd9071fa97327a96d4ddf8c7.png";
import closedEvening from "../assets/Banners/file_000000002d4071faa73cc41db7abb05b.png";

export const shopBanners = {
  open: [
    {
      image: openReception,
      eyebrow: "Reception desk",
      title: "A polished print studio ready for walk-ins and delivery orders",
      description: "Clean interiors, premium print equipment, and a customer-first desk setup for everyday jobs.",
      objectPosition: "center 32%",
    },
    {
      image: openTeam,
      eyebrow: "Team in action",
      title: "Fast support for document services, scan work, and Xerox requests",
      description: "Show the working floor, active staff, and the professional feel of the store when the shop is open.",
      objectPosition: "center 28%",
    },
    {
      image: openOffice,
      eyebrow: "Professional workspace",
      title: "A modern office-style print environment that builds trust instantly",
      description: "Designed to feel reliable for students, offices, and urgent same-day printing needs.",
      objectPosition: "center 24%",
    },
    {
      image: openMachines,
      eyebrow: "Print floor",
      title: "High-capacity machines and organized service counters for quick turnaround",
      description: "Use this view to emphasize scale, equipment readiness, and smooth order handling.",
      objectPosition: "center 26%",
    },
  ],
  closed: [
    {
      image: closedLocking,
      eyebrow: "After hours",
      title: "The storefront is currently closed, but orders can still be planned for the next opening window",
      description: "Show a clear closed-state visual while keeping the brand polished and trustworthy.",
    },
    {
      image: closedStreet,
      eyebrow: "Storefront status",
      title: "Closed for the day with the full showroom visible from the street",
      description: "Perfect for a professional closed-state banner that still highlights the studio quality.",
    },
    {
      image: closedFront,
      eyebrow: "Next opening",
      title: "Customers can still review the shop presence even when operations pause for the day",
      description: "Use this closed banner to keep the homepage looking premium while signalling the current status honestly.",
    },
    {
      image: closedEvening,
      eyebrow: "Evening exterior",
      title: "A strong storefront brand presence that stays visible even outside working hours",
      description: "A polished external shot that works well when the homepage needs to communicate a closed state.",
    },
  ],
};
