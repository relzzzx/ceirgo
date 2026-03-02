"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    console.log('[Home] Checking session...');

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[Home] Session check:', { hasSession: !!session, error });
        
        if (error) {
          console.error("Session error:", error);
          router.replace("/login");
          return;
        }

        if (session) {
          console.log('[Home] Session found, redirecting to dashboard');
          router.replace("/dashboard");
        } else {
          console.log('[Home] No session, redirecting to login');
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to check session:", err);
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-dark-400">Loading...</span>
      </div>
    </div>
  );
}
