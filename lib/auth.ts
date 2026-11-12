import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { authOrigin, googleReady, readGoogleSession } from "./google-auth";
import { safeReturnPath } from "./navigation";
export const isGoogleConfigured = () => googleReady(env);
export async function getCurrentUser() {
  const requestHeaders = await headers();
  // The hosting platform's identity is not an app Google session.
  return readGoogleSession(requestHeaders.get("cookie") || "", env);
}
export async function pendingGoogleReturn() {
  const raw = (await headers()).get("cookie") || "";
  const name = authOrigin(env)?.startsWith("https:") ? "__Secure-authjs.callback-url=" : "authjs.callback-url=";
  const value = raw.split(";").map(part=>part.trim()).find(part=>part.startsWith(name))?.slice(name.length);
  try {
    const destination = new URL(decodeURIComponent(value || ""), authOrigin(env) || "https://invalid.local");
    if (destination.origin !== authOrigin(env)) return "/saved";
    return safeReturnPath(destination.pathname + destination.search + destination.hash);
  } catch { return "/saved"; }
}
