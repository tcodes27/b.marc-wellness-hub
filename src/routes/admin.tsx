import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, type CommunityMember, MEMBER_STATUSES } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Tags,
  Download,
  Settings as SettingsIcon,
  PenSquare,
  LogOut,
  Loader2,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "B.MARC Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

type AdminCtx = {
  userId: string;
  members: CommunityMember[];
  reloadMembers: () => Promise<void>;
};

const AdminContext = createContext<AdminCtx | null>(null);
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside admin layout");
  return ctx;
}

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Community Members", icon: Users },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/leads", label: "Leads / Tags", icon: Tags },
  { to: "/admin/content", label: "Content Studio", icon: PenSquare },
  { to: "/admin/exports", label: "Exports", icon: Download },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[admin] loadMembers error:", error);
        setBootError(`community_members: ${error.message}`);
      }
      setMembers((data ?? []) as CommunityMember[]);
    } catch (err: any) {
      console.error("[admin] loadMembers threw:", err);
      setBootError(`community_members threw: ${err?.message ?? String(err)}`);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.error("[admin] getSession error:", sessionErr);
          setBootError(`getSession: ${sessionErr.message}`);
        }
        if (!sessionData.session) {
          navigate({ to: "/admin_/login" });
          return;
        }
        const uid = sessionData.session.user.id;
        const { data: isAdminRpc, error: roleErr } = await supabase.rpc("has_role", {
          _user_id: uid,
          _role: "admin",
        });
        if (roleErr) {
          console.error("[admin] has_role error:", roleErr);
          setBootError(
            `has_role: ${roleErr.message} (code ${roleErr.code ?? "?"}). ` +
              `Did you run db/admin_roles.sql in your Supabase SQL editor?`
          );
          if (!cancelled) {
            setIsAdmin(false);
            setAuthChecked(true);
          }
          return;
        }
        if (cancelled) return;
        if (!isAdminRpc) {
          setIsAdmin(false);
          setAuthChecked(true);
          return;
        }
        setUserId(uid);
        setIsAdmin(true);
        setAuthChecked(true);
        await loadMembers();
      } catch (err: any) {
        console.error("[admin] auth bootstrap threw:", err);
        setBootError(`bootstrap threw: ${err?.message ?? String(err)}`);
        if (!cancelled) setAuthChecked(true);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) navigate({ to: "/admin_/login" });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin_/login" });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Loader2 className="animate-spin text-clay" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
        <div className="max-w-lg text-center bg-white border border-tan/30 rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-2xl text-espresso">Not authorized</h1>
          <p className="mt-2 text-sm text-clay">
            Your account doesn't have admin access. Contact the site owner to be granted the admin role.
          </p>
          {bootError && (
            <pre className="mt-4 text-left text-xs bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 whitespace-pre-wrap break-words">
              {bootError}
            </pre>
          )}
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <AdminContext.Provider value={{ userId, members, reloadMembers: loadMembers }}>
      <div className="min-h-screen bg-ivory text-espresso flex">
        {/* Sidebar */}
        <aside
          className={`${
            navOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-sand/40 border-r border-tan/30 flex flex-col transition-transform`}
        >
          <div className="px-6 py-6 border-b border-tan/30">
            <Link to="/" className="font-serif text-lg tracking-[0.3em]">
              B.MARC
            </Link>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-clay mt-1">Admin Studio</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, (item as any).exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-espresso text-ivory shadow-sm"
                      : "text-espresso hover:bg-sand"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-tan/30">
            <button
              onClick={signOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-tan/40 text-sm py-2.5 hover:bg-ivory transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>

        {navOpen && (
          <button
            className="fixed inset-0 z-30 bg-espresso/40 md:hidden"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="md:hidden sticky top-0 z-20 bg-ivory/95 backdrop-blur border-b border-tan/30 px-4 h-14 flex items-center justify-between">
            <button onClick={() => setNavOpen((v) => !v)} className="p-2 rounded-lg hover:bg-sand">
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="font-serif tracking-[0.25em] text-sm">B.MARC ADMIN</span>
            <span className="w-8" />
          </header>

          <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
            {bootError && (
              <pre className="mb-4 text-xs bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 whitespace-pre-wrap break-words">
                {bootError}
              </pre>
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

export const ADMIN_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-800",
  VIP: "bg-purple-100 text-purple-700",
  "Event Attendee": "bg-emerald-100 text-emerald-700",
  "Sponsor Lead": "bg-rose-100 text-rose-700",
  Archived: "bg-slate-200 text-slate-600",
};

export const ALL_MEMBER_STATUSES = MEMBER_STATUSES;
