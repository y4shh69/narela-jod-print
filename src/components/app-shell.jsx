import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/xeroxwala-logo.jpeg";
import { navLinks, whatsappNumber } from "../lib/constants";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export function AppShell({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isScrolled
            ? "border-b border-white/40 bg-white/55 shadow-[0_18px_48px_rgba(148,75,37,0.14)] backdrop-blur-2xl"
            : "bg-transparent"
        )}
      >
        <div className="section-shell flex h-18 items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_14px_34px_rgba(148,75,37,0.16)] backdrop-blur">
              <img src={logo} alt="Xerox Wala logo" className="h-14 w-14 object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-900">Xerox Wala</p>
              <p className="text-sm font-medium text-slate-700">Stationery, Xerox and online work</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/45 bg-white/42 p-2 shadow-[0_16px_38px_rgba(148,75,37,0.12)] backdrop-blur-xl lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
                    isActive
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-slate-950 shadow-[0_10px_24px_rgba(249,115,22,0.28)]"
                      : "text-slate-700 hover:bg-white/70 hover:text-slate-950"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="secondary"
              className="rounded-full border-white/50 bg-white/68 px-6 text-slate-900 shadow-[0_16px_36px_rgba(148,75,37,0.14)] backdrop-blur-xl hover:bg-white/82"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
            >
              Order on WhatsApp
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-2xl border border-white/50 bg-white/72 p-3 text-slate-800 shadow-[0_14px_34px_rgba(148,75,37,0.14)] backdrop-blur-xl lg:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen ? (
          <div className="section-shell border-t border-white/45 bg-white/62 py-4 backdrop-blur-2xl lg:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-slate-950 shadow-[0_10px_24px_rgba(249,115,22,0.24)]"
                        : "bg-transparent text-slate-800 hover:bg-white/60"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-2xl border-white/50 bg-white/72 text-slate-900 shadow-[0_14px_34px_rgba(148,75,37,0.14)] backdrop-blur-xl hover:bg-white/84"
                  onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-10 border-t border-slate-200/80 py-10 dark:border-slate-800">
        <div className="section-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900">
                  <img src={logo} alt="Xerox Wala logo" className="h-14 w-14 object-cover" />
                </div>
                <p className="text-xl font-semibold text-slate-950 dark:text-white">Xerox Wala</p>
              </div>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                Premium everyday printing for students, offices, and doorstep document delivery across multiple cities.
              </p>
            </div>
           
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-xs uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
            <p className="font-medium">
              Built by <span className="tracking-[0.05em] text-slate-800 dark:text-slate-200">Divyanshu Singh Chouhan</span> and{" "}
              <span className="tracking-[0.05em] text-slate-800 dark:text-slate-200">Abhiraj Singh Chouhan</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold tracking-[0.16em]">
              <a
                href="https://www.linkedin.com/in/divyanshusinghchouhan"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 transition hover:text-brand-500 dark:text-brand-300"
              >
                Divyanshu on LinkedIn
              </a>
              <a
                href="https://www.linkedin.com/in/abhiraj-singh-chouhan-b147b82a3"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 transition hover:text-brand-500 dark:text-brand-300"
              >
                Abhiraj on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
