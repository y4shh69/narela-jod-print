import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapsEmbed } from "../components/maps-embed";
import { SectionHeading } from "../components/section-heading";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/toast-provider";
import { highlights, services, testimonials, whatsappNumber } from "../lib/constants";
import { Seo } from "../lib/seo";
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

  return (
    <>
      <Seo
        title="Printing Shop in Bhopal | Fast Printing & Xerox Services"
        description="Upload files online for premium printing, xerox, binding, lamination, and stationery support in Bhopal."
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="section-shell">
          <div className="hero-gradient rounded-[32px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="hero-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-brand-500" />
                {siteContent?.bannerLabel || "Modern print workflows for Bhopal"}
              </span>
              <h1 className="mt-6 max-w-3xl text-5xl font-extrabold tracking-tight !text-slate-950 sm:text-6xl lg:text-7xl">
                Fast Printing & Xerox Services in Bhopal
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 !text-slate-700 dark:!text-slate-300">
                Upload files, set print preferences, and confirm your order in minutes. Built for students, startups, offices, and urgent same-day jobs.
              </p>
              <div className="mt-6 rounded-[28px] border border-white/18 bg-[linear-gradient(135deg,rgba(10,48,88,0.76),rgba(8,25,56,0.7))] px-5 py-5 text-white shadow-[0_24px_60px_rgba(7,24,53,0.28)] backdrop-blur-2xl">
                {contentLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-40 bg-white/15" />
                    <Skeleton className="h-6 w-full bg-white/10" />
                    <Skeleton className="h-5 w-4/5 bg-white/10" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{siteContent?.shopStatus || "Open now"}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{siteContent?.dailyOffer || "A4 B&W prints from Rs 2/page for online and delivery orders."}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/84">{siteContent?.dailyMessage || "Same-day delivery is available on most standard jobs received before evening."}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-white/88">
                      <span className="rounded-full border border-white/16 bg-white/8 px-3 py-2 backdrop-blur-xl">
                        {siteContent?.primaryMetricLabel || "Jobs completed today"}: {siteContent?.primaryMetricValue || "0"}
                      </span>
                      <span className="rounded-full border border-white/16 bg-white/8 px-3 py-2 backdrop-blur-xl">
                        {siteContent?.secondaryMetricLabel || "Orders in progress"}: {siteContent?.secondaryMetricValue || "0"}
                      </span>
                      <span className="rounded-full border border-white/16 bg-white/8 px-3 py-2 backdrop-blur-xl">
                        {siteContent?.turnaroundTime || "Most jobs ready within 30-60 minutes"}
                      </span>
                    </div>
                    {siteContent?.updatedAt ? (
                      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-white/58">
                        Updated {formatDate(siteContent.updatedAt)}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {heroBullets.map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/58 bg-white/22 px-4 py-2 text-sm font-medium !text-slate-900 shadow-sm shadow-slate-200/16 backdrop-blur-xl">
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
              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((item, index) => (
                  <motion.div key={item.title} custom={index + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <div className="service-card h-full rounded-[20px] p-5 transition duration-300 hover:-translate-y-1">
                      <item.icon className="h-5 w-5 text-brand-500" />
                      <p className="mt-4 text-lg font-semibold text-white">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-white/78">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-[32px] border border-white/44 bg-white/10 p-6 shadow-xl shadow-slate-200/14 backdrop-blur-2xl">
                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/12">
                  <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Online order preview</p>
                  <div className="mt-8 space-y-4">
                    {[
                      "Upload PDF, DOC, PPT, or images",
                      "Select color mode, copies, and paper size",
                      "Confirm on WhatsApp and get it delivered",
                    ].map((line) => (
                      <div key={line} className="rounded-2xl bg-white/8 p-4 text-white/92">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {services.slice(0, 4).map((service) => (
                    <div key={service.title} className="service-card rounded-[24px] p-5">
                      <service.icon className="h-6 w-6 text-brand-500" />
                      <p className="mt-5 text-lg font-semibold text-white">{service.title}</p>
                      <p className="mt-3 text-sm leading-7 text-white/82">{service.description}</p>
                      <p className="mt-6 text-base font-semibold text-white">{service.price}</p>
                    </div>
                  ))}
                </div>
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
                  <p className="mt-7 text-[2rem] font-semibold tracking-tight text-white">{service.title}</p>
                  <p className="mt-5 text-sm leading-8 text-white/84">{service.description}</p>
                  <p className="mt-8 text-[1.75rem] font-semibold tracking-tight text-white">{service.price.replace("From ", "")}</p>
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
                    <p className="mt-6 text-[2rem] font-semibold tracking-tight text-white">{service.title}</p>
                    <p className="mt-4 text-sm leading-8 text-white/82">{service.description}</p>
                  </div>
                  <p className="mt-8 text-xl font-semibold text-white">{service.price}</p>
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
          <div className="rounded-[32px] bg-slate-950 px-6 py-12 text-center text-white shadow-2xl shadow-slate-950/12 sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">Ready to order</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Upload your files once. We handle the rest with speed and clarity.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Start your print order online, confirm details on WhatsApp, and get it delivered without the usual back-and-forth.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/upload">
                <Button className="w-full border-white bg-white text-slate-950 hover:bg-slate-100 sm:w-auto">
                  Start an Order
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-white/20 bg-white/6 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
              >
                Chat on WhatsApp
              </Button>
            </div>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
                Live from today’s order flow so returning visitors feel that the desk is active.
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
              title="Fast delivery across Bhopal"
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
