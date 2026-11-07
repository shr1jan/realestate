"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Property } from "@/lib/properties";
export function ContactForm({ p }: { p: Property }) {
  const dialog = useRef<HTMLDialogElement>(null); const [busy,setBusy] = useState(false); const [sent,setSent] = useState(false); const [error,setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/inquiries", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...Object.fromEntries(form), listingId:p.id }) });
      const data = await response.json() as { error: string }; if(!response.ok) throw new Error(data.error); setSent(true);
    } catch(e) { setError(e instanceof Error ? e.message : "Your message could not be sent. Please try again."); } finally {setBusy(false);}
  }
  return <><button className="button button-primary" onClick={() => dialog.current?.showModal()}>Enquire about this home<ArrowUpRight size={18}/></button><p className="contact-note">A question, a viewing, a new beginning.</p>
    <dialog className="form-dialog" ref={dialog} onClick={e => {if(e.target === dialog.current) dialog.current.close();}} aria-labelledby="enquiry-heading"><button className="dialog-close icon-button" onClick={() => dialog.current?.close()} aria-label="Close enquiry"><X size={22}/></button>
    {sent ? <div className="form-success"><Check size={32}/><h2 id="enquiry-heading">You’ve made the first move.</h2><p>Your enquiry about {p.title} has been received. The listing manager can now review your message.</p>{p.demo && <p className="form-help">This is a demonstration home. No real agent has been contacted.</p>}<button className="button button-primary" onClick={() => dialog.current?.close()}>Back to the home</button></div> : <><h2 id="enquiry-heading">Let’s talk about this home.</h2><p className="dialog-subtitle">{p.title} · {p.neighborhood}</p><form onSubmit={submit} onChange={() => setError("")} className="stack-form"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Full name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com"/></label><label>Phone number <span className="muted">(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Your phone number"/></label><label>Your message<textarea name="message" required minLength={10} maxLength={3000} rows={4} defaultValue={`Hi, I’m interested in ${p.title}. I’d love to learn more and arrange a viewing.`}/></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>{p.demo && <p className="form-help">This is a demo listing. Your enquiry appears in the admin portal and does not contact a real agent.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? "Sending your enquiry…" : "Send enquiry"}<ArrowUpRight size={18}/></button><p className="form-help">Your details will only be used to respond to this property enquiry.</p></form></>}
    </dialog></>;
}
