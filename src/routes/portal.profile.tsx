import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePortal } from "./portal";
import { updateProfile } from "@/lib/portal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/portal/profile")({
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Required").max(100),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  avatar_url: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

function ProfilePage() {
  const { userId, profile, reload } = usePortal();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAvatar(profile?.avatar_url ?? "");
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse({ full_name: fullName, phone, avatar_url: avatar });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const { error } = await updateProfile(userId, {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
        avatar_url: parsed.data.avatar_url || null,
      });
      if (error) throw error;
      await reload();
      toast.success("Profile saved");
    } catch (e: any) {
      setErr(e?.message ?? "Could not save");
      toast.error("Save failed", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Account</p>
        <h1 className="font-serif text-3xl mt-2">Your profile</h1>
      </div>

      <form onSubmit={submit} className="space-y-4 bg-white border border-tan/30 rounded-2xl p-6">
        <Field label="Full name" value={fullName} onChange={setFullName} required />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+1…" />
        <Field label="Avatar URL" value={avatar} onChange={setAvatar} placeholder="https://…" />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-6 py-3 disabled:opacity-60">
          {saving && <Loader2 size={14} className="animate-spin" />} Save changes
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-clay">{label}</span>
      <input className="mt-1.5 w-full rounded-xl border border-tan/40 bg-ivory px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/30"
        value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </label>
  );
}
