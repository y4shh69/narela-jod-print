import { Check, ChevronDown } from "lucide-react";
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

function extractOptions(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];

    if (child.type === "optgroup") {
      const groupLabel = child.props.label;
      return Children.toArray(child.props.children)
        .filter(isValidElement)
        .map((option) => ({
          value: option.props.value ?? option.props.children,
          label: option.props.children,
          group: groupLabel,
          disabled: Boolean(option.props.disabled),
        }));
    }

    if (child.type === "option") {
      return [
        {
          value: child.props.value ?? child.props.children,
          label: child.props.children,
          group: null,
          disabled: Boolean(child.props.disabled),
        },
      ];
    }

    return [];
  });
}

export function Select({ className, children, value, onChange, placeholder = "Select an option", disabled = false, ...props }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const options = useMemo(() => extractOptions(children), [children]);
  const selectedOption = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const groupedOptions = options.reduce((acc, option) => {
    const key = option.group || "__ungrouped__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(option);
    return acc;
  }, {});

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/20 bg-slate-950/72 px-4 py-3 text-left text-white shadow-[0_14px_36px_rgba(2,8,23,0.18)] transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
          disabled ? "cursor-not-allowed opacity-60" : "",
          className
        )}
        {...props}
      >
        <span className="truncate text-sm font-semibold">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/70 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-2xl border border-white/18 bg-slate-950/96 shadow-[0_24px_60px_rgba(2,8,23,0.34)] backdrop-blur-2xl">
          <div className="max-h-80 overflow-y-auto p-2">
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group} className="pb-2">
                {group !== "__ungrouped__" ? (
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">{group}</p>
                ) : null}
                <div className="space-y-1">
                  {groupOptions.map((option) => {
                    const active = String(option.value) === String(value);

                    return (
                      <button
                        key={`${group}-${option.value}`}
                        type="button"
                        disabled={option.disabled}
                        onClick={() => {
                          if (option.disabled) return;
                          onChange?.({ target: { value: option.value } });
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                          active ? "bg-brand-500/18" : "hover:bg-white/8",
                          option.disabled ? "cursor-not-allowed opacity-40" : ""
                        )}
                      >
                        <span className="truncate text-sm font-semibold text-white">{option.label}</span>
                        {active ? <Check className="h-4 w-4 shrink-0 text-brand-300" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
