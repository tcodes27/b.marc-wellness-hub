import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/portal_/forgot-password")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Portal Forgot-Password at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Reset password — B.MARC Member Portal" },
      { property: "og:description", content: "Explore Portal Forgot-Password at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Reset password — B.MARC Member Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/portal/reset-password`,
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-tan/30 rounded-2xl p-8 shadow-sm">
        <Link to="/" className="font-serif tracking-[0.3em] text-sm text-clay">B.MARC</Link>
        <h1 className="font-serif text-2xl mt-3 text-espresso">Reset your password</h1>
        <p className="text-sm text-clay mt-1">
          Enter your email and we'll send you a secure reset link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-tan/30 bg-sand/40 p-4 text-sm text-espresso">
            <p className="font-serif text-base">Check your inbox.</p>
            <p className="mt-1 text-clay">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30"
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] py-3 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />} Send reset link
            </button>
          </form>
        )}

        <p className="mt-5 text-sm text-clay text-center">
          <Link to="/portal/login" className="underline text-espresso">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
