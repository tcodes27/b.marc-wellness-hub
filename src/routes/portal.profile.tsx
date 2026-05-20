import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { usePortal } from "./portal";
import { updateProfile } from "@/lib/portal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, User as UserIcon } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/portal/profile")({
  component: ProfilePage,
});

const AVATAR_BUCKET = "profile-avatars";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

function ProfilePage() {
  const { userId, profile, reload } = usePortal();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  const persistAvatar = async (nextUrl: string | null) => {
    if (!userId) throw new Error("You are not signed in");
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: nextUrl })
      .eq("id", userId);
    if (error) throw error;
  };

  const handleFile = async (file: File) => {
    setErr(null);
    if (!userId) {
      setErr("You are not signed in");
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setErr("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Image must be 5MB or smaller");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      await persistAvatar(publicUrl);
      setAvatarUrl(publicUrl);
      await reload();
      toast.success("Profile photo updated");
    } catch (e: any) {
      if (import.meta.env.DEV) console.error("[profile] avatar upload", e);
      setErr(e?.message ?? "Upload failed");
      toast.error("Upload failed", { description: e?.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAvatar = async () => {
    if (!userId) return;
    setUploading(true);
    setErr(null);
    try {
      await persistAvatar(null);
      setAvatarUrl(null);
      await reload();
      toast.success("Profile photo removed");
    } catch (e: any) {
      if (import.meta.env.DEV) console.error("[profile] avatar remove", e);
      setErr(e?.message ?? "Could not remove photo");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!userId) {
      setErr("You are not signed in");
      return;
    }
    const parsed = schema.safeParse({ full_name: fullName, phone });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const { error } = await updateProfile(userId, {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone ? parsed.data.phone : null,
      });
      if (error) throw error;
      await reload();
      toast.success("Profile saved");
    } catch (e: any) {
      if (import.meta.env.DEV) console.error("[profile] save", e);
      const msg = e?.message ?? "Could not save";
      setErr(msg);
      toast.error("Save failed", { description: msg });
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

      {/* Avatar block */}
      <div className="bg-white border border-tan/30 rounded-2xl p-6 flex items-center gap-5">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-sand flex items-center justify-center border border-tan/40">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName ? `${fullName}'s profile photo` : "Your profile photo"} className="h-full w-full object-cover" />
          ) : (
            <UserIcon size={28} className="text-clay" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm">Profile photo</p>
          <p className="text-xs text-clay">JPG, PNG, or WebP. Max 5MB.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-tan/40 hover:bg-sand disabled:opacity-60"
            >
              <Upload size={12} /> {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 bg-white border border-tan/30 rounded-2xl p-6">
        <Field label="Full name" value={fullName} onChange={setFullName} required />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+1…" />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button type="submit" disabled={saving || !userId}
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
