import { notFound, redirect } from "next/navigation";
import { getProperty, viewer } from "@/lib/server";
import { ListingEditor } from "@/components/listing-editor";
export const dynamic = "force-dynamic";
export const metadata = { title:"Edit listing",robots:{index:false,follow:false} };
export default async function EditListing({ params }: { params: Promise<{ id:string }> }) {
  const { id }=await params; const user=await viewer();
  if(!user)redirect(`/login?returnTo=${encodeURIComponent(`/admin/listings/${id}`)}`);
  if(!user.isAdmin)redirect("/admin");
  if(id==="new")return <ListingEditor/>;
  const property=await getProperty(id,true);if(!property)notFound();
  return <ListingEditor property={property}/>;
}
