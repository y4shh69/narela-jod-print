import { motion } from "framer-motion";
import { CheckCircle2, Clock, LoaderCircle, Package, PackageCheck, Printer, Search, Sparkles, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/toast-provider";
import { getOrderStatusMeta } from "../lib/order-status";
import { Seo } from "../lib/seo";
import { cn, formatCurrency, formatDate } from "../lib/utils";

function getFulfillmentMeta(method, address) {
  return method === "pickup"
    ? {
        label: "Pickup",
        detail: "Collect from the shop after the team marks the order ready.",
      }
    : {
        label: "Delivery",
        detail: address || "Delivery address will be confirmed by the team.",
      };
}

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
  const fulfillmentMeta = order ? getFulfillmentMeta(order.fulfillmentMethod, order.address) : null;

  const trackingSteps = [
    { key: "submitted", label: "Submitted", Icon: Clock },
    { key: "confirmed", label: "Confirmed", Icon: CheckCircle2 },
    { key: "printing", label: "Printing", Icon: Printer },
    { key: "ready", label: "Ready", Icon: Package },
    { key: "delivered", label: "Delivered", Icon: Truck },
  ];

  const stepperStatusKey = order
    ? order.orderStatus === "out_for_delivery"
      ? "ready"
      : order.orderStatus
    : "submitted";

  const currentStepIndex = trackingSteps.findIndex((step) => step.key === stepperStatusKey);

  return (
    <>
      <Seo
        title="Track Order | Printing Shop"
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
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                            Current status
                          </p>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            {statusMeta.label}
                          </h2>
                          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                            {order.trackingMessage || statusMeta.description}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold shadow-sm",
                            order.orderStatus === "cancelled"
                              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                              : "border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-slate-900 dark:border-indigo-900 dark:bg-indigo-950/35 dark:text-white"
                          )}
                        >
                          {order.orderStatus === "cancelled" ? <XCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />}
                          <span>{statusMeta.label}</span>
                        </div>
                      </div>

                      {order.orderStatus !== "cancelled" ? (
                        <div className="rounded-3xl border border-white/35 bg-white/35 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
                              Tracking timeline
                            </p>
                            {order.orderStatus === "out_for_delivery" ? (
                              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.22)]">
                                Out for delivery
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 overflow-x-auto pb-1">
                            <ol className="flex min-w-[560px] items-start justify-between gap-2 sm:min-w-0 sm:gap-3">
                              {trackingSteps.map((step, index) => {
                                const isCompleted = currentStepIndex >= 0 && index < currentStepIndex;
                                const isCurrent = currentStepIndex >= 0 && index === currentStepIndex;
                                const isUpcoming = currentStepIndex >= 0 && index > currentStepIndex;
                                const Icon = step.Icon;

                                return (
                                  <li key={step.key} className="flex flex-1 items-start gap-2">
                                    <div className="flex flex-col items-center">
                                      <motion.div
                                        layout
                                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                        className={cn(
                                          "grid h-10 w-10 place-items-center rounded-full border shadow-sm",
                                          isCompleted
                                            ? "border-emerald-300 bg-emerald-500 text-white shadow-[0_14px_28px_rgba(34,197,94,0.18)]"
                                            : isCurrent
                                              ? "border-indigo-300 bg-indigo-600 text-white shadow-[0_16px_34px_rgba(79,70,229,0.22)]"
                                              : "border-slate-200 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
                                        )}
                                      >
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                      </motion.div>
                                      <p
                                        className={cn(
                                          "mt-2 text-center text-xs font-semibold tracking-[0.08em]",
                                          isCompleted
                                            ? "text-emerald-700 dark:text-emerald-200"
                                            : isCurrent
                                              ? "text-indigo-700 dark:text-indigo-200"
                                              : "text-slate-600 dark:text-slate-300"
                                        )}
                                      >
                                        {step.label}
                                      </p>
                                    </div>

                                    {index < trackingSteps.length - 1 ? (
                                      <div className="mt-5 hidden flex-1 sm:block">
                                        <div
                                          className={cn(
                                            "h-[3px] w-full rounded-full transition-colors",
                                            isCompleted
                                              ? "bg-emerald-400"
                                              : isCurrent
                                                ? "bg-indigo-300"
                                                : "bg-slate-200/80 dark:bg-slate-700/70"
                                          )}
                                        />
                                      </div>
                                    ) : null}

                                    {index < trackingSteps.length - 1 ? (
                                      <div className="mt-5 block flex-1 sm:hidden">
                                        <div
                                          className={cn(
                                            "h-[3px] w-full rounded-full transition-colors",
                                            isCompleted
                                              ? "bg-emerald-400"
                                              : isCurrent
                                                ? "bg-indigo-300"
                                                : "bg-slate-200/80 dark:bg-slate-700/70"
                                          )}
                                        />
                                      </div>
                                    ) : null}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl border border-white/35 bg-white/35 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                            Submitted date
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="rounded-3xl border border-white/35 bg-white/35 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                            Last updated
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{formatDate(order.updatedAt || order.createdAt)}</p>
                        </div>
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
                        <span className="text-slate-500 dark:text-slate-300">Handoff</span>
                        <span>{fulfillmentMeta.label}</span>
                      </div>
                      <div className="rounded-2xl border px-4 py-3">
                        <p className="text-slate-500 dark:text-slate-300">Pickup / delivery details</p>
                        <p className="mt-2 text-right text-sm font-semibold text-slate-900 dark:text-white">{fulfillmentMeta.detail}</p>
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
