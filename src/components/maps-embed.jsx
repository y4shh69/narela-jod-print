import { ExternalLink, MapPin, Navigation } from "lucide-react";

const mapUrl = "https://www.google.com/maps?q=23.2687781,77.4683819&z=17&output=embed";
const directionsUrl = "https://maps.app.goo.gl/jwqWHviSMq4cVx9L6";

export function MapsEmbed() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(145deg,rgba(255,248,242,0.95),rgba(255,238,227,0.88))] text-slate-900 shadow-[0_28px_70px_rgba(148,75,37,0.16)] backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between border-b border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))] p-6 lg:border-b-0 lg:border-r">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 shadow-[0_10px_24px_rgba(148,75,37,0.1)]">
              <MapPin className="h-3.5 w-3.5 text-orange-600" />
              Shop location
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Visit Xerox Wala</h3>
            <p className="mt-4 text-sm font-medium leading-8 text-slate-700">
              Shop No-f-3, Bhavani Tower, above Naman restaurant, Bhawanidham Phase-1, Chhatrapati Nagar, Narela Jod,
              Ayodhya Nagar, Madhya Pradesh 462041
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/65 bg-white/74 px-4 py-4 shadow-[0_12px_28px_rgba(148,75,37,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Landmark</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">Above Naman Restaurant, Bhavani Tower</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-300/70 bg-gradient-to-r from-amber-300/95 via-orange-200/90 to-rose-200/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_28px_rgba(249,115,22,0.18)] transition hover:brightness-105"
              >
                <Navigation className="h-4 w-4 text-orange-700" />
                Get directions
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white/92 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white"
              >
                <ExternalLink className="h-4 w-4 text-slate-700" />
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        <div className="relative min-h-[360px] bg-[#f7efe7]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#fff3ea]/85 to-transparent" />
          <iframe
            title="Madhu Enterprises map"
            src={mapUrl}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

