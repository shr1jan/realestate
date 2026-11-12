import {redirect} from "next/navigation";
import {getAdminUser,isAdminConfigured} from "@/lib/admin-auth";
import {adminReturn} from "@/lib/admin-session";
import {AdminLogin} from "@/components/admin-login";
export const dynamic="force-dynamic";
export const metadata={title:"Administrator sign-in",robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{returnTo?:string|string[]}>}){const query=await searchParams;const returnTo=adminReturn(query.returnTo);if(await getAdminUser())redirect(returnTo);return <main id="main" className="page-width"><div className="setup-card"><h1>Administrator sign-in.</h1><p>Manage listings and review property enquiries.</p><AdminLogin ready={isAdminConfigured()} returnTo={returnTo}/></div></main>;}
