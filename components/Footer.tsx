export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-600 md:grid-cols-[1fr_auto]">
        <div>
          <div className="font-semibold text-ink">LocalEconomyData</div>
          <p className="mt-2 max-w-xl">County-level business expansion, workforce, and local economy intelligence for the DC, Maryland, and Virginia region.</p>
          <p className="mt-3 text-xs">&copy; {new Date().getFullYear()} LocalEconomyData.</p>
        </div>
        <nav className="flex flex-wrap gap-4 font-semibold text-slate-700">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/regions">Regions</a>
          <a href="/guides">Guides</a>
          <a href="/methodology">Methodology</a>
        </nav>
      </div>
    </footer>
  );
}
