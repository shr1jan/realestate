"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Property } from "@/lib/properties";
import { inquirySchema, validationFields } from "@/lib/validation";
import { RequestError, requestJson } from "@/lib/client-api";

export function ContactForm({ p }: { p: Property }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const sending = useRef(false);
  const [busy,setBusy] = useState(false);
  const [sent,setSent] = useState(false);
  const [error,setError] = useState("");
  const [errors,setErrors] = useState<Record<string,string>>({});
  const close = () => { if (!sending.current) dialog.current?.close(); };
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (sending.current) return;
    setError("");
    const form = new FormData(e.currentTarget);
    const parsed = inquirySchema.safeParse({ ...Object.fromEntries(form), listingId:p.id });
    if (!parsed.success) {
      setErrors(validationFields(parsed.error));
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus());
      return;
    }
    sending.current = true; setBusy(true); setErrors({});
    try {
      await requestJson("/api/inquiries", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...parsed.data, website:form.get("website") }) });
      setSent(true); dialog.current?.scrollTo({top:0,behavior:"instant"});
    } catch(e) {
      setError(e instanceof Error ? e.message : "Your message could not be sent. Please try again.");
      if (e instanceof RequestError) setErrors(e.fields);
    } finally { sending.current = false; setBusy(false); }
  }
  const fieldError = (name:string) => errors[name] && <span className="form-error" id={`enquiry-${name}-error`}>{errors[name]}</span>;
  return <>
    <button className="button button-primary" onClick={() => dialog.current?.showModal()}>Enquire about this home<ArrowUpRight size={18}/></button>
    <p className="contact-note">A question, a viewing, a new beginning.</p>
    <dialog className="form-dialog" ref={dialog} aria-labelledby="enquiry-heading" onCancel={e=>{if(sending.current)e.preventDefault();}} onClick={e=>{if(e.target===dialog.current)close();}}>
      <div className="dialog-header"><h2 id="enquiry-heading">{sent ? "You’ve made the first move." : "Let’s talk about this home."}</h2><button type="button" className="icon-button" onClick={close} disabled={busy} aria-label="Close enquiry"><X size={22}/></button></div>
      <div className="dialog-body">{sent ? <div className="form-success"><Check size={32}/><p>Your enquiry about {p.title} has been received. The listing manager can now review your message.</p>{p.demo && <p className="form-help">This is a demonstration home. No real agent has been contacted.</p>}<button className="button button-primary" onClick={close}>Back to the home</button></div> : <>
        <p className="dialog-subtitle">{p.title} · {p.neighborhood}</p>
        <form onSubmit={submit} onChange={e=>{setError("");const name=e.target.getAttribute("name")||"";setErrors(current=>({...current,[name]:""}));}} className="stack-form" aria-busy={busy}>
          <fieldset disabled={busy}>
            <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Full name" aria-invalid={!!errors.name} aria-describedby={errors.name?"enquiry-name-error":undefined}/>{fieldError("name")}</label>
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email?"enquiry-email-error":undefined}/>{fieldError("email")}</label>
            <label><span>Phone number <span className="muted">(optional)</span></span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Your phone number"/></label>
            <label>Your message<textarea name="message" required minLength={10} maxLength={3000} rows={4} defaultValue={`Hi, I’m interested in ${p.title}. I’d love to learn more and arrange a viewing.`} aria-invalid={!!errors.message} aria-describedby={errors.message?"enquiry-message-error":undefined}/>{fieldError("message")}</label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
          </fieldset>
          {p.demo && <p className="form-help">This is a demo listing. Your enquiry appears in the admin portal and does not contact a real agent.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? "Sending your enquiry…" : "Send enquiry"}<ArrowUpRight size={18}/></button>
          <p className="form-help">Your details will only be used to respond to this property enquiry.</p>
        </form>
      </>}</div>
    </dialog>
  </>;
}
