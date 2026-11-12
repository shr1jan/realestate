"use client";
import { useState, useRef } from "react";
import { requestJson } from "@/lib/client-api";
import { House, ArrowRight } from "lucide-react";
import Link from "@/components/link";
import { Property } from "@/lib/properties";
import { PropertyCard } from "./property-card";
import { useSaved } from "./site-shell";
export function BrowseResults({ properties, savedOnly = false, returnTo = "/homes", initialSort="recommended" }: { properties: Property[]; savedOnly?: boolean; returnTo?: string; initialSort?:string }) {
  const [sort, setSort] = useState(initialSort); const { saved,setSaved,notify } = useSaved(); const previous=useRef(saved);const [removedId,setRemovedId]=useState<string|null>(null);const [undoBusy,setUndoBusy]=useState(false);if(previous.current!==saved){const removed=previous.current.find(id=>!saved.includes(id));previous.current=saved;if(removed)setRemovedId(removed);}
  const homes = properties.filter(p => !savedOnly || saved.includes(p.id)).sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : Number(b.featured)-Number(a.featured) || b.createdAt-a.createdAt);
  return <>{savedOnly&&removedId&&!saved.includes(removedId)&&<div className="recovery-note" role="status">Home removed from your shortlist. <button disabled={undoBusy} onClick={async()=>{setUndoBusy(true);try{await requestJson("/api/saved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({listingId:removedId,saved:true})});setSaved(removedId,true);setRemovedId(null);}catch(e){notify(e instanceof Error?e.message:"Could not restore this home.");}finally{setUndoBusy(false);}}}>Undo</button></div>}<div className="results-toolbar"><p><strong>{homes.length}</strong> {homes.length === 1 ? "home" : "homes"}{savedOnly ? " on your shortlist" : " to make your own"}</p><label className="sort-control">Sort by <select value={sort} onChange={e => {setSort(e.target.value);const url=new URL(location.href);url.searchParams.set("sort",e.target.value);history.replaceState(null,"",url.pathname+url.search);}}><option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    {homes.length ? <div className="property-grid">{homes.map(p => <PropertyCard key={p.id} p={p} returnTo={savedOnly?`/saved?sort=${sort}`:(()=>{const url=new URL(returnTo,"https://stillwell.local");url.searchParams.set("sort",sort);return url.pathname+url.search;})()}/>)}</div> : <div className="empty-state"><House size={36} strokeWidth={1.3}/><h2>{savedOnly ? "Your next chapter starts here." : "A little more room to search."}</h2><p>{savedOnly ? "Tap the heart on a home you love. You’ll find your shortlist here, ready when you are." : "No homes match these filters. Try a wider price range or explore a different neighborhood."}</p><Link href={savedOnly?"/homes":`/homes?transaction=${new URLSearchParams(returnTo.split("?")[1]).get("transaction")||"buy"}`} className="button button-primary">{savedOnly ? "Find your first favorite" : "Explore all homes"}<ArrowRight size={18}/></Link></div>}
  </>;
}

