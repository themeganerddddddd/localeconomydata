export default function NaicsSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      NAICS filter
      <select className="rounded-md border border-slate-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All seeded industries</option>
        <option value="541">Professional services</option>
        <option value="621">Ambulatory health care</option>
        <option value="23">Construction</option>
        <option value="3254">Pharmaceutical manufacturing</option>
        <option value="5112">Software publishers</option>
      </select>
    </label>
  );
}
