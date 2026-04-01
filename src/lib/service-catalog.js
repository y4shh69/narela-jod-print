import {
  BookCopy,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileBadge2,
  FileImage,
  FileOutput,
  FolderKanban,
  Gift,
  IdCard,
  Images,
  Landmark,
  Layers3,
  NotebookTabs,
  Package2,
  PenTool,
  Printer,
  ReceiptIndianRupee,
  ScrollText,
  ShieldCheck,
  Stamp,
  StickyNote,
  Ticket,
} from "lucide-react";

export const serviceCategoryOrder = [
  "Cards & Identity",
  "Letterheads & Stationery",
  "Printing",
  "Certificate & Cards",
  "Calendars & Diaries",
  "Stationery",
  "Office Essentials",
  "Personalised Gifts",
];

const iconMap = {
  business_cards: CreditCard,
  visiting_cards: CreditCard,
  standard_visiting_cards: CreditCard,
  classic_visiting_cards: CreditCard,
  rounded_corner_visiting_cards: CreditCard,
  square_visiting_cards: CreditCard,
  leaf_visiting_cards: CreditCard,
  oval_visiting_cards: CreditCard,
  circle_visiting_cards: CreditCard,
  letterheads: ScrollText,
  letterhead_printing: ScrollText,
  premium_embellishment_stationery: ShieldCheck,
  envelopes: FileOutput,
  bill_books: ReceiptIndianRupee,
  document_printing: Printer,
  legal_document_print: Landmark,
  resume_printing: FileBadge2,
  book_printing: BookOpenText,
  certificates_printing: FileBadge2,
  poster_printing: FileImage,
  leaflets_flyers_pamphlets: FileOutput,
  notebook_printing: NotebookTabs,
  brochure_printing: BookCopy,
  photo_album_printing: Images,
  sticker_printing: Ticket,
  annual_report_printing: ScrollText,
  booklets: BookCopy,
  presentation_folders: FolderKanban,
  raised_foil_presentation_folders: FolderKanban,
  rubber_stamp: Stamp,
  notebooks: NotebookTabs,
  desk_calendars: CalendarDays,
  table_calendar_printing: CalendarDays,
  diaries: BookOpenText,
  id_cards: IdCard,
  lanyards: IdCard,
  notepads: StickyNote,
  cards: FileBadge2,
  certificates_and_cards: FileBadge2,
  pens: PenTool,
  combo_sets: Package2,
  personalised_gifts: Gift,
  customised_playing_cards: Gift,
  letterhead_and_stationery: BriefcaseBusiness,
};

export function getServiceIcon(code, category) {
  if (iconMap[code]) return iconMap[code];

  switch (category) {
    case "Cards & Identity":
      return CreditCard;
    case "Letterheads & Stationery":
      return ScrollText;
    case "Certificate & Cards":
      return FileBadge2;
    case "Calendars & Diaries":
      return CalendarDays;
    case "Stationery":
      return NotebookTabs;
    case "Office Essentials":
      return Package2;
    case "Personalised Gifts":
      return Gift;
    default:
      return Printer;
  }
}

export function groupServicesByCategory(items) {
  const grouped = items.reduce((acc, item) => {
    const key = item.category || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => {
    const aIndex = serviceCategoryOrder.indexOf(a);
    const bIndex = serviceCategoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function splitTitle(title = "") {
  const words = title.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 18 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function servicePalette(category = "") {
  switch (category) {
    case "Cards & Identity":
      return ["#0b2f58", "#134f8c", "#f59e0b"];
    case "Letterheads & Stationery":
      return ["#172554", "#1d4ed8", "#f8fafc"];
    case "Printing":
      return ["#082f49", "#0369a1", "#fb923c"];
    case "Certificate & Cards":
      return ["#312e81", "#1d4ed8", "#fbbf24"];
    case "Calendars & Diaries":
      return ["#1e293b", "#2563eb", "#fcd34d"];
    case "Stationery":
      return ["#0f172a", "#0f766e", "#fde68a"];
    case "Office Essentials":
      return ["#111827", "#1d4ed8", "#f97316"];
    case "Personalised Gifts":
      return ["#4c1d95", "#db2777", "#fde68a"];
    default:
      return ["#0f172a", "#1d4ed8", "#f59e0b"];
  }
}

export function getServiceThumbnail(item) {
  const [bgA, bgB, accent] = servicePalette(item.category);
  const lines = splitTitle(item.title);
  const textSvg = lines
    .map(
      (line, index) =>
        `<text x="28" y="${112 + index * 24}" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${line}</text>`
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="540" viewBox="0 0 800 540" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="800" y2="540" gradientUnits="userSpaceOnUse">
          <stop stop-color="${bgA}"/>
          <stop offset="1" stop-color="${bgB}"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(620 120) rotate(135) scale(260 220)">
          <stop stop-color="${accent}" stop-opacity="0.9"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="540" rx="34" fill="url(#bg)"/>
      <rect x="22" y="22" width="756" height="496" rx="26" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.16"/>
      <circle cx="636" cy="126" r="180" fill="url(#glow)"/>
      <rect x="28" y="28" width="220" height="34" rx="17" fill="white" fill-opacity="0.09"/>
      <text x="44" y="50" fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2">${item.category.toUpperCase()}</text>
      <rect x="28" y="86" width="280" height="130" rx="24" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.14"/>
      ${textSvg}
      <rect x="468" y="110" width="220" height="146" rx="28" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.18"/>
      <rect x="494" y="136" width="170" height="16" rx="8" fill="${accent}" fill-opacity="0.85"/>
      <rect x="494" y="170" width="126" height="16" rx="8" fill="white" fill-opacity="0.74"/>
      <rect x="494" y="204" width="150" height="16" rx="8" fill="white" fill-opacity="0.42"/>
      <rect x="28" y="430" width="188" height="52" rx="24" fill="${accent}" fill-opacity="0.92"/>
      <text x="52" y="462" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="800">${item.priceLabel}</text>
      <text x="232" y="463" fill="white" fill-opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600">${item.unitLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
