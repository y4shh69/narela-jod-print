import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "../components/section-heading";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/toast-provider";
import { Seo } from "../lib/seo";
import { getServiceIcon, getServiceThumbnail, groupServicesByCategory } from "../lib/service-catalog";

export function ServicesPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        const response = await fetch("/api/service-catalog");
        if (!response.ok) {
          throw new Error("Unable to fetch service catalog");
        }
        const payload = await response.json();
        if (active) {
          setCatalog((payload.items || []).filter((item) => item.active !== false));
        }
      } catch (error) {
        if (active) {
          showToast({
            title: "Services unavailable",
            description: "Could not load the live service catalog from the backend.",
            variant: "error",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, [showToast]);

  const groupedCatalog = useMemo(() => groupServicesByCategory(catalog), [catalog]);

  return (
    <>
      <Seo
        title="Services | Printing Shop in Bhopal"
        description="Explore the full Xerox Wala service catalog and live admin-managed pricing for printing, stationery, cards, gifts, and office materials."
      />
      <section className="py-16 sm:py-20">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Service menu"
            title="Full service catalog with live admin-managed pricing"
            description="Everything listed here can be priced and updated from the admin panel, from document printing and legal drafts to cards, stationery, calendars, and custom gifts."
          />

          {loading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="mt-5 h-7 w-3/4" />
                  <Skeleton className="mt-3 h-20 w-full" />
                  <Skeleton className="mt-6 h-6 w-1/2" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {groupedCatalog.map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-500">{category}</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {items.length} services available
                      </h2>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {items.map((item, index) => {
                      const Icon = getServiceIcon(item.code, item.category);
                      return (
                        <motion.div
                          key={item.code}
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: index * 0.03 }}
                        >
                          <div className="service-card flex h-full flex-col justify-between rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                            <div>
                              <div className="overflow-hidden rounded-2xl border border-white/14">
                                <img
                                  src={getServiceThumbnail(item)}
                                  alt={item.title}
                                  className="h-48 w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex items-start justify-between gap-3">
                                <Icon className="mt-5 h-8 w-8 text-brand-500" />
                                {item.featured ? (
                                  <span className="mt-5 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                                    Featured
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                              <p className="mt-3 text-sm leading-7 text-white/78">{item.description}</p>
                            </div>
                            <div className="mt-6">
                              <p className="text-lg font-semibold text-white">{item.priceLabel}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/54">{item.unitLabel}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
