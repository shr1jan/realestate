import { env } from "cloudflare:workers";
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
    const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
    if (!extension) throw new ApiError("Choose a JPG, PNG or WebP photo.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signatureValid = extension === "jpg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : extension === "png" ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 : String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
    const complete = extension === "jpg" ? bytes.length>=20 && bytes.at(-2)===255 && bytes.at(-1)===217
      : extension === "png" ? bytes.length>=45 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v) && String.fromCharCode(...bytes.slice(12,16))==="IHDR" && String.fromCharCode(...bytes.slice(-8,-4))==="IEND"
      : bytes.length>=20 && new DataView(bytes.buffer).getUint32(4,true)+8===bytes.length && ["VP8 ","VP8L","VP8X"].includes(String.fromCharCode(...bytes.slice(12,16)));
    if (!signatureValid || !complete) throw new ApiError("The file is not a valid JPG, PNG or WebP photo.");
    const key = `${crypto.randomUUID()}.${extension}`;
    await env.BUCKET!.put(key, bytes, { httpMetadata: { contentType: file.type } });
    return Response.json({ url: `/media/${key}` }, { status: 201 });
  } catch (e) { return apiError(e); }
}
