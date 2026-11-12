import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { readAdminSession, adminReady } from "./admin-session";
export const isAdminConfigured=()=>adminReady(env);
export async function getAdminUser(){return readAdminSession((await headers()).get("cookie")||"",env);}
