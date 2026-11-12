import { apiError, ApiError, hasGoogleAdmin, readJson, sameOrigin, setupKey, viewer } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await viewer();
    if (!user) throw new ApiError("Sign in before setting up your portal.", 401);
    if (await hasGoogleAdmin()) throw new ApiError("This portal already has an administrator.", 403);
    const { key } = await readJson(request);
    const expected = setupKey();
    if (!expected) throw new ApiError("The portal setup key has not been configured.", 503);
    if (typeof key !== "string" || key.length > 256) throw new ApiError("The setup key is incorrect.", 403);
    const a = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
    const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)));
    let difference = 0;
    for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
    if (difference) throw new ApiError("The setup key is incorrect.", 403);
    // A single atomic statement ensures concurrent setup requests cannot claim two administrators.
    const { env } = await import("cloudflare:workers");
    const result = await env.DB!.prepare("INSERT INTO admins (user_id,email,created_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM admins WHERE user_id LIKE 'google:%')").bind(user.userId, user.email, Date.now()).run();
    if (!result.meta.changes) throw new ApiError("This portal already has an administrator.", 403);
    return Response.json({ success: true });
  } catch (e) { return apiError(e); }
}
