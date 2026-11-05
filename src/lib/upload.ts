import { api } from "@/lib/api/client";

/** Uploads an image for the console settings (PNG / JPEG / SVG, max 2 MB) and resolves with its hosted URL. */
export async function uploadConsoleImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return api.post<{ url: string }>("/saas/owner/console-settings/upload", form);
}
