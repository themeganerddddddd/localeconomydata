"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Home", "/"],
  ["Counties", "/counties"],
  ["Compare", "/compare"],
  ["Industries", "/industries"],
  ["Regions", "/regions"],
  ["Guides", "/guides"],
  ["Methodology", "/methodology"],
  ["About", "/about"]
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="/" className="text-lg font-semibold tracking-tight text-ink">LocalEconomyData</a>
        <button className="rounded-md border border-slate-200 p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => <a key={href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-ink" href={href}>{label}</a>)}
        </div>
      </nav>
      {open && <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">{links.map(([label, href]) => <a key={href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700" href={href}>{label}</a>)}</div>}
    </header>
  );
}
