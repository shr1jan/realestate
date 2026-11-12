"use client";
import {useRef,useState} from "react";
import {requestJson} from "@/lib/client-api";
export function AdminLogin({ready,returnTo}:{ready:boolean;returnTo:string}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const pending=useRef(false);
 return <form className="stack-form" onChange={()=>setError("")} onSubmit={async e=>{e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setError("");const form=new FormData(e.currentTarget);try{const result=await requestJson<{redirect:string}>("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:form.get("username"),password:form.get("password"),returnTo})});window.location.assign(result.redirect);}catch(e){setError(e instanceof Error?e.message:"Could not sign in. Please try again.");pending.current=false;setBusy(false);}}}>
 <fieldset disabled={!ready||busy}><label>Username<input name="username" required autoComplete="username" maxLength={100}/></label><label>Password<input name="password" type="password" required autoComplete="current-password" maxLength={256}/></label></fieldset>
 {!ready&&<p className="form-help">Administrator sign-in is being configured.</p>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={!ready||busy}>{busy?"Signing in…":"Sign in to admin"}</button></form>;
}
