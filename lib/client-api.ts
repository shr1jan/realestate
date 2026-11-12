export class RequestError extends Error {
  constructor(message: string, public status = 0, public fields: Record<string,string> = {}) { super(message); }
}
export async function requestJson<T = Record<string, unknown>>(url: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let data: unknown;
    try { data = await response.json(); }
    catch(e) { if (controller.signal.aborted) throw e; throw new RequestError("We couldn’t complete this request. Please try again.", response.status); }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new RequestError("We couldn’t complete this request. Please try again.", response.status);
    const result = data as Record<string, unknown>;
    const fields = result.fields && typeof result.fields === "object" && !Array.isArray(result.fields)
      ? Object.fromEntries(Object.entries(result.fields).filter((entry): entry is [string,string] => typeof entry[1] === "string")) : {};
    if (!response.ok) throw new RequestError(typeof result.error === "string" && result.error ? result.error : "We couldn’t complete this request. Please try again.", response.status, fields);
    return data as T;
  } catch(e) {
    if (e instanceof RequestError) throw e;
    if (controller.signal.aborted) throw new RequestError("This is taking longer than expected. Check your connection and try again.");
    throw new RequestError("We couldn’t connect. Check your connection and try again.");
  } finally { clearTimeout(timeout); }
}
export function setFlash(message: string) {
  try { sessionStorage.setItem("stillwell-flash", message); } catch { /* Feedback storage must never block a saved listing. */ }
}
