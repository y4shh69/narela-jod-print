export const orderStatusConfig = {
  submitted: {
    label: "Submitted",
    timelineLabel: "Submitted",
    description: "Order received and waiting for review.",
    tone: "border-sky-200 bg-sky-50 text-slate-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-slate-100",
  },
  confirmed: {
    label: "Confirmed",
    timelineLabel: "Confirmed",
    description: "Files reviewed and approved for production.",
    tone: "border-indigo-200 bg-indigo-50 text-slate-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-slate-100",
  },
  printing: {
    label: "Printing",
    timelineLabel: "Printing",
    description: "The team is printing or finishing the order.",
    tone: "border-amber-200 bg-amber-50 text-slate-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-slate-100",
  },
  ready: {
    label: "Packed for Delivery",
    timelineLabel: "Ready",
    description: "The order has been packed and is ready to be dispatched.",
    tone: "border-emerald-200 bg-emerald-50 text-slate-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-slate-100",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    timelineLabel: "Delivery",
    description: "The order is on the way to the customer.",
    tone: "border-violet-200 bg-violet-50 text-slate-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-slate-100",
  },
  delivered: {
    label: "Delivered",
    timelineLabel: "Delivered",
    description: "The order has been completed.",
    tone: "border-teal-200 bg-teal-50 text-slate-900 dark:border-teal-900 dark:bg-teal-950/40 dark:text-slate-100",
  },
  cancelled: {
    label: "Cancelled",
    timelineLabel: "Cancelled",
    description: "The order was cancelled.",
    tone: "border-rose-200 bg-rose-50 text-slate-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-slate-100",
  },
};

export const orderStatusOptions = Object.entries(orderStatusConfig).map(([value, config]) => ({
  value,
  label: config.label,
  description: config.description,
}));

export const orderStatusTimeline = ["submitted", "confirmed", "printing", "ready", "out_for_delivery", "delivered"];

export function getOrderStatusMeta(status) {
  return orderStatusConfig[status] || {
    label: "Unknown",
    timelineLabel: "Unknown",
    description: "Status unavailable.",
    tone: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200",
  };
}

export function getTrackingProgress(status) {
  const stepIndex = orderStatusTimeline.indexOf(status);
  if (stepIndex < 0) {
    return status === "cancelled" ? 0 : 0;
  }
  return ((stepIndex + 1) / orderStatusTimeline.length) * 100;
}
