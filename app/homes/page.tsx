import Link from "@/components/link";
import { SearchPanel } from "@/components/search-panel";
import { BrowseResults } from "@/components/browse-results";
import { getProperties } from "@/lib/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Browse homes" };
export default async function Homes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const filters = Object.fromEntries(Object.entries(raw).map(([k,v]) => [k, typeof v === "string" ? v : undefined]));
  const transaction = filters.transaction === "rent" ? "rent" : "buy";
  const q = (filters.q || "").toLowerCase().trim();
  const homes = (await getProperties()).filter(p => p.transaction === transaction && (!q || `${p.title} ${p.address} ${p.city} ${p.neighborhood}`.toLowerCase().includes(q)) && (!filters.type || p.type === filters.type) && (!filters.max || !Number.isFinite(Number(filters.max)) || p.price <= Number(filters.max)) && (!filters.beds || !Number.isFinite(Number(filters.beds)) || p.beds >= Number(filters.beds)));
  const active = q || filters.max || filters.type || filters.beds;
  return <main id="main" className="browse-page page-width"><div className="page-heading"><h1>Find your next home.</h1><p>Explore homes. Picture your everyday. Find your fit.</p></div><SearchPanel compact initial={{ ...filters, transaction }}/>{active && <Link className="clear-link" href={`/homes?transaction=${transaction}`}>Clear filters</Link>}<BrowseResults properties={homes}/><p className="sample-note">Demo properties are illustrative. Availability, prices and images are sample content.</p></main>;
}


