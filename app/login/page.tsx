import Link from "@/components/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { safeReturnPath } from "@/lib/navigation";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const query = await searchParams;
  const returnTo = safeReturnPath(query.returnTo);
  if (await getChatGPTUser()) redirect(returnTo);
  const admin = returnTo.startsWith("/admin");
  return <main id="main" className="auth-page"><div className="auth-photo"><img src="/images/courtyard.png" alt="Sunlight falling into a peaceful courtyard"/><div className="auth-photo-caption"><h2>Good things are worth keeping.</h2><p>A shortlist today. A new beginning tomorrow.</p></div></div><div className="auth-content"><div className="auth-card"><h1>{admin ? "Your listings.\nWell looked after." : "Keep a little\nroom for possibility."}</h1><p>{admin ? "Sign in to manage your homes, update the details, and see what’s next." : "Save the homes that feel like you. Come back to your favorites, whenever you’re ready."}</p><a href={chatGPTSignInPath(returnTo)} target="_top" className="button button-primary">Continue with ChatGPT<ArrowRight size={18}/></a><p className="auth-footnote">Secure sign-in. One less password to remember.<br/>Your saved homes stay with your account.</p><Link href="/homes" className="text-link"><ArrowLeft size={15}/>Keep exploring</Link></div></div></main>;
}

