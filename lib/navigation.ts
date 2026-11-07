const reserved = new Set(["/login", "/signin-with-chatgpt", "/signout-with-chatgpt", "/callback"]);
export function safeReturnPath(value: unknown, fallback = "/saved"): string {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\x00-\x1f]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://stillwell.local");
    const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    if (url.origin !== "https://stillwell.local" || reserved.has(pathname) || /[\x00-\x1f]/.test(pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
