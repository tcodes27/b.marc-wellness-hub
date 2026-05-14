import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email().max(255),
});

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email });
    if (!r.success) {
      setErr("Please enter a valid email.");
      return;
    }
    setErr(null);
    setLoading(true);
    const value = r.data.email.toLowerCase();
    const { error } = await supabase.from("community_members").insert({
      first_name: "Newsletter",
      last_name: "Subscriber",
      email: value,
      source: "newsletter",
      consent_marketing: true,
    });
    setLoading(false);
    if (error && error.code !== "23505") {
      setErr(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="rounded-[2.5rem] bg-espresso text-ivory px-6 py-20 md:p-24 text-center relative overflow-hidden">
          <div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-tan/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-clay/20 blur-3xl" />

          <div className="relative max-w-2xl mx-auto">
            <span className="eyebrow !text-tan">Newsletter</span>
            <h2 className="mt-5 text-4xl md:text-6xl text-ivory leading-[1.05]">
              Join the <em className="font-light">B.MARC</em> Community
            </h2>
            <p className="mt-6 text-ivory/75 max-w-lg mx-auto leading-relaxed">
              Get wellness updates, event access, and exclusive movement experiences delivered with intention.
            </p>

            {done ? (
              <div className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em]">
                <Check size={18} /> You're in. Welcome home.
              </div>
            ) : (
              <form onSubmit={submit} className="mt-10 max-w-md mx-auto">
                <div className="flex items-center bg-ivory/10 border border-ivory/25 rounded-full p-1.5 backdrop-blur-md focus-within:border-ivory/60 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    maxLength={255}
                    className="flex-1 bg-transparent px-5 py-3 text-sm placeholder:text-ivory/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="size-12 rounded-full bg-ivory text-espresso flex items-center justify-center hover:bg-tan hover:text-ivory transition-all duration-500 disabled:opacity-60"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                {err && <p className="mt-3 text-sm text-tan">{err}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
