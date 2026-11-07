import Link from "@/components/link";
import { ArrowRight } from "lucide-react";
export default function NotFound() { return <main id="main" className="error-page page-width"><h1>This door isn’t open.</h1><p>The page or home you’re looking for may have moved or is no longer available.</p><Link href="/homes" className="button button-primary">Explore available homes<ArrowRight size={18}/></Link></main>; }

