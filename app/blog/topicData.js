import React from 'react';

// Truck Brands Data
const truckBrands = [
    { name: 'Peterbilt', models: '389, 579, and 567' },
    { name: 'Kenworth', models: 'W900, T680, and T880' },
    { name: 'Freightliner', models: 'Cascadia, M2 106, and 122SD' },
    { name: 'Volvo', models: 'VNL, VNR, and VHD' },
    { name: 'Mack', models: 'Anthem, Granite, and Pinnacle' },
    { name: 'International', models: 'LT Series, RH Series, and HX Series' },
    { name: 'Western Star', models: '49X, 47X, and 57X' },
    { name: 'Hino', models: 'L Series and XL Series' },
    { name: 'Isuzu', models: 'N-Series and F-Series' },
    { name: 'Ford', models: 'F-650 and F-750' },
    { name: 'Chevrolet', models: 'Silverado 4500HD/5500HD' },
    { name: 'RAM', models: '5500 Chassis Cab' },
    { name: 'GMC', models: 'Sierra 3500HD' },
    { name: 'Tesla', models: 'Semi' },
    { name: 'Nikola', models: 'Tre BEV and FCEV' }
];

// Industries Data
const industries = [
    { name: 'Construction', focus: 'dump trucks, cement mixers, and crane trucks' },
    { name: 'Logging', focus: 'log carriers and chip vans' },
    { name: 'Agriculture', focus: 'grain haulers, livestock trucks, and flatbeds' },
    { name: 'Oil & Gas', focus: 'tankers, vacuum trucks, and rig movers' },
    { name: 'Moving & Storage', focus: 'box trucks and moving vans' },
    { name: 'Food Service', focus: 'refrigerated trucks (reefers) and delivery vans' },
    { name: 'Waste Management', focus: 'garbage trucks, roll-offs, and recyclers' },
    { name: 'Towing & Recovery', focus: 'wreckers, rollbacks, and rotators' },
    { name: 'Landscaping', focus: 'dump trucks and utility trailers' },
    { name: 'Delivery & Logistics', focus: 'box trucks and parcel vans' },
    { name: 'Emergency Services', focus: 'fire trucks and heavy ambulances' },
    { name: 'Utilities', focus: 'bucket trucks and digger derricks' },
    { name: 'Mining', focus: 'heavy haulers and ore trucks' },
    { name: 'Forestry', focus: 'timber trucks and equipment haulers' },
    { name: 'Manufacturing', focus: 'flatbeds and dry vans' }
];

