import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShieldCheck, ArrowRight, Calculator, FileText, Calendar, Compass, Truck, MapPin, ChevronRight } from "lucide-react";
import { adminDb as db } from "@/lib/firebaseAdmin";

import PseoImage from "../components/PseoImage";
import VisualTimeline from "../components/VisualTimeline";
import TaxRateTable from "../components/TaxRateTable";
import GeneralFaq from "../components/GeneralFaq";

// Regex Patterns
// RegexPatterns
// RegexPatterns
const PATTERN_A_DEADLINE = /^filing-2290-(?<month>\w+)-(?<year>\d{4})$/;
const PATTERN_B_CALCULATOR = /^2290-tax-for-(?<weight>\d+)-lb-(?<vehicle_type>[\w-]+)$/;
const PATTERN_C_VIN = /^(?<make>[\w-]+)-vin-decoding$/;
const PATTERN_D_STATE_DEADLINE = /^filing-2290-in-(?<state>[\w-]+)$/;
const PATTERN_E_STATE_CALCULATOR = /^2290-tax-for-(?<weight>\d+)-lb-truck-in-(?<state>[\w-]+)$/;
const PATTERN_F_STATE_TYPE = /^2290-tax-for-(?<vehicle_type>[\w-]+)-in-(?<state>[\w-]+)$/;


