import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Middleware is disabled - protection is handled client-side in layout files
    // This prevents redirect loops caused by cookie format mismatches
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
