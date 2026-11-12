import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInEmail, signInGoogle } from "@/lib/portal";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/portal_/login")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Portal Login at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Sign in — B.MARC Member Portal" },
      { property: "og:description", content: "Explore Portal Login at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },{ title: "Sign in — B.MARC Member Portal" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: PortalLogin,
});

function PortalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await signInEmail(email, pw);
    setLoading(false);
    if (error) setErr(error.message);
    else navigate({ to: "/portal" });
  };

  const google = async () => {
    setErr(null); setGLoading(true);
    const { error } = await signInGoogle();
    if (error) { setErr(error.message); setGLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-tan/30 rounded-2xl p-8 shadow-sm">
        <Link to="/" className="font-serif tracking-[0.3em] text-sm text-clay">B.MARC</Link>
        <h1 className="font-serif text-2xl mt-3 text-espresso">Member sign in</h1>
        <p className="text-sm text-clay mt-1">Welcome back to the community.</p>

        <button onClick={google} disabled={gLoading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full border border-tan/40 py-3 text-sm hover:bg-sand disabled:opacity-60">
          {gLoading ? <Loader2 size={14} className="animate-spin" /> : <span className="text-base">G</span>} Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-clay">
          <div className="h-px flex-1 bg-tan/30" /> or <div className="h-px flex-1 bg-tan/30" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30" />
          <input type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" minLength={6}
            className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] py-3 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/portal/forgot-password" className="text-clay hover:text-espresso underline">
            Forgot password?
          </Link>
        </p>

        <p className="mt-3 text-sm text-clay text-center">
          New here? <Link to="/portal/signup" className="underline text-espresso">Create account</Link>
        </p>
      </div>
    </div>
  );
}
