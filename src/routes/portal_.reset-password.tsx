import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/portal_/reset-password")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Portal Reset-Password at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Set new password — B.MARC Member Portal" },
      { property: "og:description", content: "Explore Portal Reset-Password at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Set new password — B.MARC Member Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase places the recovery token in the URL hash. The client picks it
    // up via onAuthStateChange / detectSessionInUrl and emits PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    // Fallback: if we already have a session shortly after mount, allow the form.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      else if (!window.location.hash.includes("access_token")) setInvalid(true);
    }, 800);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => navigate({ to: "/portal/login" }), 1500);
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-tan/30 rounded-2xl p-8 shadow-sm">
        <Link to="/" className="font-serif tracking-[0.3em] text-sm text-clay">B.MARC</Link>
        <h1 className="font-serif text-2xl mt-3 text-espresso">Set a new password</h1>

        {invalid && !ready ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-red-700">
              This reset link is invalid or has expired.
            </p>
            <Link
              to="/portal/forgot-password"
              className="inline-flex items-center justify-center w-full rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] py-3"
            >
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="mt-6 rounded-xl border border-tan/30 bg-sand/40 p-4 text-sm text-espresso">
            <p className="font-serif text-base">Password updated.</p>
            <p className="mt-1 text-clay">Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30"
            />
            <input
              type="password"
              required
              minLength={8}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30"
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading || (!ready && !invalid)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] py-3 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {ready ? "Update password" : "Verifying link…"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
