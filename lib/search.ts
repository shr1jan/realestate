export const priceOptions = {
  buy: [[750000, "Up to $750,000"], [1000000, "Up to $1 million"], [1500000, "Up to $1.5 million"], [2000000, "Up to $2 million"]],
  rent: [[2000, "Up to $2,000 / mo"], [3000, "Up to $3,000 / mo"], [4000, "Up to $4,000 / mo"]],
} as const;
export function normalizeSearch(raw: Record<string, unknown>) {
  const transaction = raw.transaction === "rent" ? "rent" : "buy";
  return {
    transaction,
    q: typeof raw.q === "string" ? raw.q.trim().replace(/\s+/g, " ").slice(0,100) : "",
    max: typeof raw.max === "string" && priceOptions[transaction].some(([v]) => String(v) === raw.max) ? raw.max : "",
    type: typeof raw.type === "string" && ["House", "Townhouse", "Condo"].includes(raw.type) ? raw.type : "",
    beds: typeof raw.beds === "string" && ["1","2","3","4"].includes(raw.beds) ? raw.beds : "",
  };
}
