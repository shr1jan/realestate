import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { savedHomes } from "@/db/schema";
import { apiError, ApiError, getProperty, sameOrigin, viewer } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await viewer();
    if (!user) throw new ApiError("Sign in to save this home.", 401);
    const { listingId, saved } = await request.json() as { listingId?: unknown; saved?: unknown };
    if (typeof listingId !== "string" || typeof saved !== "boolean") throw new ApiError("Invalid saved home.");
    const db = getDb();
    if (saved) {
      if (!await getProperty(listingId)) throw new ApiError("This home is no longer available.", 404);
      await db.insert(savedHomes).values({ userId: user.userId, listingId, createdAt: Date.now() }).onConflictDoNothing();
    } else {
      await db.delete(savedHomes).where(and(eq(savedHomes.userId, user.userId), eq(savedHomes.listingId, listingId)));
    }
    return Response.json({ saved });
  } catch (e) { return apiError(e); }
}
