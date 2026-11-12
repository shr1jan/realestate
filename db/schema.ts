import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(), title: text("title").notNull(), address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(), city: text("city").notNull(), price: integer("price").notNull(),
  transaction: text("transaction").notNull(), type: text("type").notNull(), beds: integer("beds").notNull(),
  baths: real("baths").notNull(), sqft: integer("sqft").notNull(), year: integer("year").notNull(),
  description: text("description").notNull(), features: text("features").notNull(), images: text("images").notNull(),
  status: text("status").notNull(), featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  demo: integer("demo", { mode: "boolean" }).notNull().default(false), createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
});
export const savedHomes = sqliteTable("saved_homes", {
  userId: text("user_id").notNull(), listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }), createdAt: integer("created_at").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.listingId] })]);
export const admins = sqliteTable("admins", { userId: text("user_id").primaryKey(), email: text("email").notNull(), createdAt: integer("created_at").notNull() });
export const adminLoginLimits = sqliteTable("admin_login_limits", {key:text("key").primaryKey(),attempts:integer("attempts").notNull(),resetAt:integer("reset_at").notNull()});
export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(), listingId: text("listing_id").notNull().references(() => listings.id), name: text("name").notNull(),
  email: text("email").notNull(), phone: text("phone").notNull(), message: text("message").notNull(), createdAt: integer("created_at").notNull(),
});
