import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * MIDDLEWARE - Route Protection
 * 
 * Handles authentication and role-based redirects for both doctors and patients.
 */
export async function middleware(req: NextRequest) {
    // Get token using unified cookie name
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
    });

    const { pathname } = req.nextUrl;

    // Public routes - accessible without authentication
    const publicRoutes = [
        "/",
        "/login",
        "/api/auth", // Unified auth base path
        "/api/v1",   // Public APIs
    ];

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const isApiRoute = pathname.startsWith("/api");

    // ============================================
    // UNAUTHENTICATED USERS
    // ============================================
    if (!token) {
        if (isPublicRoute) return NextResponse.next();

        if (isApiRoute) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log(`🔴 No token. Redirecting ${pathname} to /login`);
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // ============================================
    // AUTHENTICATED USERS (Shared Session)
    // ============================================
    const role = token.role;

    // Log for debugging
    console.log(`✅ ${role?.toUpperCase()}: ${token.email}, Path: ${pathname}`);

    // Allow API routes if authenticated
    if (isApiRoute) return NextResponse.next();

    // 1. Redirect away from login page
    if (pathname === "/login") {
        if (role === "doctor") {
            return NextResponse.redirect(new URL(token.isProfileComplete ? "/doctor/dashboard" : "/doctor/profile", req.url));
        }
        return NextResponse.redirect(new URL("/patient/dashboard", req.url));
    }

    // 2. Doctor specific logic
    if (role === "doctor") {
        // Force profile completion
        if (!token.isProfileComplete && !pathname.startsWith("/doctor/profile") && !isPublicRoute) {
            console.log(`⚠️ Doctor profile incomplete. Redirecting to /doctor/profile`);
            return NextResponse.redirect(new URL("/doctor/profile", req.url));
        }
        // Block doctors from patient routes
        if (pathname.startsWith("/patient")) {
            return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
        }
    }

    // 3. Patient specific logic
    if (role === "patient") {
        // Block patients from doctor routes
        if (pathname.startsWith("/doctor")) {
            return NextResponse.redirect(new URL("/patient/dashboard", req.url));
        }
    }

    return NextResponse.next();
}
