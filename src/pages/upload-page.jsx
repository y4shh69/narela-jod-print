import {
  ArrowRight,
  Copy,
  Layers3,
  LoaderCircle,
  MessageCircleMore,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PrintSettings } from "../components/print-settings";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import upiQrImage from "../assets/upi qr.png";
import { useToast } from "../components/toast-provider";
import { whatsappNumber } from "../lib/constants";
import { Seo } from "../lib/seo";
import {
  buildQuotePayload,
  buildWhatsAppText,
  createDocumentItem,
  fileTypeLabels,
  getServiceCategory,
  getPreviewMode,
  getServicePreset,
} from "../lib/print-studio";
import { cn, formatCurrency, formatFileType } from "../lib/utils";

const LAST_ORDER_STORAGE_KEY = "xeroxwala_last_order";

const customerInitialState = {
  name: "",
  phone: "",
  fulfillmentMethod: "delivery",
  address: "",
  notes: "",
};

function getPageSizeLabel(category) {
  if (category === "cards") return "Card size";
  if (category === "calendar") return "Calendar format";
  if (category === "gifts") return "Product size";
  if (category === "office") return "Product format";
  return "Paper size";
}




async function getPdfPageCount(file) {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Use PDF.js directly for reliable page counting across environments.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  async function loadCount(options) {
    const loadingTask = pdfjs.getDocument(options);
    try {
      const pdf = await loadingTask.promise;
      const count = Number(pdf.numPages || 1);
      await pdf.cleanup?.();
      await pdf.destroy?.();
      return Math.max(count, 1);
    } finally {
      loadingTask.destroy?.();
    }
  }

  try {
    return await loadCount({ data });
  } catch (error) {
    // Fallback for environments where the PDF worker fails to load.
    return await loadCount({ data, disableWorker: true });
  }
}

function findZipEndOfCentralDirectory(bytes) {
  // EOCD signature: 0x06054b50. Search backwards up to 64KB + 22 bytes.
  const sig = 0x06054b50;
  const maxComment = 0xffff;
  const minSize = 22;
  const start = Math.max(0, bytes.length - (minSize + maxComment));
  for (let i = bytes.length - minSize; i >= start; i--) {
    const value =
      bytes[i] |
      (bytes[i + 1] << 8) |
      (bytes[i + 2] << 16) |
      (bytes[i + 3] << 24);
    if (value === sig) return i;
  }
  return -1;
}

function readUint16LE(view, offset) {
  return view.getUint16(offset, true);
}

function readUint32LE(view, offset) {
  return view.getUint32(offset, true);
}

function decodeUtf8(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}

function sliceBytes(bytes, start, length) {
  return bytes.slice(start, start + length);
}

