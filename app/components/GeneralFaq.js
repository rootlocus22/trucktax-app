export default function GeneralFaq() {
    const faqs = [
        { q: "What is a UCR confirmation?", a: "It is the official proof of your Unified Carrier Registration. You need this document to operate legally in interstate commerce." },
        { q: "When is UCR due?", a: "UCR must be filed by December 31 each year for the following calendar year. The registration window opens October 1." },
        { q: "Can I pay by credit card?", a: "Yes, you can pay the IRS directly using a credit card, debit card, or EFTPS. Bank account withdrawal is also an option." },
        { q: "Who needs to file UCR?", a: "Anyone operating commercial motor vehicles in interstate commerce with a USDOT number must file UCR annually." }
    ];

    return (
        <div className="my-12">
            <h3 className="font-bold text-2xl text-[#0f172a] mb-6">Common Questions About UCR</h3>
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
