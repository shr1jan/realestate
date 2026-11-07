import { NextRequest, NextResponse } from "next/server";

// The framework beta parses multipart POSTs as progressive forms before API
// dispatch. Reject malformed uploads here so input errors remain JSON 4xx replies.
export async function middleware(request: NextRequest) {
  if (request.method !== "POST" || request.nextUrl.pathname !== "/api/admin/uploads") return NextResponse.next();
  const type = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;/i.test(type)) return Response.json({error:"Choose a photo to upload."},{status:415});
  if (Number(request.headers.get("content-length")) > 8*1024*1024+65536) return Response.json({error:"Photos must be smaller than 8 MB."},{status:413});
  try { await request.clone().formData(); }
  catch { return Response.json({error:"The photo upload could not be read. Please try again."},{status:400}); }
  return NextResponse.next();
}
export const config = { matcher: "/api/admin/uploads" };
