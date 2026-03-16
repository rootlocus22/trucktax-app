/**
 * EasyUCR vs competitors comparison table
 */
export function ComparisonTable() {
  const rows = [
    { feature: 'Service fee', easyucr: '$79', jjKeller: '~$120', foley: '~$100', cns: '$75', others: '$100–$300' },
    { feature: 'Pay upfront?', easyucr: 'No', jjKeller: 'Yes', foley: 'Yes', cns: 'Yes', others: 'Yes' },
    { feature: 'Filing speed', easyucr: '<10 min', jjKeller: '24–48 hrs', foley: '24 hrs', cns: '24 hrs', others: 'Varies' },
    { feature: 'Price transparency', easyucr: 'Full', jjKeller: 'Partial', foley: 'Partial', cns: 'Partial', others: 'Hidden' },
    { feature: 'Annual reminders', easyucr: 'Yes', jjKeller: 'Yes', foley: 'Yes', cns: 'No', others: 'No' },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-[var(--color-page-alt)] border-b border-slate-200">
            <th className="px-4 py-3 font-semibold text-slate-900">Feature</th>
            <th className="px-4 py-3 font-semibold text-[var(--color-orange)] bg-[var(--color-orange-soft)]">EasyUCR</th>
            <th className="px-4 py-3 font-semibold text-slate-700">JJ Keller</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Foley</th>
            <th className="px-4 py-3 font-semibold text-slate-700">CNS</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Others</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
              <td className="px-4 py-3 font-medium text-slate-900">{row.feature}</td>
              <td className="px-4 py-3 font-semibold text-[var(--color-orange)] bg-[var(--color-orange-soft)]/60">{row.easyucr}</td>
              <td className="px-4 py-3 text-slate-600">{row.jjKeller}</td>
              <td className="px-4 py-3 text-slate-600">{row.foley}</td>
              <td className="px-4 py-3 text-slate-600">{row.cns}</td>
              <td className="px-4 py-3 text-slate-600">{row.others}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
