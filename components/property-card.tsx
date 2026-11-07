"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/link";
import { Bath, BedDouble, Heart, Scan } from "lucide-react";
import { Property, money, number } from "@/lib/properties";
import { useSaved } from "./site-shell";
import { RequestError, requestJson } from "@/lib/client-api";
import { PropertyImage } from "./property-image";
export function SaveButton({ id, title, full = false, autoSave = false }: { id: string; title: string; full?: boolean; autoSave?: boolean }) {
  const { user, saved, setSaved, notify } = useSaved(); const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const active = saved.includes(id);
  const login = () => {
    const current = new URL(window.location.href); const path = new URL(`/homes/${id}`,current.origin);
    if (current.pathname===path.pathname) path.search=current.search;
    else if (["/homes","/saved"].includes(current.pathname)) path.searchParams.set("from",current.pathname+current.search);
    path.searchParams.set("save",id);
    window.location.assign(`/login?returnTo=${encodeURIComponent(path.pathname+path.search+path.hash)}`);
  };
  const finishPendingSave = () => { const url = new URL(window.location.href); url.searchParams.delete("save"); window.history.replaceState(null,"",url.pathname+url.search+url.hash); };
  async function save(value: boolean) {
    if (inFlight.current) return;
    if (!user) { login(); return; }
    inFlight.current = true; setBusy(true);
    try {
      await requestJson("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: id, saved: value }) });
      setSaved(id, value); notify(value ? "A little closer to home. Added to your saved homes." : "Home removed from your saved homes.");
      if (autoSave) finishPendingSave();
    } catch(e) {
      if (e instanceof RequestError && e.status === 401) { login(); return; }
      notify(e instanceof Error ? e.message : "Could not save this home. Please try again.");
    } finally { inFlight.current = false; setBusy(false); }
  }
  useEffect(() => { if (autoSave && user) { if (!active) void save(true); else finishPendingSave(); } }, []);
  return <button type="button" className={`${full ? "button button-outline save-full" : "save-button"} ${active ? "is-saved" : ""}`} disabled={busy} onClick={() => save(!active)} aria-label={`${active ? "Unsave" : "Save"} ${title}`} aria-pressed={active} title={active ? "Remove saved home" : "Save this home"}><Heart size={full ? 18 : 21} fill={active ? "currentColor" : "none"}/>{full && (busy ? "Saving…" : active ? "Home saved" : "Save this home")}</button>;
}
export function PropertyFacts({ p }: { p: Property }) {
  return <div className="property-facts"><span><BedDouble/> {p.beds === 0 ? "Studio" : `${p.beds} beds`}</span><span><Bath/> {p.baths} baths</span><span><Scan/> {number(p.sqft)} sq ft</span></div>;
}
export function PropertyCard({ p, returnTo }: { p: Property; returnTo?: string }) {
  const href = `/homes/${p.id}${returnTo?`?from=${encodeURIComponent(returnTo)}`:""}`;
  return <article className="property-card"><div className="card-image-wrap"><Link href={href} tabIndex={-1} aria-hidden="true"><PropertyImage src={p.images[0]} alt="" loading="lazy" className="card-image"/></Link><span className="property-label">{p.transaction === "buy" ? "For sale" : "For rent"}</span><SaveButton id={p.id} title={p.title}/></div>
    <div className="card-info"><p className="card-price">{money(p.price)}{p.transaction === "rent" && <span> / month</span>}</p><h3><Link href={href}>{p.title}</Link></h3><p className="card-location">{p.neighborhood}, {p.city}</p><PropertyFacts p={p}/></div>
  </article>;
}

