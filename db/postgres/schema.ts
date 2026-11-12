import { pgTable, text, integer, doublePrecision, boolean, bigint, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const listings = pgTable("listings", {
  id: text("id").primaryKey(), title: text("title").notNull(), address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(), city: text("city").notNull(), price: integer("price").notNull(),
  transaction: text("transaction").notNull(), type: text("type").notNull(), beds: integer("beds").notNull(),
  baths: doublePrecision("baths").notNull(), sqft: integer("sqft").notNull(), year: integer("year").notNull(),
  description: text("description").notNull(), features: text("features").notNull(), images: text("images").notNull(),
  status: text("status").notNull(), featured: boolean("featured").notNull().default(false), demo: boolean("demo").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(), updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export const savedHomes = pgTable("saved_homes", {
  userId: text("user_id").notNull(), listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }), createdAt: bigint("created_at", { mode: "number" }).notNull(),
}, t => [primaryKey({ columns: [t.userId, t.listingId] })]);
export const admins = pgTable("admins", { userId: text("user_id").primaryKey(), email: text("email").notNull(), createdAt: bigint("created_at", { mode: "number" }).notNull() }, () => [uniqueIndex("admins_single_owner").on(sql`(true)`)]);
export const inquiries = pgTable("inquiries", {
  id: text("id").primaryKey(), listingId: text("listing_id").notNull().references(() => listings.id), name: text("name").notNull(),
  email: text("email").notNull(), phone: text("phone").notNull(), message: text("message").notNull(), responded: boolean("responded").notNull().default(false), createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
export const adminLoginLimits = pgTable("admin_login_limits", {key:text("key").primaryKey(),attempts:integer("attempts").notNull(),resetAt:bigint("reset_at",{mode:"number"}).notNull()});
