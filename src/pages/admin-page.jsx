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
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../components/admin-auth-provider";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
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

const newServiceInitialState = {
  title: "",
  category: "Printing",
  description: "",
  priceLabel: "From Rs 99",
  basePrice: 99,
  unitLabel: "starting price",
  featured: false,
  active: true,
};

function buildServiceCode(title = "") {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function getFulfillmentMeta(method) {
  return method === "pickup"
    ? {
        label: "Pickup",
        note: "Customer will collect from the shop",
      }
    : {
        label: "Delivery",
        note: "Deliver to the provided address",
      };
}

function SummaryCard({ icon: Icon, label, value, note }) {
  return (
    <Card className="admin-soft-panel p-5 text-slate-900 shadow-[0_24px_48px_rgba(148,75,37,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/60 via-orange-200/70 to-rose-200/70 text-orange-700 shadow-[0_10px_24px_rgba(249,115,22,0.18)]">
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
          ? "border-orange-300/70 bg-gradient-to-r from-amber-200/90 via-orange-100/90 to-rose-100/90 text-orange-700 shadow-[0_8px_20px_rgba(249,115,22,0.14)]"
          : "border-white/55 bg-white/48 text-slate-600 hover:border-orange-200/70 hover:bg-white/70"
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
          "border-white/55 bg-white/72 text-slate-900 shadow-[0_14px_32px_rgba(148,75,37,0.12)] backdrop-blur-xl",
          disabled ? "cursor-not-allowed opacity-70" : "hover:border-orange-200/70"
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current stage</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{currentMeta.label}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-2xl border border-white/55 bg-white/84 p-2 shadow-[0_24px_48px_rgba(148,75,37,0.16)] backdrop-blur-2xl">
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
                    active ? "bg-gradient-to-r from-amber-200/90 via-orange-100/90 to-rose-100/90" : "hover:bg-white/65"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", meta.tone)}>
                      {active ? "Active" : "Stage"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{meta.description}</p>
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
    <div className="rounded-2xl border border-white/55 bg-white/56 p-4 text-slate-900 shadow-[0_14px_30px_rgba(148,75,37,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.displayName}</p>
          {item.serviceTitle ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{item.serviceTitle}</p> : null}
          <p className="mt-2 text-xs leading-6 text-slate-600">
            {item.colorMode === "color" ? "Color" : "B&W"} | {item.paperSize} | {item.copies} copies | {item.pageRange}
          </p>
          <p className="text-xs leading-6 text-slate-600">
            {item.bindingType !== "none" ? item.bindingType : "standard"} | {item.printSide} sided | {item.scaleType}
          </p>
          <p className="text-xs leading-6 text-slate-600">
            {item.finishType || "standard"} | {item.materialType || "standard_stock"} | {item.productVariant || "standard"} | {item.priorityLevel || "standard"}
          </p>
          {item.customSize ? <p className="text-xs leading-6 text-slate-600">Custom size: {item.customSize}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice || 0)}</p>
          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
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
  const [deletingId, setDeletingId] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState("");
  const [openStatusId, setOpenStatusId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteContent, setSiteContent] = useState({
    bannerLabel: "",
    dailyOffer: "",
    dailyMessage: "",
    shopStatus: "",
    shopOpen: true,
    turnaroundTime: "",
    primaryMetricLabel: "",
    secondaryMetricLabel: "",
    deliveryCharge: 30,
  });
  const [siteContentLoading, setSiteContentLoading] = useState(true);
  const [siteContentSaving, setSiteContentSaving] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [serviceCatalogLoading, setServiceCatalogLoading] = useState(true);
  const [serviceCatalogSaving, setServiceCatalogSaving] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [newService, setNewService] = useState(newServiceInitialState);
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
        shopOpen: payload.shopOpen !== false,
        turnaroundTime: payload.turnaroundTime || "",
        primaryMetricLabel: payload.primaryMetricLabel || "",
        secondaryMetricLabel: payload.secondaryMetricLabel || "",
        deliveryCharge: payload.deliveryCharge ?? 30,
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
      const haystack = [order.id, order.name, order.phone, order.address, order.fulfillmentMethod]
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

  const serviceCategoryOptions = useMemo(() => {
    const catalogCategories = serviceCatalog.map((item) => item.category).filter(Boolean);
    return Array.from(new Set([...serviceCategoryOrder, ...catalogCategories]));
  }, [serviceCatalog]);

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

function setNewServiceDraft(patch) {
  setNewService((current) => ({
    ...current,
    ...patch,
  }));
}

async function addServiceItem() {
  const title = newService.title.trim();
  const code = buildServiceCode(title);

  if (!title) {
    showToast({
      title: "Service title required",
      description: "Add a title before creating a new service item.",
      variant: "error",
    });
    return;
  }

  if (!code) {
    showToast({
      title: "Invalid service title",
      description: "Use a clearer title so we can generate a valid service code.",
      variant: "error",
    });
    return;
  }

  if (serviceCatalog.some((item) => item.code === code)) {
    showToast({
      title: "Service already exists",
      description: "A service with a similar title/code is already in the catalog.",
      variant: "error",
    });
    return;
  }

  const nextSortOrder = serviceCatalog.length
    ? Math.max(...serviceCatalog.map((item) => item.sortOrder || 0)) + 1
    : 1;

  const nextCatalog = [
    {
      code,
      title,
      category: newService.category.trim() || "Printing",
      description: newService.description.trim() || "Professional print and stationery support.",
      priceLabel: newService.priceLabel.trim() || "From Rs 99",
      basePrice: Number(newService.basePrice) || 99,
      unitLabel: newService.unitLabel.trim() || "starting price",
      featured: newService.featured,
      active: newService.active,
      sortOrder: nextSortOrder,
    },
    ...serviceCatalog,
  ];

  try {
    setServiceCatalogSaving(true);
    const response = await fetch("/api/service-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: nextCatalog }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to add the new service.");
    }

    setServiceCatalog(payload.items || []);
    setNewService(newServiceInitialState);
    setServiceSearch("");
    setServiceCategoryFilter("all");
    showToast({
      title: "Service added",
      description: "The new service is now published and visible in the Services tab.",
    });
  } catch (error) {
    showToast({
      title: "Add service failed",
      description: error.message || "The new service could not be saved.",
      variant: "error",
    });
  } finally {
    setServiceCatalogSaving(false);
  }
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
      shopOpen: payload.shopOpen !== false,
      turnaroundTime: payload.turnaroundTime || "",
      primaryMetricLabel: payload.primaryMetricLabel || "",
      secondaryMetricLabel: payload.secondaryMetricLabel || "",
      deliveryCharge: payload.deliveryCharge ?? 30,
    });

    showToast({
      title: "Homepage updated",
      description: "The daily offer, live status, and banner state are now updated on the website.",
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

async function removeServiceItem(code) {
  const target = serviceCatalog.find((item) => item.code === code);
  if (!target) return;

  const nextCatalog = serviceCatalog.filter((item) => item.code !== code);
  if (!nextCatalog.length) {
    showToast({
      title: "Cannot remove all services",
      description: "Keep at least one service in the catalog.",
      variant: "error",
    });
    return;
  }

  try {
    setServiceCatalogSaving(true);
    const response = await fetch("/api/service-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: nextCatalog }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to remove the service.");
    }

    setServiceCatalog(payload.items || []);
    showToast({
      title: "Service removed",
      description: `${target.title} has been removed from the live services catalog.`,
    });
  } catch (error) {
    showToast({
      title: "Remove failed",
      description: error.message || "The service could not be removed.",
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

  async function deleteOrder(orderId) {
    if (!orderId) return;

    const confirmed = window.confirm(
      `Delete order ${orderId}?\n\nThis will permanently remove the order and delete its uploaded files from storage.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(orderId);
      const nextOrders = orders.filter((order) => order.id !== orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete the order.");
      }

      setOrders(nextOrders);
      setDrafts((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });
      setExpandedOrderId((current) => (current === orderId ? nextOrders[0]?.id || "" : current));
      setOpenStatusId((current) => (current === orderId ? "" : current));

      showToast({
        title: "Order deleted",
        description: `Order ${orderId} has been removed.`,
      });
    } catch (error) {
      showToast({
        title: "Delete failed",
        description: error.message || "The order could not be deleted.",
        variant: "error",
      });
    } finally {
      setDeletingId("");
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
          <div className="admin-hero rounded-[32px] px-6 py-6 text-slate-900 shadow-[0_30px_80px_rgba(148,75,37,0.16)] backdrop-blur-2xl sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/44 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin workspace
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Order operations and tracking</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                  Manage daily updates, review incoming jobs, and move orders through production without the admin view becoming noisy.
                </p>
                {user?.username ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Signed in as {user.username}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full border-white/60 bg-white/52 px-5 text-slate-800 shadow-[0_12px_28px_rgba(148,75,37,0.1)] hover:bg-white/76 hover:text-slate-900" onClick={loadOrders}>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" className="rounded-full border-white/60 bg-white/52 px-5 text-slate-800 shadow-[0_12px_28px_rgba(148,75,37,0.1)] hover:bg-white/76 hover:text-slate-900" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Card className="admin-panel p-6 text-slate-900 shadow-[0_24px_60px_rgba(148,75,37,0.14)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Daily homepage update</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Keep the site feeling active</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
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
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full bg-white/65" />
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Banner label</label>
                    <Input value={siteContent.bannerLabel} onChange={(event) => setSiteContentDraft({ bannerLabel: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Display status text</label>
                    <Input value={siteContent.shopStatus} onChange={(event) => setSiteContentDraft({ shopStatus: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Shop banner state</label>
                    <div className="flex gap-3 rounded-2xl border border-white/55 bg-white/52 p-2 shadow-[0_14px_30px_rgba(148,75,37,0.08)]">
                      <button
                        type="button"
                        onClick={() => setSiteContentDraft({ shopOpen: true })}
                        className={cn(
                          "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                          siteContent.shopOpen
                            ? "bg-gradient-to-r from-emerald-200 to-lime-100 text-emerald-800 shadow-[0_10px_24px_rgba(16,185,129,0.16)]"
                            : "text-slate-600 hover:bg-white/70"
                        )}
                      >
                        Open banners
                      </button>
                      <button
                        type="button"
                        onClick={() => setSiteContentDraft({ shopOpen: false })}
                        className={cn(
                          "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                          siteContent.shopOpen === false
                            ? "bg-gradient-to-r from-rose-200 to-orange-100 text-rose-800 shadow-[0_10px_24px_rgba(244,63,94,0.14)]"
                            : "text-slate-600 hover:bg-white/70"
                        )}
                      >
                        Closed banners
                      </button>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">This switches the homepage slider between open-shop and closed-shop banner sets.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Turnaround promise</label>
                    <Input value={siteContent.turnaroundTime} onChange={(event) => setSiteContentDraft({ turnaroundTime: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Primary metric label</label>
                    <Input value={siteContent.primaryMetricLabel} onChange={(event) => setSiteContentDraft({ primaryMetricLabel: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Secondary metric label</label>
                    <Input value={siteContent.secondaryMetricLabel} onChange={(event) => setSiteContentDraft({ secondaryMetricLabel: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Delivery charge (Rs)</label>
                    <Input type="number" min="0" value={siteContent.deliveryCharge} onChange={(event) => setSiteContentDraft({ deliveryCharge: Number(event.target.value) || 0 })} />
                  </div>
                  <div className="admin-soft-panel rounded-2xl px-4 py-4 text-sm leading-6 text-slate-600">
                    These counts stay automatic. You control the wording, the visible status text, and which banner set the homepage slider uses.
                  </div>
                  <div className="lg:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Daily offer</label>
                    <Textarea
                      value={siteContent.dailyOffer}
                      onChange={(event) => setSiteContentDraft({ dailyOffer: event.target.value })}
                      placeholder="Example: Student print combo active today. A4 B&W from Rs 2/page."
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Daily message</label>
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
            <Card className="admin-panel p-6 text-slate-900 shadow-[0_24px_60px_rgba(148,75,37,0.14)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Service pricing control</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Manage the full services catalog</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
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
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

              <div className="mt-5 grid gap-3 rounded-2xl border border-white/55 bg-white/48 p-4 shadow-[0_14px_30px_rgba(148,75,37,0.08)] lg:grid-cols-[1fr_1fr_1.2fr_0.75fr_0.7fr_0.8fr_0.75fr_auto]">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">New service title</label>
                  <Input
                    value={newService.title}
                    onChange={(event) => setNewServiceDraft({ title: event.target.value })}
                    placeholder="Example: Mug Printing"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Category</label>
                  <Select
                    value={newService.category}
                    onChange={(event) => setNewServiceDraft({ category: event.target.value })}
                  >
                    {serviceCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Description</label>
                  <Input
                    value={newService.description}
                    onChange={(event) => setNewServiceDraft({ description: event.target.value })}
                    placeholder="Short service description"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price label</label>
                  <Input
                    value={newService.priceLabel}
                    onChange={(event) => setNewServiceDraft({ priceLabel: event.target.value })}
                    placeholder="From Rs 99"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Base price (Rs)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newService.basePrice}
                    onChange={(event) => setNewServiceDraft({ basePrice: Number(event.target.value) || 0 })}
                    placeholder="99"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unit</label>
                  <Input
                    value={newService.unitLabel}
                    onChange={(event) => setNewServiceDraft({ unitLabel: event.target.value })}
                    placeholder="starting price"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addServiceItem} className="w-full">
                    <Plus className="h-4 w-4" />
                    Add service
                  </Button>
                </div>
                <div className="lg:col-span-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setNewServiceDraft({ active: !newService.active })}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                      newService.active
                        ? "border-emerald-300/60 bg-emerald-100/90 text-emerald-700"
                        : "border-white/65 bg-white/70 text-slate-600"
                    )}
                  >
                    {newService.active ? "Visible on site" : "Hidden initially"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewServiceDraft({ featured: !newService.featured })}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                      newService.featured
                        ? "border-orange-300/60 bg-orange-100/90 text-orange-700"
                        : "border-white/65 bg-white/70 text-slate-600"
                    )}
                  >
                    {newService.featured ? "Featured service" : "Standard service"}
                  </button>
                  <div className="rounded-2xl border border-white/65 bg-white/72 px-4 py-3 text-sm font-medium text-slate-600">
                    Generated code: <span className="font-semibold text-slate-900">{buildServiceCode(newService.title) || "service_code"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {serviceCatalogLoading ? (
                  Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-16 w-full bg-white/65" />)
                ) : (
                  filteredServiceCatalog.map((item) => (
                    <div
                      key={item.code}
                      className="grid gap-3 rounded-2xl border border-white/55 bg-white/52 px-4 py-4 shadow-[0_14px_30px_rgba(148,75,37,0.08)] lg:grid-cols-[1.2fr_0.8fr_0.55fr_0.5fr_0.5fr_0.55fr_0.55fr_auto]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                        <p className="mt-2 text-xs leading-6 text-slate-600">{item.description}</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price label</label>
                        <Input value={item.priceLabel} onChange={(event) => setServiceItemDraft(item.code, { priceLabel: event.target.value })} />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Base price</label>
                        <Input type="number" min="1" value={item.basePrice ?? 0} onChange={(event) => setServiceItemDraft(item.code, { basePrice: Number(event.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unit</label>
                        <Input value={item.unitLabel} onChange={(event) => setServiceItemDraft(item.code, { unitLabel: event.target.value })} />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setServiceItemDraft(item.code, { active: !item.active })}
                          className={cn(
                            "w-full rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                            item.active
                              ? "border-emerald-300/60 bg-emerald-100/90 text-emerald-700"
                              : "border-white/65 bg-white/70 text-slate-600"
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
                              ? "border-orange-300/60 bg-orange-100/90 text-orange-700"
                              : "border-white/65 bg-white/70 text-slate-600"
                          )}
                        >
                          {item.featured ? "Featured" : "Standard"}
                        </button>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeServiceItem(item.code)}
                          disabled={serviceCatalogSaving}
                          className="w-full rounded-2xl border border-rose-300/70 bg-rose-100/90 px-3 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-200/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {!serviceCatalogLoading && filteredServiceCatalog.length === 0 ? (
                  <Card className="admin-soft-panel p-6 text-center text-sm text-slate-600">
                    No service items match the current filters.
                  </Card>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="admin-panel mt-6 rounded-[28px] p-4 shadow-[0_24px_60px_rgba(148,75,37,0.14)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Order queue</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Compact order management</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    <Card key={index} className="admin-soft-panel p-4">
                      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_0.6fr_auto]">
                        <Skeleton className="h-14 w-full bg-white/65" />
                        <Skeleton className="h-14 w-full bg-white/65" />
                        <Skeleton className="h-14 w-full bg-white/65" />
                        <Skeleton className="h-14 w-full bg-white/65" />
                        <Skeleton className="h-14 w-24 bg-white/65" />
                      </div>
                    </Card>
                  ))
                : filteredOrders.map((order) => {
                    const draft = drafts[order.id] || {
                      status: order.orderStatus || "submitted",
                      trackingMessage: order.trackingMessage || "",
                    };
                    const statusMeta = getOrderStatusMeta(draft.status);
                    const fulfillmentMeta = getFulfillmentMeta(order.fulfillmentMethod);
                    const expanded = expandedOrderId === order.id;

                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                        <Card className={cn("admin-soft-panel overflow-visible p-4 text-slate-900 backdrop-blur-xl", openStatusId === order.id ? "relative z-20" : "relative z-0")}>
                          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.9fr_0.65fr_auto] lg:items-center">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusMeta.tone)}>
                                  {statusMeta.label}
                                </span>
                                <span className="rounded-full border border-white/65 bg-white/72 px-3 py-1 text-xs font-semibold text-slate-700">
                                  {fulfillmentMeta.label}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-slate-800">{order.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {order.phone}
                                {order.fulfillmentMethod === "pickup" ? " | Pickup from shop" : order.address ? ` | ${order.address}` : ""}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Items</p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">{order.itemCount || order.items?.length || 0} documents</p>
                              <p className="mt-1 text-xs text-slate-500">Updated {formatDate(order.updatedAt || order.createdAt)}</p>
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
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(order.totalAmount || 0)}</p>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button type="button" onClick={() => saveOrderStatus(order.id)} disabled={savingId === order.id} className="h-11">
                                {savingId === order.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                {savingId === order.id ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => deleteOrder(order.id)}
                                disabled={deletingId === order.id || savingId === order.id}
                                className="h-11 border-rose-300/70 bg-rose-100/90 !text-rose-700 shadow-[0_14px_30px_rgba(244,63,94,0.12)] hover:bg-rose-200/90"
                              >
                                {deletingId === order.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {deletingId === order.id ? "Deleting..." : "Delete"}
                              </Button>
                              <button
                                type="button"
                                onClick={() => setExpandedOrderId((current) => (current === order.id ? "" : order.id))}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/65 bg-white/72 text-slate-600 transition hover:bg-white"
                                aria-label={expanded ? "Collapse order details" : "Expand order details"}
                              >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          {expanded ? (
                            <div className="mt-5 grid gap-4 border-t border-white/55 pt-5 xl:grid-cols-[1.2fr_0.95fr]">
                              <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                  <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Submitted</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(order.createdAt)}</p>
                                  </div>
                                  <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{order.name}</p>
                                  </div>
                                  <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{order.phone}</p>
                                  </div>
                                  <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Handoff</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{fulfillmentMeta.label}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {order.fulfillmentMethod === "pickup" ? "Customer pickup from shop" : order.address || fulfillmentMeta.note}
                                    </p>
                                  </div>
                                </div>

                                {order.notes ? (
                                  <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer notes</p>
                                    <p className="mt-2 text-sm leading-7 text-slate-600">{order.notes}</p>
                                  </div>
                                ) : null}

                                <div className="space-y-3">
                                  {(order.items || []).map((item) => (
                                    <OrderItemCard key={item.id} item={item} />
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer-facing summary</p>
                                  <p className="mt-2 text-sm leading-7 text-slate-600">{statusMeta.description}</p>
                                </div>

                                <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tracking code</p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">{order.id}</p>
                                  <p className="mt-2 text-xs leading-6 text-slate-500">
                                    Share the order ID and ask the customer to use their phone number on the tracking page.
                                  </p>
                                </div>

                                <div className="admin-soft-panel rounded-2xl px-4 py-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment proof</p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">UPI QR payment</p>
                                  {order.paymentScreenshotUrl ? (
                                    <a
                                      href={order.paymentScreenshotUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      {order.paymentScreenshotName || "Open screenshot"}
                                    </a>
                                  ) : (
                                    <p className="mt-2 text-xs leading-6 text-slate-500">No payment screenshot available.</p>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tracking message</label>
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
              <Card className="admin-soft-panel mt-4 p-8 text-center text-sm text-slate-600">
                No orders match the current filters. Try a broader search or switch the stage filter.
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}









