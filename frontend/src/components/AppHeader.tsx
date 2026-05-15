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
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-semibold tracking-tight text-ink">LocalEconomyData</a>
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 font-medium ${active ? "bg-blue-50 text-accent" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
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
