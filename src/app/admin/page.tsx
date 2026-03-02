"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

interface Order {
    id: string;
    user_id: string;
    imei: string;
    model: string | null;
    status: string;
    proof_url: string | null;
    created_at: string;
}

const STATUS_OPTIONS = [
    "Menunggu Verifikasi",
    "Diproses",
    "Aktif",
    "Ditolak",
];

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

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const hasChecked = useRef(false);

    const fetchOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAdmin = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error || !session) {
                    router.replace("/login");
                    return;
                }
                if (!isAdmin(session.user.email)) {
                    router.replace("/dashboard");
                    return;
                }
                await fetchOrders();
            } catch {
                router.replace("/login");
            }
        };

        checkAdmin();
    }, [router, fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (!error) {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
        }
        setActionLoading(null);
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        setActionLoading(orderId);
        const { error } = await supabase
            .from("orders")
            .delete()
            .eq("id", orderId);

        if (!error) {
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
        setActionLoading(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-sm border-b border-dark-600/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                                <span className="text-emerald-400">CEIR</span>
                                <span className="text-white">GO</span>
                            </Link>
                            <span className="bg-red-500/10 text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-500/30">
                                Admin Panel
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://wa.me/6281930014177?text=Halo%20min,%20saya%20ingin%20bertanya%20mengenai%20layanan%20roaming%20IMEI.%20Terima%20kasih."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                                title="Contact Admin via WhatsApp"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.777c0 2.428.742 4.776 2.153 6.788l-2.295 8.385a.75.75 0 00.961.96l8.385-2.295a9.873 9.873 0 006.788 2.153 9.872 9.872 0 009.777-9.746c0-5.369-4.362-9.743-9.777-9.777z" />
                                </svg>
                                Help
                            </a>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Hero */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Manage Orders</h1>
                    <p className="text-dark-400">
                        View and manage all user roaming activation requests
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
                        <p className="text-dark-400 text-sm mb-2">Total Orders</p>
                        <p className="text-3xl font-bold text-white">{orders.length}</p>
                    </div>
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
                        <p className="text-dark-400 text-sm mb-2">Pending Verification</p>
                        <p className="text-3xl font-bold text-yellow-400">{orders.filter(o => o.status === "Menunggu Verifikasi").length}</p>
                    </div>
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
                        <p className="text-dark-400 text-sm mb-2">Active</p>
                        <p className="text-3xl font-bold text-emerald-400">{orders.filter(o => o.status === "Aktif").length}</p>
                    </div>
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
                        <p className="text-dark-400">No orders found</p>
                    </div>
                ) : (
                    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-600">
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            IMEI
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            Model
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            User ID
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            Status
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            Proof
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            Date
                                        </th>
                                        <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-700">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-dark-700/50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-mono text-white">
                                                {order.imei}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-dark-400">
                                                {order.model || "-"}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-dark-400 font-mono">
                                                {order.user_id.slice(0, 8)}...
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                {order.proof_url ? (
                                                    <a
                                                        href={order.proof_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-dark-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-dark-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        disabled={actionLoading === order.id}
                                                        className="text-xs py-1 px-2 rounded-md"
                                                    >
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        disabled={actionLoading === order.id}
                                                        className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors cursor-pointer p-1"
                                                        title="Delete order"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