// Months Data
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// FAQs Data
const faqs = [
    { q: 'Can I pay Form 2290 with a credit card?', a: 'Yes, you can use a credit or debit card through an IRS-approved payment processor.' },
    { q: 'Do I need an EIN to file Form 2290?', a: 'Yes, you must have an Employer Identification Number (EIN). You cannot use your Social Security Number (SSN).' },
    { q: 'What is the penalty for late filing?', a: 'The penalty is 4.5% of the total tax due for each month the return is late, plus interest.' },
    { q: 'How do I correct a wrong VIN?', a: 'You must file a Form 2290 Amendment (VIN Correction) to update the VIN. There is no tax due for this.' },
    { q: 'Can I e-file for a suspended vehicle?', a: 'Yes, you can and should e-file for suspended vehicles (Category W) to get your Schedule 1 proof.' },
    { q: 'What if I sold my truck?', a: 'If you sold a truck you paid tax on, you may be eligible for a credit or refund using Form 8849 or a credit on your next 2290.' },
    { q: 'How long does it take to get Schedule 1?', a: 'When you e-file, you typically receive your stamped Schedule 1 within minutes.' },
    { q: 'Is Form 2290 required for 2025?', a: 'Yes, the tax period begins July 1, 2025. All heavy vehicles must file.' },
    { q: 'What is the weight limit for Form 2290?', a: 'Vehicles with a taxable gross weight of 55,000 pounds or more must file.' },
    { q: 'Do I file if I drive less than 5,000 miles?', a: 'Yes, you must file as a Suspended Vehicle (Category W) if you drive under 5,000 miles (7,500 for ag).' },
    { q: 'How do I calculate Taxable Gross Weight?', a: 'Add the empty weight of the truck, trailer, and the maximum load you expect to carry.' },
    { q: 'Can I file 2290 without a computer?', a: 'Yes, many providers offer mobile apps or mobile-friendly websites to file from your phone.' },
    { q: 'What is a stamped Schedule 1?', a: 'It is the official IRS proof of payment required for vehicle registration.' },
    { q: 'Where do I mail Form 2290?', a: 'We recommend e-filing, but if you must mail it, the address depends on whether you are enclosing a payment.' },
    { q: 'Can I pay 2290 with a check?', a: 'Yes, you can mail a check with the payment voucher (Form 2290-V), but e-filing with EFW or card is faster.' },
    { q: 'What is the 2290 tax period?', a: 'The tax period runs from July 1st to June 30th of the following year.' },
    { q: 'Do school buses pay HVUT?', a: 'Government and some educational vehicles are exempt from the tax but may still need to file.' },
    { q: 'What is a VIN correction?', a: 'A process to fix a typo in the Vehicle Identification Number on a previously filed return.' },
    { q: 'How do I get a copy of my Schedule 1?', a: 'If you e-filed, log in to your provider account to download it. If you paper filed, request a copy from the IRS.' },
    { q: 'What is IRS Form 2290 used for?', a: 'It is used to figure and pay the tax due on heavy highway motor vehicles.' },
    { q: 'Who pays the 2290 tax?', a: 'The person in whose name the vehicle is registered under state, Canadian, or Mexican law.' },
    { q: 'When is the 2290 deadline for 2025?', a: 'For vehicles on the road in July 2025, the deadline is September 2, 2025 (since Aug 31 is a Sunday and Sep 1 is Labor Day).' },
    { q: 'What is an authorized e-file provider?', a: 'A private company authorized to safely transmit tax returns electronically to the IRS.' },
    { q: 'Can I file 2290 for free?', a: 'The IRS does not charge to file, but e-file providers charge a service fee. Paper filing is free but slow.' },
    { q: 'What is the tax for 80,000 lbs?', a: 'The maximum tax for vehicles 75,000 lbs and over is $550 per year.' },
    { q: 'Do I need to file for a trailer?', a: 'No, you file for the power unit (truck) but include the trailer\'s weight in the calculation.' },
    { q: 'What if my truck was stolen?', a: 'You can claim a credit for the tax paid if the vehicle was stolen and not recovered.' },
    { q: 'How do I register for EFTPS?', a: 'Visit eftps.gov to enroll. It takes up to 7 days to get your PIN.' },
    { q: 'Can I file 2290 in Spanish?', a: 'Yes, many e-file providers offer support and interfaces in Spanish.' },
    { q: 'What is a Third Party Designee?', a: 'Someone you authorize to discuss your return with the IRS, like your tax preparer.' }
];

// Generators

