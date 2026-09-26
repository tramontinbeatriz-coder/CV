import type { Metadata } from "next";

export const metadata: Metadata = { title: "painel", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="admin min-h-svh bg-cream text-ink">{children}</div>;
}
