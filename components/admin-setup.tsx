"use client";
import { useState } from "react";

import { ArrowRight } from "lucide-react";
export function AdminSetup() {
  const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  return <div className="setup-card"><h1>A home for your listings.</h1><p>This account doesn't have administrator access. If you're the site owner, enter your private setup key to activate the portal.</p><form className="setup-form" onChange={() => setError("")} onSubmit={async e => {e.preventDefault();setBusy(true);setError("");const form=new FormData(e.currentTarget);try{const r=await fetch("/api/admin/setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:form.get("key")})});const d=await r.json() as { error: string };if(!r.ok)throw new Error(d.error);window.location.reload();}catch(e){setError(e instanceof Error?e.message:"Setup failed. Please try again.");}finally{setBusy(false);}}}><label>Private setup key<input name="key" type="password" required autoComplete="off" maxLength={256}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy?"Setting up your portal...":"Activate admin portal"}<ArrowRight size={18}/></button></form><p className="form-help">Already have an administrator? Sign in with the account used to set up this portal.</p></div>;
}


