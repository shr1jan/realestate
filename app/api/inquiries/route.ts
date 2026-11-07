import { and, count, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { inquirySchema } from "@/lib/validation";
import { apiError, ApiError, getProperty, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await request.json() as { website?: unknown };
    if (body.website) return Response.json({ success: true });
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
    if (!await getProperty(parsed.data.listingId)) throw new ApiError("This home is no longer available.", 404);
    const db = getDb();
    const [recent] = await db.select({ total: count() }).from(inquiries).where(and(eq(inquiries.email, parsed.data.email), gt(inquiries.createdAt, Date.now() - 3600000)));
    if (recent.total >= 5) throw new ApiError("You’ve sent a few messages recently. Please try again in an hour.", 429);
    await db.insert(inquiries).values({ ...parsed.data, id: crypto.randomUUID(), createdAt: Date.now() });
    return Response.json({ success: true }, { status: 201 });
  } catch (e) { return apiError(e); }
}
