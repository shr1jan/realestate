import { notFound, redirect } from "next/navigation";
import { getProperty } from "@/lib/server";
import { getAdminUser } from "@/lib/admin-auth";
import { ListingEditor } from "@/components/listing-editor";
export const dynamic = "force-dynamic";
export const metadata = { title:"Edit listing",robots:{index:false,follow:false} };
export default async function EditListing({ params }: { params: Promise<{ id:string }> }) {
  const { id }=await params; const user=await getAdminUser();
  if(!user)redirect(`/admin/login?returnTo=${encodeURIComponent(`/admin/listings/${id}`)}`);
  if(id==="new")return <ListingEditor/>;
  const property=await getProperty(id,true);if(!property)notFound();
  return <ListingEditor property={property}/>;
}
