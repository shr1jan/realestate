import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins, listings, savedHomes } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
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
  const user = await getChatGPTUser();
  if (!user) return null;
  const rows = await getDb().select().from(admins).where(eq(admins.userId, user.userId)).limit(1);
  return { ...user, isAdmin: rows.length > 0 };
}
export async function savedIds(userId?: string) {
  if (!userId) return [];
  return (await getDb().select({ id: savedHomes.listingId }).from(savedHomes).where(eq(savedHomes.userId, userId))).map(r => r.id);
}
export async function requireAdmin() {
  const user = await viewer();
  if (!user) throw new ApiError("Please sign in to continue.", 401);
  if (!user.isAdmin) throw new ApiError("Administrator access is required.", 403);
  return user;
}
export class ApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function apiError(e: unknown) {
  if (e instanceof ApiError) return Response.json({ error: e.message }, { status: e.status });
  console.error("API request failed", e);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new ApiError("This request could not be verified. Refresh and try again.", 403);
}
export async function seedDemo() {
  await requireAdmin();
  const db = getDb();
  if ((await db.select({ id: listings.id }).from(listings).limit(1)).length) throw new ApiError("Example homes can only be added to an empty catalogue.");
  await db.batch([
    db.insert(listings).values(sampleProperties.slice(0,3).map(encode)).onConflictDoNothing(),
    db.insert(listings).values(sampleProperties.slice(3).map(encode)).onConflictDoNothing(),
  ]);
}
export function setupKey() { return env.ADMIN_SETUP_KEY; }
