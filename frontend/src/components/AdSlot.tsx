export default function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </div>
  );
}
