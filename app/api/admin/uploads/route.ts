import { env } from "cloudflare:workers";
import { apiError, ApiError, requireAdmin, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    if (Number(request.headers.get("content-length")) > 8 * 1024 * 1024 + 10000) throw new ApiError("Photos must be smaller than 8 MB.");
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024 || file.size === 0) throw new ApiError("Choose an image smaller than 8 MB.");
    const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
    if (!extension) throw new ApiError("Choose a JPG, PNG or WebP photo.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signatureValid = extension === "jpg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : extension === "png" ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 : String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
    if (!signatureValid) throw new ApiError("The file is not a valid JPG, PNG or WebP photo.");
    const key = `${crypto.randomUUID()}.${extension}`;
    await env.BUCKET!.put(key, bytes, { httpMetadata: { contentType: file.type } });
    return Response.json({ url: `/media/${key}` }, { status: 201 });
  } catch (e) { return apiError(e); }
}
