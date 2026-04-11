import { useMemo } from "react";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { groupServicesByCategory } from "../lib/service-catalog";
import { cn } from "../lib/utils";

const fallbackServices = [
  {
    code: "document_printing",
    title: "Document Printing",
    category: "Printing",
    priceLabel: "From Rs 2",
    unitLabel: "per page",
  },
  {
    code: "brochure_printing",
    title: "Brochure Printing",
    category: "Printing",
    priceLabel: "From Rs 8",
    unitLabel: "per page",
  },
  {
    code: "certificates_printing",
    title: "Certificates Printing",
    category: "Certificate & Cards",
    priceLabel: "From Rs 20",
    unitLabel: "per sheet",
  },
];

const fallbackPageSizeOptions = [
  { value: "A4", label: "A4" },
  { value: "A3", label: "A3" },
  { value: "Letter", label: "Letter" },
];

const orientationOptions = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

const printSideOptions = [
  { value: "single", label: "Single side" },
  { value: "double", label: "Double side" },
];

const scalingOptions = [
  { value: "fit", label: "Fit to page" },
  { value: "actual", label: "Actual size" },
];

const priorityOptions = [
  { value: "standard", label: "Standard" },
  { value: "same_day", label: "Same day" },
  { value: "urgent", label: "Urgent" },
];

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionAccordion({ step, title, subtitle, defaultOpen = false, children }) {
  return (
    <details
      open={defaultOpen}
      className="group relative rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-200 to-orange-100 text-sm font-extrabold text-slate-900 shadow-sm">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
        </div>
        <div className="hidden min-w-0 max-w-[46%] text-right sm:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current</p>
          <p className="text-sm font-semibold leading-5 text-slate-700">{subtitle}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
      </summary>
      <div className="relative z-10 border-t border-slate-200 px-4 py-4">{children}</div>
    </details>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-sm font-semibold text-slate-800">{children}</label>;
}

function FieldHint({ children }) {
  return <p className="mt-2 text-xs leading-5 text-slate-500">{children}</p>;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Select option", error }) {
  const safeOptions = options.length ? options : fallbackPageSizeOptions;

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {safeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function TextInputField({ label, error, className = "", ...props }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Input
        className={cn(
          "border border-slate-300 rounded-lg px-3 py-2 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}

function TextareaField({ label, error, className = "", ...props }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Textarea
        className={cn(
          "border border-slate-300 rounded-lg px-3 py-2 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}

function ChoiceButton({ active, children, onClick }) {
  return (
    <Button
      type="button"
      variant={active ? "primary" : "outline"}
      className={cn(
        "w-full rounded-lg px-4 py-2 text-sm font-semibold",
        active ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800" : "border-slate-300 bg-white text-slate-800"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function normalizeCurrentOption(options, currentValue, currentLabel) {
  if (!currentValue) return options;
  if (options.some((option) => String(option.value) === String(currentValue))) return options;
  return [{ value: currentValue, label: currentLabel || currentValue }, ...options];
}

function getBindingOptions(category) {
  if (category === "cards") {
    return [
      { value: "none", label: "Standard edge" },
      { value: "staple", label: "Rounded corners" },
      { value: "spiral", label: "Square card style" },
      { value: "hard", label: "Special cut shape" },
    ];
  }

  return [
    { value: "none", label: "None" },
    { value: "staple", label: "Staple" },
    { value: "spiral", label: "Spiral" },
    { value: "hard", label: "Hard binding" },
  ];
}

function getFinishOptions(category) {
  if (category === "cards") {
    return [
      { value: "matte", label: "Matte finish" },
      { value: "gloss", label: "Gloss finish" },
      { value: "textured", label: "Textured finish" },
      { value: "premium", label: "Premium laminated finish" },
    ];
  }

  if (category === "gifts") {
    return [
      { value: "premium", label: "Premium print" },
      { value: "branding", label: "Logo branding" },
      { value: "photo_finish", label: "Photo finish" },
      { value: "gift_box", label: "Gift-ready packing" },
    ];
  }

  return [
    { value: "standard", label: "Standard finish" },
    { value: "premium", label: "Premium finish" },
    { value: "gloss", label: "Gloss finish" },
    { value: "matte", label: "Matte finish" },
  ];
}

function getMaterialOptions(category) {
  if (category === "cards") {
    return [
      { value: "premium_card", label: "Premium card stock" },
      { value: "standard_stock", label: "Standard card stock" },
      { value: "textured_stock", label: "Textured stock" },
      { value: "kraft_stock", label: "Kraft stock" },
    ];
  }

  if (category === "calendar") {
    return [
      { value: "desk_format", label: "Desk calendar format" },
      { value: "wall_format", label: "Wall calendar format" },
      { value: "planner_format", label: "Planner format" },
    ];
  }

  if (category === "gifts") {
    return [
      { value: "gift_surface", label: "Gift surface" },
      { value: "ceramic", label: "Ceramic / mug" },
      { value: "photo_board", label: "Photo board" },
      { value: "cardboard_box", label: "Gift box" },
    ];
  }

  return [
    { value: "standard_stock", label: "Standard stock" },
    { value: "bond_paper", label: "Bond paper" },
    { value: "thick_stock", label: "Thick stock" },
    { value: "office_material", label: "Office material" },
  ];
}

function getVariantOptions(category) {
  if (category === "cards") {
    return [
      { value: "standard", label: "Standard" },
      { value: "classic", label: "Classic" },
      { value: "rounded", label: "Rounded" },
      { value: "custom_shape", label: "Custom shape" },
    ];
  }

  if (category === "stationery") {
    return [
      { value: "office_set", label: "Office set" },
      { value: "single_sheet", label: "Single sheet" },
      { value: "bulk_pack", label: "Bulk pack" },
    ];
  }

  if (category === "gifts") {
    return [
      { value: "single_piece", label: "Single piece" },
      { value: "gift_combo", label: "Gift combo" },
      { value: "custom_name", label: "Custom name print" },
    ];
  }

  return [
    { value: "document_set", label: "Document set" },
    { value: "single_file", label: "Single file" },
    { value: "bulk_run", label: "Bulk run" },
  ];
}

function getSectionErrors(activeDocument, serviceOptions, pageSizeOptions) {
  if (!activeDocument) return {};

  return {
    service: !serviceOptions.length ? "No services available. Fallback services are being shown." : !activeDocument.settings.serviceCode ? "Please select a service." : "",
    paperSize: !pageSizeOptions.length ? "Please select a paper size." : !activeDocument.settings.paperSize ? "Please select a paper size." : "",
    orientation: !activeDocument.settings.orientation ? "Please select an orientation." : "",
    printSide: !activeDocument.settings.printSide ? "Please select print side." : "",
    finishType: !activeDocument.settings.finishType ? "Please select a finish." : "",
    materialType: !activeDocument.settings.materialType ? "Please select a material." : "",
    productVariant: !activeDocument.settings.productVariant ? "Please select a variant." : "",
    priorityLevel: !activeDocument.settings.priorityLevel ? "Please select a priority." : "",
  };
}

export function PrintSettings({
  activeDocument,
  activeServiceCategory,
  pageSizeLabel,
  pageSizeOptions,
  serviceCatalog,
  serviceCatalogLoading,
  onSelectService,
  onUpdateSettings,
}) {
  const serviceOptions = useMemo(() => {
    const merged = serviceCatalog.length ? serviceCatalog : fallbackServices;

    if (
      activeDocument?.settings.serviceCode &&
      !merged.some((item) => item.code === activeDocument.settings.serviceCode)
    ) {
      return [
        {
          code: activeDocument.settings.serviceCode,
          title: activeDocument.settings.serviceTitle || "Selected Service",
          category: "Printing",
          priceLabel: "Configured",
          unitLabel: "current service",
        },
        ...merged,
      ];
    }

    return merged;
  }, [activeDocument, serviceCatalog]);

  const groupedServices = useMemo(() => groupServicesByCategory(serviceOptions), [serviceOptions]);
  const safePageSizes = normalizeCurrentOption(
    pageSizeOptions?.length ? pageSizeOptions : fallbackPageSizeOptions,
    activeDocument?.settings.paperSize,
    activeDocument?.settings.paperSize
  );
  const orientationChoices = normalizeCurrentOption(orientationOptions, activeDocument?.settings.orientation, activeDocument?.settings.orientation);
  const printSideChoices = normalizeCurrentOption(printSideOptions, activeDocument?.settings.printSide, activeDocument?.settings.printSide);
  const scalingChoices = normalizeCurrentOption(scalingOptions, activeDocument?.settings.scaleType, activeDocument?.settings.scaleType);
  const bindingChoices = normalizeCurrentOption(getBindingOptions(activeServiceCategory), activeDocument?.settings.bindingType, activeDocument?.settings.bindingType);
  const finishChoices = normalizeCurrentOption(getFinishOptions(activeServiceCategory), activeDocument?.settings.finishType, activeDocument?.settings.finishType);
  const materialChoices = normalizeCurrentOption(getMaterialOptions(activeServiceCategory), activeDocument?.settings.materialType, activeDocument?.settings.materialType);
  const variantChoices = normalizeCurrentOption(getVariantOptions(activeServiceCategory), activeDocument?.settings.productVariant, activeDocument?.settings.productVariant);
  const priorityChoices = normalizeCurrentOption(priorityOptions, activeDocument?.settings.priorityLevel, activeDocument?.settings.priorityLevel);
  const errors = getSectionErrors(activeDocument, serviceOptions, safePageSizes);

  const selectedService = serviceOptions.find((item) => item.code === activeDocument?.settings.serviceCode) || null;
  const copies = Number(activeDocument?.settings.copies || 1);
  const sectionSummary = {
    service: selectedService?.title || activeDocument?.settings.serviceTitle || "Select option",
    output: activeDocument?.settings.colorMode === "color" ? "Color" : activeDocument?.settings.colorMode === "bw" ? "Black & White" : "Select option",
    paper: activeDocument ? `${activeDocument.settings.paperSize || "Select option"}  ${copies} ${copies === 1 ? "copy" : "copies"}` : "Select option",
    finishing: activeDocument
      ? `${finishChoices.find((item) => item.value === activeDocument.settings.finishType)?.label || "Select option"}  ${activeDocument.settings.lamination ? "Lamination" : "No lamination"}`
      : "Select option",
    notes: activeDocument?.settings.notes?.trim() || activeDocument?.settings.customSize?.trim() ? "Added" : "Optional",
  };

  if (!activeDocument) {
    return (
      <Card className="rounded-xl bg-white p-6 shadow-md">
        <p className="text-lg font-semibold text-slate-900">Print Settings</p>
        <p className="mt-2 text-sm text-slate-600">Select a document to configure print settings.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl bg-white p-4 shadow-md sm:p-6">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <p className="text-lg font-semibold text-slate-900">Print Settings</p>
        <p className="text-sm text-slate-600">
          Configure service, paper, finishing, and notes for <span className="font-semibold text-slate-900">{activeDocument.name}</span>.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <SectionAccordion step="1" title="Service" subtitle={sectionSummary.service} defaultOpen>
          <SectionCard>
            <div>
              <FieldLabel>Requested service</FieldLabel>
              <Select
                value={activeDocument.settings.serviceCode || ""}
                onChange={(event) => {
                  const item = serviceOptions.find((service) => service.code === event.target.value);
                  if (item) onSelectService(item);
                }}
                placeholder="Select option"
                className="border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select option
                </option>
                {groupedServices.map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <FieldError message={errors.service} />
              <FieldHint>
                {serviceCatalogLoading ? "Loading service list... fallback services are available if needed." : "Choose the exact print service for this file."}
              </FieldHint>
            </div>
          </SectionCard>
        </SectionAccordion>

        <SectionAccordion step="2" title="Print Options" subtitle={sectionSummary.output}>
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <FieldLabel>Color mode</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceButton active={activeDocument.settings.colorMode === "bw"} onClick={() => onUpdateSettings({ colorMode: "bw" })}>
                    Black & White
                  </ChoiceButton>
                  <ChoiceButton active={activeDocument.settings.colorMode === "color"} onClick={() => onUpdateSettings({ colorMode: "color" })}>
                    Color
                  </ChoiceButton>
                </div>
              </div>
              <SelectField
                label="Orientation"
                value={activeDocument.settings.orientation}
                onChange={(event) => onUpdateSettings({ orientation: event.target.value })}
                options={orientationChoices}
                error={errors.orientation}
              />
              <SelectField
                label="Print side"
                value={activeDocument.settings.printSide}
                onChange={(event) => onUpdateSettings({ printSide: event.target.value })}
                options={printSideChoices}
                error={errors.printSide}
              />
              <SelectField
                label="Scaling"
                value={activeDocument.settings.scaleType}
                onChange={(event) => onUpdateSettings({ scaleType: event.target.value })}
                options={scalingChoices}
              />
            </div>
          </SectionCard>
        </SectionAccordion>

        <SectionAccordion step="3" title="Paper Settings" subtitle={sectionSummary.paper}>
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SelectField
                label={pageSizeLabel}
                value={activeDocument.settings.paperSize}
                onChange={(event) => onUpdateSettings({ paperSize: event.target.value })}
                options={safePageSizes}
                error={errors.paperSize}
              />
              <TextInputField
                label="Pages"
                type="number"
                min="1"
                value={activeDocument.settings.pages}
                onChange={(event) => onUpdateSettings({ pages: event.target.value })}
              />
              <TextInputField
                label="Copies"
                type="number"
                min="1"
                value={activeDocument.settings.copies}
                onChange={(event) => onUpdateSettings({ copies: event.target.value })}
              />
              <TextInputField
                label="Page range"
                value={activeDocument.settings.pageRange}
                onChange={(event) => onUpdateSettings({ pageRange: event.target.value })}
                placeholder="All or 1-5,8"
              />
            </div>
          </SectionCard>
        </SectionAccordion>

        <SectionAccordion step="4" title="Finishing" subtitle={sectionSummary.finishing}>
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SelectField
                label={activeServiceCategory === "cards" ? "Edge / corner style" : "Binding"}
                value={activeDocument.settings.bindingType}
                onChange={(event) => onUpdateSettings({ bindingType: event.target.value })}
                options={bindingChoices}
              />
              <SelectField
                label={
                  activeServiceCategory === "cards"
                    ? "Finish"
                    : activeServiceCategory === "gifts"
                      ? "Branding finish"
                      : "Finish type"
                }
                value={activeDocument.settings.finishType}
                onChange={(event) => onUpdateSettings({ finishType: event.target.value })}
                options={finishChoices}
                error={errors.finishType}
              />
              <SelectField
                label={
                  activeServiceCategory === "calendar"
                    ? "Format"
                    : activeServiceCategory === "office"
                      ? "Material type"
                      : "Material / stock"
                }
                value={activeDocument.settings.materialType}
                onChange={(event) => onUpdateSettings({ materialType: event.target.value })}
                options={materialChoices}
                error={errors.materialType}
              />
              <SelectField
                label={activeServiceCategory === "cards" ? "Card / product variant" : "Variant"}
                value={activeDocument.settings.productVariant}
                onChange={(event) => onUpdateSettings({ productVariant: event.target.value })}
                options={variantChoices}
                error={errors.productVariant}
              />
              <SelectField
                label="Priority"
                value={activeDocument.settings.priorityLevel}
                onChange={(event) => onUpdateSettings({ priorityLevel: event.target.value })}
                options={priorityChoices}
                error={errors.priorityLevel}
              />
              <div>
                <FieldLabel>{activeServiceCategory === "cards" || activeServiceCategory === "gifts" ? "Protective finish" : "Add lamination"}</FieldLabel>
                <Button
                  type="button"
                  variant={activeDocument.settings.lamination ? "primary" : "outline"}
                  className={cn(
                    "w-full rounded-lg px-4 py-2 text-sm font-semibold",
                    activeDocument.settings.lamination ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800" : "border-slate-300 bg-white text-slate-800"
                  )}
                  onClick={() => onUpdateSettings({ lamination: !activeDocument.settings.lamination })}
                >
                  {activeDocument.settings.lamination ? (
                    <>
                      <Check className="h-4 w-4" />
                      Lamination enabled
                    </>
                  ) : (
                    "Enable lamination"
                  )}
                </Button>
              </div>
            </div>
          </SectionCard>
        </SectionAccordion>

        <SectionAccordion step="5" title="Special Instructions" subtitle={sectionSummary.notes}>
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextInputField
                label={activeServiceCategory === "cards" ? "Custom size or shape notes" : "Custom size / layout"}
                value={activeDocument.settings.customSize}
                onChange={(event) => onUpdateSettings({ customSize: event.target.value })}
                placeholder={
                  activeServiceCategory === "cards"
                    ? "Example: 3.5 x 2 inch, rounded corner, oval cut"
                    : activeServiceCategory === "calendar"
                      ? "Example: desk format, 8 x 6 inch, 12 leaves"
                      : "Example: custom dimensions, margin or fold requirement"
                }
                className="md:col-span-2"
              />
              <TextareaField
                label="Document notes"
                value={activeDocument.settings.notes}
                onChange={(event) => onUpdateSettings({ notes: event.target.value })}
                placeholder={
                  activeServiceCategory === "cards"
                    ? "Mention brand colors, front/back text, QR code, quantity split, or finishing notes."
                    : activeServiceCategory === "gifts"
                      ? "Mention name personalization, logo placement, gift text, or packaging notes."
                      : "Mention margins, print quality, cover page, folds, finishing, or any special instruction."
                }
                className="md:col-span-2"
              />
            </div>
          </SectionCard>
        </SectionAccordion>
      </div>
    </Card>
  );
}


