import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Admin Login at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Admin Login, B.MARC Pilates" },
      { property: "og:description", content: "Explore Admin Login at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Admin Login, B.MARC Pilates" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("[admin-auth] login mount", {
        hasSession: !!data.session,
        userId: data.session?.user.id ?? null,
      });
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const maskEmail = (e: string) => {
    const [user, domain] = e.split("@");
    if (!domain) return "***";
    return `${user.slice(0, 1)}***@${domain}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log("[admin-auth] signIn attempt", { email: maskEmail(email) });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    console.log("[admin-auth] signIn result", {
      ok: !error,
      userId: data?.user?.id ?? null,
      error: error?.message ?? null,
    });
    if (error) {
      setError(error.message);
      return;
    }
    console.log("[admin-auth] signIn success, navigating to /admin");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-lg tracking-[0.3em] text-slate-900">
            B.MARC
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your community</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
