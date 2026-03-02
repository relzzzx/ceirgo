"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function OrderPage() {
    const router = useRouter();
    const [imei, setImei] = useState("");
    const [model, setModel] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"bca" | "dana" | "qris">("bca");
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const downloadQRIS = () => {
        const link = document.createElement('a');
        link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Crect width='200' height='200' fill='white'/%3E%3Crect x='20' y='20' width='50' height='50' fill='black'/%3E%3Crect x='25' y='25' width='40' height='40' fill='white'/%3E%3Crect x='30' y='30' width='30' height='30' fill='black'/%3E%3Crect x='130' y='20' width='50' height='50' fill='black'/%3E%3Crect x='135' y='25' width='40' height='40' fill='white'/%3E%3Crect x='140' y='30' width='30' height='30' fill='black'/%3E%3Crect x='20' y='130' width='50' height='50' fill='black'/%3E%3Crect x='25' y='135' width='40' height='40' fill='white'/%3E%3Crect x='30' y='140' width='30' height='30' fill='black'/%3E%3Crect x='80' y='80' width='40' height='40' fill='black'/%3E%3C/svg%3E";
        link.download = 'QRIS_CEIRGO.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const validateImei = (value: string): boolean => {
        return /^\d{15}$/.test(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateImei(imei)) {
            setError("IMEI must be exactly 15 digits (numbers only)");
            return;
        }

        if (!file) {
            setError("Proof of transfer is required");
            return;
        }

        setLoading(true);

        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("You must be logged in");
                setLoading(false);
                return;
            }

            let proofUrl: string | null = null;

            // Upload proof file (required)
            const fileExt = file.name.split(".").pop();
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("proofs")
                .upload(fileName, file);

            if (uploadError) {
                setError("Failed to upload proof: " + uploadError.message);
                setLoading(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from("proofs")
                .getPublicUrl(fileName);

            proofUrl = urlData.publicUrl;

            // Insert order
            const { error: insertError } = await supabase.from("orders").insert({
                user_id: session.user.id,
                imei,
                model: model || null,
                proof_url: proofUrl,
            });

            if (insertError) {
                setError("Failed to create order: " + insertError.message);
                setLoading(false);
                return;
            }

            router.replace("/dashboard");
        } catch {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm mb-4 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Add Roamer (3 Months) - Rp 155.000</h1>
                <p className="text-dark-400">
                    Submit your device information for 90-day roaming activation
                </p>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-dark-800 rounded-2xl border border-dark-600 p-8 shadow-xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-8 flex gap-3">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* IMEI Input */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Device IMEI <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="imei"
                                type="text"
                                placeholder="Enter 15-digit IMEI"
                                value={imei}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, "").slice(0, 15);
                                    setImei(v);
                                }}
                                maxLength={15}
                                required
                                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-dark-400 mt-2 flex items-center justify-between">
                                <span>15-digit number, numbers only</span>
                                <span className={imei.length === 15 ? "text-emerald-400 font-medium" : "text-dark-500"}>
                                    {imei.length}/15
                                </span>
                            </p>
                        </div>

                        {/* Model Input */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Device Model <span className="text-dark-500 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="model"
                                type="text"
                                placeholder="e.g., iPhone 15 Pro Max, Samsung Galaxy S24"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-3">
                                Metode Pembayaran <span className="text-red-400">*</span>
                            </label>
                            <div className="space-y-2">
                                {/* BCA */}
                                <label className="flex items-start gap-3 p-4 bg-dark-700 border-2 border-dark-600 hover:border-emerald-500 rounded-lg cursor-pointer transition-all" style={{borderColor: paymentMethod === 'bca' ? '#10b981' : undefined}}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bca"
                                        checked={paymentMethod === 'bca'}
                                        onChange={(e) => setPaymentMethod(e.target.value as "bca" | "dana" | "qris")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">BCA Transfer</p>
                                        <p className="text-xs text-dark-400">5540869008</p>
                                        <p className="text-xs text-dark-400">A/N Aurel Ramdani</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            copyToClipboard('5540869008', 'BCA');
                                        }}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                                    >
                                        {copiedText === 'BCA' ? '✓ Copied' : 'Copy'}
                                    </button>
                                </label>

                                {/* DANA / ShopeePay */}
                                <label className="flex items-start gap-3 p-4 bg-dark-700 border-2 border-dark-600 hover:border-emerald-500 rounded-lg cursor-pointer transition-all" style={{borderColor: paymentMethod === 'dana' ? '#10b981' : undefined}}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="dana"
                                        checked={paymentMethod === 'dana'}
                                        onChange={(e) => setPaymentMethod(e.target.value as "bca" | "dana" | "qris")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">DANA / ShopeePay</p>
                                        <p className="text-xs text-dark-400">081930014177</p>
                                        <p className="text-xs text-dark-400">A/N Aurel Ramdani</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            copyToClipboard('081930014177', 'DANA');
                                        }}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                                    >
                                        {copiedText === 'DANA' ? '✓ Copied' : 'Copy'}
                                    </button>
                                </label>

                                {/* QRIS */}
                                <label className="flex items-start gap-3 p-4 bg-dark-700 border-2 border-dark-600 hover:border-emerald-500 rounded-lg cursor-pointer transition-all" style={{borderColor: paymentMethod === 'qris' ? '#10b981' : undefined}}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="qris"
                                        checked={paymentMethod === 'qris'}
                                        onChange={(e) => setPaymentMethod(e.target.value as "bca" | "dana" | "qris")}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">QRIS Code</p>
                                        <p className="text-xs text-dark-400">Scan dengan aplikasi pembayaran apa pun</p>
                                    </div>
                                </label>
                            </div>

                            {/* QRIS Display */}
                            {paymentMethod === 'qris' && (
                                <div className="mt-4 p-4 bg-dark-700 border border-dark-600 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-dark-400">Scan QRIS di bawah dengan aplikasi pembayaran Anda:</p>
                                        <button
                                            type="button"
                                            onClick={downloadQRIS}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='150' height='150'%3E%3Crect width='200' height='200' fill='white'/%3E%3Crect x='20' y='20' width='50' height='50' fill='black'/%3E%3Crect x='25' y='25' width='40' height='40' fill='white'/%3E%3Crect x='30' y='30' width='30' height='30' fill='black'/%3E%3Crect x='130' y='20' width='50' height='50' fill='black'/%3E%3Crect x='135' y='25' width='40' height='40' fill='white'/%3E%3Crect x='140' y='30' width='30' height='30' fill='black'/%3E%3Crect x='20' y='130' width='50' height='50' fill='black'/%3E%3Crect x='25' y='135' width='40' height='40' fill='white'/%3E%3Crect x='30' y='140' width='30' height='30' fill='black'/%3E%3Crect x='80' y='80' width='40' height='40' fill='black'/%3E%3C/svg%3E" 
                                            alt="QRIS Code" 
                                            className="w-32 h-32"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Bukti Pembayaran - Rp 155.000 <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="proof"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="proof"
                                    className="block w-full px-4 py-8 border-2 border-dashed border-dark-600 rounded-lg hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer text-center"
                                >
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-emerald-400 font-medium">{file.name}</p>
                                            <p className="text-xs text-dark-400">Click to change file</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="text-white font-medium">Click to upload proof</p>
                                            <p className="text-xs text-dark-400">Image or PDF file</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !imei || imei.length !== 15 || !file}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Submit Order"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-6">
                    <div className="max-w-none">
                        <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                            </svg>
                            How it works
                        </h3>
                        <ol className="space-y-3 text-sm text-dark-300">
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-400 shrink-0">1.</span>
                                <span>Enter your device IMEI (15 digits from device settings)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-400 shrink-0">2.</span>
                                <span>Optionally add device model for reference</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-400 shrink-0">3.</span>
                                <span>Upload proof of transfer/payment</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-400 shrink-0">4.</span>
                                <span>Our team verifies and activates your device</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-emerald-400 shrink-0">5.</span>
                                <span>Device remains active for 90 days</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
