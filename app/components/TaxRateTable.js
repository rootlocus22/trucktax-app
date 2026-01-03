export default function TaxRateTable() {
    const rates = [
        { w: "55,000 lbs", t: "$100.00" },
        { w: "56,000 lbs", t: "$122.00" },
        { w: "60,000 lbs", t: "$210.00" },
        { w: "70,000 lbs", t: "$430.00" },
        { w: "75,000 lbs", t: "$550.00 (Max)" },
        { w: "80,000 lbs", t: "$550.00" },
    ];

    return (
        <div className="my-12 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">HVUT Tax Rate Reference (2025-2026)</h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                        <th className="p-4">Gross Weight</th>
                        <th className="p-4">Annual Tax</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {rates.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-700">{r.w}</td>
                            <td className="p-4 text-green-700 font-bold">{r.t}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="p-4 font-medium text-slate-700">Logging Vehicles</td>
                        <td className="p-4 text-green-700 font-bold">Reduced Rate (See Calculator)</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
