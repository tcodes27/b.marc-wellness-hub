import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type CommunityContextValue = {
  open: (source?: string) => void;
  close: () => void;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}

const INTEREST_OPTIONS = [
  "Pilates events",
  "Wellness community",
  "Online classes",
  "Beginner Pilates",
  "Brand updates",
  "Sponsorship/collaboration",
];

const schema = z.object({
  first_name: z.string().trim().min(1, "Required").max(80),
  last_name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  instagram_handle: z.string().trim().max(80).optional().or(z.literal("")),
  interests: z.array(z.string().max(80)).max(20),
  consent_marketing: z.boolean(),
});

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  instagram_handle: string;
  interests: string[];
  consent_marketing: boolean;
};

const empty: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  instagram_handle: "",
  interests: [],
  consent_marketing: false,
};

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | undefined>();
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeBack, setWelcomeBack] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback((src?: string) => {
    setSource(src);
    setForm(empty);
    setDone(false);
    setError(null);
    setWelcomeBack(false);
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

  const toggleInterest = (i: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter((x) => x !== i)
        : [...f.interests, i],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }
    setSubmitting(true);
    const { data: inserted, error: insertError } = await supabase
      .from("community_members")
      .insert({
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
        city: parsed.data.city || null,
        instagram_handle: parsed.data.instagram_handle || null,
        interests: parsed.data.interests,
        source: source ?? "website",
        consent_marketing: parsed.data.consent_marketing,
      })
      .select("id, first_name")
      .single();
    setSubmitting(false);
    if (insertError || !inserted) {
      if (insertError?.code === "23505") {
        setWelcomeBack(true);
        toast.success(`Welcome back, ${parsed.data.first_name}.`, {
          description: "You're already part of the B.MARC community",
          duration: 6000,
        });
        return;
      }
      setError(insertError?.message || "Something went wrong. Please try again.");
      return;
    }
    toast.success(`Welcome, ${inserted.first_name}.`, {
      description: "Your place in the B.MARC community is confirmed",
      duration: 6000,
    });
    setDone(true);
  };

  return (
    <CommunityContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Join the Community"
        >
          <button
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-espresso/55 backdrop-blur-md animate-fade-in"
          />

          <div
            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-tan/30 bg-ivory shadow-[0_40px_120px_-30px_oklch(0.28_0.035_40_/_0.55)] animate-scale-in"
            style={{ animationDuration: "0.4s" }}
          >
            <div className="flex items-start justify-between gap-6 px-6 sm:px-10 pt-7 pb-5 border-b border-tan/25 bg-gradient-to-b from-sand/60 to-ivory">
              <div className="min-w-0">
                <span className="eyebrow">Community</span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-espresso">
                  Join the B.MARC Community
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Movement, connection, and intentional living for modern women.
                </p>
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

            <div className="overflow-y-auto px-6 sm:px-10 py-8">
              {done ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-14 w-14 rounded-full bg-espresso text-ivory flex items-center justify-center">
                    <Check size={22} />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl text-espresso">Welcome to the B.MARC community.</h3>
                  <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    You'll be the first to know about upcoming events and experiences.
                  </p>
                  <button onClick={close} className="btn-luxe btn-luxe-hover mt-8">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First name *">
                      <input
                        required
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        maxLength={80}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last name *">
                      <input
                        required
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        maxLength={80}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Email *">
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      maxLength={255}
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        maxLength={40}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="City">
                      <input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        maxLength={120}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Instagram handle">
                    <input
                      placeholder="@yourhandle"
                      value={form.instagram_handle}
                      onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
                      maxLength={80}
                      className={inputClass}
                    />
                  </Field>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.24em] text-clay mb-3">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((i) => {
                        const active = form.interests.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleInterest(i)}
                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition-all ${
                              active
                                ? "bg-espresso text-ivory border-espresso"
                                : "bg-transparent text-espresso border-tan/50 hover:border-espresso"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent_marketing}
                      onChange={(e) =>
                        setForm({ ...form, consent_marketing: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 accent-espresso"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to receive occasional B.MARC Pilates updates about events,
                      community experiences, and wellness content. No spam.
                    </span>
                  </label>

                  {error && (
                    <p className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-luxe btn-luxe-hover w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Joining…" : "Join the Community"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </CommunityContext.Provider>
  );
}

const inputClass =
  "w-full bg-ivory border border-tan/40 rounded-lg px-4 py-3 text-sm text-espresso placeholder:text-clay/60 focus:outline-none focus:border-espresso transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.24em] text-clay mb-2">{label}</span>
      {children}
    </label>
  );
}
