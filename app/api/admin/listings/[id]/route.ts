import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { listingSchema } from "@/lib/validation";
import { apiError, ApiError, encode, getProperty, requireAdmin, sameOrigin } from "@/lib/server";
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request); await requireAdmin();
    const { id } = await context.params;
    const existing = await getProperty(id, true);
    if (!existing) throw new ApiError("This listing was not found.", 404);
    const parsed = listingSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
    await getDb().update(listings).set(encode({ ...existing, ...parsed.data, updatedAt: Date.now() })).where(eq(listings.id, id));
    return Response.json({ id });
  } catch (e) { return apiError(e); }
}
