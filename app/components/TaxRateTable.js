export default function TaxRateTable() {
    const tiers = [
        { fleet: "0–2 power units", fee: "$76" },
        { fleet: "3–5 power units", fee: "$227" },
        { fleet: "6–20 power units", fee: "$452" },
        { fleet: "21–100 power units", fee: "$1,267" },
        { fleet: "101–1,000 power units", fee: "$6,335" },
        { fleet: "1,001+ power units", fee: "$63,350" },
    ];

    return (
        <div className="my-12 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">UCR Fee Tiers (2026)</h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                        <th className="p-4">Fleet Size</th>
                        <th className="p-4">Annual Fee</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {tiers.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-700">{r.fleet}</td>
                            <td className="p-4 text-green-700 font-bold">{r.fee}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
