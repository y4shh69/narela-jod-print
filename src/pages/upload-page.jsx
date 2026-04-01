import {
  Check,
  ChevronDown,
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  Layers3,
  LoaderCircle,
  Maximize2,
  MessageCircleMore,
  Monitor,
  Palette,
  ScanLine,
  Shapes,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/toast-provider";
import { whatsappNumber } from "../lib/constants";
import { Seo } from "../lib/seo";
import { groupServicesByCategory } from "../lib/service-catalog";
import {
  buildQuotePayload,
  buildWhatsAppText,
  createDocumentItem,
  fileTypeLabels,
  getPreviewMode,
  getServiceCategory,
  getServicePreset,
} from "../lib/print-studio";
import { cn, formatCurrency, formatFileType } from "../lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const customerInitialState = {
  name: "",
  phone: "",
  address: "",
  notes: "",
};

function getPageSizeLabel(category) {
  switch (category) {
    case "cards":
      return "Card size";
    case "calendar":
      return "Calendar format";
    case "gifts":
      return "Product size";
    case "office":
      return "Product format";
    default:
      return "Paper size";
  }
}

function getPageSizeOptions(category, serviceCode) {
  if (category === "cards") {
    if (String(serviceCode).includes("square")) {
      return [
        { value: "Square Card", label: "Square card" },
        { value: "Business Card", label: "Business card" },
        { value: "Custom Shape", label: "Custom shape" },
      ];
    }

    if (["circle_visiting_cards", "oval_visiting_cards", "leaf_visiting_cards"].includes(serviceCode)) {
      return [
        { value: "Custom Shape", label: "Custom shape" },
        { value: "Business Card", label: "Business card" },
        { value: "Square Card", label: "Square card" },
      ];
    }

    return [
      { value: "Business Card", label: "Business card" },
      { value: "Square Card", label: "Square card" },
      { value: "Custom Shape", label: "Custom shape" },
    ];
  }

  if (category === "stationery") {
    return [
      { value: "A4", label: "A4" },
      { value: "A5", label: "A5" },
      { value: "DL Envelope", label: "DL envelope" },
      { value: "Custom", label: "Custom" },
    ];
  }

  if (category === "calendar") {
    return [
      { value: "Desk Calendar", label: "Desk calendar" },
      { value: "Wall Calendar", label: "Wall calendar" },
      { value: "A5", label: "A5" },
      { value: "A4", label: "A4" },
    ];
  }

  if (category === "gifts") {
    return [
      { value: "Single Item", label: "Single item" },
      { value: "Gift Set", label: "Gift set" },
      { value: "Custom", label: "Custom" },
    ];
  }

  if (category === "office") {
    return [
      { value: "Standard", label: "Standard" },
      { value: "Compact", label: "Compact" },
      { value: "Custom", label: "Custom" },
    ];
  }

  return [
    { value: "A4", label: "A4" },
    { value: "A3", label: "A3" },
    { value: "Legal", label: "Legal" },
  ];
}

