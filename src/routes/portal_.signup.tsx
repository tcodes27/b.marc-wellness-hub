import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signUpEmail, signInGoogle } from "@/lib/portal";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/portal_/signup")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Portal Signup at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Create account — B.MARC Member Portal" },
      { property: "og:description", content: "Explore Portal Signup at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },{ title: "Create account — B.MARC Member Portal" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: PortalSignup,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
});

function PortalSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/portal" }); });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setInfo(null);
    const parsed = schema.safeParse({ full_name: fullName, email, password: pw });
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { data, error } = await signUpEmail(parsed.data.email, parsed.data.password, parsed.data.full_name);
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (data.session) navigate({ to: "/portal" });
    else setInfo("Check your email to confirm your account, then sign in.");
  };

  const google = async () => {
    setErr(null); setGLoading(true);
    const { error } = await signInGoogle();
    if (error) { setErr(error.message); setGLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-tan/30 rounded-2xl p-8 shadow-sm">
        <Link to="/" className="font-serif tracking-[0.3em] text-sm text-clay">B.MARC</Link>
        <h1 className="font-serif text-2xl mt-3 text-espresso">Create your account</h1>
        <p className="text-sm text-clay mt-1">Join the B.MARC community.</p>

        <button onClick={google} disabled={gLoading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full border border-tan/40 py-3 text-sm hover:bg-sand disabled:opacity-60">
          {gLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="text-base">G</span>} Sign up with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-clay">
          <div className="h-px flex-1 bg-tan/30" /> or <div className="h-px flex-1 bg-tan/30" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name"
            className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30" />
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30" />
          <input type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="Password (min 8)" minLength={8}
            className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] py-3 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Create account
          </button>
          <p className="text-[0.65rem] text-clay text-center">
            Tip: use <code>you+test@domain.com</code> or <code>demo@…</code> to auto-flag as test data.
          </p>
        </form>

        <p className="mt-5 text-sm text-clay text-center">
          Already have an account? <Link to="/portal/login" className="underline text-espresso">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
