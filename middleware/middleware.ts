import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * MIDDLEWARE FUNCTION
 * 
 * This function runs on EVERY request that matches the config.matcher pattern (see bottom of file).
 * It checks authentication status and redirects users based on:
 * 1. Whether they are logged in or not
 * 2. Whether their profile is complete or incomplete
 * 3. Which route they are trying to access
 */
export async function middleware(req: NextRequest) {
    // ============================================
    // STEP 1: Get the authentication token
    // ============================================
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Get the current pathname (e.g., "/login", "/doctor/profile", etc.)
    const { pathname } = req.nextUrl;

    // ============================================
    // STEP 2: Define route types
    // ============================================
    // These routes don't require authentication - anyone can access them
    const publicRoutes = ["/", "/login", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check if the current request is for an API route
    const isApiRoute = pathname.startsWith("/api");

    // Check if trying to access doctor-specific routes
    const isDoctorRoute = pathname.startsWith("/doctor");

    // ============================================
    // STEP 3: Handle unauthenticated users
    // ============================================
    // If no token exists (user not logged in) and they're trying to access a protected route
    if (!token && isDoctorRoute) {
        console.log(`🔴 No token found. Redirecting from ${pathname} to home`);

        // For API routes, return a 401 Unauthorized instead of a redirect
        if (isApiRoute) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Redirect to home page instead of login
        return NextResponse.redirect(new URL("/", req.url));
    }

    // ============================================
    // STEP 4: Handle authenticated users
    // ============================================
    if (token) {
        console.log(`✅ Token found for user: ${token.email}, Profile Complete: ${token.isProfileComplete}`);

        // Skip redirection logic for API routes
        if (isApiRoute) {
            return NextResponse.next();
        }

        // --------------------------------------------
        // 4A: User trying to access login page
        // --------------------------------------------
        // If already logged in and going to /login, redirect to dashboard
        if (pathname === "/login") {
            console.log(`↪️ Already logged in. Redirecting to /doctor/dashboard`);
            return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
        }

        // --------------------------------------------
        // 4B: Profile incomplete - can only access dashboard and profile
        // Other features (queue, consulting, clinics) require complete profile
        // --------------------------------------------
        const protectedRoutes = ["/doctor/queue", "/doctor/consulting", "/doctor/clinics", "/doctor/settings"];
        const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
        
        if (!token.isProfileComplete && isProtectedRoute) {
            console.log(`⚠️ Profile incomplete. Redirecting to /doctor/profile from ${pathname}`);
            return NextResponse.redirect(new URL("/doctor/profile", req.url));
        }

        // Note: Profile page is always accessible so doctors can edit their profile
    }

    // ============================================
    // STEP 5: Allow the request to continue
    // ============================================
    console.log(`✅ Allowing access to ${pathname}`);
    return NextResponse.next();
}
