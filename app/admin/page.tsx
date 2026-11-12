import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, listings } from "@/db/schema";
import { getProperties } from "@/lib/server";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminManager } from "@/components/admin-manager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin portal", robots: { index:false,follow:false } };
export default async function Admin() {
  if (!await getAdminUser()) redirect("/admin/login");
  const properties = await getProperties(true);
  const enquiries = await getDb().select({ id:inquiries.id, listingId:inquiries.listingId, name:inquiries.name, email:inquiries.email, phone:inquiries.phone, message:inquiries.message, responded:inquiries.responded, createdAt:inquiries.createdAt, title:listings.title }).from(inquiries).innerJoin(listings,eq(inquiries.listingId,listings.id)).orderBy(desc(inquiries.createdAt));
  return <main id="main" className="admin-page page-width"><div className="page-heading"><AdminManager properties={properties} enquiries={enquiries}/></div></main>;
}
