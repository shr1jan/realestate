import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { savedIds, viewer } from "@/lib/server";

export const metadata: Metadata = {
  title: { default: "Stillwell — A place to call your own", template: "%s — Stillwell" },
  description: "Discover thoughtfully chosen homes in Austin. Browse, explore and save the places that feel like you.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await viewer();
  const saved = await savedIds(user?.userId);
  return (
    <html lang="en">
      <body><SiteShell user={user} initialSaved={saved}>{children}</SiteShell></body>
    </html>
  );
}
