const navItems = [
  { href: "/", label: "Map" },
  { href: "/rankings/fastest-growing-counties", label: "Rankings" },
  { href: "/methodology", label: "Methodology" },
  { href: "/data-sources", label: "Data Sources" }
];

export default function AppHeader() {
  const path = window.location.pathname;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 text-sm sm:px-6 lg:px-8">
        <a href="/" className="shrink-0 whitespace-nowrap text-base font-semibold tracking-tight text-ink sm:text-lg">LocalEconomyData</a>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap sm:justify-end sm:gap-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm ${active ? "bg-blue-50 text-accent" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
