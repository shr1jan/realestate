import {env} from "cloudflare:workers";
import {adminSessionCookie} from "@/lib/admin-session";
import {apiError,sameOrigin} from "@/lib/server";
export async function POST(request:Request){try{sameOrigin(request);return Response.json({success:true},{headers:{"Set-Cookie":adminSessionCookie("",env,true),"Cache-Control":"no-store"}});}catch(e){return apiError(e);}}
