"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    router.replace("/login");
                    return;
                }

                if (!session) {
                    router.replace("/login");
                    return;
                }

                setEmail(session.user.email ?? null);
                setUserIsAdmin(isAdmin(session.user.email));
                setLoading(false);
            } catch {
                router.replace("/login");
            }
        };

        checkSession();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
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
                        {/* Logo & Nav */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                                <span className="text-emerald-400">CEIR</span>
                                <span className="text-white">GO</span>
                            </Link>
                            <nav className="hidden sm:flex items-center gap-1">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors"
                                >
                                    📊 Dashboard
                                </Link>
                                {userIsAdmin && (
                                    <Link
                                        href="/admin"
                                        className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors"
                                    >
                                        ⚙️ Admin Panel
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-700/30 rounded-lg">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-sm text-dark-300">{email}</span>
                            </div>
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
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
