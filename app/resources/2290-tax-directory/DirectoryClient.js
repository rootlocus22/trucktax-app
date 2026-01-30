"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Truck, Calculator, FileText, ChevronLeft, ChevronRight, Grip } from "lucide-react";

export default function DirectoryClient({ allRoutes }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Filter Logic
    const filteredRoutes = useMemo(() => {
        let routes = allRoutes;

        // 1. Filter by Tab
        if (activeTab === "state") {
            routes = routes.filter(r => r.type === "state-deadline" || r.type === "state-type");
        } else if (activeTab === "calculator") {
            routes = routes.filter(r => r.type === "calculator" || r.type === "state-calculator");
        } else if (activeTab === "vin") {
            routes = routes.filter(r => r.type === "vin");
        }

        // 2. Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            routes = routes.filter(r => r.url.toLowerCase().includes(lowerTerm));
        }

        return routes;
    }, [allRoutes, searchTerm, activeTab]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const currentRoutes = filteredRoutes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to page 1 on tab switch
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#173b63] to-[#0f172a] text-white pt-16 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Find Your Tax Guide
                    </h1>
                    <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                        Quick access to <span className="font-bold text-white">{allRoutes.length}+</span> filing guides and calculators
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by state, vehicle type, or manufacturer..."
                            className="w-full pl-12 pr-6 py-4 rounded-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-2xl text-lg font-medium transition-shadow"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 pb-24 relative z-20">
                {/* Tabs */}
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-wrap justify-center gap-2 mb-8 max-w-3xl mx-auto">
                    <TabButton active={activeTab === "all"} onClick={() => handleTabChange("all")} icon={Grip} label="All Guides" />
                    <TabButton active={activeTab === "state"} onClick={() => handleTabChange("state")} icon={MapPin} label="By State" />
                    <TabButton active={activeTab === "calculator"} onClick={() => handleTabChange("calculator")} icon={Calculator} label="Tax Calculators" />
                    <TabButton active={activeTab === "vin"} onClick={() => handleTabChange("vin")} icon={FileText} label="VIN Help" />
                </div>

                {/* Content Grid */}
                {filteredRoutes.length > 0 ? (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                            {currentRoutes.map((route, i) => (
                                <DirectoryCard key={i} route={route} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                <span className="text-sm font-bold text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No matches found</h3>
                        <p className="text-slate-500">Try a different search term or clear your filters.</p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${active
                ? "bg-[#173b63] text-white shadow-md transform scale-105"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
        >
            <Icon className={`w-4 h-4 ${active ? "text-blue-200" : "text-slate-400"}`} />
            {label}
        </button>
    );
}

function DirectoryCard({ route }) {
    const title = route.url.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Determine Icon & Color based on type
    let icon = FileText;
    let colorClass = "bg-blue-50 text-blue-600";
    let typeLabel = "Guide";

    if (route.type.includes("state")) {
        icon = MapPin;
        colorClass = "bg-orange-50 text-orange-600";
        typeLabel = route.type === "state-deadline" ? "State Filing" : "State Guide";
    } else if (route.type.includes("calculator")) {
        icon = Calculator;
        colorClass = "bg-green-50 text-green-600";
        typeLabel = "Tax Calculator";
    } else if (route.type === "vin") {
        icon = Truck;
        colorClass = "bg-purple-50 text-purple-600";
        typeLabel = "VIN Help";
    }

    const Icon = icon;

    return (
        <Link href={route.url} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                        {title}
                    </h3>
                    <span className="inline-block bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                        {typeLabel}
                    </span>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <span className="text-sm text-blue-600 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
                    View Guide
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>
        </Link>
    );
}
