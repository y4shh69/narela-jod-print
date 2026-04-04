import {
  BookCopy,
  FileOutput,
  Layers3,
  Laptop2,
  MapPinned,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const whatsappNumber = "919424000266";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Upload & Order", href: "/upload" },
  { label: "Track Order", href: "/track" },
  { label: "Contact", href: "/contact" },
];

export const services = [
  {
    title: "Instant Printing",
    description: "Black and white, color, PDF prints, and urgent delivery-ready jobs.",
    price: "From Rs 2/page",
    icon: Printer,
  },
  {
    title: "Binding",
    description: "Spiral binding, project files, reports, and presentation packs.",
    price: "From Rs 35",
    icon: BookCopy,
  },
  {
    title: "Lamination",
    description: "Cards, certificates, ID-sized sheets, and presentation covers.",
    price: "From Rs 25",
    icon: Layers3,
  },
  {
    title: "Online Work",
    description: "Form filling, resume formatting, scanning, and document support.",
    price: "From Rs 49",
    icon: Laptop2,
  },
];

export const highlights = [
  {
    title: "Fast turnaround",
    description: "Most print orders are confirmed within minutes on WhatsApp.",
    icon: Sparkles,
  },
  {
    title: "Trusted quality",
    description: "Clean prints, proper margins, and reliable finishing for students and offices.",
    icon: ShieldCheck,
  },
  {
    title: "Doorstep delivery",
    description: "Fast document dispatch across cities with clear timing updates.",
    icon: MapPinned,
  },
  {
    title: "Flexible uploads",
    description: "Share files directly on the website or send them on WhatsApp.",
    icon: FileOutput,
  },
];

export const testimonials = [
  {
    name: "Aditi Sharma",
    role: "Engineering student",
    quote: "The upload flow is simple and the print quality is consistently sharp. It feels faster than most local shops.",
  },
  {
    name: "Rahul Verma",
    role: "Coaching center manager",
    quote: "We use them for notes, binding, and urgent bulk copies. Turnaround is quick and pricing stays transparent.",
  },
  {
    name: "Neha Khan",
    role: "Freelancer",
    quote: "The site looks premium, but more importantly the service is practical. Upload, confirm, delivered, done.",
  },
];

export const pricing = [
  {
    name: "B&W Xerox",
    detail: "Single-sided A4 printing for notes and forms.",
    price: 2,
  },
  {
    name: "Color Print",
    detail: "Sharp color output for portfolios and certificates.",
    price: 10,
  },
  {
    name: "Spiral Binding",
    detail: "Professional binding with front cover options.",
    price: 35,
  },
  {
    name: "Lamination",
    detail: "Protective lamination for important documents.",
    price: 25,
  },
];