function parseSlug(slug) {
    const matchA = slug.match(PATTERN_A_DEADLINE);
    if (matchA) return { type: "deadline", ...matchA.groups };

    const matchB = slug.match(PATTERN_B_CALCULATOR);
    // Be careful, matchB might collide with matchE if not strict. 
    // Usually 'truck-in-state' vs 'truck-type' is distinct enough if type doesn't contain 'truck-in'.
    // Best to check longer patterns first.

    const matchE = slug.match(PATTERN_E_STATE_CALCULATOR);
    if (matchE) return { type: "state-calculator", ...matchE.groups };

    if (matchB) return { type: "calculator", ...matchB.groups };

    const matchC = slug.match(PATTERN_C_VIN);
    if (matchC) return { type: "vin", ...matchC.groups };

    const matchD = slug.match(PATTERN_D_STATE_DEADLINE);
    if (matchD) return { type: "state-deadline", ...matchD.groups };

    const matchF = slug.match(PATTERN_F_STATE_TYPE);
    if (matchF) return { type: "state-type", ...matchF.groups };

    return null;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = parseSlug(slug);

    if (!data) return {};

    // Try to fetch meta from DB if available for better SEO
    let dbMeta = {};
    try {
        const docRef = db.collection("pseo_pages").doc(slug);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            dbMeta = docSnap.data();
        }
    } catch (e) {
        // ignore
    }

    // Improved fallback titles with keyword optimization
    const generateOptimizedTitle = (slug, data) => {
        if (dbMeta.meta_title) return dbMeta.meta_title;

        // Extract keywords from slug
        const slugWords = slug.replace(/-/g, ' ');

        // For calculator pages, include price and value prop
        if (data.type === "calculator" || data.type === "state-calculator") {
            const weight = data.weight ? `${parseInt(data.weight).toLocaleString()} lb` : '';
            const vehicle = data.vehicle_type ? data.vehicle_type.replace(/-/g, ' ') : '';
            const state = data.state ? ` in ${data.state.replace(/-/g, ' ')}` : '';
            return `Form 2290 Tax for ${weight} ${vehicle}${state} | File Online $34.99`;
        }

        // For deadline pages, include urgency
        if (data.type === "deadline" || data.type === "state-deadline") {
            const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1) : '';
            const year = data.year || '';
            const state = data.state ? ` in ${data.state.replace(/-/g, ' ')}` : '';
            return `Form 2290 ${month} ${year}${state} | Deadline & Rates | QuickTruckTax`;
        }

        // For vehicle type pages
        if (data.type === "state-type") {
            const vehicle = data.vehicle_type ? data.vehicle_type.replace(/-/g, ' ') : '';
            const state = data.state ? ` in ${data.state.replace(/-/g, ' ')}` : '';
            return `Form 2290 for ${vehicle}${state} | Guide & E-File Info | QuickTruckTax`;
        }

        // Default: guide-focused (we don't file 2290)
        return `${slugWords.charAt(0).toUpperCase() + slugWords.slice(1)} | Form 2290 Guide | QuickTruckTax`;
    };

    const generateOptimizedDescription = (slug, data) => {
        if (dbMeta.meta_description) return dbMeta.meta_description;

        const slugWords = slug.replace(/-/g, ' ');

        if (data.type === "calculator" || data.type === "state-calculator") {
            const weight = data.weight ? `${parseInt(data.weight).toLocaleString()} lb` : '';
            const vehicle = data.vehicle_type ? data.vehicle_type.replace(/-/g, ' ') : '';
            const state = data.state ? ` in ${data.state.replace(/-/g, ' ')}` : '';
            return `Form 2290 (HVUT) guide for ${weight} ${vehicle}${state}. Deadlines, rates, and how to e-file. We file UCR.`;
        }

        if (data.type === "deadline" || data.type === "state-deadline") {
            const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1) : '';
            const year = data.year || '';
            return `Form 2290 deadlines for ${month} ${year}. Learn prorated rates and how to e-file. QuickTruckTax focuses on UCR filing.`;
        }

        return `Guide for ${slugWords}. Form 2290 deadlines, rates, and e-file options. We file UCR—see our Form 2290 guide for HVUT.`;
    };

    const title = generateOptimizedTitle(slug, data);
    const description = generateOptimizedDescription(slug, data);

    // Common OpenGraph Data
    const ogData = {
        title,
        description,
        url: `https://www.quicktrucktax.com/${slug}`,
        siteName: 'QuickTruckTax',
        locale: 'en_US',
        type: 'article',
    }

    // Base Metadata
    const baseUrl = 'https://www.quicktrucktax.com';
    const currentUrl = `${baseUrl}/${slug}`;

    // Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": title,
                "item": currentUrl
            }
        ]
    };

    const commonMeta = {
        title: title,
        description: description,
        alternates: {
            canonical: currentUrl, // CRITICAL FIX: Override layout canonical
        },
        openGraph: {
            ...ogData,
            url: currentUrl
        },
        other: {
            'script:ld+json': JSON.stringify(breadcrumbSchema) // Inject Breadcrumbs
        }
    };

    if (data.type === "deadline") {
        const month = data.month.charAt(0).toUpperCase() + data.month.slice(1);
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `Filing Form 2290 in ${month} ${data.year}: Deadlines & Prorated Rates`,
            description: dbMeta.meta_description || `Need to file Form 2290 in ${month} ${data.year}? Learn about prorated tax amounts, deadlines, and how to get your Schedule 1 instantly with QuickTruckTax.`,
        };
    }

    if (data.type === "calculator") {
        const type = data.vehicle_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `Form 2290 Tax for ${parseInt(data.weight).toLocaleString()} lb ${type} (2025-2026)`,
            description: dbMeta.meta_description || `Calculate HVUT for a ${parseInt(data.weight).toLocaleString()} lb ${type}. See the exact tax table rates and e-file your return in minutes.`,
        };
    }

    if (data.type === "vin") {
        const make = data.make.charAt(0).toUpperCase() + data.make.slice(1);
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `${make} VIN Decoding for Form 2290 Filing`,
            description: dbMeta.meta_description || `Locate and decode your ${make} VIN for IRS Form 2290. Avoid rejection errors with our free VIN check and e-file securely.`,
        };
    }

    if (data.type === "state-deadline") {
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `Filing Form 2290 in ${data.state} | QuickTruckTax`,
            description: dbMeta.meta_description || `Complete guide for ${data.state} truckers on filing IRS Form 2290, paying HVUT, and registering vehicles with the local DMV/DOT.`,
        }
    }

    if (data.type === "state-calculator") {
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `2290 Tax for ${data.weight}lb Truck in ${data.state}`,
            description: dbMeta.meta_description || `Calculate federal HVUT for ${data.weight} pound trucks operating in ${data.state}.`,
        }
    }

    if (data.type === "state-type") {
        const type = data.vehicle_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const stateName = data.state.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        return {
            ...commonMeta,
            title: dbMeta.meta_title || `Form 2290 Tax for ${type} in ${stateName}`,
            description: dbMeta.meta_description || `Complete guide to HVUT tax requirements for ${type}s operating in ${stateName}.`,
        }
    }
}

