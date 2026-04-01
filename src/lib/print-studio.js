export const fileTypeLabels = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  ppt: "PPT",
  pptx: "PPTX",
  jpg: "JPG",
  jpeg: "JPG",
  png: "PNG",
};

export const previewableImageTypes = ["jpg", "jpeg", "png"];
export const previewableDocumentTypes = ["pdf"];
export const supportedPreviewTypes = [...previewableImageTypes, ...previewableDocumentTypes];

export const baseDocumentSettings = {
  serviceCode: "document_printing",
  serviceTitle: "Document Printing",
  colorMode: "bw",
  paperSize: "A4",
  orientation: "portrait",
  printSide: "single",
  copies: 1,
  pages: 1,
  pageRange: "All",
  bindingType: "none",
  lamination: false,
  scaleType: "fit",
  finishType: "standard",
  materialType: "standard_stock",
  customSize: "",
  priorityLevel: "standard",
  productVariant: "standard",
  notes: "",
};

export function getServiceCategory(code = "", title = "") {
  const normalized = `${code} ${title}`.toLowerCase();

  if (normalized.includes("card") || normalized.includes("id") || normalized.includes("lanyard")) return "cards";
  if (normalized.includes("letterhead") || normalized.includes("stationery") || normalized.includes("envelope") || normalized.includes("bill")) return "stationery";
  if (normalized.includes("calendar") || normalized.includes("diar")) return "calendar";
  if (normalized.includes("gift") || normalized.includes("playing")) return "gifts";
  if (normalized.includes("pen") || normalized.includes("stamp") || normalized.includes("combo")) return "office";
  return "printing";
}

export function getServicePreset(code = "", title = "") {
  const category = getServiceCategory(code, title);

  switch (category) {
    case "cards":
      return {
        printSide: "double",
        scaleType: "actual",
        finishType: "matte",
        materialType: "premium_card",
        productVariant: "standard",
      };
    case "stationery":
      return {
        printSide: "single",
        scaleType: "fit",
        finishType: "standard",
        materialType: "bond_paper",
        productVariant: "office_set",
      };
    case "calendar":
      return {
        printSide: "single",
        finishType: "spiral_finish",
        materialType: "calendar_board",
        productVariant: "desk_format",
      };
    case "gifts":
      return {
        printSide: "single",
        finishType: "premium",
        materialType: "gift_surface",
        productVariant: "single_piece",
      };
    case "office":
      return {
        printSide: "single",
        finishType: "branding",
        materialType: "office_material",
        productVariant: "standard",
      };
    default:
      return {
        printSide: "single",
        scaleType: "fit",
        finishType: "standard",
        materialType: "standard_stock",
        productVariant: "document_set",
      };
  }
}

export function getFileExtension(name = "") {
  return name.includes(".") ? name.split(".").pop().toLowerCase() : "";
}

export function createDocumentItem(file) {
  const extension = getFileExtension(file.name);
  return {
    tempId: crypto.randomUUID(),
    file,
    name: file.name,
    fileType: extension || "file",
    previewUrl: supportedPreviewTypes.includes(extension) ? URL.createObjectURL(file) : "",
    pdfPageCount: extension === "pdf" ? 0 : null,
    selectedPages: [],
    conversionError: "",
    isConvertingPreview: false,
    settings: { ...baseDocumentSettings },
    pricing: {
      unitPrice: 0,
      totalPrice: 0,
    },
  };
}

export function getPreviewMode(fileType) {
  if (previewableImageTypes.includes(fileType)) return "image";
  if (previewableDocumentTypes.includes(fileType)) return "pdf";
  return "placeholder";
}

export function buildQuotePayload(documents) {
  return {
    items: documents.map((document) => ({
      tempId: document.tempId,
      displayName: document.name,
      fileType: document.fileType,
      ...document.settings,
    })),
  };
}

export function buildWhatsAppText(customer, documents, total) {
  const documentLines = documents
    .map(
      (document, index) =>
        `${index + 1}. ${document.name} | ${document.settings.colorMode === "color" ? "Color" : "B&W"} | ${document.settings.paperSize} | ${document.settings.copies} copies | ${document.settings.pageRange}`
        + ` | Service: ${document.settings.serviceTitle || "Document Printing"}`
    )
    .join("\n");

  return encodeURIComponent(
    `Hello, I want to place a print order.\nName: ${customer.name || "-"}\nPhone: ${customer.phone || "-"}\nAddress: ${customer.address || "-"}\nDocuments:\n${documentLines || "-"}\nEstimated total: Rs ${total || 0}`
  );
}
