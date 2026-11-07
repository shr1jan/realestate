import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { listingSchema, validationFields } from "@/lib/validation";
import { apiError, ApiError, encode, getProperty, readJson, requireAdmin, sameOrigin } from "@/lib/server";
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request); await requireAdmin();
    const { id } = await context.params;
    const existing = await getProperty(id, true);
    if (!existing) throw new ApiError("This listing was not found.", 404);
    const body = await readJson(request);
    const parsed = listingSchema.safeParse(body);
    if (!parsed.success) throw new ApiError("Check the highlighted listing details.", 400, validationFields(parsed.error));
    if (typeof body.expectedUpdatedAt !== "number" || !Number.isSafeInteger(body.expectedUpdatedAt)) throw new ApiError("Reload this listing before saving it again.");
    const updatedAt = Math.max(Date.now(), existing.updatedAt + 1);
    const result = await getDb().update(listings).set(encode({ ...existing, ...parsed.data, updatedAt }))
      .where(and(eq(listings.id, id), eq(listings.updatedAt, body.expectedUpdatedAt)));
    if (!result.meta.changes) throw new ApiError("This listing was updated in another tab. Reload it before saving to avoid overwriting those changes.", 409);
    return Response.json({ id, updatedAt });
  } catch (e) { return apiError(e); }
}
