"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Heart, Menu, X, LogOut } from "lucide-react";
export type User = { userId: string; displayName: string; email: string; isAdmin: boolean } | null;
type SavedContextType = { user: User; saved: string[]; setSaved: (id: string, value: boolean) => void; notify: (message: string) => void };
const SavedContext = createContext<SavedContextType>({ user: null, saved: [], setSaved: () => {}, notify: () => {} });
export const useSaved = () => useContext(SavedContext);
export function SiteShell({ user, initialSaved, children }: { user: User; initialSaved: string[]; children: React.ReactNode }) {
  const pathname = usePathname(); const admin = pathname.startsWith("/admin");
  const [saved, setSavedState] = useState(initialSaved); const [open, setOpen] = useState(false); const [toast, setToast] = useState("");
  useEffect(() => { setSavedState(initialSaved); }, [initialSaved.join(",")]);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(""), 4200); return () => clearTimeout(id); } }, [toast]);
  return <SavedContext.Provider value={{ user, saved, setSaved: (id, value) => setSavedState(prev => value ? [...new Set([...prev, id])] : prev.filter(v => v !== id)), notify: setToast }}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="wordmark" aria-label="Stillwell home">Stillwell<span className="brand-dot">.</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/homes" className={!admin && pathname !== "/saved" && pathname !== "/login" ? "nav-active" : ""}>Browse homes</Link>
        <Link href="/saved" className={pathname === "/saved" ? "nav-active" : ""}>Saved homes{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</Link>
        {user?.isAdmin && <Link href="/admin" className={admin ? "nav-active" : ""}>Admin portal</Link>}
      </nav>
      <div className="header-actions">{user ? <><span className="account-name" title={user.email}>{user.displayName.split(" ")[0].split("@")[0]}</span><a href="/signout-with-chatgpt?return_to=/" target="_top" className="icon-button" aria-label="Sign out"><LogOut size={18}/></a></> : <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="sign-in">Sign in <ArrowUpRight size={16}/></Link>}
        <button className="icon-button mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={23}/> : <Menu size={23}/>}</button>
      </div>
    </div>{open && <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/homes">Browse homes</Link><Link href="/saved">Saved homes ({saved.length})</Link>{user?.isAdmin && <Link href="/admin">Admin portal</Link>}</nav>}</header>
    {children}
    <footer className="site-footer"><div className="footer-top"><Link href="/" className="wordmark">Stillwell<span className="brand-dot">.</span></Link><p>A little more considered.<br/>A little more like home.</p><div><Link href="/homes">Browse homes <ArrowUpRight size={15}/></Link><Link href="/saved">Your saved homes <Heart size={14}/></Link><Link href="/admin">Admin portal <ArrowUpRight size={15}/></Link></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Stillwell. Find your own kind of home.</span><span>Demonstration homes & illustrative photography. <Link href="/about">About this site</Link></span></div>
    </footer>
    <div className={`toast ${toast ? "toast-visible" : ""}`} role="status">{toast}</div>
  </SavedContext.Provider>;
}

