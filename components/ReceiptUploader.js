"use client";

import { useState } from 'react';

export default function ReceiptUploader({ onScanComplete }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handeUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/ocr/receipt', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to scan receipt');
            }

            if (onScanComplete) {
                onScanComplete(result.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-1">
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--color-text)]">Upload Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-[var(--color-muted)]
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-[var(--color-page-alt)] file:text-[var(--color-navy)]
            hover:file:bg-[var(--color-page)]
            cursor-pointer"
                />
            </div>

            {preview && (
                <div className="mb-4 relative h-48 w-full bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
                    <img
                        src={preview}
                        alt="Receipt Preview"
                        className="object-contain w-full h-full"
                    />
                </div>
            )}

            {error && (
                <div className="mb-4 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                    Note: {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-3">
                    <div className="animate-bounce mb-2">
                        <span className="text-3xl">🚚</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-navy)] animate-pulse">
                        Analyzing Receipt...
                    </span>
                </div>
            ) : (
                <button
                    onClick={handeUpload}
                    disabled={!file}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all transform duration-200 flex items-center justify-center gap-2.5
          ${!file
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'
                            : 'bg-gradient-to-r from-[var(--color-orange)] to-[#ff8f33] text-white hover:-translate-y-1 hover:shadow-orange-500/30 active:scale-[0.98]'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <span>Extract Details with AI</span>
                </button>
            )}
        </div>
    );
}
