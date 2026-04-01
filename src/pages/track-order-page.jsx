import { motion } from "framer-motion";
import { LoaderCircle, PackageCheck, Search, Sparkles, Stars } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/toast-provider";
import { getOrderStatusMeta, getTrackingProgress, orderStatusTimeline } from "../lib/order-status";
import { Seo } from "../lib/seo";
import { cn, formatCurrency, formatDate } from "../lib/utils";

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleTrack(event) {
    event.preventDefault();

    if (!orderId.trim() || !phone.trim()) {
      showToast({
        title: "Tracking details needed",
        description: "Enter both the order ID and phone number to check the order.",
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          phone: phone.trim(),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to track this order.");
      }

      setOrder(payload);
    } catch (error) {
      setOrder(null);
      showToast({
        title: "Tracking unavailable",
        description: error.message || "We could not find that order right now.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const statusMeta = order ? getOrderStatusMeta(order.orderStatus) : null;
  const progress = order ? getTrackingProgress(order.orderStatus) : 0;

  return (
    <>
      <Seo
        title="Track Order | Printing Shop in Bhopal"
        description="Track your print order status using the order ID and phone number."
      />

      <section className="py-16 sm:py-20">
        <div className="section-shell">
          <div className="scene-3d mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="hero-aurora relative mb-8 rounded-[40px] border border-white/30 bg-white/30 px-6 py-10 text-center shadow-[0_30px_100px_rgba(35,142,255,0.10)] backdrop-blur-2xl sm:px-10"
            >
              <motion.div
                aria-hidden="true"
                className="floating-orb top-10 left-8 h-20 w-20 bg-[radial-gradient(circle,rgba(255,217,90,0.95),rgba(255,217,90,0.15)_60%,transparent_75%)]"
                animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="floating-orb right-10 top-12 h-24 w-24 bg-[radial-gradient(circle,rgba(69,152,255,0.82),rgba(69,152,255,0.12)_60%,transparent_75%)]"
                animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffe27a] via-white to-[#8ecbff] text-slate-900 shadow-[0_14px_32px_rgba(35,142,255,0.18)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600 shadow-[0_12px_30px_rgba(255,217,90,0.12)]">
                  <Stars className="h-3.5 w-3.5" />
                  Live Order Tracking
                </div>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Order tracking</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Check exactly where your print job stands</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-700 dark:text-slate-100">
                Use the order ID from your confirmation message and the same phone number used while placing the order.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, rotateX: -5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="tilt-shell"
            >
              <Card className="glass panel-3d border-white/35 p-6 sm:p-8">
              <form onSubmit={handleTrack} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm font-bold">Order ID</label>
                  <Input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="ORD-1740000000000" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">Phone number</label>
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="9876543210" />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "Checking..." : "Track order"}
                  </Button>
                </div>
              </form>
              </Card>
            </motion.div>

            {order ? (
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <motion.div
                  initial={{ opacity: 0, y: 24, rotateX: -6 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
                  className="tilt-shell"
                >
                  <Card className="glass panel-3d border-white/35 p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Current status</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{statusMeta.label}</h2>
                      <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                        {order.trackingMessage || statusMeta.description}
                      </p>
                    </div>
                    <div className={cn("rounded-full border px-4 py-2 text-sm font-bold", statusMeta.tone)}>{statusMeta.label}</div>
                  </div>

                  {order.orderStatus !== "cancelled" ? (
                    <div className="mt-8">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400 transition-all duration-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {orderStatusTimeline.map((step) => {
                          const stepMeta = getOrderStatusMeta(step);
                          const isActive = order.orderStatus === step;
                          const isCompleted = orderStatusTimeline.indexOf(step) <= orderStatusTimeline.indexOf(order.orderStatus);

                          return (
                            <div
                              key={step}
                              className={cn(
                                "flex min-h-20 items-center justify-center rounded-2xl border px-3 py-3 text-center transition",
                                isActive
                                  ? stepMeta.tone
                                  : isCompleted
                                    ? "border-brand-200 bg-brand-50/70 text-brand-700 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-300"
                                    : "border-slate-200 bg-white/30 text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
                              )}
                            >
                              <p className="max-w-[8ch] text-xs font-bold uppercase tracking-[0.12em] leading-tight [overflow-wrap:anywhere]">
                                {stepMeta.timelineLabel || stepMeta.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/35 bg-white/30 px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Submitted</p>
                      <p className="mt-2 text-sm font-semibold">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="rounded-3xl border border-white/35 bg-white/30 px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Last update</p>
                      <p className="mt-2 text-sm font-semibold">{formatDate(order.updatedAt || order.createdAt)}</p>
                    </div>
                  </div>
                  </Card>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 24, rotateY: 6 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
                    className="tilt-shell"
                  >
                    <Card className="glass panel-3d border-white/35 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffe27a] via-white to-[#8ecbff] text-slate-900 shadow-[0_18px_34px_rgba(35,142,255,0.18)]">
                        <PackageCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Order summary</p>
                        <h3 className="mt-1 text-xl font-semibold">{order.id}</h3>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-sm font-medium">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                        <span className="text-slate-500 dark:text-slate-300">Customer</span>
                        <span>{order.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                        <span className="text-slate-500 dark:text-slate-300">Items</span>
                        <span>{order.itemCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                        <span className="text-slate-500 dark:text-slate-300">Total</span>
                        <span className="font-bold">{formatCurrency(order.totalAmount || 0)}</span>
                      </div>
                    </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24, rotateY: -6 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
                    className="tilt-shell"
                  >
                    <Card className="glass panel-3d border-white/35 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Documents</p>
                    <div className="mt-4 space-y-3">
                      {(order.items || []).map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45 }}
                          className="rounded-3xl border border-white/35 bg-white/30 px-4 py-4"
                        >
                          <p className="font-bold">{item.displayName}</p>
                          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {item.colorMode === "color" ? "Color" : "B&W"} | {item.paperSize} | {item.copies} copies | {item.pageRange}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