function extractHeaders(html) {
    const headers = [];
    const regex = /<h2.*?>(.*?)<\/h2>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const id = match[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        headers.push({ id, text: match[1] });
    }
    return headers;
}

function processContent(html, headers) {
    let processedHash = html;
    headers.forEach(h => {
        processedHash = processedHash.replace(`<h2>${h.text}</h2>`, `<h2 id="${h.id}" class="text-2xl font-bold text-slate-900 mt-8 mb-4 scroll-mt-24">${h.text}</h2>`);
    });
    return processedHash;
}

export default async function PseoPage({ params }) {
    const { slug } = await params;
    const data = parseSlug(slug);

    if (!data) {
        notFound();
    }

    // Fetch Content from Firestore
    let displayData = {};
    try {
        // Debug: Check which project we are connecting to
        console.log("Connecting to Firebase Project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

        const docRef = db.collection("pseo_pages").doc(slug);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            displayData = docSnap.data();
        } else {
            // Fallback content if generation hasn't happened yet or failed
            console.warn(`pSEO content not found for ${slug}, using fallback.`);
            displayData = {
                intro_html: `<p>Detailed guide for ${slug.replace(/-/g, ' ')} is being generated. Please check back shortly.</p>`,
                tips_html: "<p>Standard compliance rules apply.</p>",
                faq: [{ q: "When is the deadline?", a: "The annual deadline is August 31st." }]
            };
        }
    } catch (error) {
        console.error("Error fetching pSEO data:", error);
        displayData = {
            intro_html: `<p>Error loading content: ${error.message}. Please try again.</p>`,
            tips_html: "<p>Unable to load tips.</p>",
            faq: []
        };
    }

    // Template Logic
    if (data.type === "deadline") {
        const month = data.month.charAt(0).toUpperCase() + data.month.slice(1);
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                <header className="mb-12 text-center max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4 uppercase tracking-wider">
                        {data.year} Tax Season Guide
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0f172a] mb-6 leading-tight">
                        Filing Form 2290 in <span className="text-[#f97316]">{month} {data.year}</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Your complete guide to prorated taxes, deadlines, and compliance for {month}.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area */}
                    <article className="lg:col-span-8 order-2 lg:order-1">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 prose prose-lg prose-blue max-w-none"
                            dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-12">
                            <h3 className="flex items-center gap-2 font-bold text-[#0f172a] text-xl mb-4">
                                <ShieldCheck className="w-6 h-6 text-green-600" />
                                Expert Tips for {month}
                            </h3>
                            <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: displayData.tips_html }} />
                        </div>

                        <VisualTimeline />
                        <GeneralFaq />

                        {/* Removed the original FAQ section as GeneralFaq replaces it */}
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <div className="sticky top-24 space-y-6">
                            <CtaBox />
                            <UcrCtaBox />
                            <RelatedGuides currentSlug={slug} data={data} />
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    // --- TEMPLATE B: CALCULATOR (Power Page) ---
    if (data.type === "calculator") {
        const type = data.vehicle_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const weightNum = parseInt(data.weight);
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        // Determine image
        const vehicleImages = {
            "logging-truck": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200",
            "semi-truck": "https://images.unsplash.com/photo-1586021884144-8393557e4925?auto=format&fit=crop&q=80&w=1200",
            "dump-truck": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200",
            "default": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200"
        };
        const bgImage = Object.values(vehicleImages).find((_, i) => slug.includes(Object.keys(vehicleImages)[i])) || vehicleImages["default"];


        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* JSON-LD Schema (Kept from previous) */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": `Form 2290 Filing for ${type}`,
                        "description": `E-file Form 2290 for a ${type} (${weightNum} lbs).`,
                        "provider": { "@type": "Organization", "name": "QuickTruckTax" }
                    })
                }} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <header className="col-span-12 lg:col-span-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="py-1 px-3 rounded-full bg-green-100 text-green-800 text-sm font-bold uppercase tracking-wider">
                                2025-2026 Calculator
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-green-600" /> Verified Content
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0f172a] mb-6 leading-tight">
                            Tax for {weightNum.toLocaleString()} lb {type}
                        </h1>
                    </header>

                    {/* Left Rail: Content */}
                    <article className="lg:col-span-8 col-span-12 space-y-12">
                        {/* Hero Image */}
                        <div className="rounded-3xl overflow-hidden shadow-lg h-[400px] relative">
                            <PseoImage src={bgImage} alt={type} className="w-full h-full object-cover" fallbackSrc={vehicleImages.default} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Estimated Tax</p>
                                    <p className="text-5xl font-black">${(weightNum >= 75000 ? 550 : 100 + ((weightNum - 55000) / 1000) * 22).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-lg prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-2xl mb-6">Expert Compliance Tips</h3>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: displayData.tips_html }} />
                        </div>

                        <VisualTimeline />
                        <TaxRateTable />
                        <GeneralFaq />
                    </article>

                    {/* Right Rail: Sidebar */}
                    <aside className="lg:col-span-4 col-span-12 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <div className="sticky top-24 space-y-6">
                            <CtaBox />
                            <UcrCtaBox />
                            <RelatedGuides currentSlug={slug} data={data} />
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    // --- TEMPLATE C: VIN (Power Page Layout) ---
    if (data.type === "vin") {
        const make = data.make.charAt(0).toUpperCase() + data.make.slice(1);
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="grid lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8 order-2 lg:order-1">
                        <header className="mb-8">
                            <span className="text-sm font-bold text-purple-600 tracking-wide uppercase">VIN Decoder</span>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] mt-2 leading-tight">
                                <span className="text-[#f97316]">{make}</span> VIN Decoding for Form 2290
                            </h1>
                            <p className="text-xl text-slate-600 mt-4">
                                Accurate VIN reporting is critical for avoiding IRS rejection code R0000-058.
                            </p>
                        </header>

                        <div className="prose prose-lg text-slate-600 mb-12" dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                        <div className="bg-[#0f172a] text-slate-300 p-8 rounded-2xl relative overflow-hidden mb-12">
                            <div className="relative z-10">
                                <h3 className="text-white font-bold text-lg mb-4">VIN Checklist</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">1</span>
                                        Check Driver's Side Door Jamb
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">2</span>
                                        Check Dashboard (Driver Side)
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">3</span>
                                        Verify against Registration
                                    </li>
                                </ul>
                                <div className="mt-8 pt-8 border-t border-slate-700">
                                    <p className="text-xs text-slate-400 mb-2 font-mono">EXAMPLE VIN:</p>
                                    <div className="font-mono text-xl text-white tracking-widest bg-black/30 p-3 rounded border border-slate-600 text-center">
                                        1M2P...4589
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-12">
                            <h3 className="text-2xl font-bold mb-6 text-[#0f172a]">Manufacturer Specifics</h3>
                            <div className="prose prose-purple max-w-none" dangerouslySetInnerHTML={{ __html: displayData.tips_html }} />
                        </div>

                        <VisualTimeline />
                        <GeneralFaq />
                    </article>

                    <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <CtaBox />
                        <UcrCtaBox />
                        <RelatedGuides currentSlug={slug} />
                    </aside>
                </div>
            </div>
        );
    }

    // --- TEMPLATE D: STATE DEADLINE ---
    if (data.type === "state-deadline") {
        const stateName = data.state.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="grid lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8 order-2 lg:order-1">
                        <h1 className="text-4xl font-extrabold mb-6 text-[#0f172a]">Filing 2290 in <span className="text-red-600">{stateName}</span></h1>
                        <div className="prose prose-lg prose-slate max-w-none mb-12" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                        <div className="grid md:grid-cols-2 gap-6">
                            {displayData.faq?.map((f, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-xl">
                                    <h4 className="font-bold text-sm mb-2">{f.q}</h4>
                                    <p className="text-xs text-slate-600">{f.a}</p>
                                </div>
                            ))}
                        </div>
                        <VisualTimeline />
                        <GeneralFaq />
                    </article>
                    <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <CtaBox />
                        <UcrCtaBox />
                        <RelatedGuides currentSlug={slug} />
                    </aside>
                </div>
            </div>
        )
    }

    // --- TEMPLATE E: STATE CALCULATOR ---
    if (data.type === "state-calculator") {
        const stateName = data.state.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const weightNum = parseInt(data.weight);
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="grid lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8 order-2 lg:order-1">
                        <header className="mb-8">
                            <span className="text-sm font-bold text-purple-600 tracking-wide uppercase">State Calculator</span>
                            <h1 className="text-4xl font-extrabold text-[#0f172a] mt-2">
                                {weightNum.toLocaleString()} lb Truck Tax in {stateName}
                            </h1>
                        </header>
                        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                        <VisualTimeline />
                        <TaxRateTable />
                        <GeneralFaq />
                    </article>
                    <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <div className="bg-[#0f172a] text-white p-6 rounded-2xl text-center">
                            <p className="text-sm opacity-70 mb-2">Estimated Tax</p>
                            <p className="text-4xl font-black">${(weightNum >= 75000 ? 550 : 100 + ((weightNum - 55000) / 1000) * 22).toFixed(2)}</p>
                            <Link href="/services/form-2290-filing" className="mt-4 block bg-[#f97316] text-white font-bold py-3 rounded-lg hover:bg-orange-600">
                                Form 2290 guide
                            </Link>
                        </div>
                        <UcrCtaBox />
                        <RelatedGuides currentSlug={slug} />
                    </aside>
                </div>
            </div>
        )
    }

    // --- TEMPLATE F: STATE TYPE ---
    if (data.type === "state-type") {
        const stateName = data.state.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const type = data.vehicle_type.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const headers = extractHeaders(displayData.intro_html || "");
        const contentWithIds = processContent(displayData.intro_html || "", headers);

        return (
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="grid lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8 order-2 lg:order-1">
                        <header className="mb-8">
                            <span className="text-sm font-bold text-blue-600 tracking-wide uppercase">State Guide</span>
                            <h1 className="text-4xl font-extrabold text-[#0f172a] mt-2">
                                {type} Tax in {stateName}
                            </h1>
                        </header>
                        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-12">
                            <h3 className="font-bold text-2xl mb-6">Specific rules for {stateName}</h3>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: displayData.tips_html }} />
                        </div>

                        <VisualTimeline />
                        <GeneralFaq />
                    </article>
                    <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <TrustBox />
                        <TableOfContents headers={headers} />
                        <CtaBox />
                        <UcrCtaBox />
                        <RelatedGuides currentSlug={slug} />
                    </aside>
                </div>
            </div>
        )
    }

    // Fallback
    return <div className="p-12 text-center">Template Not Found</div>
}

