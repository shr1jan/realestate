"use client";
import { useState } from "react";
import { House, ArrowRight } from "lucide-react";
import Link from "@/components/link";
import { Property } from "@/lib/properties";
import { PropertyCard } from "./property-card";
import { useSaved } from "./site-shell";
export function BrowseResults({ properties, savedOnly = false, returnTo = "/homes" }: { properties: Property[]; savedOnly?: boolean; returnTo?: string }) {
  const [sort, setSort] = useState("recommended"); const { saved } = useSaved();
  const homes = properties.filter(p => !savedOnly || saved.includes(p.id)).sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : Number(b.featured)-Number(a.featured) || b.createdAt-a.createdAt);
  return <><div className="results-toolbar"><p><strong>{homes.length}</strong> {homes.length === 1 ? "home" : "homes"}{savedOnly ? " on your shortlist" : " to make your own"}</p><label className="sort-control">Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    {homes.length ? <div className="property-grid">{homes.map(p => <PropertyCard key={p.id} p={p} returnTo={savedOnly?"/saved":returnTo}/>)}</div> : <div className="empty-state"><House size={36} strokeWidth={1.3}/><h2>{savedOnly ? "Your next chapter starts here." : "A little more room to search."}</h2><p>{savedOnly ? "Tap the heart on a home you love. You’ll find your shortlist here, ready when you are." : "No homes match these filters. Try a wider price range or explore a different neighborhood."}</p><Link href="/homes" className="button button-primary">{savedOnly ? "Find your first favorite" : "Explore all homes"}<ArrowRight size={18}/></Link></div>}
  </>;
}

