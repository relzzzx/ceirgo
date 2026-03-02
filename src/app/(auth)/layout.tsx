"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        console.log('[Auth Layout] Checking session...');

        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                console.log('[Auth Layout] Session check result:', { hasSession: !!session, error });
                
                if (error) {
                    console.error("Auth session error:", error);
                    setChecking(false);
                    return;
                }

                if (session) {
                    console.log('[Auth Layout] User logged in, redirecting to dashboard');
                    router.replace("/dashboard");
                } else {
                    console.log('[Auth Layout] No session, allowing auth pages');
                    setChecking(false);
                }
            } catch (err) {
                console.error("Failed to check auth session:", err);
                setChecking(false);
            }
        };

        checkSession();
    }, [router]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            {/* WhatsApp Help Button - Fixed */}
            <a
                href="https://wa.me/6281930014177?text=Halo%20min,%20saya%20ingin%20bertanya%20mengenai%20layanan%20roaming%20IMEI.%20Terima%20kasih."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
                title="Contact Admin via WhatsApp"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.777c0 2.428.742 4.776 2.153 6.788l-2.295 8.385a.75.75 0 00.961.96l8.385-2.295a9.873 9.873 0 006.788 2.153 9.872 9.872 0 009.777-9.746c0-5.369-4.362-9.743-9.777-9.777z" />
                </svg>
            </a>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        <span className="text-emerald-400">CEIR</span>
                        <span className="text-white">GO</span>
                    </h1>
                    <p className="text-dark-400 text-sm mt-1">Roaming Activation Service</p>
                </div>
                {children}
                
                {/* Footer Help */}
                <div className="mt-8 pt-6 border-t border-dark-600 text-center">
                    <p className="text-dark-400 text-xs mb-3">Need help? Contact us</p>
                    <a
                        href="https://wa.me/6281930014177?text=Halo%20min,%20saya%20ingin%20bertanya%20mengenai%20layanan%20roaming%20IMEI.%20Terima%20kasih."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.777c0 2.428.742 4.776 2.153 6.788l-2.295 8.385a.75.75 0 00.961.96l8.385-2.295a9.873 9.873 0 006.788 2.153 9.872 9.872 0 009.777-9.746c0-5.369-4.362-9.743-9.777-9.777z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
