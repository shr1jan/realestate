import Link from "@/components/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser, isGoogleConfigured, pendingGoogleReturn } from "@/lib/auth";
import { GoogleSignIn } from "@/components/google-sign-in";
import { safeReturnPath } from "@/lib/navigation";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[]; callbackUrl?: string | string[]; error?: string | string[] }> }) {
  const query = await searchParams;
  const returnTo = query.returnTo || query.callbackUrl ? safeReturnPath(query.returnTo || query.callbackUrl) : await pendingGoogleReturn();
  if (returnTo === "/admin" || returnTo.startsWith("/admin/")) redirect(`/admin/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (await getCurrentUser()) redirect(returnTo);
  const admin = returnTo.startsWith("/admin"); const pendingId=new URL(returnTo,"https://stillwell.local").searchParams.get("save");const pending=pendingId?await (await import("@/lib/server")).getProperty(pendingId):null;
  return <main id="main" className="auth-page"><div className="auth-photo"><img src="/images/courtyard.png" alt="Sunlight falling into a peaceful courtyard"/><div className="auth-photo-caption"><h2>Good things are worth keeping.</h2><p>A shortlist today. A new beginning tomorrow.</p></div></div><div className="auth-content"><div className="auth-card"><h1>{admin ? "Your listings.\nWell looked after." : "Keep a little\nroom for possibility."}</h1><p>{admin ? "Sign in to manage your homes, update the details, and see what’s next." : "Save the homes that feel like you. Come back to your favorites, whenever you’re ready."}</p>{query.error && <p className="form-error" role="alert">Sign-in was cancelled or could not be completed. Please try again.</p>}{pending&&<p>You’re signing in to save <strong>{pending.title}</strong>.</p>}<GoogleSignIn ready={isGoogleConfigured()} returnTo={returnTo}/><p className="auth-footnote">Secure sign-in. One less password to remember.<br/>Your saved homes stay with your account.</p><Link href={returnTo.replace(/([?&])save=[^&]*&?/,"$1").replace(/[?&]$/,"")} className="text-link"><ArrowLeft size={15}/>Keep exploring</Link></div></div></main>;
}

