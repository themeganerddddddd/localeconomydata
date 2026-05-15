export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>LocalEconomyData uses public economic data from BLS, Census, and BEA sources.</div>
        <nav className="flex flex-wrap gap-4 font-semibold text-slate-700">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
          <a href="/methodology">Methodology</a>
          <a href="/data-sources">Data Sources</a>
        </nav>
      </div>
    </footer>
  );
}
