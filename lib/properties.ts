export type Property = {
  id: string; title: string; address: string; neighborhood: string; city: string; price: number;
  transaction: "buy" | "rent"; type: "House" | "Townhouse" | "Condo"; beds: number; baths: number; sqft: number; year: number; description: string;
  features: string[]; images: string[]; status: "published" | "draft" | "archived"; featured: boolean; demo: boolean; createdAt: number; updatedAt: number;
};
export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const number = (n: number) => new Intl.NumberFormat("en-US").format(n);
const common = { city: "Austin, TX", status: "published" as const, featured: false, demo: true, createdAt: 1794000000000, updatedAt: 1794000000000 };
export const sampleProperties: Property[] = [
  { ...common, id: "ridgeview-house", title: "Ridgeview House", address: "2408 Ridgeview Lane", neighborhood: "Tarrytown", price: 1295000, transaction: "buy", type: "House", beds: 3, baths: 2, sqft: 2052, year: 2021, featured: true,
    description: "A quiet retreat beneath the live oaks. Warm limestone, natural wood and generous windows bring a little of the garden into every room. The open living space flows into a sheltered courtyard, with room for slow mornings, long dinners and everyday life.\n\nThree thoughtfully arranged bedrooms offer space to retreat, while a separate study makes working from home feel easy. Native planting and a private terrace complete a home designed around simple pleasures.",
    features: ["Private courtyard", "Dedicated study", "Oak flooring", "Two-car garage", "Native landscaping", "Walk-in pantry"], images: ["/images/courtyard.png", "/images/living.jpg", "/images/kitchen.jpg", "/images/bedroom.jpg"] },
  { ...common, id: "barton-creek-residence", title: "Barton Creek Residence", address: "1806 Greenbelt Drive", neighborhood: "Barton Hills", price: 1825000, transaction: "buy", type: "House", beds: 4, baths: 3, sqft: 2842, year: 2023, featured: true,
    description: "Tucked into a leafy setting, this generous family home balances open spaces with quiet corners. Expansive windows frame the garden, while a warm, pared-back interior provides a natural backdrop for everyday living.\n\nA spacious kitchen connects to the dining room and covered terrace. Upstairs, the primary suite offers a peaceful outlook, with three additional bedrooms and flexible space for a home office.",
    features: ["Covered terrace", "Garden views", "Chef’s kitchen", "Primary suite", "Two-car garage", "Laundry room"], images: ["/images/house-2.jpg", "/images/kitchen.jpg", "/images/living.jpg", "/images/bedroom.jpg"] },
  { ...common, id: "meadowlark-house", title: "Meadowlark House", address: "1214 Meadowlark Avenue", neighborhood: "East Austin", price: 925000, transaction: "buy", type: "House", beds: 3, baths: 2, sqft: 1648, year: 2019, featured: true,
    description: "An inviting home with a simple silhouette and a garden made for enjoying. Light-filled living spaces and an easy flow between inside and out make this a lovely place to settle in.\n\nThe practical layout includes three bedrooms, two bathrooms and a bright kitchen with a generous island. A private backyard offers space to garden, entertain or just put your feet up.",
    features: ["Private backyard", "Kitchen island", "Natural light", "Covered entry", "Off-street parking", "Energy-efficient windows"], images: ["/images/house-3.jpg", "/images/living.jpg", "/images/bedroom.jpg"] },
  { ...common, id: "juniper-townhome", title: "Juniper Townhome", address: "701 Juniper Street", neighborhood: "Mueller", price: 685000, transaction: "buy", type: "Townhouse", beds: 3, baths: 2.5, sqft: 1830, year: 2022,
    description: "An easy-going townhome with well-proportioned rooms and a welcoming outdoor terrace. The main floor brings cooking, dining and relaxing together, while the bedrooms above offer privacy and a peaceful place to unwind.",
    features: ["Private terrace", "Attached garage", "Walk-in closet", "Flexible office space"], images: ["/images/house-4.jpg", "/images/kitchen.jpg", "/images/bedroom.jpg"] },
  { ...common, id: "willow-garden-home", title: "Willow Garden Home", address: "904 Willow Bend", neighborhood: "Hyde Park", price: 3200, transaction: "rent", type: "House", beds: 3, baths: 2, sqft: 1720, year: 2018,
    description: "A bright, comfortable rental with a green outlook and plenty of room to make yourself at home. A generous living room connects to the kitchen, and a private garden provides space to enjoy the outdoors.",
    features: ["Private garden", "Pet friendly", "Washer and dryer", "Off-street parking"], images: ["/images/house-5.jpg", "/images/living.jpg", "/images/kitchen.jpg"] },
  { ...common, id: "south-lamar-loft", title: "South Lamar Loft", address: "1520 Lamar Boulevard, Unit 204", neighborhood: "South Lamar", price: 2450, transaction: "rent", type: "Condo", beds: 2, baths: 2, sqft: 1180, year: 2020,
    description: "A considered city apartment with open living spaces, warm finishes and a private balcony. Two well-separated bedrooms make room for a home office or a guest, with everyday conveniences close at hand.",
    features: ["Private balcony", "Secure parking", "In-unit laundry", "Elevator access"], images: ["/images/living.jpg", "/images/kitchen.jpg", "/images/bedroom.jpg"] },
];
