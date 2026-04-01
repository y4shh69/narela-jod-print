import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Download,
  LoaderCircle,
  LogOut,
  PackageCheck,
  RefreshCcw,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../components/admin-auth-provider";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/toast-provider";
import { getOrderStatusMeta, orderStatusOptions } from "../lib/order-status";
import { Seo } from "../lib/seo";
import { serviceCategoryOrder } from "../lib/service-catalog";
import { cn, formatCurrency, formatDate } from "../lib/utils";

const statusMessageTemplates = {
  submitted: "Order received. The print desk will review the files and confirm the job shortly.",
  confirmed: "Files have been reviewed and approved. The order is queued for production.",
  printing: "The print team is actively printing and finishing the documents.",
  ready: "The order is packed and ready to be dispatched.",
  out_for_delivery: "The order is on the way to the customer.",
  delivered: "Order completed successfully and delivered to the customer.",
  cancelled: "This order has been cancelled. Reach out to the customer if a follow-up is needed.",
};

function SummaryCard({ icon: Icon, label, value, note }) {
  return (
    <Card className="border-white/20 bg-slate-950/70 p-5 text-white shadow-[0_24px_60px_rgba(2,8,23,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{note}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/14 text-brand-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
        active
          ? "border-brand-400/60 bg-brand-500/16 text-brand-300"
          : "border-white/18 bg-white/8 text-slate-300 hover:border-white/28 hover:bg-white/12"
      )}
    >
      {label}
    </button>
  );
}

