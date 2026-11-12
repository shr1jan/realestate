import {getAdminUser} from "@/lib/admin-auth";
import {AdminShell} from "@/components/admin-shell";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){const user=await getAdminUser();return <AdminShell username={user?.username}>{children}</AdminShell>;}
