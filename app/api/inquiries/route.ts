import { env } from "cloudflare:workers";
import { inquirySchema, validationFields } from "@/lib/validation";
import { apiError, ApiError, getProperty, readJson, sameOrigin } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await readJson(request);
    if (body.website) return Response.json({ success: true });
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) throw new ApiError("Check your enquiry details.",400,validationFields(parsed.error));
    if (!await getProperty(parsed.data.listingId)) throw new ApiError("This home is no longer available.", 404);
    const data = parsed.data; const now = Date.now();
    // Count and insert in the same statement so simultaneous submissions respect the limit.
    const result = await env.DB!.prepare("INSERT INTO inquiries (id,listing_id,name,email,phone,message,created_at) SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM inquiries WHERE lower(email)=? AND created_at>?) < 5")
      .bind(crypto.randomUUID(), data.listingId, data.name, data.email, data.phone, data.message, now, data.email, now - 3600000).run();
    if (!result.meta.changes) throw new ApiError("You’ve sent a few messages recently. Please try again in an hour.", 429);
    return Response.json({ success: true }, { status: 201 });
  } catch (e) { return apiError(e); }
}
