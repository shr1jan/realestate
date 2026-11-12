"use client";
import { useRef, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { requestJson } from "@/lib/client-api";
async function submitAuth(action: string, callbackUrl: string) {
  const { csrfToken } = await requestJson<{csrfToken:string}>("/api/auth/csrf", { method: "GET" });
  if (typeof csrfToken !== "string" || !csrfToken) throw new Error("Sign-in could not start. Please refresh and try again.");
  const form = document.createElement("form"); form.method = "POST"; form.action = `/api/auth/${action}`; form.target = "_top";
  for (const [name,value] of Object.entries({ csrfToken, callbackUrl })) { const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input); }
  document.body.appendChild(form); form.submit();
}
export function GoogleSignIn({ ready, returnTo }: { ready: boolean; returnTo: string }) {
  const [busy,setBusy] = useState(false); const [error,setError] = useState(""); const pending = useRef(false);
  return <><button className="button button-primary" disabled={!ready || busy} onClick={async()=>{if(pending.current)return;pending.current=true;setBusy(true);setError("");try{await submitAuth("signin/google",returnTo);}catch(e){setError(e instanceof Error?e.message:"Sign-in could not start. Please try again.");pending.current=false;setBusy(false);}}}>{busy ? "Opening Google…" : "Continue with Google"}<ArrowRight size={18}/></button>{!ready && <p className="form-help" role="status">Google sign-in is being configured. You can browse homes in the meantime.</p>}{error && <p className="form-error" role="alert">{error}</p>}</>;
}
export function SignOutButton({ switchAccount=false }: { switchAccount?:boolean }) {
  const [busy,setBusy] = useState(false); const [error,setError] = useState(""); const pending = useRef(false);
  return <><button className={switchAccount?"button button-primary":"icon-button"} disabled={busy} aria-label={switchAccount?"Switch account":"Sign out"} onClick={async()=>{if(pending.current)return;pending.current=true;setBusy(true);setError("");try{await submitAuth("signout",switchAccount?"/login?returnTo=%2Fadmin":"/");}catch(e){setError(e instanceof Error?e.message:"Sign-out failed. Please try again.");pending.current=false;setBusy(false);}}}>{switchAccount ? <>{busy?"Signing out…":"Switch account"}<ArrowRight size={18}/></> : <LogOut size={18}/>}</button>{error && <span className="form-error" role="alert">{error}</span>}</>;
}