const generateBrandPosts = () => {
    return truckBrands.map(brand => ({
        id: `form-2290-filing-guide-${brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-trucks`,
        title: `Form 2290 Filing Guide for ${brand.name} Truck Owners`,
        excerpt: `Own a ${brand.name} ${brand.models.split(',')[0]}? Here is everything you need to know about filing HVUT for your ${brand.name} fleet.`,
        category: 'Brand Guides',
        readTime: '4 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [`${brand.name} Form 2290`, `${brand.name} HVUT`, `tax for ${brand.name} trucks`, `heavy vehicle tax ${brand.name}`],
        tableOfContents: [
            { id: 'intro', title: `${brand.name} and HVUT` },
            { id: 'weight', title: 'Determining Taxable Weight' },
            { id: 'filing', title: 'How to File' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">🚛 {brand.name} Owner Alert</p>
                    <p>Whether you drive a classic <strong>{brand.models}</strong> or a new model, if your rig grosses over 55,000 lbs, Uncle Sam wants his cut.</p>
                </div>
                <p className="mb-6">
                    {brand.name} trucks are known for their durability and performance. But owning one of these beasts comes with responsibilities, including the annual Heavy Vehicle Use Tax (HVUT).
                </p>
                <h2 id="weight" className="text-3xl font-bold mt-12 mb-6">Determining Taxable Weight for {brand.name}</h2>
                <p className="mb-4">
                    Remember, the tax is based on <strong>Taxable Gross Weight</strong>. This isn't just the weight of your {brand.name} cab. It includes:
                </p>
                <ul className="list-disc ml-6 mb-6 space-y-2">
                    <li>The unloaded weight of the truck.</li>
                    <li>The unloaded weight of any trailer you pull.</li>
                    <li>The maximum load you customarily carry.</li>
                </ul>
                <h2 id="filing" className="text-3xl font-bold mt-12 mb-6">How to File</h2>
                <p className="mb-4">
                    E-filing is the quickest way to get your {brand.name} back on the road with a valid Schedule 1.
                </p>
            </>
        )
    }));
};

const generateIndustryPosts = () => {
    return industries.map(ind => ({
        id: `form-2290-guide-for-${ind.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-')}-industry`,
        title: `Form 2290 Guide for the ${ind.name} Industry`,
        excerpt: `Specialized guide for ${ind.name} professionals using ${ind.focus}. Learn about exemptions and filing tips.`,
        category: 'Industry Guides',
        readTime: '5 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [`${ind.name} truck tax`, `Form 2290 ${ind.name}`, `HVUT for ${ind.focus}`],
        tableOfContents: [
            { id: 'overview', title: `${ind.name} & HVUT` },
            { id: 'exemptions', title: 'Industry Exemptions' },
            { id: 'tips', title: 'Filing Tips' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">🏗️ {ind.name} Fleet Compliance</p>
                    <p>The {ind.name} industry relies on heavy duty vehicles like <strong>{ind.focus}</strong>. Ensure your fleet is compliant with IRS Form 2290.</p>
                </div>
                <p className="mb-6">
                    Managing a fleet in the {ind.name} sector has unique challenges. From variable vehicle weights to seasonal usage, understanding how HVUT applies to your specific situation can save you money.
                </p>
                <h2 id="exemptions" className="text-3xl font-bold mt-12 mb-6">Industry Exemptions</h2>
                <p className="mb-4">
                    Does your vehicle travel less than 5,000 miles on public roads? In the {ind.name} industry, this is common. You may qualify for a <strong>Suspension of Tax</strong>.
                </p>
            </>
        )
    }));
};

const generateMonthPosts = () => {
    return months.map(month => ({
        id: `form-2290-due-date-first-used-${month.toLowerCase()}`,
        title: `Form 2290 Due Date for Vehicles First Used in ${month}`,
        excerpt: `Did you put a new truck on the road in ${month}? Find out your exact Form 2290 filing deadline and avoid penalties.`,
        category: 'Deadlines',
        readTime: '3 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [`Form 2290 deadline ${month}`, `HVUT due date ${month}`, `first used ${month} 2290`],
        tableOfContents: [
            { id: 'deadline', title: 'Your Filing Deadline' },
            { id: 'prorated', title: 'Prorated Tax Amount' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">📅 Deadline Alert: {month}</p>
                    <p>If your vehicle was first used on public highways in <strong>{month}</strong>, your Form 2290 is due by the end of the following month.</p>
                </div>
                <h2 id="deadline" className="text-3xl font-bold mt-12 mb-6">Your Filing Deadline</h2>
                <p className="mb-4">
                    For a vehicle first used in {month}, you must file by the last day of the next month.
                </p>
                <h2 id="prorated" className="text-3xl font-bold mt-12 mb-6">Prorated Tax Amount</h2>
                <p className="mb-4">
                    Good news! Since you didn't use the vehicle for the full tax year (starting July 1), you only pay a partial tax amount.
                </p>
            </>
        )
    }));
};

const generateFAQPosts = () => {
    return faqs.map((faq, index) => ({
        id: `faq-${faq.q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
        title: faq.q,
        excerpt: `Quick answer: ${faq.a} Read more for detailed explanation.`,
        category: 'FAQ',
        readTime: '2 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [faq.q, 'Form 2290 FAQ', 'HVUT questions'],
        tableOfContents: [
            { id: 'answer', title: 'The Answer' },
            { id: 'details', title: 'More Details' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">❓ Question</p>
                    <p className="text-xl">{faq.q}</p>
                </div>
                <h2 id="answer" className="text-3xl font-bold mt-12 mb-6">The Answer</h2>
                <p className="mb-6 text-lg font-medium">{faq.a}</p>
                <h2 id="details" className="text-3xl font-bold mt-12 mb-6">More Details</h2>
                <p className="mb-4">
                    Understanding the details of IRS Form 2290 can be tricky. It is important to get this right to avoid penalties and delays in your vehicle registration.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p>Need more help? Our support team is available to answer your specific questions.</p>
                </div>
            </>
        )
    }));
};

// Additional Topic Generators
const generateTroubleshootingPosts = () => {
    const topics = [
        { title: 'How to Fix a VIN Error on Form 2290', slug: 'fix-vin-error-2290', content: 'Made a typo in your VIN? Don\'t panic. You can file a VIN Correction amendment for free with most providers.' },
        { title: 'What to Do If Your Form 2290 Is Rejected', slug: 'form-2290-rejected-fix', content: 'Rejections happen. Common reasons include name/EIN mismatch. Learn how to identify the error code and resubmit quickly.' },
        { title: 'How to Claim a Credit for a Sold Vehicle', slug: 'claim-credit-sold-vehicle-2290', content: 'If you sold a truck before the year ended, you can get money back. File Form 2290 or Form 8849 to claim your refund.' },
        { title: 'Form 2290 Name Control Mismatch Explained', slug: 'name-control-mismatch-2290', content: 'The IRS matches your business name with your EIN. If they don\'t match exactly, you get rejected. Here is how to find your correct Name Control.' },
        { title: 'How to Amend Taxable Gross Weight', slug: 'amend-gross-weight-2290', content: 'Did you underestimate your load? If your taxable gross weight increases, you must file an amendment and pay the difference.' },
        { title: 'Lost Schedule 1: How to Retrieve It', slug: 'lost-schedule-1-retrieval', content: 'Can\'t find your proof of payment? If you e-filed, it\'s in your email or portal. If you paper filed, you have a harder road ahead.' },
        { title: 'Form 2290 for Leased Vehicles: Who Files?', slug: 'leased-vehicles-2290-filing', content: 'Leasing is complicated. Generally, the carrier (lessee) files if the lease is long-term, but check your contract.' },
        { title: 'Understanding Suspended Vehicle Status', slug: 'suspended-vehicle-status-explained', content: 'Category W is for vehicles driving under 5,000 miles. You file, but pay $0. Learn the rules to avoid an audit.' },
        { title: 'Form 2290 Audit: What to Expect', slug: 'form-2290-audit-guide', content: 'The IRS does audit HVUT returns. Keep your mileage logs and weight tickets organized for at least 3 years.' },
        { title: 'E-File vs Paper File: The Real Cost', slug: 'efile-vs-paper-file-cost-comparison', content: 'Paper filing is "free" but costs you weeks of waiting. E-filing costs a small fee but gives you instant compliance.' }
    ];

    return topics.map(topic => ({
        id: topic.slug,
        title: topic.title,
        excerpt: topic.content,
        category: 'Troubleshooting',
        readTime: '5 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [topic.title, 'Form 2290 help', 'HVUT problems'],
        tableOfContents: [
            { id: 'issue', title: 'The Issue' },
            { id: 'solution', title: 'The Solution' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">⚠️ Troubleshooting Guide</p>
                    <p>{topic.content}</p>
                </div>
                <h2 id="issue" className="text-3xl font-bold mt-12 mb-6">The Issue</h2>
                <p className="mb-4">
                    Trucking is hard enough without tax complications. This guide addresses common issues truckers face with Form 2290.
                </p>
                <h2 id="solution" className="text-3xl font-bold mt-12 mb-6">The Solution</h2>
                <p className="mb-4">
                    Follow these steps to resolve your issue and ensure you remain compliant with the IRS.
                </p>
            </>
        )
    }));
};

const generateGlossaryPosts = () => {
    const terms = [
        { term: 'EIN', full: 'Employer Identification Number', def: 'A 9-digit number assigned by the IRS to identify a business entity. Required for Form 2290.' },
        { term: 'VIN', full: 'Vehicle Identification Number', def: 'A unique 17-character code used to identify individual motor vehicles. Must match your registration.' },
        { term: 'Taxable Gross Weight', full: 'Taxable Gross Weight', def: 'The total weight of the truck, trailer, and maximum load. Used to determine the tax category (A-V).' },
        { term: 'Schedule 1', full: 'Schedule 1', def: 'The proof of payment document returned by the IRS after filing Form 2290. Required for tags.' },
        { term: 'HVUT', full: 'Heavy Highway Vehicle Use Tax', def: 'An annual federal tax on heavy vehicles operating on public highways at 55,000 lbs or more.' },
        { term: 'Form 8849', full: 'Form 8849', def: 'The form used to claim a refund of excise taxes, such as for sold or destroyed vehicles.' },
        { term: 'Suspended Vehicle', full: 'Suspended Vehicle', def: 'A vehicle that travels less than 5,000 miles (7,500 for ag) and is exempt from paying tax, though filing is required.' },
        { term: 'IRP', full: 'International Registration Plan', def: 'A reciprocity agreement among states for commercial vehicle registration. Requires Schedule 1.' },
        { term: 'IFTA', full: 'International Fuel Tax Agreement', def: 'An agreement for the collection and distribution of fuel use tax between states.' },
        { term: 'DOT Number', full: 'USDOT Number', def: 'A unique identifier for companies operating commercial vehicles in interstate commerce.' },
        { term: 'MC Number', full: 'Motor Carrier Number', def: 'An operating authority number issued by the FMCSA for for-hire carriers.' },
        { term: 'UCR', full: 'Unified Carrier Registration', def: 'A federally mandated system for registering operators of commercial vehicles in interstate commerce.' },
        { term: 'BOC-3', full: 'Designation of Agents for Service of Process', def: 'A filing that designates a legal agent in each state where you operate.' },
        { term: 'Intermodal Chassis', full: 'Intermodal Chassis', def: 'A trailer used to transport shipping containers. Often subject to specific HVUT rules.' },
        { term: 'Logging Vehicle', full: 'Logging Vehicle', def: 'A vehicle used exclusively to transport products harvested from a forest. Eligible for lower tax rates.' },
        { term: 'Agricultural Vehicle', full: 'Agricultural Vehicle', def: 'A vehicle used for farming purposes. Eligible for a higher mileage limit (7,500 miles).' },
        { term: 'E-file', full: 'Electronic Filing', def: 'The process of submitting tax returns over the internet. Mandatory for fleets of 25+ vehicles.' },
        { term: 'Tax Period', full: 'Tax Period', def: 'For Form 2290, this runs from July 1 to June 30 of the following year.' },
        { term: 'First Use Month', full: 'Month of First Use', def: 'The month a vehicle is first driven on public highways during the tax period. Determines the due date.' },
        { term: 'Third Party Designee', full: 'Third Party Designee', def: 'A person or company authorized to discuss your tax return with the IRS.' }
    ];

    return terms.map(item => ({
        id: `what-is-${item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-trucking`,
        title: `What is ${item.term}? Trucking Tax Glossary`,
        excerpt: `${item.full}: ${item.def} Learn why this matters for your trucking business.`,
        category: 'Glossary',
        readTime: '2 min',
        date: 'November 2025',
        dateISO: '2025-11-28',
        keywords: [`what is ${item.term}`, `${item.term} meaning`, `trucking ${item.term}`, 'truck tax terms'],
        tableOfContents: [
            { id: 'definition', title: 'Definition' },
            { id: 'importance', title: 'Why It Matters' },
        ],
        relatedPosts: ['ultimate-2026-guide-filing-irs-form-2290'],
        content: (
            <>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-6 mb-8">
                    <p className="font-bold text-lg mb-2">📖 Trucking Terminology</p>
                    <p><strong>{item.full} ({item.term})</strong></p>
                    <p>{item.def}</p>
                </div>
                <h2 id="definition" className="text-3xl font-bold mt-12 mb-6">Definition</h2>
                <p className="mb-4">
                    In the world of trucking and taxes, acronyms are everywhere. <strong>{item.term}</strong> stands for <strong>{item.full}</strong>.
                </p>
                <h2 id="importance" className="text-3xl font-bold mt-12 mb-6">Why It Matters</h2>
                <p className="mb-4">
                    Understanding {item.term} is crucial for maintaining compliance with the IRS and FMCSA.
                </p>
            </>
        )
    }));
};

export const generateTopicPosts = () => {
    return [
        ...generateBrandPosts(),
        ...generateIndustryPosts(),
        ...generateMonthPosts(),
        ...generateFAQPosts(),
        ...generateTroubleshootingPosts(),
        ...generateGlossaryPosts()
    ];
};
