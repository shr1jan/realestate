import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { listings, savedHomes } from "@/db/schema";
import { getAdminUser } from "@/lib/admin-auth";
import { getCurrentUser } from "@/lib/auth";
import { Property, sampleProperties } from "./properties";
const decode = (row: typeof listings.$inferSelect): Property => ({ ...row, features: JSON.parse(row.features), images: JSON.parse(row.images) } as Property);
export const encode = (p: Property) => ({ ...p, features: JSON.stringify(p.features), images: JSON.stringify(p.images) });
let initialized = false;
export async function initializeExamples() {
  if (initialized) return;
  const db = getDb();
  if (!(await db.select({ id: listings.id }).from(listings).limit(1)).length) {
    await db.batch([
      db.insert(listings).values(sampleProperties.slice(0,3).map(encode)).onConflictDoNothing(),
      db.insert(listings).values(sampleProperties.slice(3).map(encode)).onConflictDoNothing(),
    ]);
  }
  initialized = true;
}
export async function getProperties(all = false) {
  await initializeExamples();
  return (await getDb().select().from(listings).where(all ? undefined : eq(listings.status, "published")).orderBy(desc(listings.createdAt))).map(decode);
}
export async function getProperty(id: string, includeDraft = false) {
  await initializeExamples();
  const rows = await getDb().select().from(listings).where(includeDraft ? eq(listings.id, id) : and(eq(listings.id, id), eq(listings.status, "published"))).limit(1);
  return rows[0] ? decode(rows[0]) : null;
}
export async function viewer() {
  const user = await getCurrentUser();
  if (!user) return null;
  return { ...user, isAdmin: false };
}
export async function savedIds(userId?: string) {
  if (!userId) return [];
  return (await getDb().select({ id: savedHomes.listingId }).from(savedHomes)
    .innerJoin(listings, eq(savedHomes.listingId, listings.id))
    .where(and(eq(savedHomes.userId, userId), eq(listings.status, "published")))).map(r => r.id);
}
export async function getSavedProperties(userId: string) {
  return (await getDb().select({ listing: listings }).from(savedHomes)
    .innerJoin(listings, eq(savedHomes.listingId, listings.id))
    .where(and(eq(savedHomes.userId, userId), eq(listings.status, "published")))
    .orderBy(desc(savedHomes.createdAt))).map(row => decode(row.listing));
}
export async function requireAdmin() { const user=await getAdminUser(); if(!user)throw new ApiError("Administrator sign-in is required.",401); return user; }
export class ApiError extends Error {
  constructor(message: string, public status = 400, public fields?: Record<string, string>) { super(message); }
}
export function apiError(e: unknown) {
  if (e instanceof ApiError) return Response.json({ error: e.message, ...(e.fields ? { fields: e.fields } : {}) }, { status: e.status });
  console.error("API request failed", e);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) throw new ApiError("This request could not be verified. Refresh and try again.", 403);
}
export async function readRequestBytes(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) {
    await request.body?.cancel();
    throw new ApiError("This request is too large.", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("The request body is missing.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new ApiError("This request is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) {
    await request.body?.cancel();
    throw new ApiError("Send this request as JSON.", 415);
  }
  const bytes = await readRequestBytes(request, 128 * 1024);
  let body: unknown;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError("This request contains invalid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("The request must contain a JSON object.");
  return body as Record<string, unknown>;
}
export function setupKey() { return env.ADMIN_SETUP_KEY; }
