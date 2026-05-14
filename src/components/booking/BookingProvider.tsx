import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type BookingDetails = {
  title?: string;
  date?: string;
  description?: string;
};

type BookingContextValue = {
  open: (details?: BookingDetails) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

const CAL_SRC = "https://cal.com/bmarcpilates?embed=true&theme=light";

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<BookingDetails | undefined>(undefined);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback((d?: BookingDetails) => {
    setDetails(d);
    setIframeLoaded(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <BookingContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Booking"
        >
          {/* Backdrop */}
          <button
            aria-label="Close booking"
            onClick={close}
            className="absolute inset-0 bg-espresso/55 backdrop-blur-md animate-fade-in"
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-tan/30 bg-ivory shadow-[0_40px_120px_-30px_oklch(0.28_0.035_40_/_0.55)] animate-scale-in"
            style={{ animationDuration: "0.4s" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-6 px-6 sm:px-10 pt-7 pb-5 border-b border-tan/25 bg-gradient-to-b from-sand/60 to-ivory">
              <div className="min-w-0">
                <span className="eyebrow">Reserve</span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-espresso truncate">
                  {details?.title ?? "Book your B.MARC experience"}
                </h2>
                {(details?.date || details?.description) && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {details?.date}
                    {details?.date && details?.description ? " · " : ""}
                    {details?.description}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                onClick={close}
                aria-label="Close"
                className="shrink-0 h-10 w-10 rounded-full border border-tan/40 bg-ivory flex items-center justify-center text-espresso hover:bg-sand transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scheduler */}
            <div className="relative flex-1 bg-ivory">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ivory">
                  <div className="h-8 w-8 rounded-full border-2 border-tan/30 border-t-espresso animate-spin" />
                  <p className="text-xs uppercase tracking-[0.3em] text-clay">Preparing your booking</p>
                </div>
              )}
              <iframe
                key={CAL_SRC}
                src={CAL_SRC}
                title="Schedule Appointment"
                onLoad={() => setIframeLoaded(true)}
                allow="payment"
                className="w-full h-[70vh] min-h-[520px] border-0 bg-ivory"
              />
            </div>
          </div>
        </div>
      )}
    </BookingContext.Provider>
  );
}
