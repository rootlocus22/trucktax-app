"use client";

import dynamic from 'next/dynamic';

// Lazy load heavy components with loading fallbacks
export const VisualTimeline = dynamic(() => import('./VisualTimeline'), {
    loading: () => <TimelineSkeleton />,
    ssr: true
});

export const TaxRateTable = dynamic(() => import('./TaxRateTable'), {
    loading: () => <TableSkeleton />,
    ssr: true
});

export const GeneralFaq = dynamic(() => import('./GeneralFaq'), {
    loading: () => <FaqSkeleton />,
    ssr: true
});

// Loading Skeletons to prevent CLS
function TimelineSkeleton() {
    return (
        <div className="my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-8"></div>
            <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-6">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="my-12 overflow-hidden rounded-xl border border-slate-200 shadow-sm animate-pulse">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-64"></div>
            </div>
            <div className="bg-white divide-y divide-slate-100">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="p-4 flex justify-between">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-4 bg-slate-100 rounded w-20"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FaqSkeleton() {
    return (
        <div className="my-12 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
