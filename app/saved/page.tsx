import Link from "@/components/link";
import { Heart, ArrowRight } from "lucide-react";
import { BrowseResults } from "@/components/browse-results";
import { getProperties, viewer } from "@/lib/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Saved homes" };
export default async function Saved() {
  const user = await viewer();
  return <main id="main" className="browse-page page-width"><div className="page-heading"><h1>Your saved homes.</h1><p>Your favorite homes, kept together for what comes next.</p></div>{user ? <BrowseResults properties={await getProperties()} savedOnly/> : <div className="empty-state"><Heart size={36} strokeWidth={1.3}/><h2>Make room for your favorites.</h2><p>Sign in to save the places you love and pick up your search wherever you left off.</p><Link href="/login?returnTo=/saved" className="button button-primary">Sign in to save homes<ArrowRight size={18}/></Link><br/><Link href="/homes" className="text-link">Or keep exploring</Link></div>}</main>;
}


