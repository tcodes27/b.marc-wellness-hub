import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useCommunity } from "./community/CommunityProvider";
import { branding } from "@/config/branding";

const links = branding.nav;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openCommunity } = useCommunity();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ivory/85 backdrop-blur-xl border-b border-border/60 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container-luxe flex items-center justify-between">
        <Link
          to="/"
          className={`font-serif text-xl tracking-[0.3em] transition-colors ${
            scrolled ? "text-espresso" : "text-ivory"
          }`}
        >
          {branding.name}
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-[0.72rem] uppercase tracking-[0.28em] font-medium link-underline transition-colors ${
                scrolled ? "text-espresso" : "text-ivory"
              }`}
              activeProps={{ className: "opacity-100" }}
              inactiveProps={{ className: "opacity-80 hover:opacity-100" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/portal"
            className={`text-[0.72rem] uppercase tracking-[0.28em] font-medium link-underline transition-colors ${
              scrolled ? "text-espresso" : "text-ivory"
            }`}
          >
            Member Portal
          </Link>
          <button
            onClick={() => openCommunity("navbar")}
            className={`btn-luxe btn-luxe-hover ${
              scrolled
                ? ""
                : "!bg-transparent !text-ivory !border-ivory/70 hover:!bg-ivory hover:!text-espresso"
            }`}
          >
            {branding.cta.joinCommunity}
          </button>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden ${scrolled ? "text-espresso" : "text-ivory"}`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-ivory border-t border-border mt-3 animate-fade-in">
          <div className="container-luxe py-6 flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.28em] text-espresso"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                openCommunity("navbar-mobile");
              }}
              className="btn-luxe btn-luxe-hover self-start mt-2"
            >
              {branding.cta.joinCommunity}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
