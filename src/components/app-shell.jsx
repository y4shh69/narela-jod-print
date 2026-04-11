import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/xeroxwala-logo.jpeg";
import whatsappLogo from "../assets/whatsappp logo.jpg";
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

      <button
        type="button"
        onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer")}
        className={cn(
          "fixed right-5 z-50 grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-emerald-200/60 bg-white shadow-[0_18px_46px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(16,185,129,0.28)] focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
          // Keep it above the mobile submit bar on the Upload page.
          "bottom-24 md:bottom-6"
        )}
        aria-label="Chat on WhatsApp"
      >
        <img src={whatsappLogo} alt="" className="h-full w-full object-cover" />
      </button>

      <footer className="mt-14 py-10">
        <div className="section-shell">
          <div className="rounded-[30px] border border-white/55 bg-[linear-gradient(145deg,rgba(255,251,246,0.9),rgba(255,239,225,0.76))] px-6 py-6 shadow-[0_24px_56px_rgba(148,75,37,0.14)] backdrop-blur-xl sm:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/92 shadow-[0_14px_32px_rgba(148,75,37,0.14)] backdrop-blur">
                    <img src={logo} alt="Xerox Wala logo" className="h-14 w-14 object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-600">Xerox Wala</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">Print studio and delivery desk</p>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600">
                  Premium everyday printing for students, offices, and doorstep document delivery across multiple cities.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/60 bg-white/76 px-5 py-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)] backdrop-blur md:max-w-[420px]">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Crafted by</p>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
              
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://www.linkedin.com/in/divyanshusinghchouhan"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-300 via-orange-200 to-rose-200 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-900 shadow-[0_12px_28px_rgba(249,115,22,0.18)] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Divyanshu Singh Chouhan
                  </a>
                  <a
                    href="https://www.linkedin.com/in/abhiraj-singh-chouhan-b147b82a3"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-slate-300/85 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    Abhiraj Singh Chouhan 
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/60 pt-5">
              <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 md:flex-row md:items-center md:justify-between">
                <p className="font-semibold">
                  Built with care for fast, local printing workflows
                </p>
                <p className="font-medium text-slate-600">
                  Online orders, print setup, payment proof, and delivery updates in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
