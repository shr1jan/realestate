import { env } from "cloudflare:workers";
import { adminOrigin,adminReady,verifyAdminPassword,issueAdminSession,adminSessionCookie,adminReturn } from "@/lib/admin-session";
import { apiError,ApiError,readJson,sameOrigin } from "@/lib/server";
export async function POST(request:Request){try{
  sameOrigin(request);if(!adminReady(env))throw new ApiError("Administrator sign-in has not been configured yet.",503);
  if(new URL(request.url).origin!==adminOrigin(env))throw new ApiError("Use the configured administrator sign-in address.",400);
  const body=await readJson(request);if(typeof body.username!=="string"||typeof body.password!=="string"||body.username.length>100||body.password.length>256)throw new ApiError("Check your username and password.",400);
  const now=Date.now();const ip=request.headers.get("cf-connecting-ip")||"local";const key=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip))),v=>v.toString(16).padStart(2,"0")).join("");
  const allowed=await env.DB!.prepare("INSERT INTO admin_login_limits (key,attempts,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END WHERE reset_at<=? OR attempts<10 RETURNING attempts").bind(key,now+900000,now,now,now).first();
  if(!allowed)throw new ApiError("Too many sign-in attempts. Please try again in 15 minutes.",429);
  await env.DB!.prepare("DELETE FROM admin_login_limits WHERE reset_at<?").bind(now-86400000).run();
  if(!await verifyAdminPassword(body.username.trim(),body.password,env))throw new ApiError("The username or password is incorrect.",401);
  return Response.json({redirect:adminReturn(body.returnTo)},{headers:{"Set-Cookie":adminSessionCookie(await issueAdminSession(env),env),"Cache-Control":"no-store"}});
}catch(e){return apiError(e);}}
