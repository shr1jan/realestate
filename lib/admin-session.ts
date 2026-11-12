import { encode, getToken } from "@auth/core/jwt";
export type AdminSettings = { ADMIN_USERNAME?: string; ADMIN_PASSWORD_HASH?: string; ADMIN_SESSION_SECRET?: string; ADMIN_AUTH_URL?: string };
export function adminOrigin(s: AdminSettings) { try { const u=new URL(s.ADMIN_AUTH_URL||""); return !u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==="/"&&(u.protocol==="https:"||(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname)))?u.origin:null; } catch { return null; } }
export function adminReady(s:AdminSettings) { return !!(adminOrigin(s)&&s.ADMIN_USERNAME&&s.ADMIN_PASSWORD_HASH&&s.ADMIN_SESSION_SECRET&&s.ADMIN_SESSION_SECRET.length>=32); }
export const adminCookieName=(s:AdminSettings)=>adminOrigin(s)?.startsWith("https:")?"__Secure-stillwell-admin":"stillwell-admin";
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
async function digest(text:string){return hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)));}
export async function verifyAdminPassword(username:string,password:string,s:AdminSettings){
  const parts=s.ADMIN_PASSWORD_HASH?.split("$");
  if(!parts||parts.length!==4||parts[0]!=="pbkdf2-sha256"||parts[1]!=="100000"||!/^[a-f0-9]{32}$/.test(parts[2])||!/^[a-f0-9]{64}$/.test(parts[3]))return false;
  const salt=Uint8Array.from(parts[2].match(/../g)!,v=>parseInt(v,16));
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  const calculated=hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:100000},key,256));
  const [a,b]=await Promise.all([digest(username+":"+calculated),digest(s.ADMIN_USERNAME+":"+parts[3])]);let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
export async function issueAdminSession(s:AdminSettings){const name=adminCookieName(s);return encode({secret:s.ADMIN_SESSION_SECRET!,salt:name,maxAge:8*3600,token:{role:"admin",username:s.ADMIN_USERNAME,version:await digest(s.ADMIN_USERNAME+":"+s.ADMIN_PASSWORD_HASH)}});}
export async function readAdminSession(cookie:string,s:AdminSettings){
  if(!adminReady(s))return null;const name=adminCookieName(s);const token=await getToken({req:{headers:new Headers({cookie})},secret:s.ADMIN_SESSION_SECRET!,salt:name,cookieName:name});
  if(!token||token.role!=="admin"||token.username!==s.ADMIN_USERNAME||token.version!==await digest(s.ADMIN_USERNAME+":"+s.ADMIN_PASSWORD_HASH))return null;
  return {userId:"admin:credentials",username:s.ADMIN_USERNAME!,isAdmin:true};
}
export function adminSessionCookie(value:string,s:AdminSettings,clear=false){return `${adminCookieName(s)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:8*3600}${adminOrigin(s)?.startsWith("https:")?"; Secure":""}`;}
export function adminReturn(value:unknown){try{if(typeof value!=="string"||value.length>2048||/[\x00-\x1f]/.test(value)||!value.startsWith("/")||value.startsWith("//"))return"/admin";const u=new URL(value,"https://admin.local");if(u.origin!=="https://admin.local"||!u.pathname.startsWith("/admin/")||decodeURIComponent(u.pathname).replace(/\/+$/,"")==="/admin/login")return"/admin";return u.pathname+u.search;}catch{return"/admin";}}
