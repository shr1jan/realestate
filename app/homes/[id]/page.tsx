import Link from "@/components/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, BedDouble, Bath, Scan, CalendarDays, Check } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { SaveButton, PropertyCard } from "@/components/property-card";
import { ContactForm } from "@/components/contact-form";
import { getProperties, getProperty } from "@/lib/server";
import { money, number } from "@/lib/properties";
import { safeReturnPath } from "@/lib/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProperty((await params).id);
  return { title: p ? `${p.title} in ${p.neighborhood}` : "Home not found", description: p?.description.slice(0,160) };
}
export default async function PropertyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ save?: string; from?: string | string[] }> }) {
  const p = await getProperty((await params).id); if (!p) notFound();
  const similar = (await getProperties()).filter(v => v.id !== p.id && v.transaction === p.transaction).slice(0,3);
  const query = await searchParams; const autoSave = query.save === p.id;
  const requestedReturn = safeReturnPath(query.from,`/homes?transaction=${p.transaction}`);
  const returnPath = new URL(requestedReturn,"https://kadelbuilders.local").pathname;
  const back = ["/homes","/saved"].includes(returnPath)?requestedReturn:`/homes?transaction=${p.transaction}`;
  return <main id="main" className="detail-page page-width"><Link href={back} className="back-link"><ArrowLeft size={15}/>{returnPath==="/saved"?"Back to saved homes":"Back to homes"}</Link><Gallery images={p.images} title={p.title}/>
    <div className="detail-body"><div className="detail-main"><div className="detail-tags"><span>{p.transaction === "buy" ? "For sale" : "For rent"}</span><span>{p.type}</span>{p.demo && <span>Demo home</span>}</div><h1 className="detail-title">{p.title}</h1><p className="detail-address"><MapPin/>{p.address}, {p.neighborhood}, {p.city}</p>
    <div className="detail-facts"><div><strong>{p.beds || "Studio"}</strong><span><BedDouble/>{p.beds ? "Bedrooms" : "Open plan"}</span></div><div><strong>{p.baths}</strong><span><Bath/>Bathrooms</span></div><div><strong>{number(p.sqft)}</strong><span><Scan/>Square feet</span></div><div><strong>{p.year}</strong><span><CalendarDays/>Year built</span></div></div>
    <section className="detail-section description"><h2>A closer look.</h2>{p.description.split("\n\n").map((text,i) => <p key={i}>{text}</p>)}</section>{p.features.length > 0 && <section className="detail-section"><h2>The little things, considered.</h2><ul className="feature-list">{p.features.map((f,i) => <li key={`${f}-${i}`}><Check/>{f}</li>)}</ul></section>}{p.demo && <p className="demo-notice">This is a demonstration listing. The address, description, price and photography are illustrative and do not represent an available property.</p>}</div>
    <aside className="detail-sidebar" aria-label="Property price and enquiries"><p className="detail-price">{money(p.price)}{p.transaction === "rent" && <small> / month</small>}</p><p className="muted">{p.transaction === "buy" ? "A place to make your own." : "Your next place to settle in."}</p><ContactForm p={p}/><SaveButton id={p.id} title={p.title} full autoSave={autoSave}/><div className="sidebar-meta"><span>{p.type} · {p.neighborhood}</span><span>{p.demo ? "Sample listing" : "Listed on Kadel Builders"}</span></div></aside></div>
    {similar.length > 0 && <section className="similar-section"><div className="section-heading"><h2>A few more to fall for.</h2><Link href={`/homes?transaction=${p.transaction}`} className="text-link">View all homes<ArrowRight size={17}/></Link></div><div className="property-grid">{similar.map(home => <PropertyCard key={home.id} p={home}/>)}</div></section>}
  </main>;
}

