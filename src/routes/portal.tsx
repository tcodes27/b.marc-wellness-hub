import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Loader2, User as UserIcon, CalendarDays, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, upsertOwnProfile, type Profile } from "@/lib/portal";
import { toast } from "sonner";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { name: "description", content: "Explore Portal at B.MARC Pilates, a movement and wellness community." },
      { property: "og:title", content: "Member Portal — B.MARC" },
      { property: "og:description", content: "Explore Portal at B.MARC Pilates, a movement and wellness community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Member Portal — B.MARC" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalLayout,
});

type Ctx = { userId: string; email: string; profile: Profile | null; reload: () => Promise<void> };
const PortalCtx = createContext<Ctx>({ userId: "", email: "", profile: null, reload: async () => {} });
export const usePortal = () => useContext(PortalCtx);

const NAV = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/portal/profile", label: "Profile", icon: UserIcon },
  { to: "/portal/events", label: "My Events", icon: CalendarDays },
  { to: "/portal/content", label: "Member Content", icon: BookOpen },
];

function PortalLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [checked, setChecked] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = async (uid: string, mail: string) => {
    try {
      let p = await getProfile(uid);
      if (!p) {
        await upsertOwnProfile(uid, mail);
        p = await getProfile(uid);
      }
      setProfile(p);
    } catch (e: any) {
      console.error("[portal] loadProfile", e);
      toast.error("Couldn't load your profile", { description: e?.message });
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/portal/login" });
        return;
      }
      if (cancelled) return;
      setUserId(data.session.user.id);
      setEmail(data.session.user.email ?? "");
      await load(data.session.user.id, data.session.user.email ?? "");
      setChecked(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/portal/login" });
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/portal/login" });
  };

  const reload = async () => { if (userId) await load(userId, email); };

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center bg-ivory"><Loader2 className="animate-spin text-clay" /></div>;
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <PortalCtx.Provider value={{ userId, email, profile, reload }}>
      <div className="min-h-screen bg-ivory text-espresso flex">
        <aside className="hidden md:flex sticky top-0 h-screen w-64 bg-sand/40 border-r border-tan/30 flex-col">
          <div className="px-6 py-6 border-b border-tan/30">
            <Link to="/" className="font-serif text-lg tracking-[0.3em]">B.MARC</Link>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-clay mt-1">Member Portal</p>
            {profile?.is_test_account && (
              <span className="mt-2 inline-block text-[0.6rem] uppercase tracking-[0.2em] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Demo Account</span>
            )}
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1">
            {NAV.map(({ to, label, icon: Icon, exact }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive(to, exact) ? "bg-espresso text-ivory" : "text-espresso hover:bg-sand"
                }`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-tan/30 space-y-2">
            <div className="text-xs text-clay truncate" title={email}>{email}</div>
            <button onClick={signOut} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-tan/40 text-sm py-2.5 hover:bg-ivory">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="md:hidden sticky top-0 z-20 bg-ivory/95 backdrop-blur border-b border-tan/30 px-4 h-14 flex items-center justify-between">
            <span className="font-serif tracking-[0.25em] text-sm">B.MARC PORTAL</span>
            <button onClick={signOut} className="text-xs uppercase tracking-[0.2em] text-clay">Sign out</button>
          </header>

          {/* Mobile nav */}
          <nav className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-tan/30 bg-ivory">
            {NAV.map(({ to, label, exact }) => (
              <Link key={to} to={to}
                className={`whitespace-nowrap text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
                  isActive(to, exact) ? "bg-espresso text-ivory border-espresso" : "border-tan/40 text-espresso"
                }`}>{label}</Link>
            ))}
          </nav>

          <main className="flex-1 p-5 sm:p-8 max-w-5xl w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </PortalCtx.Provider>
  );
}
