export class RequestError extends Error {
  constructor(message: string, public status = 0, public fields: Record<string,string> = {}) { super(message); }
}
export async function requestJson<T = Record<string, unknown>>(url: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let data: { error?: unknown; fields?: Record<string,string> } & T;
    try { data = await response.json() as typeof data; }
    catch { throw new RequestError("We couldn’t complete this request. Please try again.", response.status); }
    if (!response.ok) throw new RequestError(typeof data.error === "string" ? data.error : "We couldn’t complete this request. Please try again.", response.status, data.fields);
    return data;
  } catch(e) {
    if (e instanceof RequestError) throw e;
    if (controller.signal.aborted) throw new RequestError("This is taking longer than expected. Check your connection and try again.");
    throw new RequestError("We couldn’t connect. Check your connection and try again.");
  } finally { clearTimeout(timeout); }
}
export function setFlash(message: string) {
  try { sessionStorage.setItem("stillwell-flash", message); } catch { /* Feedback storage must never block a saved listing. */ }
}
