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
    <div ref={rootRef} className={cn("relative", open ? "z-[140]" : "z-[20]")}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-slate-900 shadow-sm transition hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled ? "cursor-not-allowed opacity-60" : "",
          className
        )}
        {...props}
      >
        <span className="block flex-1 whitespace-normal break-words pr-2 text-sm font-semibold leading-5 text-slate-900 md:text-[15px]">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[160] min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_56px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/70">
          <div className="max-h-72 overflow-y-auto p-2">
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group} className="pb-2">
                {group !== "__ungrouped__" ? (
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">{group}</p>
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
                        className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition", active ? "bg-gradient-to-r from-amber-200 via-orange-100 to-rose-100" : "hover:bg-slate-50",
                          option.disabled ? "cursor-not-allowed opacity-40" : ""
                        )}
                      >
                        <span className="block flex-1 whitespace-normal break-words pr-2 text-sm font-semibold leading-5 text-slate-800">{option.label}</span>
                        {active ? <Check className="h-4 w-4 shrink-0 text-orange-600" /> : null}
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



