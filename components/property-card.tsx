"use client";
import { useEffect, useState } from "react";
import Link from "@/components/link";
import { Bath, BedDouble, Heart, Scan } from "lucide-react";
import { Property, money, number } from "@/lib/properties";
import { useSaved } from "./site-shell";
export function SaveButton({ id, title, full = false, autoSave = false }: { id: string; title: string; full?: boolean; autoSave?: boolean }) {
  const { user, saved, setSaved, notify } = useSaved(); const [busy, setBusy] = useState(false);
  const active = saved.includes(id);
  async function save(value: boolean) {
    if (!user) { window.location.assign(`/login?returnTo=${encodeURIComponent(`/homes/${id}?save=${encodeURIComponent(id)}`)}`); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: id, saved: value }) });
      const data = await response.json() as { error: string }; if (!response.ok) throw new Error(data.error);
      setSaved(id, value); notify(value ? "A little closer to home. Added to your saved homes." : "Home removed from your saved homes.");
    } catch(e) { notify(e instanceof Error ? e.message : "Could not save this home. Please try again."); } finally { setBusy(false); }
  }
  useEffect(() => { if (autoSave && user) { if (!active) void save(true); window.history.replaceState(null, "", `/homes/${id}`); } }, []);
  return <button type="button" className={`${full ? "button button-outline save-full" : "save-button"} ${active ? "is-saved" : ""}`} disabled={busy} onClick={() => save(!active)} aria-label={`${active ? "Unsave" : "Save"} ${title}`} aria-pressed={active} title={active ? "Remove saved home" : "Save this home"}><Heart size={full ? 18 : 21} fill={active ? "currentColor" : "none"}/>{full && (busy ? "Saving…" : active ? "Home saved" : "Save this home")}</button>;
}
export function PropertyFacts({ p }: { p: Property }) {
  return <div className="property-facts"><span><BedDouble/> {p.beds === 0 ? "Studio" : `${p.beds} beds`}</span><span><Bath/> {p.baths} baths</span><span><Scan/> {number(p.sqft)} sq ft</span></div>;
}
export function PropertyCard({ p }: { p: Property }) {
  return <article className="property-card"><div className="card-image-wrap"><Link href={`/homes/${p.id}`} tabIndex={-1} aria-hidden="true"><img src={p.images[0]} alt="" loading="lazy" className="card-image"/></Link><span className="property-label">{p.transaction === "buy" ? "For sale" : "For rent"}</span><SaveButton id={p.id} title={p.title}/></div>
    <div className="card-info"><p className="card-price">{money(p.price)}{p.transaction === "rent" && <span> / month</span>}</p><h3><Link href={`/homes/${p.id}`}>{p.title}</Link></h3><p className="card-location">{p.neighborhood}, {p.city}</p><PropertyFacts p={p}/></div>
  </article>;
}

