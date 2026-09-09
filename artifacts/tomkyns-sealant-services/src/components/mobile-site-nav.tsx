import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

type MobileSiteNavProps = {
  active?: "home" | "reviews";
  onQuote?: () => void;
};

export default function MobileSiteNav({ active, onQuote }: MobileSiteNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open && (
        <nav
          id="mobile-site-navigation"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full border-b border-border bg-background px-4 py-4 shadow-lg"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 font-medium">
            <Link
              href="/"
              onClick={close}
              className={`rounded-md px-3 py-3 transition hover:bg-primary/5 hover:text-primary ${active === "home" ? "text-primary" : "text-foreground/80"}`}
            >
              Home
            </Link>
            <a
              href={active === "home" ? "#services" : "/#services"}
              onClick={close}
              className="rounded-md px-3 py-3 text-foreground/80 transition hover:bg-primary/5 hover:text-primary"
            >
              Services
            </a>
            <Link
              href="/reviews"
              onClick={close}
              className={`rounded-md px-3 py-3 transition hover:bg-primary/5 hover:text-primary ${active === "reviews" ? "text-primary" : "text-foreground/80"}`}
            >
              Reviews
            </Link>
            <Link
              href="/business-portal"
              onClick={close}
              className="rounded-md px-3 py-3 text-foreground/80 transition hover:bg-primary/5 hover:text-primary"
            >
              Business Portal
            </Link>
            {onQuote ? (
              <button
                type="button"
                onClick={() => {
                  close();
                  onQuote();
                }}
                className="mt-1 rounded-md bg-primary px-3 py-3 text-left font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Get a Free Quote
              </button>
            ) : (
              <a
                href="/#quote"
                onClick={close}
                className="mt-1 rounded-md bg-primary px-3 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Get a Free Quote
              </a>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}