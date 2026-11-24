import { NextRequest, NextResponse } from "next/server";

// The framework beta parses multipart POSTs as progressive forms before API
// dispatch. Reject malformed uploads here so input errors remain JSON 4xx replies.
export async function proxy(request: NextRequest) {
  if (request.method !== "POST" || request.nextUrl.pathname !== "/api/admin/uploads") return NextResponse.next();
  const type = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;/i.test(type)) return Response.json({error:"Choose a photo to upload."},{status:415});
  if (Number(request.headers.get("content-length")) > 8*1024*1024+65536) return Response.json({error:"Photos must be smaller than 8 MB."},{status:413});
  const reader = request.clone().body?.getReader();
  if (!reader) return Response.json({error:"Choose a photo to upload."},{status:400});
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8*1024*1024+65536) {
        // Cancelling a cloned stream may wait for its sibling; do not block
        // the error response while the framework disposes of the original.
        void reader.cancel().catch(()=>{});
        return Response.json({error:"Photos must be smaller than 8 MB."},{status:413});
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
    await new Response(bytes,{headers:{"Content-Type":type}}).formData();
  }
  catch { return Response.json({error:"The photo upload could not be read. Please try again."},{status:400}); }
  finally { reader.releaseLock(); }
  return NextResponse.next();
}
export const config = { matcher: "/api/admin/uploads" };
