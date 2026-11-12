import { Auth, type AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import { getToken } from "@auth/core/jwt";
import { safeReturnPath } from "./navigation";

export type GoogleAuthSettings = { AUTH_SECRET?: string; AUTH_URL?: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string };
export function authOrigin(settings: GoogleAuthSettings) {
  try {
    const url = new URL(settings.AUTH_URL || "");
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return null;
    return url.origin;
  } catch { return null; }
}
export function googleReady(settings: GoogleAuthSettings) {
  return !!(authOrigin(settings) && settings.AUTH_SECRET && settings.AUTH_SECRET.length >= 32 && settings.GOOGLE_CLIENT_ID && settings.GOOGLE_CLIENT_SECRET);
}
export function sessionCookie(settings: GoogleAuthSettings) {
  return authOrigin(settings)?.startsWith("https:") ? "__Secure-authjs.session-token" : "authjs.session-token";
}
export function googleAuthConfig(settings: GoogleAuthSettings): AuthConfig {
  return {
    secret: settings.AUTH_SECRET, basePath: "/api/auth", trustHost: true,
    useSecureCookies: authOrigin(settings)?.startsWith("https:") ?? true,
    providers: [Google({ clientId: settings.GOOGLE_CLIENT_ID, clientSecret: settings.GOOGLE_CLIENT_SECRET, checks: ["pkce", "state", "nonce"], authorization: { params: { scope: "openid email profile", prompt: "select_account" } } })],
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
    pages: { signIn: "/login", error: "/login" },
    callbacks: {
      signIn: ({ account, profile }) => account?.provider === "google" && profile?.email_verified === true,
      jwt({ token, account, profile }) {
        if (account?.provider === "google" && profile?.email_verified === true && typeof profile.sub === "string") token.userId = `google:${profile.sub}`;
        return token;
      },
      session({ session, token }) { if (session.user) Object.assign(session.user, { id: token.userId }); return session; },
      redirect({ url, baseUrl }) {
        try { const target = new URL(url, baseUrl); if (target.origin !== baseUrl) return baseUrl + "/saved"; return baseUrl + safeReturnPath(target.pathname + target.search + target.hash); }
        catch { return baseUrl + "/saved"; }
      },
    },
    logger: { error(error) { console.error("Google sign-in failed:", error.name); }, warn(code) { console.warn("Authentication warning:", code); }, debug() {} },
  };
}
export async function handleGoogleAuth(request: Request, settings: GoogleAuthSettings) {
  const ready = googleReady(settings);
  const localAction = ["/api/auth/csrf", "/api/auth/signout", "/api/auth/session"].includes(new URL(request.url).pathname);
  const baseReady = !!(authOrigin(settings) && settings.AUTH_SECRET && settings.AUTH_SECRET.length >= 32);
  if (!ready && !(baseReady && localAction)) return Response.json({ error: "Google sign-in is not configured yet. You can still browse homes." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (new URL(request.url).origin !== authOrigin(settings)) return Response.json({ error: "The sign-in address does not match this site." }, { status: 400 });
  const config = googleAuthConfig(settings);
  if (!ready) config.providers = []; // Existing sessions can still sign out.
  const response = await Auth(request, config);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
export async function readGoogleSession(cookie: string, settings: GoogleAuthSettings) {
  if (!settings.AUTH_SECRET || settings.AUTH_SECRET.length < 32 || !authOrigin(settings)) return null;
  const name = sessionCookie(settings);
  const token = await getToken({ req: { headers: new Headers({ cookie }) }, secret: settings.AUTH_SECRET, cookieName: name, salt: name });
  if (!token || typeof token.userId !== "string" || !/^google:[^\s:]{1,200}$/.test(token.userId) || typeof token.email !== "string" || !token.email) return null;
  const fullName = typeof token.name === "string" ? token.name.slice(0,100) : null;
  return { userId: token.userId, email: token.email, fullName, displayName: fullName || token.email };
}
