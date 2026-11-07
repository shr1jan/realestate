import { z } from "zod";
const image = z.string().max(2048).refine(v => /^\/(images|media)\/[a-zA-Z0-9._-]+$/.test(v) || (() => { try { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } })(), "Use an HTTPS image URL or an uploaded image.");
export const listingSchema = z.object({
  title: z.string().trim().min(3).max(100), address: z.string().trim().min(3).max(200), neighborhood: z.string().trim().min(2).max(100), city: z.string().trim().min(2).max(100),
  price: z.number().int().min(1).max(1000000000), transaction: z.enum(["buy", "rent"]), type: z.enum(["House", "Townhouse", "Condo"]), beds: z.number().int().min(0).max(50),
  baths: z.number().min(0.5).max(50).multipleOf(0.5), sqft: z.number().int().min(50).max(1000000), year: z.number().int().min(1600).max(2100),
  description: z.string().trim().min(30).max(10000), features: z.array(z.string().trim().min(1).max(100)).max(30), images: z.array(image).min(1, "Add at least one photo.").max(20),
  status: z.enum(["published", "draft", "archived"]), featured: z.boolean(), demo: z.boolean(),
});
export const inquirySchema = z.object({ listingId: z.string().min(1).max(100), name: z.string().trim().min(2,"Enter your full name.").max(100), email: z.string().trim().email("Enter a valid email address.").max(200).transform(v => v.toLowerCase()), phone: z.string().trim().max(40), message: z.string().trim().min(10,"Add a message of at least 10 characters.").max(3000) });
export function validationFields(error: z.ZodError) {
  return Object.fromEntries(Object.entries(error.flatten().fieldErrors).map(([key, values]) => [key, values?.[0] || "Check this field."]));
}
