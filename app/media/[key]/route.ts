import { getPhoto } from "@/lib/photo-storage";
export async function GET(_: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key)) return new Response("Not found", { status: 404 });
  const file = await getPhoto(key);
  if (!file) return new Response("Not found", { status: 404 });
  const headers = new Headers(); file.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable"); headers.set("X-Content-Type-Options", "nosniff");
  return new Response(file.body, { headers });
}
