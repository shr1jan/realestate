"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "@/components/link";
import { SignOutButton } from "./google-sign-in";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, Menu, X } from "lucide-react";
export type User = { userId: string; displayName: string; email: string; isAdmin: boolean } | null;
type SavedContextType = { user: User; saved: string[]; setSaved: (id: string, value: boolean) => void; notify: (message: string) => void };
const SavedContext = createContext<SavedContextType>({ user: null, saved: [], setSaved: () => {}, notify: () => {} });
export const useSaved = () => useContext(SavedContext);
export function SiteShell({ user, initialSaved, children }: { user: User; initialSaved: string[]; children: React.ReactNode }) {
  const pathname = usePathname(); const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const [saved, setSavedState] = useState(initialSaved); const [open, setOpen] = useState(false); const [toast, setToast] = useState("");
  const [returnTo, setReturnTo] = useState(pathname);
  useEffect(() => { setSavedState(initialSaved); }, [initialSaved.join(",")]);
  useEffect(() => { setOpen(false); setReturnTo(window.location.pathname + window.location.search + window.location.hash); }, [pathname]);
  useEffect(() => {
    if(admin)return;
    try { const message = sessionStorage.getItem("kadel-flash"); if (message) { setToast(message); sessionStorage.removeItem("kadel-flash"); } } catch { /* Storage is optional. */ }
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".mobile-toggle")?.focus(); } };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, [open]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(""), 4200); return () => clearTimeout(id); } }, [toast]);
  if(admin) return <>{children}</>;
  return <SavedContext.Provider value={{ user, saved, setSaved: (id, value) => setSavedState(prev => value ? [...new Set([...prev, id])] : prev.filter(v => v !== id)), notify: setToast }}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="wordmark" aria-label="Kadel Builders home">Kadel Builders<span className="brand-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/homes" className={pathname === "/" || pathname.startsWith("/homes") ? "nav-active" : ""} aria-current={pathname === "/" || pathname.startsWith("/homes") ? "page" : undefined}>Browse homes</Link>
        <Link href="/saved" className={pathname === "/saved" ? "nav-active" : ""}>Saved homes{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</Link>

      </nav>
      <div className="header-actions">{user ? <><span className="account-name" title={user.email}>{user.displayName.split(" ")[0].split("@")[0]}</span><SignOutButton/></> : <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="sign-in">Sign in <ArrowUpRight size={16}/></Link>}
        <button className="icon-button mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={23}/> : <Menu size={23}/>}</button>
      </div>
    </div>{open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><Link href="/homes">Browse homes</Link><Link href="/saved">Saved homes ({saved.length})</Link></nav>}</header>
    {children}
    <footer className="site-footer"><div className="footer-top"><Link href="/" className="wordmark">Kadel Builders<span className="brand-dot">.</span></Link><p>A little more considered.<br/>A little more like home.</p><div><Link href="/homes">Browse homes <ArrowUpRight size={15}/></Link><Link href="/saved">Your saved homes <Heart size={14}/></Link></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Kadel Builders. Find your own kind of home.</span><span>Demonstration homes & illustrative photography. <Link href="/about">About this site</Link></span></div>
    </footer>
    <div className={`toast ${toast ? "toast-visible" : ""}`} role="status">{toast}</div>
  </SavedContext.Provider>;
}

