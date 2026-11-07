"use client";
import { useState } from "react";

import { ArrowRight } from "lucide-react";
import { requestJson } from "@/lib/client-api";
import Link from "@/components/link";
export function AdminSetup({configured=false}:{configured?:boolean}) {
  const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  if(configured) return <div className="setup-card"><h1>Administrator access required.</h1><p>This account can browse and save homes. Sign in with the account that manages the listings to open this portal.</p><a href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top" className="button button-primary">Switch account<ArrowRight size={18}/></a><br/><Link href="/homes" className="text-link">Back to homes</Link></div>;
  return <div className="setup-card"><h1>A home for your listings.</h1><p>This account doesn't have administrator access. If you're the site owner, enter your private setup key to activate the portal.</p><form className="setup-form" onChange={() => setError("")} onSubmit={async e => {e.preventDefault();setBusy(true);setError("");const form=new FormData(e.currentTarget);try{await requestJson("/api/admin/setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:form.get("key")})});window.location.reload();}catch(e){setError(e instanceof Error?e.message:"Setup failed. Please try again.");}finally{setBusy(false);}}}><label>Private setup key<input name="key" type="password" required autoComplete="off" maxLength={256}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy?"Setting up your portal...":"Activate admin portal"}<ArrowRight size={18}/></button></form><p className="form-help">Already have an administrator? Sign in with the account used to set up this portal.</p></div>;
}