function StatusCombobox({ value, open, onToggle, onSelect, disabled }) {
  const currentMeta = getOrderStatusMeta(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
          "border-white/20 bg-slate-950/72 text-white shadow-[0_14px_36px_rgba(2,8,23,0.18)]",
          disabled ? "cursor-not-allowed opacity-70" : "hover:border-white/30"
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Current stage</p>
          <p className="mt-1 text-sm font-semibold text-white">{currentMeta.label}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-white/70 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 rounded-2xl border border-white/18 bg-slate-950/94 p-2 shadow-[0_24px_60px_rgba(2,8,23,0.34)] backdrop-blur-2xl">
          <div className="space-y-1">
            {orderStatusOptions.map((option) => {
              const meta = getOrderStatusMeta(option.value);
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(option.value)}
                  className={cn(
                    "w-full rounded-xl px-3 py-3 text-left transition",
                    active ? "bg-brand-500/18" : "hover:bg-white/8"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", meta.tone)}>
                      {active ? "Active" : "Stage"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/64">{meta.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrderItemCard({ item }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-slate-950/58 p-4 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{item.displayName}</p>
          {item.serviceTitle ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">{item.serviceTitle}</p> : null}
          <p className="mt-2 text-xs leading-6 text-white/64">
            {item.colorMode === "color" ? "Color" : "B&W"} | {item.paperSize} | {item.copies} copies | {item.pageRange}
          </p>
          <p className="text-xs leading-6 text-white/64">
            {item.bindingType !== "none" ? item.bindingType : "standard"} | {item.printSide} sided | {item.scaleType}
          </p>
          <p className="text-xs leading-6 text-white/64">
            {item.finishType || "standard"} | {item.materialType || "standard_stock"} | {item.productVariant || "standard"} | {item.priorityLevel || "standard"}
          </p>
          {item.customSize ? <p className="text-xs leading-6 text-white/64">Custom size: {item.customSize}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-sm font-semibold text-white">{formatCurrency(item.totalPrice || 0)}</p>
          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-3 py-2 text-xs font-semibold text-white/84 transition hover:bg-white/12"
            >
              <Download className="h-3.5 w-3.5" />
              {item.fileName || "Download file"}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState("");
  const [openStatusId, setOpenStatusId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteContent, setSiteContent] = useState({
    bannerLabel: "",
    dailyOffer: "",
    dailyMessage: "",
    shopStatus: "",
    turnaroundTime: "",
    primaryMetricLabel: "",
    secondaryMetricLabel: "",
  });
  const [siteContentLoading, setSiteContentLoading] = useState(true);
  const [siteContentSaving, setSiteContentSaving] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [serviceCatalogLoading, setServiceCatalogLoading] = useState(true);
  const [serviceCatalogSaving, setServiceCatalogSaving] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [drafts, setDrafts] = useState({});
  const { showToast } = useToast();
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await fetch("/api/orders", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to fetch orders");
      }
      const payload = await response.json();
      const nextOrders = payload.orders || [];
      setOrders(nextOrders);
      setDrafts(
        Object.fromEntries(
          nextOrders.map((order) => [
            order.id,
            {
              status: order.orderStatus || "submitted",
              trackingMessage: order.trackingMessage || statusMessageTemplates[order.orderStatus] || "",
            },
          ])
        )
      );
      setExpandedOrderId((current) => current || nextOrders[0]?.id || "");
    } catch (error) {
      showToast({
        title: "Admin data unavailable",
        description: "Could not load orders from the backend.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadSiteContent() {
    try {
      setSiteContentLoading(true);
      const response = await fetch("/api/site-content", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to fetch homepage content");
      }
      const payload = await response.json();
      setSiteContent({
        bannerLabel: payload.bannerLabel || "",
        dailyOffer: payload.dailyOffer || "",
        dailyMessage: payload.dailyMessage || "",
        shopStatus: payload.shopStatus || "",
        turnaroundTime: payload.turnaroundTime || "",
        primaryMetricLabel: payload.primaryMetricLabel || "",
        secondaryMetricLabel: payload.secondaryMetricLabel || "",
      });
    } catch (error) {
      showToast({
        title: "Homepage content unavailable",
        description: "Could not load the daily update settings.",
        variant: "error",
      });
    } finally {
      setSiteContentLoading(false);
    }
  }

  async function loadServiceCatalog() {
    try {
      setServiceCatalogLoading(true);
      const response = await fetch("/api/service-catalog", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to fetch service catalog");
      }
      const payload = await response.json();
      setServiceCatalog(payload.items || []);
    } catch (error) {
      showToast({
        title: "Catalog unavailable",
        description: "Could not load service pricing controls.",
        variant: "error",
      });
    } finally {
      setServiceCatalogLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    loadSiteContent();
    loadServiceCatalog();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.orderStatus)).length;
    const readyOrders = orders.filter((order) => ["ready", "out_for_delivery"].includes(order.orderStatus)).length;
    const deliveredToday = orders.filter((order) => order.orderStatus === "delivered").length;
    return {
      totalOrders: orders.length,
      activeOrders,
      readyOrders,
      deliveredToday,
      totalRevenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" ? true : order.orderStatus === statusFilter;
      const haystack = [order.id, order.name, order.phone, order.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = query ? haystack.includes(query) : true;
      return matchesStatus && matchesQuery;
    });
  }, [orders, searchQuery, statusFilter]);

  const filteredServiceCatalog = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    return serviceCatalog.filter((item) => {
      const matchesCategory = serviceCategoryFilter === "all" ? true : item.category === serviceCategoryFilter;
      const haystack = [item.title, item.description, item.category, item.code].join(" ").toLowerCase();
      const matchesQuery = query ? haystack.includes(query) : true;
      return matchesCategory && matchesQuery;
    });
  }, [serviceCatalog, serviceSearch, serviceCategoryFilter]);

  function setDraft(orderId, patch) {
    setDrafts((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        ...patch,
      },
    }));
  }

  function setSiteContentDraft(patch) {
    setSiteContent((current) => ({
      ...current,
      ...patch,
    }));
  }

  function setServiceItemDraft(code, patch) {
    setServiceCatalog((current) =>
      current.map((item) => (item.code === code ? { ...item, ...patch } : item))
    );
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
    showToast({
      title: "Admin signed out",
      description: "The admin session has been closed.",
    });
  }

  async function saveSiteContent() {
    try {
      setSiteContentSaving(true);
      const response = await fetch("/api/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(siteContent),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save homepage content.");
      }

      setSiteContent({
        bannerLabel: payload.bannerLabel || "",
        dailyOffer: payload.dailyOffer || "",
        dailyMessage: payload.dailyMessage || "",
        shopStatus: payload.shopStatus || "",
        turnaroundTime: payload.turnaroundTime || "",
        primaryMetricLabel: payload.primaryMetricLabel || "",
        secondaryMetricLabel: payload.secondaryMetricLabel || "",
      });

      showToast({
        title: "Homepage updated",
        description: "The daily offer and live status are now updated on the website.",
      });
    } catch (error) {
      showToast({
        title: "Save failed",
        description: error.message || "The homepage update could not be saved.",
        variant: "error",
      });
    } finally {
      setSiteContentSaving(false);
    }
  }

  async function saveServiceCatalog() {
    try {
      setServiceCatalogSaving(true);
      const response = await fetch("/api/service-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: serviceCatalog }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save service pricing.");
      }
      setServiceCatalog(payload.items || []);
      showToast({
        title: "Service pricing updated",
        description: "The Services tab now reflects the latest admin pricing.",
      });
    } catch (error) {
      showToast({
        title: "Pricing update failed",
        description: error.message || "Could not save the service catalog.",
        variant: "error",
      });
    } finally {
      setServiceCatalogSaving(false);
    }
  }

  async function saveOrderStatus(orderId) {
    const draft = drafts[orderId];
    if (!draft) return;

    try {
      setSavingId(orderId);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: draft.status,
          trackingMessage: draft.trackingMessage,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update order status.");
      }

      setOrders((current) => current.map((order) => (order.id === payload.id ? payload : order)));
      setDraft(orderId, {
        status: payload.orderStatus,
        trackingMessage: payload.trackingMessage || "",
      });
      setOpenStatusId("");
      showToast({
        title: "Status updated",
        description: `Order ${payload.id} is now marked as ${getOrderStatusMeta(payload.orderStatus).label}.`,
      });
    } catch (error) {
      showToast({
        title: "Update failed",
        description: error.message || "The order status could not be saved.",
        variant: "error",
      });
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      <Seo
        title="Admin Panel | Printing Shop"
        description="Manage orders, update print progress, and keep customers informed from the admin panel."
      />

      <section className="py-12 sm:py-16">
        <div className="section-shell">
          <div className="rounded-[32px] border border-white/18 bg-[linear-gradient(135deg,rgba(8,24,56,0.92),rgba(10,55,106,0.78))] px-6 py-6 text-white shadow-[0_30px_80px_rgba(2,8,23,0.28)] backdrop-blur-2xl sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin workspace
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Order operations and tracking</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
                  Manage daily updates, review incoming jobs, and move orders through production without the admin view becoming noisy.
                </p>
                {user?.username ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/48">Signed in as {user.username}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-white/14 bg-white/8 text-white hover:bg-white/12 hover:text-white" onClick={loadOrders}>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" className="border-white/14 bg-white/8 text-white hover:bg-white/12 hover:text-white" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Card className="border-white/16 bg-slate-950/74 p-6 text-white shadow-[0_24px_60px_rgba(2,8,23,0.24)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Daily homepage update</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Keep the site feeling active</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
                    Update the homepage offer and delivery messaging here. Live counts still come from real order activity.
                  </p>
                </div>
                <Button type="button" onClick={saveSiteContent} disabled={siteContentSaving || siteContentLoading}>
                  {siteContentSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {siteContentSaving ? "Saving..." : "Publish update"}
                </Button>
              </div>

              {siteContentLoading ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full bg-white/10" />
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/84">Banner label</label>
                    <Input value={siteContent.bannerLabel} onChange={(event) => setSiteContentDraft({ bannerLabel: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/84">Delivery status</label>
                    <Input value={siteContent.shopStatus} onChange={(event) => setSiteContentDraft({ shopStatus: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/84">Turnaround promise</label>
                    <Input value={siteContent.turnaroundTime} onChange={(event) => setSiteContentDraft({ turnaroundTime: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/84">Primary metric label</label>
                    <Input value={siteContent.primaryMetricLabel} onChange={(event) => setSiteContentDraft({ primaryMetricLabel: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/84">Secondary metric label</label>
                    <Input value={siteContent.secondaryMetricLabel} onChange={(event) => setSiteContentDraft({ secondaryMetricLabel: event.target.value })} />
                  </div>
                  <div className="rounded-2xl border border-white/14 bg-white/6 px-4 py-4 text-sm leading-6 text-white/68">
                    These counts stay automatic. You only control the wording and daily messaging.
                  </div>
                  <div className="lg:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-white/84">Daily offer</label>
                    <Textarea
                      value={siteContent.dailyOffer}
                      onChange={(event) => setSiteContentDraft({ dailyOffer: event.target.value })}
                      placeholder="Example: Student print combo active today. A4 B&W from Rs 2/page."
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-white/84">Daily message</label>
                    <Textarea
                      value={siteContent.dailyMessage}
                      onChange={(event) => setSiteContentDraft({ dailyMessage: event.target.value })}
                      placeholder="Add a short update about turnaround, delivery timing, or a temporary note."
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard icon={PackageCheck} label="Total orders" value={summary.totalOrders} note="All jobs currently recorded." />
            <SummaryCard icon={CalendarClock} label="Active jobs" value={summary.activeOrders} note="Jobs still in review or production." />
            <SummaryCard icon={Truck} label="Ready / dispatch" value={summary.readyOrders} note="Orders ready for handoff." />
            <SummaryCard icon={CheckCheck} label="Delivered" value={summary.deliveredToday} note="Orders already completed." />
            <SummaryCard icon={Sparkles} label="Order value" value={formatCurrency(summary.totalRevenue)} note="Total value across all orders." />
          </div>

          <div className="mt-6">
            <Card className="border-white/16 bg-slate-950/74 p-6 text-white shadow-[0_24px_60px_rgba(2,8,23,0.24)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Service pricing control</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Manage the full services catalog</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
                    This list is seeded from the services shown in your reference images. Update prices here and the Services tab changes automatically.
                  </p>
                </div>
                <Button type="button" onClick={saveServiceCatalog} disabled={serviceCatalogSaving || serviceCatalogLoading}>
                  {serviceCatalogSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {serviceCatalogSaving ? "Saving..." : "Save service pricing"}
                </Button>
              </div>

              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
                  <Input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Search services"
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All" active={serviceCategoryFilter === "all"} onClick={() => setServiceCategoryFilter("all")} />
                  {serviceCategoryOrder.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      active={serviceCategoryFilter === category}
                      onClick={() => setServiceCategoryFilter(category)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {serviceCatalogLoading ? (
                  Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-16 w-full bg-white/10" />)
                ) : (
                  filteredServiceCatalog.map((item) => (
                    <div
                      key={item.code}
                      className="grid gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-4 lg:grid-cols-[1.2fr_0.8fr_0.55fr_0.55fr_auto]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-white/56">{item.category}</p>
                        <p className="mt-2 text-xs leading-6 text-white/62">{item.description}</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Price label</label>
                        <Input value={item.priceLabel} onChange={(event) => setServiceItemDraft(item.code, { priceLabel: event.target.value })} />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Unit</label>
                        <Input value={item.unitLabel} onChange={(event) => setServiceItemDraft(item.code, { unitLabel: event.target.value })} />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setServiceItemDraft(item.code, { active: !item.active })}
                          className={cn(
                            "w-full rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                            item.active
                              ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-300"
                              : "border-white/14 bg-white/6 text-white/62"
                          )}
                        >
                          {item.active ? "Visible" : "Hidden"}
                        </button>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setServiceItemDraft(item.code, { featured: !item.featured })}
                          className={cn(
                            "w-full rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                            item.featured
                              ? "border-brand-400/30 bg-brand-500/12 text-brand-300"
                              : "border-white/14 bg-white/6 text-white/62"
                          )}
                        >
                          {item.featured ? "Featured" : "Standard"}
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {!serviceCatalogLoading && filteredServiceCatalog.length === 0 ? (
                  <Card className="border-white/12 bg-white/6 p-6 text-center text-sm text-white/70">
                    No service items match the current filters.
                  </Card>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/16 bg-slate-950/74 p-4 shadow-[0_24px_60px_rgba(2,8,23,0.24)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Order queue</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Compact order management</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by order ID, name, phone"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
              {orderStatusOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={statusFilter === option.value}
                  onClick={() => setStatusFilter(option.value)}
                />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="border-white/12 bg-white/6 p-4">
                      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_0.6fr_auto]">
                        <Skeleton className="h-14 w-full bg-white/10" />
                        <Skeleton className="h-14 w-full bg-white/10" />
                        <Skeleton className="h-14 w-full bg-white/10" />
                        <Skeleton className="h-14 w-full bg-white/10" />
                        <Skeleton className="h-14 w-24 bg-white/10" />
                      </div>
                    </Card>
                  ))
                : filteredOrders.map((order) => {
                    const draft = drafts[order.id] || {
                      status: order.orderStatus || "submitted",
                      trackingMessage: order.trackingMessage || "",
                    };
                    const statusMeta = getOrderStatusMeta(draft.status);
                    const expanded = expandedOrderId === order.id;

                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                        <Card className="overflow-visible border-white/12 bg-white/6 p-4 text-white backdrop-blur-xl">
                          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.9fr_0.65fr_auto] lg:items-center">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-base font-semibold text-white">{order.id}</p>
                                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusMeta.tone)}>
                                  {statusMeta.label}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-white/82">{order.name}</p>
                              <p className="mt-1 text-xs text-white/56">{order.phone} | {order.address}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Items</p>
                              <p className="mt-2 text-sm font-semibold text-white">{order.itemCount || order.items?.length || 0} documents</p>
                              <p className="mt-1 text-xs text-white/56">Updated {formatDate(order.updatedAt || order.createdAt)}</p>
                            </div>

                            <div>
                              <StatusCombobox
                                value={draft.status}
                                open={openStatusId === order.id}
                                disabled={savingId === order.id}
                                onToggle={() => setOpenStatusId((current) => (current === order.id ? "" : order.id))}
                                onSelect={(nextStatus) => {
                                  setDraft(order.id, {
                                    status: nextStatus,
                                    trackingMessage: statusMessageTemplates[nextStatus],
                                  });
                                  setOpenStatusId("");
                                }}
                              />
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Amount</p>
                              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(order.totalAmount || 0)}</p>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button type="button" onClick={() => saveOrderStatus(order.id)} disabled={savingId === order.id} className="h-11">
                                {savingId === order.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                {savingId === order.id ? "Saving..." : "Save"}
                              </Button>
                              <button
                                type="button"
                                onClick={() => setExpandedOrderId((current) => (current === order.id ? "" : order.id))}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/16 bg-white/8 text-white/80 transition hover:bg-white/12"
                                aria-label={expanded ? "Collapse order details" : "Expand order details"}
                              >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          {expanded ? (
                            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 xl:grid-cols-[1.2fr_0.95fr]">
                              <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Submitted</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{formatDate(order.createdAt)}</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Customer</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{order.name}</p>
                                  </div>
                                  <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Phone</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{order.phone}</p>
                                  </div>
                                </div>

                                {order.notes ? (
                                  <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Customer notes</p>
                                    <p className="mt-2 text-sm leading-7 text-white/72">{order.notes}</p>
                                  </div>
                                ) : null}

                                <div className="space-y-3">
                                  {(order.items || []).map((item) => (
                                    <OrderItemCard key={item.id} item={item} />
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Customer-facing summary</p>
                                  <p className="mt-2 text-sm leading-7 text-white/72">{statusMeta.description}</p>
                                </div>

                                <div className="rounded-2xl border border-white/12 bg-slate-950/54 px-4 py-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/44">Tracking code</p>
                                  <p className="mt-2 text-sm font-semibold text-white">{order.id}</p>
                                  <p className="mt-2 text-xs leading-6 text-white/58">
                                    Share the order ID and ask the customer to use their phone number on the tracking page.
                                  </p>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-white/84">Tracking message</label>
                                  <Textarea
                                    value={draft.trackingMessage}
                                    onChange={(event) => setDraft(order.id, { trackingMessage: event.target.value })}
                                    placeholder="Add a clear update the customer will see on the tracking page."
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </Card>
                      </motion.div>
                    );
                  })}
            </div>

            {!loading && filteredOrders.length === 0 ? (
              <Card className="mt-4 border-white/12 bg-white/6 p-8 text-center text-sm text-white/70">
                No orders match the current filters. Try a broader search or switch the stage filter.
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
