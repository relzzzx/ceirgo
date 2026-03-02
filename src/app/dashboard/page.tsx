"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Order {
    id: string;
    imei: string;
    model: string | null;
    status: string;
    proof_url: string | null;
    created_at: string;
}

function maskImei(imei: string): string {
    if (imei.length < 8) return imei;
    return imei.slice(0, 4) + "****" + imei.slice(-4);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "Menunggu Verifikasi":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        case "Diproses":
            return "bg-blue-500/10 text-blue-400 border-blue-500/30";
        case "Aktif":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        case "Ditolak":
            return "bg-red-500/10 text-red-400 border-red-500/30";
        default:
            return "bg-dark-500/30 text-dark-400 border-dark-500";
    }
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const activeOrders = orders.filter(o => !["Ditolak"].includes(o.status));
    const historyOrders = orders.filter(o => ["Ditolak"].includes(o.status) || o.status === "Aktif");

    return (
        <div>
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back! 👋</h1>
                <p className="text-emerald-300 text-lg">
                    Activate your device for 90 days of overseas roaming
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link
                    href="/dashboard/order"
                    className="group bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-xl transition-all hover:scale-105 cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg mb-1">Add Roamer (3 Months)</h3>
                            <p className="text-emerald-100 text-sm">Create a new activation request</p>
                        </div>
                        <svg className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div className="text-sm text-emerald-100">→ Start new activation</div>
                </Link>

                <div className="bg-dark-800 border border-dark-600 p-6 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-white mb-1">Active Orders</h3>
                            <p className="text-dark-400 text-sm">Currently processing</p>
                        </div>
                        <div className="text-3xl font-bold text-emerald-400">
                            {activeOrders.filter(o => o.status !== "Ditolak").length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-2 border-b border-dark-600">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                            activeTab === "active"
                                ? "border-emerald-500 text-emerald-400"
                                : "border-transparent text-dark-400 hover:text-white"
                        }`}
                    >
                        Active Orders ({activeOrders.filter(o => o.status !== "Ditolak").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                            activeTab === "history"
                                ? "border-emerald-500 text-emerald-400"
                                : "border-transparent text-dark-400 hover:text-white"
                        }`}
                    >
                        History ({historyOrders.length})
                    </button>
                </div>
            </div>

            {/* Orders Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-dark-400">Loading orders...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === "active" ? (
                        activeOrders.filter(o => o.status !== "Ditolak").length === 0 ? (
                            <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
                                <svg className="w-12 h-12 mx-auto text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-dark-400 mb-4">No active orders yet</p>
                                <Link
                                    href="/dashboard/order"
                                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create your first order
                                </Link>
                            </div>
                        ) : (
                            activeOrders.filter(o => o.status !== "Ditolak").map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))
                        )
                    ) : historyOrders.length === 0 ? (
                        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
                            <svg className="w-12 h-12 mx-auto text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-dark-400">No history yet</p>
                        </div>
                    ) : (
                        historyOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    return (
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 hover:border-dark-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-white font-bold">{maskImei(order.imei)}</span>
                        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    {order.model && (
                        <p className="text-sm text-dark-400">📱 {order.model}</p>
                    )}
                </div>
                {order.proof_url && (
                    <a
                        href={order.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                    >
                        View Proof
                    </a>
                )}
            </div>
            <p className="text-xs text-dark-500">
                Submitted {formatDate(order.created_at)}
            </p>
        </div>
    );
}