async function inflateRawIfNeeded(compressionMethod, compressed) {
  if (compressionMethod === 0) {
    return compressed;
  }
  if (compressionMethod !== 8) {
    return null;
  }
  if (typeof DecompressionStream === "undefined") {
    return null;
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const inflated = await new Response(stream).arrayBuffer();
  return new Uint8Array(inflated);
}

async function extractZipEntry(bytes, entryName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findZipEndOfCentralDirectory(bytes);
  if (eocdOffset < 0) return null;

  // EOCD layout (we only need central directory offset and total entries).
  const centralDirSize = readUint32LE(view, eocdOffset + 12);
  const centralDirOffset = readUint32LE(view, eocdOffset + 16);
  if (!centralDirSize || !centralDirOffset) return null;

  let ptr = centralDirOffset;
  const end = centralDirOffset + centralDirSize;
  while (ptr + 46 <= end) {
    // Central directory file header signature: 0x02014b50
    const sig = readUint32LE(view, ptr);
    if (sig !== 0x02014b50) break;

    const compressionMethod = readUint16LE(view, ptr + 10);
    const compressedSize = readUint32LE(view, ptr + 20);
    const fileNameLen = readUint16LE(view, ptr + 28);
    const extraLen = readUint16LE(view, ptr + 30);
    const commentLen = readUint16LE(view, ptr + 32);
    const localHeaderOffset = readUint32LE(view, ptr + 42);

    const nameStart = ptr + 46;
    const nameBytes = sliceBytes(bytes, nameStart, fileNameLen);
    const name = decodeUtf8(nameBytes);

    if (name === entryName) {
      // Local file header signature: 0x04034b50
      const localSig = readUint32LE(view, localHeaderOffset);
      if (localSig !== 0x04034b50) return null;
      const localNameLen = readUint16LE(view, localHeaderOffset + 26);
      const localExtraLen = readUint16LE(view, localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const compressed = sliceBytes(bytes, dataOffset, compressedSize);
      return inflateRawIfNeeded(compressionMethod, compressed);
    }

    ptr = nameStart + fileNameLen + extraLen + commentLen;
  }

  return null;
}

function parseOfficeAppXmlForCount(xmlText, fileType) {
  // docx: <Pages>n</Pages> (often present). pptx: <Slides>n</Slides>.
  const tag = fileType === "pptx" ? "Slides" : "Pages";
  const match = xmlText.match(new RegExp(`<${tag}>(\\d+)</${tag}>`));
  if (!match) return null;
  const count = Number(match[1]);
  return Number.isFinite(count) && count > 0 ? count : null;
}

async function getOfficeMeta(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const appXml = await extractZipEntry(bytes, "docProps/app.xml");
  const thumbnailJpg = await extractZipEntry(bytes, "docProps/thumbnail.jpeg");
  const thumbnailPng = await extractZipEntry(bytes, "docProps/thumbnail.png");

  let pageCount = null;
  if (appXml) {
    const xmlText = decodeUtf8(appXml);
    pageCount = parseOfficeAppXmlForCount(xmlText, String(file.name).toLowerCase().endsWith(".pptx") ? "pptx" : "docx");
  }

  let thumbnailUrl = "";
  if (thumbnailJpg) {
    thumbnailUrl = URL.createObjectURL(new Blob([thumbnailJpg], { type: "image/jpeg" }));
  } else if (thumbnailPng) {
    thumbnailUrl = URL.createObjectURL(new Blob([thumbnailPng], { type: "image/png" }));
  }

  return { pageCount, thumbnailUrl };
}

async function hydrateDocument(file) {
  const document = createDocumentItem(file);

  if (document.fileType !== "pdf") {
    const ext = document.fileType;
    if (ext === "jpg" || ext === "jpeg" || ext === "png") {
      return {
        ...document,
        settings: {
          ...document.settings,
          pages: 1,
        },
      };
    }

    if (ext === "docx" || ext === "pptx") {
      try {
        const meta = await getOfficeMeta(file);
        return {
          ...document,
          previewMode: meta.thumbnailUrl ? "image" : document.previewMode,
          previewUrl: meta.thumbnailUrl || document.previewUrl,
          settings: {
            ...document.settings,
            pages: meta.pageCount || document.settings.pages || 1,
          },
        };
      } catch (error) {
        return document;
      }
    }

    // Legacy Office types (.doc/.ppt) don't have reliable client-side page counts without conversion.
    return document;
  }

  try {
    const pageCount = await getPdfPageCount(file);
    return {
      ...document,
      pdfPageCount: pageCount,
      settings: {
        ...document.settings,
        pages: pageCount,
      },
    };
  } catch (error) {
    return document;
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





export function UploadPage() {
  const fileInputRef = useRef(null);
  const paymentInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [customer, setCustomer] = useState(customerInitialState);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [serviceCatalogLoading, setServiceCatalogLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const raw = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [totals, setTotals] = useState({ subtotal: 0, deliveryCharge: 0, total: 0 });
  const { showToast } = useToast();

  function persistLastOrder(next) {
    setLastOrder(next);
    try {
      if (next) {
        window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(LAST_ORDER_STORAGE_KEY);
      }
    } catch {
      // Storage can be blocked in private mode; ignore gracefully.
    }
  }

  const activeDocument = documents.find((document) => document.tempId === activeId) || documents[0] || null;
  const activeServiceCategory = getServiceCategory(activeDocument?.settings.serviceCode, activeDocument?.settings.serviceTitle);
  const activePageSizeOptions = getPageSizeOptions(activeServiceCategory, activeDocument?.settings.serviceCode);
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
  const activePreviewMode = activeDocument ? (activeDocument.previewMode || getPreviewMode(activeDocument.fileType)) : "placeholder";
  const activePageCount = activeDocument ? Number(activeDocument.pdfPageCount || activeDocument.settings.pages || 1) : 0;
  const copiesLabel = `${Number(activeDocument?.settings.copies || 1)} ${Number(activeDocument?.settings.copies || 1) === 1 ? "copy" : "copies"}`;
  const normalizedPhone = customer.phone.replace(/\D/g, "");
  const isCustomerReadyForPayment = customer.name.trim().length > 0 && normalizedPhone.length >= 10;

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
      setTotals({ subtotal: 0, deliveryCharge: 0, total: 0 });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsQuoteLoading(true);
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildQuotePayload(documents, customer.fulfillmentMethod)),
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
          deliveryCharge: payload.deliveryCharge || 0,
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
  }, [customer.fulfillmentMethod, documents.length, quoteKey, showToast]);

  const whatsappLink = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${buildWhatsAppText(customer, documents, totals.total)}`,
    [customer, documents, totals.total]
  );

  function setCustomerField(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const nextDocuments = await Promise.all(files.map((file) => hydrateDocument(file)));

    setDocuments((current) => [...current, ...nextDocuments]);
    setActiveId((current) => current || nextDocuments[0].tempId);
    setErrors((current) => ({ ...current, documents: "" }));
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function setPaymentProof(file) {
    setPaymentScreenshot((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      if (!file) {
        return null;
      }

      return {
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      };
    });
    setErrors((current) => ({ ...current, paymentScreenshot: "" }));
    if (paymentInputRef.current) {
      paymentInputRef.current.value = "";
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

  function validate() {
    const nextErrors = {};
    if (!documents.length) nextErrors.documents = "Please upload at least one file.";
    if (!customer.name.trim()) nextErrors.name = "Name is required.";
    if (normalizedPhone.length < 10) nextErrors.phone = "Enter a valid phone number.";
    if (customer.fulfillmentMethod === "delivery" && !customer.address.trim()) nextErrors.address = "Delivery address is required.";
    if (!paymentScreenshot?.file) nextErrors.paymentScreenshot = "Payment screenshot is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage(null);
    if (!validate()) {
      showToast({
        title: "Please complete the form",
        description: "We need your customer details, payment proof, and at least one document.",
        variant: "error",
      });
      return;
    }

    const payload = new FormData();
    payload.append("name", customer.name);
    payload.append("phone", customer.phone);
    payload.append("fulfillmentMethod", customer.fulfillmentMethod);
    payload.append("paymentMethod", "upi_qr");
    payload.append("address", customer.fulfillmentMethod === "delivery" ? customer.address : "");
    payload.append("notes", customer.notes);
    documents.forEach((document) => payload.append("files", document.file));
    payload.append("paymentScreenshot", paymentScreenshot.file);
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
      if (paymentScreenshot?.previewUrl) {
        URL.revokeObjectURL(paymentScreenshot.previewUrl);
      }
      setDocuments([]);
      setActiveId("");
      setPaymentScreenshot(null);
      setCustomer(customerInitialState);
      setTotals({ subtotal: 0, deliveryCharge: 0, total: 0 });
      setErrors({});
      setSuccessMessage({
        orderId: result.id,
        text: `Order submitted successfully. Use ${result.id} with your phone number on the Track Order page to check live updates.`,
      });
      persistLastOrder({
        orderId: result.id,
        createdAt: Date.now(),
      });
      showToast({
        title: "Order submitted",
        description:
          customer.fulfillmentMethod === "pickup"
            ? `Your files were sent to the print team for pickup handling. Tracking ID: ${result.id}.`
            : `Your files were sent to the delivery team. Tracking ID: ${result.id}.`,
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
        title="Print Studio | Printing Shop"
        description="Upload multiple files, customize print settings per document, and place your print order online."
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

          {lastOrder?.orderId ? (
            <Card className="mb-6 border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 via-white/80 to-emerald-50/80 p-5 shadow-[0_18px_44px_rgba(16,185,129,0.10)] backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Order placed</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Tracking ID: <span className="break-all">{lastOrder.orderId}</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-600">Keep this ID to track order progress.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await window.navigator.clipboard.writeText(lastOrder.orderId);
                        showToast({ title: "Copied", description: "Tracking ID copied to clipboard." });
                      } catch {
                        showToast({ title: "Copy failed", description: "Select and copy the tracking ID manually.", variant: "error" });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy ID
                  </Button>
                  <Button type="button" onClick={() => (window.location.href = "/track")}>
                    Track order
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => persistLastOrder(null)}
                    className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:brightness-105"
                    aria-label="Dismiss tracking banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-6 pb-28 md:pb-0 xl:grid-cols-[minmax(220px,300px)_minmax(0,1fr)_minmax(420px,520px)]">
            <aside className="space-y-4 xl:min-w-[220px]">
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
                            ? "border-orange-400/80 bg-gradient-to-r from-amber-300/90 via-orange-200/80 to-rose-200/80 shadow-[0_18px_38px_rgba(148,75,37,0.16)]"
                            : "hover:bg-white/35 dark:hover:bg-slate-900/35"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => setActiveId(document.tempId)} className="min-w-0 flex-1 text-left">
                            <p className="break-words text-sm font-bold leading-5">{document.name}</p>
                            <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                              {fileTypeLabels[document.fileType] || formatFileType(document.fileType)} | {document.settings.paperSize} |{" "}
                              {document.settings.colorMode === "color" ? "Color" : "B&W"} | {document.settings.serviceTitle}
                            </p>
                            {activeId === document.tempId ? (
                              <p className="mt-3 inline-flex rounded-full border border-orange-500/40 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                                Editing this file
                              </p>
                            ) : null}
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
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Document preview</p>
                        <h2 className="mt-2 text-2xl font-semibold">{activeDocument.name}</h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-600">
                          {fileTypeLabels[activeDocument.fileType] || formatFileType(activeDocument.fileType)} file ready for printing. Review the thumbnail and document details here while you adjust the settings on the right.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-orange-300/70 bg-gradient-to-r from-amber-300/95 via-orange-200/85 to-rose-200/85 px-4 py-2 text-sm font-bold text-slate-900 shadow-[0_12px_28px_rgba(148,75,37,0.14)]">
                        Selected file
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-orange-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,243,235,0.72))] p-6 shadow-[0_22px_48px_rgba(148,75,37,0.10)]">
                      <div className="mb-5 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/82 px-3 py-2 text-xs font-bold text-slate-800">
                          {fileTypeLabels[activeDocument.fileType] || formatFileType(activeDocument.fileType)}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/82 px-3 py-2 text-xs font-bold text-slate-800">
                          {activePageCount} {activePageCount === 1 ? "page" : "pages"}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/82 px-3 py-2 text-xs font-bold text-slate-800">
                          {activeDocument.settings.serviceTitle}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-[0_26px_60px_rgba(15,23,42,0.12)]">
                        {activeDocument.previewUrl && activePreviewMode === "image" ? (
                          <img
                            src={activeDocument.previewUrl}
                            alt={`${activeDocument.name} preview`}
                            className="h-[420px] w-full object-contain bg-[radial-gradient(circle_at_top,rgba(255,241,230,0.9),rgba(255,255,255,0.96))]"
                          />
                        ) : activeDocument.previewUrl && activePreviewMode === "pdf" ? (
                          <iframe
                            title={`${activeDocument.name} preview`}
                            src={`${activeDocument.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="h-[420px] w-full bg-white"
                          />
                        ) : (
                          <div className="grid h-[420px] place-items-center bg-[radial-gradient(circle_at_top,rgba(255,241,230,0.9),rgba(255,255,255,0.96))] p-8 text-center">
                            <div className="max-w-sm">
                              <Layers3 className="mx-auto h-12 w-12 text-brand-500" />
                              <p className="mt-4 text-xl font-bold text-slate-900">Thumbnail unavailable</p>
                              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                                This file type does not have a live thumbnail, but the selected filename and print settings are ready to submit.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Filename</p>
                          <p className="mt-2 break-words text-sm font-bold">{activeDocument.name}</p>
                        </div>
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Page count</p>
                          <p className="mt-2 text-sm font-bold">{activePageCount}</p>
                        </div>
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Requested service</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.serviceTitle}</p>
                        </div>
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Paper size</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.paperSize}</p>
                        </div>
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Copies</p>
                          <p className="mt-2 text-sm font-bold">{copiesLabel}</p>
                        </div>
                        <div className="rounded-2xl border border-orange-200/70 bg-white/82 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Page range</p>
                          <p className="mt-2 text-sm font-bold">{activeDocument.settings.pageRange}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid min-h-[420px] place-items-center rounded-[32px] border border-dashed border-orange-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,243,235,0.72))] p-6 text-center">
                    <div className="max-w-md">
                      <Layers3 className="mx-auto h-12 w-12 text-brand-500" />
                      <p className="mt-4 text-2xl font-bold">Choose a file to preview</p>
                      <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                        Add one or more files, then click a file from the left panel to see its thumbnail, filename, and page details here.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            <aside className="space-y-4 xl:sticky xl:top-0 xl:flex xl:max-h-screen xl:flex-col xl:overflow-y-auto xl:pr-2">
              <PrintSettings
                activeDocument={activeDocument}
                activeServiceCategory={activeServiceCategory}
                pageSizeLabel={getPageSizeLabel(activeServiceCategory)}
                pageSizeOptions={activePageSizeOptions}
                serviceCatalog={serviceCatalog}
                serviceCatalogLoading={serviceCatalogLoading}
                onSelectService={(item) => selectServiceForDocument(activeDocument.tempId, item)}
                onUpdateSettings={(patch) => updateDocumentSettings(activeDocument.tempId, patch)}
              />
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
                    <label className="mb-2 block text-sm font-bold">Order handoff</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setCustomer((current) => ({ ...current, fulfillmentMethod: "delivery" }))}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          customer.fulfillmentMethod === "delivery"
                            ? "border-orange-400/80 bg-gradient-to-r from-amber-300/95 via-orange-200/90 to-rose-200/90 text-slate-900 shadow-[0_12px_28px_rgba(249,115,22,0.18)]"
                            : "border-slate-200/80 bg-white/75 text-slate-700 hover:border-orange-200/70 hover:bg-white"
                        )}
                      >
                        <p className="text-sm font-semibold">Delivery</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomer((current) => ({ ...current, fulfillmentMethod: "pickup", address: "" }))}
                        className={cn(
                          "rounded-2xl border px-4 py-4 text-left transition",
                          customer.fulfillmentMethod === "pickup"
                            ? "border-orange-400/80 bg-gradient-to-r from-amber-300/95 via-orange-200/90 to-rose-200/90 text-slate-900 shadow-[0_12px_28px_rgba(249,115,22,0.18)]"
                            : "border-slate-200/80 bg-white/75 text-slate-700 hover:border-orange-200/70 hover:bg-white"
                        )}
                      >
                        <p className="text-sm font-semibold">Pickup</p>
                      </button>
                    </div>
                  </div>
                  {customer.fulfillmentMethod === "delivery" ? (
                    <div>
                      <label className="mb-2 block text-sm font-bold">Delivery address</label>
                      <Input
                        value={customer.address}
                        onChange={(event) => setCustomerField("address", event.target.value)}
                        placeholder="Enter the full delivery address"
                      />
                      {errors.address ? <p className="mt-2 text-sm text-rose-500">{errors.address}</p> : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-4 text-sm font-medium leading-6 text-slate-600">
                      Pickup selected. The customer can collect the finished order directly from the shop, so no delivery address is needed.
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-sm font-bold">Order notes</label>
                    <Textarea
                      value={customer.notes}
                      onChange={(event) => setCustomerField("notes", event.target.value)}
                      placeholder={
                        customer.fulfillmentMethod === "pickup"
                          ? "Mention urgency, preferred pickup timing, or if you need design help before printing."
                          : "Mention urgency, delivery timing, or if you need design help before printing."
                      }
                    />
                  </div>
                </div>
              </Card>

              <details className="rounded-[28px] border border-white/60 bg-white/86 shadow-[0_18px_40px_rgba(15,23,42,0.12)]" open={isCustomerReadyForPayment}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Payment</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">UPI QR and payment proof</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current</p>
                    <p className="text-sm font-semibold text-slate-800">{isCustomerReadyForPayment ? paymentScreenshot?.file?.name || "Pending proof" : "Locked"}</p>
                  </div>
                </summary>
                <div className="border-t border-orange-100/80 px-5 pb-5 pt-4">
                  {isCustomerReadyForPayment ? (
                    <div className="space-y-4">
                      <div className="rounded-[28px] border border-white/60 bg-white/74 p-4 shadow-[0_16px_36px_rgba(148,75,37,0.1)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-bold text-slate-900">Pay with the shop UPI QR</p>
                            <p className="mt-1 text-xs leading-6 text-slate-600">
                              Scan the QR, complete the payment, then upload the screenshot below as proof.
                            </p>
                          </div>
                          <a
                            href={upiQrImage}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-300/80 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white"
                          >
                            Open image
                          </a>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/90 p-3">
                          <img src={upiQrImage} alt="UPI QR code" className="mx-auto w-full max-w-[300px] rounded-[20px] object-contain" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold">Payment screenshot</label>
                        <input
                          ref={paymentInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => setPaymentProof(event.target.files?.[0] || null)}
                        />
                        <button
                          type="button"
                          onClick={() => paymentInputRef.current?.click()}
                          className="flex min-h-[92px] w-full items-center justify-between gap-4 rounded-[24px] border-2 border-dashed border-orange-400 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 text-left text-slate-900 shadow-[0_16px_34px_rgba(249,115,22,0.14)] transition hover:border-orange-500 hover:from-amber-100 hover:to-orange-100 hover:shadow-[0_20px_40px_rgba(249,115,22,0.18)]"
                        >
                          <div>
                            <p className="text-base font-bold text-slate-900">
                              {paymentScreenshot?.file?.name || "Upload payment screenshot"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">Accepted: image proof of the completed payment.</p>
                          </div>
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.26)]"><UploadCloud className="h-5 w-5" /></div>
                        </button>
                        {errors.paymentScreenshot ? <p className="mt-2 text-sm text-rose-500">{errors.paymentScreenshot}</p> : null}
                      </div>

                      {paymentScreenshot ? (
                        <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/78 p-3">
                          {paymentScreenshot.previewUrl ? (
                            <img
                              src={paymentScreenshot.previewUrl}
                              alt="Payment screenshot preview"
                              className="max-h-72 w-full rounded-[18px] object-contain"
                            />
                          ) : (
                            <div className="rounded-[18px] border border-white/60 bg-white/90 px-4 py-6 text-center text-sm font-medium text-slate-600">
                              {paymentScreenshot.file.name}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 px-4 py-4 text-sm font-medium leading-6 text-slate-700">
                      Enter the customer name and a valid phone number to unlock the QR payment section.
                    </div>
                  )}
                </div>
              </details>
              <div className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] xl:sticky xl:bottom-0 xl:mt-auto xl:border-t-2 xl:border-orange-200/70">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Price summary</p>
                  {isQuoteLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-brand-500" /> : null}
                </div>
                <div className="mt-4 space-y-3">
                  {documents.length ? (
                    documents.map((document) => (
                      <div key={document.tempId} className="flex items-start justify-between gap-3 rounded-2xl border px-4 py-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold leading-5">{document.name}</p>
                          <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
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

                {customer.fulfillmentMethod === "delivery" ? (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-orange-200/70 bg-orange-50/60 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">Delivery charge</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(totals.deliveryCharge || 0)}</span>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Estimated total</span>
                  <span className="text-xl font-bold">{formatCurrency(totals.total || 0)}</span>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <Button type="submit" disabled={isSubmitting} className="hidden w-full px-6 py-3.5 text-base md:inline-flex">
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "Submitting order..." : "Submit print order"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}>
                    <MessageCircleMore className="h-4 w-4" />
                    Send on WhatsApp
                  </Button>
                </div>

                {successMessage ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-white/92 px-4 py-3 text-sm shadow-[0_14px_34px_rgba(16,185,129,0.10)] backdrop-blur">
                    <p className="font-medium leading-6 text-slate-700">{successMessage.text}</p>
                    <p className="mt-2 font-bold text-slate-900">
                      Tracking ID: <span className="break-all text-emerald-700">{successMessage.orderId}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </aside>
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-200/70 bg-white/95 p-4 shadow-[0_-18px_36px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
              <Button type="submit" disabled={isSubmitting} className="w-full px-6 py-3.5 text-base">
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Submitting order..." : "Submit print order"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}




