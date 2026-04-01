import { ExternalLink, MapPin, Navigation } from "lucide-react";

const mapUrl = "https://www.google.com/maps?q=23.2687781,77.4683819&z=17&output=embed";
const directionsUrl = "https://maps.app.goo.gl/oMsa44wFfC5ppxdA8";

export function MapsEmbed() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/18 bg-slate-950/74 text-white shadow-[0_28px_70px_rgba(2,8,23,0.26)] backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              <MapPin className="h-3.5 w-3.5" />
              Shop location
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Visit Xerox Wala in Bhopal</h3>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Shop No-f-3, Bhavani Tower, above Naman restaurant, Bhawanidham Phase-1, Chhatrapati Nagar, Narela Jod,
              Ayodhya Nagar, Bhopal, Madhya Pradesh 462041
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Landmark</p>
              <p className="mt-2 text-sm font-semibold text-white">Above Naman Restaurant, Bhavani Tower</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-400/30 bg-brand-500/16 px-4 py-3 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/22"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/8 px-4 py-3 text-sm font-semibold text-white/84 transition hover:bg-white/12"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        <div className="relative min-h-[360px] bg-slate-900">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-slate-950/55 to-transparent" />
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