function ServicePicker({ value, items, groupedItems, loading, onSelect }) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((item) => item.code === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/20 bg-slate-950/72 px-4 py-3 text-left text-white shadow-[0_14px_36px_rgba(2,8,23,0.18)] transition hover:border-white/30"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Requested service</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{selectedItem?.title || "Document Printing"}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-white/70 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-2xl border border-white/18 bg-slate-950/96 shadow-[0_24px_60px_rgba(2,8,23,0.34)] backdrop-blur-2xl">
          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <div className="px-3 py-4 text-sm font-medium text-white/68">Loading services...</div>
            ) : (
              groupedItems.map(([category, categoryItems]) => (
                <div key={category} className="pb-2">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">{category}</p>
                  <div className="space-y-1">
                    {categoryItems.map((item) => {
                      const active = item.code === value;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            onSelect(item);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                            active ? "bg-brand-500/18" : "hover:bg-white/8"
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 truncate text-xs text-white/56">{item.priceLabel} · {item.unitLabel}</p>
                          </div>
                          {active ? <Check className="h-4 w-4 shrink-0 text-brand-300" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function UploadPage() {
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [customer, setCustomer] = useState(customerInitialState);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [serviceCatalogLoading, setServiceCatalogLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0, total: 0 });
  const { showToast } = useToast();

  const activeDocument = documents.find((document) => document.tempId === activeId) || documents[0] || null;
  const activeService = serviceCatalog.find((item) => item.code === activeDocument?.settings.serviceCode) || null;
  const activeServiceCategory = getServiceCategory(activeDocument?.settings.serviceCode, activeDocument?.settings.serviceTitle);
  const activePageSizeOptions = getPageSizeOptions(activeServiceCategory, activeDocument?.settings.serviceCode);
  const activePreviewUrl = activeDocument?.previewUrl || "";
  const previewMode = activeDocument ? getPreviewMode(activeDocument.fileType) : "placeholder";
  const previewPaperClass =
    activeDocument?.settings.paperSize === "A3"
      ? "aspect-[1/1.42] max-w-[520px]"
      : activeDocument?.settings.paperSize === "Legal"
        ? "aspect-[1/1.57] max-w-[430px]"
        : activeDocument?.settings.paperSize === "Business Card"
          ? "aspect-[1.75/1] max-w-[360px]"
          : activeDocument?.settings.paperSize === "Square Card"
            ? "aspect-square max-w-[320px]"
            : activeDocument?.settings.paperSize === "Custom Shape"
              ? "aspect-[1.4/1] max-w-[340px]"
              : activeDocument?.settings.paperSize === "Desk Calendar"
                ? "aspect-[1.3/1] max-w-[420px]"
                : activeDocument?.settings.paperSize === "Wall Calendar"
                  ? "aspect-[1/1.1] max-w-[420px]"
                  : activeDocument?.settings.paperSize === "Single Item"
                    ? "aspect-square max-w-[360px]"
                    : activeDocument?.settings.paperSize === "Gift Set"
                      ? "aspect-[1.3/1] max-w-[420px]"
        : "aspect-[1/1.41] max-w-[400px]";
  const previewTransformClass =
    activeDocument?.settings.orientation === "landscape" ? "rotate-90 scale-[0.74]" : "";
  const previewScaleClass =
    activeDocument?.settings.scaleType === "actual" ? "object-center scale-[1.08]" : "object-contain";
  const previewFilterStyle = {
    filter: activeDocument?.settings.colorMode === "bw" ? "grayscale(1)" : "none",
  };
  const quoteKey = useMemo(
    () =>
      JSON.stringify(
        documents.map((document) => ({
          tempId: document.tempId,
          settings: document.settings,
        }))
      ),
    [documents]
  );
  const groupedServiceCatalog = useMemo(() => groupServicesByCategory(serviceCatalog), [serviceCatalog]);

  useEffect(() => {
    let active = true;

    async function loadServiceCatalog() {
      try {
        setServiceCatalogLoading(true);
        const response = await fetch("/api/service-catalog");
        if (!response.ok) {
          throw new Error("Unable to load service catalog");
        }
        const payload = await response.json();
        if (active) {
          setServiceCatalog((payload.items || []).filter((item) => item.active !== false));
        }
      } catch (error) {
        if (active) {
          showToast({
            title: "Service list unavailable",
            description: "The upload studio could not load the live service catalog.",
            variant: "error",
          });
        }
      } finally {
        if (active) setServiceCatalogLoading(false);
      }
    }

    loadServiceCatalog();
    return () => {
      active = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!documents.length) {
      setTotals({ subtotal: 0, total: 0 });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsQuoteLoading(true);
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildQuotePayload(documents)),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Quote failed");
        }

        const payload = await response.json();
        setDocuments((current) =>
          current.map((document) => {
            const priced = payload.items?.find((item) => item.tempId === document.tempId);
            return priced
              ? {
                  ...document,
                  pricing: {
                    unitPrice: priced.unitPrice,
                    totalPrice: priced.totalPrice,
                  },
                }
              : document;
          })
        );
        setTotals({
          subtotal: payload.subtotal || 0,
          total: payload.total || 0,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          showToast({
            title: "Estimate unavailable",
            description: "Live pricing could not be refreshed right now.",
            variant: "error",
          });
        }
      } finally {
        setIsQuoteLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [documents.length, quoteKey]);

  const whatsappLink = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${buildWhatsAppText(customer, documents, totals.total)}`,
    [customer, documents, totals.total]
  );

  function setCustomerField(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function addFiles(fileList) {
    const nextDocuments = Array.from(fileList || []).map(createDocumentItem);
    if (!nextDocuments.length) return;

    setDocuments((current) => [...current, ...nextDocuments]);
    setActiveId((current) => current || nextDocuments[0].tempId);
    setErrors((current) => ({ ...current, documents: "" }));
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeDocument(tempId) {
    setDocuments((current) => {
      const target = current.find((item) => item.tempId === tempId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((item) => item.tempId !== tempId);
      if (tempId === activeId) {
        setActiveId(next[0]?.tempId || "");
      }
      return next;
    });
  }

  function updateDocumentSettings(tempId, patch) {
    setDocuments((current) =>
      current.map((document) =>
        document.tempId === tempId
          ? {
              ...document,
              settings: {
                ...document.settings,
                ...patch,
              },
            }
          : document
      )
    );
  }

  function selectServiceForDocument(tempId, item) {
    const category = getServiceCategory(item.code, item.title);
    const nextPageSize = getPageSizeOptions(category, item.code)[0]?.value || "A4";
    updateDocumentSettings(tempId, {
      serviceCode: item.code,
      serviceTitle: item.title,
      paperSize: nextPageSize,
      ...getServicePreset(item.code, item.title),
    });
  }

  function handlePdfLoadSuccess(tempId, pdf) {
    setDocuments((current) =>
      current.map((document) =>
        document.tempId === tempId
          ? {
              ...document,
              pdfPageCount: pdf.numPages,
              selectedPages:
                document.selectedPages.length > 0
                  ? document.selectedPages.filter((page) => page <= pdf.numPages)
                  : Array.from({ length: Math.min(pdf.numPages, 3) }, (_, index) => index + 1),
              settings: {
                ...document.settings,
                pages: pdf.numPages,
                pageRange:
                  document.selectedPages.length > 0
                    ? document.selectedPages.filter((page) => page <= pdf.numPages).join(",")
                    : pdf.numPages <= 3
                      ? Array.from({ length: pdf.numPages }, (_, index) => index + 1).join(",")
                      : "All",
              },
            }
          : document
      )
    );
  }

  function togglePdfPage(tempId, pageNumber) {
    setDocuments((current) =>
      current.map((document) => {
        if (document.tempId !== tempId) return document;

        const exists = document.selectedPages.includes(pageNumber);
        const selectedPages = exists
          ? document.selectedPages.filter((page) => page !== pageNumber)
          : [...document.selectedPages, pageNumber].sort((a, b) => a - b);

        return {
          ...document,
          selectedPages,
          settings: {
            ...document.settings,
            pageRange: selectedPages.length ? selectedPages.join(",") : "All",
          },
        };
      })
    );
  }

  async function convertDocumentPreview(tempId) {
    const target = documents.find((document) => document.tempId === tempId);
    if (!target) return;

    const payload = new FormData();
    payload.append("file", target.file);

    setDocuments((current) =>
      current.map((document) =>
        document.tempId === tempId ? { ...document, isConvertingPreview: true, conversionError: "" } : document
      )
    );

    try {
      const response = await fetch("/api/preview/convert", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Conversion failed");
      }

      setDocuments((current) =>
        current.map((document) =>
          document.tempId === tempId
            ? {
                ...document,
                previewUrl: result.previewUrl,
                fileType: "pdf",
                isConvertingPreview: false,
                conversionError: "",
              }
            : document
        )
      );
      showToast({
        title: "Preview ready",
        description: "The document was converted to PDF for live preview.",
      });
    } catch (error) {
      setDocuments((current) =>
        current.map((document) =>
          document.tempId === tempId
            ? {
                ...document,
                isConvertingPreview: false,
                conversionError: error.message || "Conversion failed",
              }
            : document
        )
      );
      showToast({
        title: "Preview conversion unavailable",
        description: error.message || "The server could not convert this file.",
        variant: "error",
      });
    }
  }

  function validate() {
    const nextErrors = {};
    if (!documents.length) nextErrors.documents = "Please upload at least one file.";
    if (!customer.name.trim()) nextErrors.name = "Name is required.";
    if (!/^\d{10}$/.test(customer.phone.trim())) nextErrors.phone = "Enter a valid 10-digit phone number.";
    if (!customer.address.trim()) nextErrors.address = "Address is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage(null);
    if (!validate()) {
      showToast({
        title: "Please complete the form",
        description: "We need your customer details and at least one document.",
        variant: "error",
      });
      return;
    }

    const payload = new FormData();
    payload.append("name", customer.name);
    payload.append("phone", customer.phone);
    payload.append("address", customer.address);
    payload.append("notes", customer.notes);
    documents.forEach((document) => payload.append("files", document.file));
    payload.append(
      "items",
      JSON.stringify(
        documents.map((document) => ({
          tempId: document.tempId,
          displayName: document.name,
          fileType: document.fileType,
          ...document.settings,
        }))
      )
    );

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Unable to create order");
      }

      const result = await response.json();

      documents.forEach((document) => {
        if (document.previewUrl) URL.revokeObjectURL(document.previewUrl);
      });
      setDocuments([]);
      setActiveId("");
      setCustomer(customerInitialState);
      setTotals({ subtotal: 0, total: 0 });
      setErrors({});
      setSuccessMessage({
        orderId: result.id,
        text: `Order submitted successfully. Use ${result.id} with your phone number on the Track Order page to check live updates.`,
      });
      showToast({
        title: "Order submitted",
                    description: `Your files were sent to the delivery team. Tracking ID: ${result.id}.`,
      });
    } catch (error) {
      showToast({
        title: "Submission failed",
        description: "The order could not be submitted. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Print Studio | Printing Shop in Bhopal"
        description="Upload multiple files, customize print settings per document, and place your Bhopal print order online."
      />

      <section className="py-16 sm:py-20">
        <div className="section-shell">
          <div className="mb-8 flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Print studio</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Upload multiple documents and configure each one before ordering
            </h1>
            <p className="max-w-3xl text-base font-medium leading-7 text-slate-700 dark:text-slate-200">
              This version gives each file its own print settings, live pricing, and a cleaner admin-ready order payload.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[300px_1fr_340px]">
            <aside className="space-y-4">
              <Card className="p-5">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    addFiles(event.dataTransfer.files);
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-5 py-8 text-center transition ${
                    errors.documents
                      ? "border-rose-400 bg-rose-50/60 dark:bg-rose-950/20"
                      : isDragging
                        ? "border-brand-500 bg-brand-50/70 dark:bg-brand-950/20"
                        : "hover:border-brand-400 hover:bg-white/45 dark:hover:bg-slate-900/45"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(event) => addFiles(event.target.files)}
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-bold">Add documents</p>
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Upload PDFs, Office files, and images. Configure each document separately.
                  </p>
                  <Button type="button" className="mt-5" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="h-4 w-4" />
                    Choose files
                  </Button>
                  {errors.documents ? <p className="mt-3 text-sm text-rose-500">{errors.documents}</p> : null}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Documents</p>
                  <span className="rounded-full border px-3 py-1 text-xs font-bold">{documents.length}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {documents.length ? (
                    documents.map((document) => (
                      <div
                        key={document.tempId}
                        className={`rounded-3xl border p-4 transition ${
                          activeId === document.tempId
                            ? "bg-white/60 shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:bg-slate-900/55"
                            : "hover:bg-white/35 dark:hover:bg-slate-900/35"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => setActiveId(document.tempId)} className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-bold">{document.name}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {fileTypeLabels[document.fileType] || formatFileType(document.fileType)} | {document.settings.paperSize} |{" "}
                              {document.settings.colorMode === "color" ? "Color" : "B&W"} | {document.settings.serviceTitle}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDocument(document.tempId)}
                            className="rounded-full p-2 text-slate-500 transition hover:bg-white/60 hover:text-rose-500 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
                          {document.pricing.totalPrice ? formatCurrency(document.pricing.totalPrice) : "Pricing pending"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed p-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Upload files to start configuring your print job.
                    </div>
                  )}
                </div>
              </Card>
            </aside>

            <section className="space-y-4">
              <Card className="p-6">
                {activeDocument ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Preview</p>
                        <h2 className="mt-2 text-2xl font-semibold">{activeDocument.name}</h2>
                      </div>
                      <div className="rounded-2xl border px-4 py-2 text-sm font-bold">
                        {fileTypeLabels[activeDocument.fileType] || formatFileType(activeDocument.fileType)}
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-dashed bg-white/35 p-6 dark:bg-slate-900/28">
                      <div className="mb-5 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold">
                          <Palette className="h-3.5 w-3.5" />
                          {activeDocument.settings.colorMode === "color" ? "Color output" : "Black and white"}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold">
                          <ScanLine className="h-3.5 w-3.5" />
                          {activeDocument.settings.printSide === "double" ? "Double-sided print" : "Single-sided print"}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold">
                          <Maximize2 className="h-3.5 w-3.5" />
                          {activeDocument.settings.scaleType === "actual" ? "Actual size" : "Fit to page"}
                        </div>
                      </div>

                      <div className="grid min-h-[420px] place-items-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(35,142,255,0.10),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.18))] p-5 dark:bg-[radial-gradient(circle_at_top,_rgba(35,142,255,0.16),_transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.68),rgba(2,6,23,0.48))]">
                        <div
                          className={cn(
                            "relative w-full overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.20)] transition duration-300 dark:border-white/10 dark:bg-slate-950",
                            previewPaperClass
                          )}
                        >
                          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b bg-slate-50/90 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-900/90 dark:text-slate-300">
                            <span>{activeDocument.settings.paperSize}</span>
                            <span>{activeDocument.settings.orientation}</span>
                          </div>
                          <div className="flex h-full items-center justify-center p-4 pt-14">
                            {previewMode === "image" && activePreviewUrl ? (
                              <img
                                src={activePreviewUrl}
                                alt={activeDocument.name}
                                style={previewFilterStyle}
                                className={cn(
                                  "max-h-full max-w-full rounded-2xl transition duration-300",
                                  previewScaleClass,
                                  previewTransformClass
                                )}
                              />
                            ) : null}

                            {previewMode === "pdf" && activePreviewUrl ? (
                              <div className={cn("h-full w-full overflow-auto rounded-2xl", previewTransformClass)}>
                                <Document
                                  file={activePreviewUrl}
                                  onLoadSuccess={(pdf) => handlePdfLoadSuccess(activeDocument.tempId, pdf)}
                                  loading={<div className="py-20 text-center text-sm font-semibold">Loading PDF preview...</div>}
                                  error={<div className="py-20 text-center text-sm font-semibold text-rose-500">PDF preview could not be rendered.</div>}
                                >
                                  <Page
                                    pageNumber={activeDocument.selectedPages[0] || 1}
                                    width={420}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                  />
                                </Document>
                              </div>
                            ) : null}

                            {previewMode === "placeholder" ? (
                              <div className="max-w-md text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-brand-500/12 text-brand-600 dark:text-brand-300">
                                  {activeDocument.fileType === "pdf" ? <Monitor className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                                </div>
                                <p className="mt-5 text-xl font-bold">Live print preview is available for PDF and image files</p>
                                <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                                  DOCX and PPTX files still need a conversion step before they can render visually here. The current
                                  settings panel will still capture the print instructions for this file.
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {previewMode === "pdf" && activePreviewUrl ? (
                        <div className="mt-5">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-bold">PDF page thumbnails</p>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                              Click pages to include or exclude them from the page range
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {Array.from({ length: activeDocument.pdfPageCount || 0 }, (_, index) => index + 1).map((pageNumber) => {
                              const isSelected =
                                activeDocument.selectedPages.length === 0 || activeDocument.selectedPages.includes(pageNumber);

                              return (
                                <button
                                  key={pageNumber}
                                  type="button"
                                  onClick={() => togglePdfPage(activeDocument.tempId, pageNumber)}
                                  className={cn(
                                    "overflow-hidden rounded-2xl border p-2 text-left transition",
                                    isSelected
                                      ? "border-brand-400 bg-brand-50/70 dark:bg-brand-950/20"
                                      : "opacity-55 hover:opacity-100"
                                  )}
                                >
                                  <Document file={activePreviewUrl} loading={<div className="h-[120px] animate-pulse rounded-xl bg-slate-200/60" />}>
                                    <Page
                                      pageNumber={pageNumber}
                                      width={110}
                                      renderTextLayer={false}
                                      renderAnnotationLayer={false}
                                    />
                                  </Document>
                                  <p className="mt-2 text-xs font-bold">Page {pageNumber}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {previewMode === "placeholder" && ["doc", "docx", "ppt", "pptx"].includes(activeDocument.fileType) ? (
                        <div className="mt-5 rounded-2xl border px-4 py-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-bold">Convert this file to PDF preview</p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                This uses LibreOffice on the server. Once converted, the file will render in the live preview pane.
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => convertDocumentPreview(activeDocument.tempId)}
                              disabled={activeDocument.isConvertingPreview}
                            >
                              {activeDocument.isConvertingPreview ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                              {activeDocument.isConvertingPreview ? "Converting..." : "Convert preview"}
                            </Button>
                          </div>
                          {activeDocument.conversionError ? (
                            <p className="mt-3 text-sm font-medium text-rose-500">{activeDocument.conversionError}</p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Requested service</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.serviceTitle}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Page range</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.pageRange}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Copies</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.copies}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Finishing</p>
                          <p className="mt-2 text-sm font-bold">
                            {activeDocument.settings.finishType || "standard"}
                          </p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Material / stock</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.materialType || "standard_stock"}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Variant</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.productVariant || "standard"}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Priority</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.priorityLevel || "standard"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid min-h-[420px] place-items-center rounded-[32px] border border-dashed bg-white/30 p-6 text-center">
                    <div className="max-w-md">
                      <Layers3 className="mx-auto h-12 w-12 text-brand-500" />
                      <p className="mt-4 text-2xl font-bold">Your document studio will appear here</p>
                      <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                        Add one or more files, then we'll let you configure paper size, color mode, page range, copies,
                        finishing, and total pricing for each document.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            <aside className="space-y-4">
              <Card className="p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Print settings</p>
                {activeDocument ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold">Requested service</label>
                      <ServicePicker
                        value={activeDocument.settings.serviceCode}
                        items={serviceCatalog}
                        groupedItems={groupedServiceCatalog}
                        loading={serviceCatalogLoading}
                        onSelect={(item) =>
                          selectServiceForDocument(activeDocument.tempId, item)
                        }
                      />
                      <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        Tag this file to the exact service you want, such as legal print, brochure printing, certificates, visiting cards, or stationery.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={activeDocument.settings.colorMode === "bw" ? "primary" : "outline"}
                        onClick={() => updateDocumentSettings(activeDocument.tempId, { colorMode: "bw" })}
                      >
                        B&W
                      </Button>
                      <Button
                        type="button"
                        variant={activeDocument.settings.colorMode === "color" ? "secondary" : "outline"}
                        onClick={() => updateDocumentSettings(activeDocument.tempId, { colorMode: "color" })}
                      >
                        Color
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-brand-400/18 bg-brand-500/8 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-brand-500" />
                        <div>
                          <p className="text-sm font-bold">Service-aware customization</p>
                          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            This file is being configured as <span className="font-semibold text-slate-900 dark:text-white">{activeDocument.settings.serviceTitle}</span>.
                            The options below adapt to this type of document so the order is closer to the final production requirement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">{getPageSizeLabel(activeServiceCategory)}</label>
                        <Select
                          value={activeDocument.settings.paperSize}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { paperSize: event.target.value })}
                        >
                          {activePageSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">Orientation</label>
                        <Select
                          value={activeDocument.settings.orientation}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { orientation: event.target.value })}
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">Pages</label>
                        <Input
                          type="number"
                          min="1"
                          value={activeDocument.settings.pages}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { pages: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">Copies</label>
                        <Input
                          type="number"
                          min="1"
                          value={activeDocument.settings.copies}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { copies: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">Print side</label>
                        <Select
                          value={activeDocument.settings.printSide}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { printSide: event.target.value })}
                        >
                          <option value="single">Single side</option>
                          <option value="double">Double side</option>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          {activeServiceCategory === "cards" ? "Edge / corner style" : "Binding"}
                        </label>
                        <Select
                          value={activeDocument.settings.bindingType}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { bindingType: event.target.value })}
                        >
                          {activeServiceCategory === "cards" ? (
                            <>
                              <option value="none">Standard edge</option>
                              <option value="staple">Rounded corners</option>
                              <option value="spiral">Square card style</option>
                              <option value="hard">Special cut shape</option>
                            </>
                          ) : (
                            <>
                              <option value="none">None</option>
                              <option value="staple">Staple</option>
                              <option value="spiral">Spiral</option>
                              <option value="hard">Hard binding</option>
                            </>
                          )}
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">Page range</label>
                        <Input
                          value={activeDocument.settings.pageRange}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { pageRange: event.target.value })}
                          placeholder="All or 1-5,8"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">Scaling</label>
                        <Select
                          value={activeDocument.settings.scaleType}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { scaleType: event.target.value })}
                        >
                          <option value="fit">Fit to page</option>
                          <option value="actual">Actual size</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          {activeServiceCategory === "cards"
                            ? "Finish"
                            : activeServiceCategory === "gifts"
                              ? "Branding finish"
                              : "Finish type"}
                        </label>
                        <Select
                          value={activeDocument.settings.finishType}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { finishType: event.target.value })}
                        >
                          {activeServiceCategory === "cards" ? (
                            <>
                              <option value="matte">Matte finish</option>
                              <option value="gloss">Gloss finish</option>
                              <option value="textured">Textured finish</option>
                              <option value="premium">Premium laminated finish</option>
                            </>
                          ) : activeServiceCategory === "gifts" ? (
                            <>
                              <option value="premium">Premium print</option>
                              <option value="branding">Logo branding</option>
                              <option value="photo_finish">Photo finish</option>
                              <option value="gift_box">Gift-ready packing</option>
                            </>
                          ) : (
                            <>
                              <option value="standard">Standard finish</option>
                              <option value="premium">Premium finish</option>
                              <option value="gloss">Gloss finish</option>
                              <option value="matte">Matte finish</option>
                            </>
                          )}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          {activeServiceCategory === "calendar"
                            ? "Format"
                            : activeServiceCategory === "office"
                              ? "Material type"
                              : "Material / stock"}
                        </label>
                        <Select
                          value={activeDocument.settings.materialType}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { materialType: event.target.value })}
                        >
                          {activeServiceCategory === "cards" ? (
                            <>
                              <option value="premium_card">Premium card stock</option>
                              <option value="standard_stock">Standard card stock</option>
                              <option value="textured_stock">Textured stock</option>
                              <option value="kraft_stock">Kraft stock</option>
                            </>
                          ) : activeServiceCategory === "calendar" ? (
                            <>
                              <option value="desk_format">Desk calendar format</option>
                              <option value="wall_format">Wall calendar format</option>
                              <option value="planner_format">Planner format</option>
                            </>
                          ) : activeServiceCategory === "gifts" ? (
                            <>
                              <option value="gift_surface">Gift surface</option>
                              <option value="ceramic">Ceramic / mug</option>
                              <option value="photo_board">Photo board</option>
                              <option value="cardboard_box">Gift box</option>
                            </>
                          ) : (
                            <>
                              <option value="standard_stock">Standard stock</option>
                              <option value="bond_paper">Bond paper</option>
                              <option value="thick_stock">Thick stock</option>
                              <option value="office_material">Office material</option>
                            </>
                          )}
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          {activeServiceCategory === "cards" ? "Card / product variant" : "Variant"}
                        </label>
                        <Select
                          value={activeDocument.settings.productVariant}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { productVariant: event.target.value })}
                        >
                          {activeServiceCategory === "cards" ? (
                            <>
                              <option value="standard">Standard</option>
                              <option value="classic">Classic</option>
                              <option value="rounded">Rounded</option>
                              <option value="custom_shape">Custom shape</option>
                            </>
                          ) : activeServiceCategory === "stationery" ? (
                            <>
                              <option value="office_set">Office set</option>
                              <option value="single_sheet">Single sheet</option>
                              <option value="bulk_pack">Bulk pack</option>
                            </>
                          ) : activeServiceCategory === "gifts" ? (
                            <>
                              <option value="single_piece">Single piece</option>
                              <option value="gift_combo">Gift combo</option>
                              <option value="custom_name">Custom name print</option>
                            </>
                          ) : (
                            <>
                              <option value="document_set">Document set</option>
                              <option value="single_file">Single file</option>
                              <option value="bulk_run">Bulk run</option>
                            </>
                          )}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">Priority</label>
                        <Select
                          value={activeDocument.settings.priorityLevel}
                          onChange={(event) => updateDocumentSettings(activeDocument.tempId, { priorityLevel: event.target.value })}
                        >
                          <option value="standard">Standard</option>
                          <option value="same_day">Same day</option>
                          <option value="urgent">Urgent</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {activeServiceCategory === "cards" ? "Custom size or shape notes" : "Custom size / layout"}
                      </label>
                      <Input
                        value={activeDocument.settings.customSize}
                        onChange={(event) => updateDocumentSettings(activeDocument.tempId, { customSize: event.target.value })}
                        placeholder={
                          activeServiceCategory === "cards"
                            ? "Example: 3.5 x 2 inch, rounded corner, oval cut"
                            : activeServiceCategory === "calendar"
                              ? "Example: desk format, 8 x 6 inch, 12 leaves"
                              : "Example: custom dimensions, margin or fold requirement"
                        }
                      />
                    </div>

                    <label className="flex items-center justify-between rounded-2xl border px-4 py-3">
                      <span className="text-sm font-bold">
                        {activeServiceCategory === "cards" || activeServiceCategory === "gifts" ? "Protective finish" : "Add lamination"}
                      </span>
                      <input
                        type="checkbox"
                        checked={activeDocument.settings.lamination}
                        onChange={(event) => updateDocumentSettings(activeDocument.tempId, { lamination: event.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>

                    <div>
                      <label className="mb-2 block text-sm font-bold">Document notes</label>
                      <Textarea
                        value={activeDocument.settings.notes}
                        onChange={(event) => updateDocumentSettings(activeDocument.tempId, { notes: event.target.value })}
                        placeholder={
                          activeServiceCategory === "cards"
                            ? "Mention brand colors, front/back text, QR code, quantity split, or finishing notes."
                            : activeServiceCategory === "gifts"
                              ? "Mention name personalization, logo placement, gift text, or packaging notes."
                              : "Mention margins, print quality, cover page, folds, finishing, or any special instruction."
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Select a document to customize its printing setup.
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Customer details</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold">Name</label>
                    <Input value={customer.name} onChange={(event) => setCustomerField("name", event.target.value)} />
                    {errors.name ? <p className="mt-2 text-sm text-rose-500">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">Phone</label>
                    <Input value={customer.phone} onChange={(event) => setCustomerField("phone", event.target.value)} />
                    {errors.phone ? <p className="mt-2 text-sm text-rose-500">{errors.phone}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">Address</label>
                    <Input value={customer.address} onChange={(event) => setCustomerField("address", event.target.value)} />
                    {errors.address ? <p className="mt-2 text-sm text-rose-500">{errors.address}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">Order notes</label>
                    <Textarea
                      value={customer.notes}
                      onChange={(event) => setCustomerField("notes", event.target.value)}
                    placeholder="Mention urgency, delivery timing, or if you need design help before printing."
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Price summary</p>
                  {isQuoteLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-brand-500" /> : null}
                </div>
                <div className="mt-4 space-y-3">
                  {documents.length ? (
                    documents.map((document) => (
                      <div key={document.tempId} className="flex items-start justify-between gap-3 rounded-2xl border px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{document.name}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {document.settings.serviceTitle} | {document.settings.copies} copies | {document.settings.paperSize} |{" "}
                            {document.settings.colorMode === "color" ? "Color" : "B&W"}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-bold">
                          {document.pricing.totalPrice ? formatCurrency(document.pricing.totalPrice) : "--"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      Add documents to calculate the order total.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Estimated total</span>
                  <span className="text-xl font-bold">{formatCurrency(totals.total || 0)}</span>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "Submitting order..." : "Submit print order"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}>
                    <MessageCircleMore className="h-4 w-4" />
                    Send on WhatsApp
                  </Button>
                </div>

                {successMessage ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <p>{successMessage.text}</p>
                    <p className="mt-2 font-bold">Tracking ID: {successMessage.orderId}</p>
                  </div>
                ) : null}
              </Card>
            </aside>
          </form>
        </div>
      </section>
    </>
  );
}

