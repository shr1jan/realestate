import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { saveListingSchema, validationFields } from "@/lib/validation";
import { apiError, ApiError, encode, readJson, requireAdmin, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const parsed = saveListingSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError("Check the highlighted listing details.", 400, validationFields(parsed.error));
    const id = crypto.randomUUID(); const now = Date.now();
    await getDb().insert(listings).values(encode({ ...parsed.data, id, createdAt: now, updatedAt: now }));
    return Response.json({ id, updatedAt: now }, { status: 201 });
  } catch (e) { return apiError(e); }
}
