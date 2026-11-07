import Link from "@/components/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { PropertyCard } from "@/components/property-card";
import { getProperties } from "@/lib/server";
export const dynamic = "force-dynamic";
export default async function Home() {
  const properties = await getProperties();
  const featured = properties.filter(p => p.featured).slice(0,3);
  const homes = featured.length ? featured : properties.slice(0,3);
  return <main id="main">
    <section className="hero page-width"><div className="hero-copy"><h1>Find a place to<br/>call your own.</h1><p>Thoughtfully chosen homes.<br className="small-only"/> A simpler way to find yours.</p><SearchPanel/></div><div className="hero-image"><img src="/images/courtyard.png" alt="A warm limestone home and garden beneath a mature oak tree" fetchPriority="high"/><div className="hero-caption"><span>A slower pace. A place that fits.</span><ArrowUpRight size={19}/></div></div></section>
    <section className="featured-section page-width"><div className="section-heading"><div><h2>Homes worth coming home to.</h2><p>A few places we think you’ll love.</p></div><Link href="/homes" className="text-link">Explore all homes <ArrowRight size={18}/></Link></div><div className="property-grid">{homes.map(p => <PropertyCard p={p} key={p.id}/>)}</div><p className="sample-note">Our starting collection uses demonstration listings and illustrative photography.</p></section>
    <section className="considered-section page-width"><div><h2>A home is more<br/>than a place.</h2><p>It’s where the everyday becomes your everyday. A quiet morning. A seat in the sun. Room for what comes next.</p></div><div><p>Whether you’re looking for a fresh start or a little more space, take your time. Explore the details, save what speaks to you, and come back when you’re ready.</p><Link href="/homes" className="text-link">Find a home that feels like you <ArrowRight size={18}/></Link></div></section>
  </main>;
}