// --- COMPONENTS ---

function TrustBox({ centered = false }) {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${centered ? 'mx-auto max-w-sm' : ''}`}>
            <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Expert Verified</p>
                    <p className="text-[10px] text-slate-500">Updated: Jan 3, 2025</p>
                </div>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
                This guide is reviewed by our IRS compliance team to ensure accuracy with current 2025-2026 tax laws.
            </p>
        </div>
    );
}

function TableOfContents({ headers }) {
    if (!headers || headers.length === 0) return null;
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 hidden lg:block">
            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">On This Page</h4>
            <ul className="space-y-3">
                {headers.map((h, i) => (
                    <li key={i}>
                        <a href={`#${h.id}`} className="text-sm text-slate-600 hover:text-[#173b63] hover:underline block truncate transition-colors">
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Components moved to /app/components/ for lazy loading

function CtaBox() {
    return (
        <div className="bg-[#173b63] rounded-xl p-6 text-white text-center shadow-lg">
            <h4 className="font-bold text-lg mb-2">Form 2290 Guide</h4>
            <p className="text-blue-200 text-sm mb-6">Learn deadlines, rates, and how to e-file. We file UCR.</p>
            <Link href="/services/form-2290-filing" className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3 rounded-lg transition-colors">
                Form 2290 guide
            </Link>
        </div>
    )
}

function UcrCtaBox() {
    return (
        <div className="bg-indigo-600 rounded-xl p-6 text-white text-center shadow-lg relative overflow-hidden mt-6">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/50 text-indigo-100 text-[10px] font-bold mb-3 uppercase tracking-wider border border-indigo-400">
                    DOT Compliance
                </span>
                <h4 className="font-bold text-lg mb-2">Need your 2026 UCR?</h4>
                <p className="text-indigo-200 text-sm mb-6">Avoid fines. File now with $0 upfront.</p>
                <Link href="/services/ucr-registration" className="block w-full bg-white text-indigo-600 font-bold py-3 rounded-lg transition-colors hover:bg-slate-50 border border-indigo-100 shadow-sm flex items-center justify-center gap-2">
                    Get UCR <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}


function RelatedGuides({ currentSlug, data }) {
    // Strategic internal linking based on page type
    const getRelatedGuides = () => {
        const baseGuides = [
            { label: "Form 2290 Guide", href: "/services/form-2290-filing", icon: "file", priority: true },
            { label: "HVUT Tax Calculator", href: "/tools/hvut-calculator", icon: "calculator", priority: true },
            { label: "Form 2290 Ultimate Guide", href: "/insights/form-2290-ultimate-guide", icon: "guide", priority: true },
        ];

        // Add context-specific guides based on page type
        if (data?.type === "state-calculator" || data?.type === "state-deadline" || data?.type === "state-type") {
            const state = data.state?.replace(/-/g, ' ');
            if (state) {
                baseGuides.push(
                    { label: `Form 2290 in ${state}`, href: `/filing-2290-in-${data.state}`, icon: "map", priority: false },
                    { label: `${state} Tax Guide`, href: `/insights/state/${data.state}`, icon: "map", priority: false }
                );
            }
        }

        if (data?.type === "calculator" || data?.type === "state-calculator") {
            const weight = data.weight ? parseInt(data.weight) : null;
            if (weight) {
                // Add nearby weight guides
                const nearbyWeights = [weight - 5000, weight + 5000].filter(w => w >= 55000 && w <= 80000);
                nearbyWeights.forEach(w => {
                    baseGuides.push({
                        label: `Form 2290 for ${w.toLocaleString()} lb Truck`,
                        href: `/2290-tax-for-${w}-lb-truck${data.state ? `-in-${data.state}` : ''}`,
                        icon: "truck",
                        priority: false
                    });
                });
            }
        }

        // Add popular state guides
        const popularStates = [
            { name: "Texas", slug: "texas" },
            { name: "California", slug: "california" },
            { name: "Florida", slug: "florida" },
            { name: "Ohio", slug: "ohio" },
        ];

        popularStates.forEach(state => {
            if (!currentSlug.includes(state.slug)) {
                baseGuides.push({
                    label: `${state.name} Tax Guide`,
                    href: `/filing-2290-in-${state.slug}`,
                    icon: "map",
                    priority: false
                });
            }
        });

        // Sort: priority first, then by relevance
        return baseGuides
            .filter(g => g.href !== `/${currentSlug}`)
            .sort((a, b) => {
                if (a.priority && !b.priority) return -1;
                if (!a.priority && b.priority) return 1;
                return 0;
            })
            .slice(0, 6);
    };

    const guides = getRelatedGuides();

    const getIcon = (type) => {
        if (type === 'truck') return <Truck className="w-4 h-4 text-blue-500" />;
        if (type === 'map') return <MapPin className="w-4 h-4 text-red-500" />;
        if (type === 'calculator') return <Calculator className="w-4 h-4 text-green-500" />;
        if (type === 'file') return <FileText className="w-4 h-4 text-orange-500" />;
        if (type === 'guide') return <FileText className="w-4 h-4 text-purple-500" />;
        return <Compass className="w-4 h-4 text-slate-500" />;
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative group/box">
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover/box:opacity-[0.05] transition-opacity">
                <Compass className="w-32 h-32 text-slate-900 rotate-12" />
            </div>
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                <Compass className="w-5 h-5 text-[#f97316]" />
                Explore Related Guides
            </h3>
            <div className="space-y-3 relative z-10">
                {guides.map((guide, i) => (
                    <Link key={i} href={guide.href} className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm">
                            {getIcon(guide.icon)}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors flex-1">
                            {guide.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>
            <div className="mt-6 text-center relative z-10">
                <Link href="/services/form-2290-filing" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-1">
                    Form 2290 guide <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
