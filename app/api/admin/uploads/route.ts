import { putPhoto } from "@/lib/photo-storage";
import { apiError, ApiError, readRequestBytes, requireAdmin, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const contentType = request.headers.get("content-type") || "";
    if (!/^multipart\/form-data;/i.test(contentType)) throw new ApiError("Choose a photo to upload.",415);
    const body = await readRequestBytes(request,8*1024*1024+65536);
    let form: FormData;
    try { form = await new Response(body,{headers:{"Content-Type":contentType}}).formData(); }
    catch { throw new ApiError("The photo upload could not be read. Please try again."); }
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024 || file.size === 0) throw new ApiError("Choose an image smaller than 8 MB.");
    // Originals are never persisted: the editor converts before transfer.
    if (file.type !== "image/webp") throw new ApiError("Upload photos through the listing editor so they are converted to WebP first.",415);
    const extension = "webp";
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signatureValid = String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
    const complete = bytes.length>=20 && new DataView(bytes.buffer).getUint32(4,true)+8===bytes.length && ["VP8 ","VP8L","VP8X"].includes(String.fromCharCode(...bytes.slice(12,16)));
    if (!signatureValid || !complete) throw new ApiError("The file is not a valid WebP photo.");
    const key = `${crypto.randomUUID()}.${extension}`;
    await putPhoto(key, bytes);
    return Response.json({ url: `/media/${key}` }, { status: 201 });
  } catch (e) { return apiError(e); }
}
