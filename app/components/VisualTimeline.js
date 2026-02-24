export default function VisualTimeline() {
    const steps = [
        { title: "Gather Vehicle Info", desc: "Have your VIN (Vehicle Identification Number) and Gross Taxable Weight ready. You can find the VIN on your registration or dashboard." },
        { title: "Choose Tax Period", desc: "Select the current tax year (July 1 - June 30). If filing late, our system automatically calculates prorated taxes for you." },
        { title: "E-File with IRS", desc: "Submit your return securely. We check for common errors before sending to the IRS to prevent rejections." },
        { title: "Get Schedule 1", desc: "Receive your IRS-stamped Schedule 1 proof of payment via email instantly once accepted. No waiting for mail." }
    ];

    return (
        <div className="my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-[#0f172a] mb-8 text-center">4 Simple Steps to File</h3>
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 hidden sm:block"></div>

                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <div key={i} className="relative flex flex-col sm:flex-row gap-6">
                            <div className="flex-none">
                                <div className="w-8 h-8 rounded-full bg-[#173b63] text-white flex items-center justify-center font-bold text-sm relative z-10 shadow-md ring-4 ring-white">
                                    {i + 1}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[#0f172a] mb-2">{step.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8 text-center">
                <a href="/ucr/file" className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition">
                    Start UCR Filing
                </a>
                <a href="/services/form-2290-filing" className="inline-block ml-3 border border-slate-300 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-50 transition">
                    Form 2290 guide
                </a>
            </div>
        </div>
    );
}
