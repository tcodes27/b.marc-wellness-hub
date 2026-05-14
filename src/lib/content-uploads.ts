import { supabase } from "@/integrations/supabase/client";

const IMAGE_BUCKET = "content-images";
const VIDEO_BUCKET = "content-videos";
const AUDIO_BUCKET = "content-audio";

const IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_MIME = ["video/mp4", "video/quicktime", "video/mov"];
const AUDIO_MIME = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/x-m4a", "audio/mp4"];

async function uploadTo(bucket: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadContentImage(file: File): Promise<string> {
  return uploadTo(IMAGE_BUCKET, file);
}
export async function uploadContentVideo(file: File): Promise<string> {
  return uploadTo(VIDEO_BUCKET, file);
}
export async function uploadContentAudio(file: File): Promise<string> {
  return uploadTo(AUDIO_BUCKET, file);
}

type Kind = "image" | "video" | "audio";

function acceptFor(kind: Kind) {
  if (kind === "image") return "image/jpeg,image/png,image/webp";
  if (kind === "video") return "video/mp4,video/quicktime";
  return "audio/mpeg,audio/wav,audio/mp4,audio/x-m4a";
}

function validateMime(kind: Kind, file: File) {
  const list = kind === "image" ? IMAGE_MIME : kind === "video" ? VIDEO_MIME : AUDIO_MIME;
  if (file.type && !list.includes(file.type)) {
    throw new Error(`Unsupported ${kind} type: ${file.type}`);
  }
}

async function pickAndUpload(kind: Kind, multiple = false): Promise<string[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptFor(kind);
    if (multiple) input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) return resolve([]);
      const urls: string[] = [];
      for (const f of files) {
        try {
          validateMime(kind, f);
          const url =
            kind === "image" ? await uploadContentImage(f)
            : kind === "video" ? await uploadContentVideo(f)
            : await uploadContentAudio(f);
          urls.push(url);
        } catch (e) {
          alert(`Upload failed: ${(e as Error).message}`);
        }
      }
      resolve(urls);
    };
    input.click();
  });
}

// Back-compat single-image picker used by the rich editor.
export async function pickAndUploadImage(): Promise<string | null> {
  const urls = await pickAndUpload("image", false);
  return urls[0] ?? null;
}

export async function pickAndUploadImages(): Promise<string[]> {
  return pickAndUpload("image", true);
}

export async function pickAndUploadVideos(): Promise<string[]> {
  return pickAndUpload("video", true);
}

export async function pickAndUploadAudio(): Promise<string[]> {
  return pickAndUpload("audio", true);
}
