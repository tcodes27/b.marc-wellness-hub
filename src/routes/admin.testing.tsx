import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "./admin";
import { SETUP_FILES } from "@/lib/db-setup.functions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, CircleDashed, Loader2, Database, ExternalLink, Copy, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/testing")({
  component: TestingPage,
});

type Check = {
  id: string;
  label: string;
  description: string;
  run?: () => Promise<{ ok: boolean; detail?: string }>;
  manualHref?: string;
};

function TestingPage() {
  const { userId } = useAdmin();
  const storageKey = `bmarc.testing.${userId || "anon"}`;

  const [results, setResults] = useState<Record<string, { ok: boolean; detail?: string } | "running">>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { setManual(JSON.parse(localStorage.getItem(storageKey) || "{}")); } catch {}
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(manual)); } catch {}
  }, [manual, storageKey]);

  const checks: Check[] = useMemo(() => [
    {
      id: "supabase_session",
      label: "Supabase session is live",
      description: "Verifies admin session is hydrated.",
      run: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return { ok: false, detail: error.message };
        return { ok: !!data.session, detail: data.session?.user.email ?? "no session" };
      },
    },
    {
      id: "has_role_admin",
      label: "has_role('admin') returns true",
      description: "Confirms RLS admin gate works.",
      run: async () => {
        if (!userId) return { ok: false, detail: "No authenticated user — sign in as admin first." };
        const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        if (error) return { ok: false, detail: error.message };
        return { ok: !!data, detail: String(data) };
      },
    },
    {
      id: "diag_write_read",
      label: "Supabase write + read (_diagnostics)",
      description: "Inserts and reads a row to confirm RW.",
      run: async () => {
        if (!userId) return { ok: false, detail: "No authenticated user — sign in as admin first." };
        const { data: ins, error: insErr } = await supabase
          .from("_diagnostics").insert({ created_by: userId, note: `ping ${Date.now()}` }).select().single();
        if (insErr) return { ok: false, detail: `insert: ${insErr.message}` };
        const { error: selErr } = await supabase.from("_diagnostics").select("id").eq("id", ins.id).single();
        if (selErr) return { ok: false, detail: `select: ${selErr.message}` };
        await supabase.from("_diagnostics").delete().eq("id", ins.id);
        return { ok: true, detail: "RW OK" };
      },
    },
    {
      id: "profiles_table",
      label: "profiles table reachable",
      description: "Reads from public.profiles (admin policy).",
      run: async () => {
        const { error, count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
        if (error) return { ok: false, detail: error.message };
        return { ok: true, detail: `${count ?? 0} rows` };
      },
    },
    {
      id: "event_regs_table",
      label: "event_registrations table reachable",
      description: "Reads from public.event_registrations.",
      run: async () => {
        const { error, count } = await supabase.from("event_registrations").select("id", { count: "exact", head: true });
        if (error) return { ok: false, detail: error.message };
        return { ok: true, detail: `${count ?? 0} rows` };
      },
    },
    {
      id: "community_count",
      label: "community_members reachable",
      description: "Confirms CRM core table.",
      run: async () => {
        const { error, count } = await supabase.from("community_members").select("id", { count: "exact", head: true });
        if (error) return { ok: false, detail: error.message };
        return { ok: true, detail: `${count ?? 0} members` };
      },
    },
    { id: "public_signup", label: "Public community signup form works", description: "Open homepage, submit the email signup, see success toast.", manualHref: "/" },
    { id: "portal_signup", label: "Member can create a portal account", description: "Open /portal/signup, create test account with +test@ email.", manualHref: "/portal/signup" },
    { id: "portal_login", label: "Member can log in", description: "Sign in at /portal/login after confirming email.", manualHref: "/portal/login" },
    { id: "portal_profile", label: "Member can update profile", description: "Edit name/phone in /portal/profile, save, refresh.", manualHref: "/portal/profile" },
    { id: "admin_sees_new", label: "Admin sees new account in profiles", description: "Filter /admin/members by Real vs Demo.", manualHref: "/admin/members" },
    { id: "content_publish", label: "Published member content shows in portal", description: "Publish a post with visibility=members; confirm in /portal/content.", manualHref: "/admin/content" },
    { id: "event_create", label: "Event creation flow works", description: "Create an event; appears in /admin/events.", manualHref: "/admin/events" },
    { id: "session_persist", label: "Logout/login session persistence", description: "Sign out of portal, sign back in, session sticks across reload.", manualHref: "/portal/login" },
  ], [userId]);

  const runOne = async (id: string, fn: () => Promise<{ ok: boolean; detail?: string }>) => {
    setResults(r => ({ ...r, [id]: "running" }));
    try {
      const out = await fn();
      setResults(r => ({ ...r, [id]: out }));
    } catch (e: any) {
      setResults(r => ({ ...r, [id]: { ok: false, detail: e?.message ?? String(e) } }));
    }
  };

  const runAll = async () => {
    for (const c of checks) if (c.run) await runOne(c.id, c.run);
  };

  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const copySql = async (name: string, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedFile(name);
      toast.success(`${name} copied`);
      setTimeout(() => setCopiedFile((c) => (c === name ? null : c)), 1500);
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Pre-launch</p>
        <h1 className="font-serif text-3xl mt-2">Testing & readiness</h1>
        <p className="text-sm text-clay mt-2 max-w-2xl">
          Run automated probes and walk through the manual flows below. This environment runs on real data only — no demo seeding.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-800">Database setup</p>
            <h2 className="font-serif text-xl mt-1 text-espresso">Manual SQL setup only</h2>
            <p className="text-sm text-clay mt-1 max-w-2xl">
              For security, database setup cannot be executed from the deployed website. Open the
              Supabase SQL Editor and run each file below in order. All scripts are idempotent and safe to re-run.
            </p>
          </div>
        </div>

        <ol className="space-y-2">
          {SETUP_FILES.map((f, i) => (
            <li key={f.name} className="flex items-center gap-3 bg-white border border-tan/30 rounded-xl px-4 py-3">
              <span className="text-xs font-mono text-clay w-6">{i + 1}.</span>
              <span className="font-mono text-sm flex-1">{f.name}</span>
              <button
                onClick={() => copySql(f.name, f.sql)}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-tan/40 hover:bg-sand"
              >
                <Copy size={12} /> {copiedFile === f.name ? "Copied" : "Copy SQL"}
              </button>
            </li>
          ))}
        </ol>

        <a
          href="https://supabase.com/dashboard/project/_/sql/new"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-espresso underline"
        >
          Open Supabase SQL Editor <ExternalLink size={12} />
        </a>
      </section>


      <div className="flex flex-wrap gap-2">
        <button onClick={runAll} className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5">
          <Database size={14} /> Run all probes
        </button>
      </div>


      <div className="bg-white border border-tan/30 rounded-2xl divide-y divide-tan/20">
        {checks.map(c => {
          const r = results[c.id];
          const done = manual[c.id];
          return (
            <div key={c.id} className="p-4 sm:p-5 flex items-start gap-4">
              <button
                onClick={() => setManual(m => ({ ...m, [c.id]: !m[c.id] }))}
                className="mt-0.5 shrink-0"
                aria-label="Mark complete"
              >
                {done ? <CheckCircle2 className="text-emerald-600" /> : <CircleDashed className="text-clay" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-serif text-base ${done ? "line-through text-clay" : ""}`}>{c.label}</p>
                <p className="text-sm text-clay mt-0.5">{c.description}</p>
                {r && r !== "running" && (
                  <p className={`mt-2 text-xs flex items-center gap-1 ${r.ok ? "text-emerald-700" : "text-red-700"}`}>
                    {r.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {r.detail || (r.ok ? "OK" : "Failed")}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {c.run && (
                  <button onClick={() => runOne(c.id, c.run!)}
                    className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-tan/40 hover:bg-sand disabled:opacity-60"
                    disabled={r === "running"}>
                    {r === "running" ? <Loader2 size={12} className="animate-spin" /> : "Run"}
                  </button>
                )}
                {c.manualHref && (
                  <a href={c.manualHref} target="_blank" rel="noreferrer"
                    className="text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-tan/40 hover:bg-sand inline-flex items-center gap-1">
                    Open <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <footer className="text-xs text-clay">
        Run the SQL in <code>db/portal_and_testing.sql</code> first, then click "Run all probes". Manual checks are saved in your browser.
      </footer>
    </div>
  );
}
