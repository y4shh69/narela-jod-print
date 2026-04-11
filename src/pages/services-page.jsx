import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "../components/section-heading";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/toast-provider";
import { Seo } from "../lib/seo";
import { getServiceIcon, groupServicesByCategory } from "../lib/service-catalog";

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
        title="Services | Printing Shop"
        description="Explore the full Xerox Wala service catalog ."
      />
      <section className="py-16 sm:py-20">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Service menu"
            title="Full service catalog"
            description=""
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
                          <div className="service-card group flex h-full flex-col justify-between rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                            <div className="space-y-5">
                              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    loading="lazy"
                                    className="h-36 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12]"
                                  />
                                ) : (
                                  <div className="grid h-36 w-full place-items-center bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                                    <Icon className="h-10 w-10 text-white/75" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                                <div className="absolute left-4 top-4 flex items-center gap-3">
                                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-white shadow-[0_12px_30px_rgba(0,0,0,0.20)] backdrop-blur">
                                    <Icon className="h-5 w-5 text-white" />
                                  </div>
                                </div>

                                {item.featured ? (
                                  <span className="absolute right-4 top-4 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur">
                                    Featured
                                  </span>
                                ) : null}
                              </div>

                              <div>
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-white/78">{item.description}</p>
                              </div>
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
