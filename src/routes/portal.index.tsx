import { createFileRoute, Link } from "@tanstack/react-router";
import { usePortal } from "./portal";

export const Route = createFileRoute("/portal/")({
  component: PortalHome,
});

function PortalHome() {
  const { profile, email } = usePortal();
  const name = profile?.full_name?.trim() || email.split("@")[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Welcome back</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-2">{name}</h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Account type" value={profile?.account_type ?? "customer"} />
        <StatCard label="Community status" value={profile?.community_status ?? "Active"} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <QuickLink to="/portal/profile" title="Edit profile" desc="Update your name, phone, and avatar." />
        <QuickLink to="/portal/events" title="My events" desc="See classes & events you've registered for." />
        <QuickLink to="/portal/content" title="Member content" desc="Read the latest from B.MARC studio." />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white border border-tan/30 p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-clay">{label}</p>
      <p className="mt-2 font-serif text-xl capitalize">{value}</p>
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="block rounded-2xl bg-sand/40 border border-tan/30 p-5 hover:bg-sand transition">
      <p className="font-serif text-lg">{title}</p>
      <p className="text-sm text-clay mt-1">{desc}</p>
    </Link>
  );
}
