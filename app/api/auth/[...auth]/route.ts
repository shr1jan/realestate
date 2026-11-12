import { env } from "cloudflare:workers";
import { handleGoogleAuth } from "@/lib/google-auth";
export const GET = (request: Request) => handleGoogleAuth(request, env);
export const POST = (request: Request) => handleGoogleAuth(request, env);
