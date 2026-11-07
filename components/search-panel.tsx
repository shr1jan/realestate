"use client";
import { useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
export function SearchPanel({ compact = false, initial = {} }: { compact?: boolean; initial?: Record<string, string | undefined> }) {
  const [transaction, setTransaction] = useState(initial.transaction === "rent" ? "rent" : "buy");
  return <form action="/homes" className={`search-panel ${compact ? "search-compact" : ""}`} key={JSON.stringify(initial)}>
    <div className="transaction-tabs" aria-label="Listing purpose"><button type="button" aria-pressed={transaction === "buy"} className={transaction === "buy" ? "selected" : ""} onClick={() => setTransaction("buy")}>{compact ? "Buy" : "Buy a home"}</button><button type="button" aria-pressed={transaction === "rent"} className={transaction === "rent" ? "selected" : ""} onClick={() => setTransaction("rent")}>{compact ? "Rent" : "Rent a home"}</button></div>
    <input type="hidden" name="transaction" value={transaction}/>
    <label className="search-location"><MapPin size={19}/><span className="sr-only">City, neighborhood or address</span><input name="q" defaultValue={initial.q || ""} placeholder="City, neighborhood or address" maxLength={100}/></label>
    <div className="search-selects"><label><span>Price range</span><select name="max" key={transaction} defaultValue={initial.max || ""}><option value="">Any price</option>{(transaction === "buy" ? [[750000,"Up to $750,000"],[1000000,"Up to $1 million"],[1500000,"Up to $1.5 million"],[2000000,"Up to $2 million"]] : [[2000,"Up to $2,000 / mo"],[3000,"Up to $3,000 / mo"],[4000,"Up to $4,000 / mo"]]).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <label><span>Property type</span><select name="type" defaultValue={initial.type || ""}><option value="">Any type</option><option>House</option><option>Townhouse</option><option>Condo</option></select></label>
    {compact && <label><span>Bedrooms</span><select name="beds" defaultValue={initial.beds || ""}><option value="">Any beds</option><option value="1">1+ beds</option><option value="2">2+ beds</option><option value="3">3+ beds</option><option value="4">4+ beds</option></select></label>}</div>
    <button className="button button-primary search-submit" type="submit">{compact ? "Find homes" : "Explore homes"}<ArrowRight size={18}/></button>
  </form>;
}
