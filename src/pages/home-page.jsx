import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapsEmbed } from "../components/maps-embed";
import { SectionHeading } from "../components/section-heading";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/toast-provider";
import { highlights, services, testimonials, whatsappNumber } from "../lib/constants";
import { Seo } from "../lib/seo";
import { shopBanners } from "../lib/shop-banners";
import { formatDate } from "../lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: index * 0.08 },
  }),
};

export function HomePage() {
  const heroBullets = ["Fast turnaround", "Clear pricing", "Delivery updates on WhatsApp"];
  const [siteContent, setSiteContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadSiteContent() {
      try {
        setContentLoading(true);
        const response = await fetch("/api/site-content");
        if (!response.ok) {
          throw new Error("Unable to load daily site content");
        }
        const payload = await response.json();
        if (active) {
          setSiteContent(payload);
        }
      } catch (error) {
        if (active) {
          showToast({
            title: "Daily updates unavailable",
            description: "Using the default homepage content for now.",
            variant: "error",
          });
        }
      } finally {
        if (active) {
          setContentLoading(false);
        }
      }
    }

    loadSiteContent();
    return () => {
      active = false;
    };
  }, [showToast]);

  const shopMode = siteContent?.shopOpen === false ? "closed" : "open";
  const activeBanners = useMemo(() => shopBanners[shopMode], [shopMode]);

  useEffect(() => {
    setBannerIndex(0);
  }, [shopMode]);

  useEffect(() => {
    if (!activeBanners.length) return undefined;

    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % activeBanners.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [activeBanners]);

  return (
    <>
      <Seo
        title="Printing Shop | Fast Printing & Xerox Services"
        description="Upload files online for premium printing, xerox, binding, lamination, and stationery support."
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="section-shell">
          <div className="hero-gradient rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="relative z-10 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15 }}
                className="w-full"
              >
                <div className="banner-showcase rounded-[34px] p-3 sm:p-4 lg:p-5">
                  <div className="relative overflow-hidden rounded-[30px] aspect-[16/8] min-h-[240px] sm:min-h-[320px] lg:min-h-[380px] xl:min-h-[430px]">
                    {activeBanners.map((banner, index) => (
                      <div
                        key={banner.image}
                        className={`absolute inset-0 transition-opacity duration-700 ${index === bannerIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: banner.objectPosition || "center center" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/54 via-transparent to-white/8" />
                      </div>
                    ))}

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-white/12 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                      <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-slate-950/32 px-4 py-3 backdrop-blur-md">
                        {activeBanners.map((banner, index) => (
                          <button
                            key={`${banner.eyebrow}-${index}`}
                            type="button"
                            onClick={() => setBannerIndex(index)}
                            className={`h-2.5 rounded-full transition-all ${index === bannerIndex ? "w-10 bg-white" : "w-2.5 bg-white/45 hover:bg-white/72"}`}
                            aria-label={`Show banner ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-6xl">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] xl:items-start">
                  <div>
                    <span className="hero-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700">
                      <Sparkles className="h-4 w-4 text-brand-500" />
                      {siteContent?.bannerLabel || "Modern print workflows for delivery-first teams"}
                    </span>
                    <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                      Fast Printing & Xerox Services
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                      Upload files, set print preferences, and confirm your order in minutes. Built for students, startups, offices, and urgent same-day jobs.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {heroBullets.map((item) => (
                        <div key={item} className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/10 backdrop-blur-sm">
                          <CheckCircle2 className="h-4 w-4 text-brand-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link to="/upload">
                        <Button className="w-full sm:w-auto">
                          Upload File
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
                      >
                        Order on WhatsApp
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-black/5 bg-white/72 px-5 py-5 text-slate-900 shadow-[0_20px_48px_rgba(15,23,42,0.12)] backdrop-blur-md">
                    {contentLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-40 bg-slate-200/80" />
                        <Skeleton className="h-6 w-full bg-slate-200/70" />
                        <Skeleton className="h-5 w-4/5 bg-slate-200/70" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-300 via-orange-200 to-rose-200 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-900 shadow-[0_12px_28px_rgba(249,115,22,0.22)]">
                            {siteContent?.shopStatus || "Open now"}
                          </span>
                          <span className={`inline-flex items-center rounded-full border px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.18em] shadow-[0_12px_28px_rgba(15,23,42,0.14)] ${siteContent?.shopOpen === false ? "border-rose-300/85 bg-gradient-to-r from-rose-300 via-pink-200 to-orange-100 text-rose-900" : "border-emerald-300/85 bg-gradient-to-r from-emerald-300 via-lime-200 to-emerald-100 text-emerald-900"}`}>
                            {siteContent?.shopOpen === false ? "Store closed" : "Store open"}
                          </span>
                        </div>
                        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{siteContent?.dailyOffer || "A4 B&W prints from Rs 2/page for online and delivery orders."}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{siteContent?.dailyMessage || "Same-day delivery is available on most standard jobs received before evening."}</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <span className="rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm">
                            {siteContent?.primaryMetricLabel || "Jobs completed today"}: {siteContent?.primaryMetricValue || "0"}
                          </span>
                          <span className="rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm">
                            {siteContent?.secondaryMetricLabel || "Orders in progress"}: {siteContent?.secondaryMetricValue || "0"}
                          </span>
                          <span className="rounded-[18px] border border-black/5 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm sm:col-span-2">
                            {siteContent?.turnaroundTime || "Most jobs ready within 30-60 minutes"}
                          </span>
                        </div>
                        {siteContent?.updatedAt ? (
                          <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            Updated {formatDate(siteContent.updatedAt)}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {highlights.map((item, index) => (
                    <motion.div key={item.title} custom={index + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                      <div className="service-card h-full rounded-[20px] p-5 transition duration-300 hover:-translate-y-1">
                        <item.icon className="h-5 w-5 text-brand-500" />
                        <p className="mt-4 text-lg font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Features"
            title="A cleaner ordering flow for everyday print work"
            description="Clear preferences, faster intake, and a polished customer journey from upload to delivery."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <motion.div key={service.title} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="service-card group h-full rounded-[24px] p-7 transition duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                  <service.icon className="h-8 w-8 text-brand-500" />
                  <p className="mt-7 text-[2rem] font-semibold tracking-tight text-slate-900">{service.title}</p>
                  <p className="mt-5 text-sm leading-8 text-slate-600">{service.description}</p>
                  <p className="mt-8 text-[1.75rem] font-semibold tracking-tight text-slate-900">{service.price.replace("From ", "")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Services"
            title="Everything students and offices need in one place"
            description="Modern service cards, transparent starting prices, and the right mix of urgency and reliability."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {services.map((service, index) => (
              <motion.div key={service.title} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="service-card flex h-full flex-col justify-between rounded-[24px] p-7 transition duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                  <div>
                    <service.icon className="h-8 w-8 text-brand-500" />
                    <p className="mt-6 text-[2rem] font-semibold tracking-tight text-slate-900">{service.title}</p>
                    <p className="mt-4 text-sm leading-8 text-slate-600">{service.description}</p>
                  </div>
                  <p className="mt-8 text-xl font-semibold text-slate-900">{service.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Social proof"
            title="Trusted by students, freelancers, and local teams"
            description="Readable layouts, reliable execution, and a workflow designed to reduce friction."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.div key={item.name} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">"{item.quote}"</p>
                  <div className="mt-6">
                    <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Today on delivery</p>
              <p className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{siteContent?.shopStatus || "Open now"}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {siteContent?.dailyMessage || "Same-day delivery is available on most standard jobs received before evening."}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{siteContent?.primaryMetricLabel || "Jobs completed today"}</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{siteContent?.primaryMetricValue || "0"}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Live from today&apos;s order flow so returning visitors feel that the desk is active.
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{siteContent?.secondaryMetricLabel || "Orders in progress"}</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{siteContent?.secondaryMetricValue || "0"}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Current workload at the print desk with a visible turnaround promise.
              </p>
            </Card>
          </div>
          <div className="mt-16">
            <SectionHeading
              eyebrow="Location"
              title="Fast delivery across cities"
              description="Share your file online and get printed documents delivered once the order is ready."
            />
            <div className="mt-8">
              <MapsEmbed />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}



