import { getDb } from "@/db";
import { listings } from "@/db/schema";
import { listingSchema } from "@/lib/validation";
import { apiError, ApiError, encode, requireAdmin, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const parsed = listingSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
    const id = crypto.randomUUID(); const now = Date.now();
    await getDb().insert(listings).values(encode({ ...parsed.data, id, createdAt: now, updatedAt: now }));
    return Response.json({ id }, { status: 201 });
  } catch (e) { return apiError(e); }
}
