export default function GeneralFaq() {
    const faqs = [
        { q: "What is a Stamped Schedule 1?", a: "It is the official proof of payment for the Heavy Vehicle Use Tax (HVUT). You need this document to register your vehicle with the DMV." },
        { q: "When is Form 2290 due?", a: "For the annual tax period (July 1 - June 30), it is due by August 31st. For newly purchased vehicles, it is due by the end of the month following the month of first use." },
        { q: "Can I pay by credit card?", a: "Yes, you can pay the IRS directly using a credit card, debit card, or EFTPS. Bank account withdrawal is also an option." },
        { q: "What if I suspended my vehicle?", a: "If you expect to drive less than 5,000 miles (7,500 for agriculture), you can file as 'Suspended' and pay $0 tax. However, you must still file Form 2290." }
    ];

    return (
        <div className="my-12">
            <h3 className="font-bold text-2xl text-[#0f172a] mb-6">Common Questions About Form 2290</h3>
            <div className="space-y-4">
                {faqs.map((f, i) => (
                    <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden p-2">
                        <summary className="flex justify-between items-center cursor-pointer font-bold text-slate-900 p-4 marker:content-none hover:bg-slate-50 rounded-lg transition">
                            {f.q}
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3 mt-2">
                            {f.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}
