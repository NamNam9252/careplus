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
    // This retrieves the JWT token from the request cookies
    // We check for both doctor and patient tokens
    const doctorToken = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.doctor-token`,
    });

    const patientToken = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.patient-token`,
    });

    // Use whichever token is available (prioritize doctor if both exist for some reason)
    const token = doctorToken || patientToken;

    // Get the current pathname (e.g., "/login", "/doctor/profile", etc.)
    const { pathname } = req.nextUrl;

    // ============================================
    // STEP 2: Define route types
    // ============================================
    // These routes don't require authentication - anyone can access them
    const publicRoutes = ["/login", "/api/auth", "/api/patient/auth", "/patient-test"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check if the current request is for an API route
    const isApiRoute = pathname.startsWith("/api");

    // ============================================
    // STEP 3: Handle unauthenticated users
    // ============================================
    // If no token exists (user not logged in) and they're trying to access a protected route
    if (!token && !isPublicRoute) {
        console.log(`🔴 No token found. Accessing ${pathname}`);

        // For API routes, return a 401 Unauthorized instead of a redirect to /login
        if (isApiRoute) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.redirect(new URL("/login", req.url));
    }

    // ============================================
    // STEP 4: Handle authenticated users
    // ============================================
    if (token) {
        console.log(`✅ Token found for user: ${token.email}, Profile Complete: ${token.isProfileComplete}`);

        // Skip redirection logic for API routes (except maybe login/auth if needed)
        // API routes should proceed if authenticated
        if (isApiRoute) {
            return NextResponse.next();
        }

        // --------------------------------------------
        // 4A: User trying to access login page
        // --------------------------------------------
        // If already logged in, redirect based on profile completion status
        if (pathname === "/login") {
            if (token.isProfileComplete) {
                console.log(`↪️ Profile complete. Redirecting to /doctor/dashboard`);
                return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
            } else {
                console.log(`↪️ Profile incomplete. Redirecting to /doctor/profile`);
                return NextResponse.redirect(new URL("/doctor/profile", req.url));
            }
        }

        // --------------------------------------------
        // 4B: Profile incomplete - force to profile page
        // --------------------------------------------
        // If profile is NOT complete and user tries to access any protected route
        // (except the profile page itself), redirect them to complete their profile first
        if (!token.isProfileComplete && !pathname.startsWith("/doctor/profile") && !isPublicRoute) {
            console.log(`⚠️ Profile incomplete. Redirecting to /doctor/profile from ${pathname}`);
            return NextResponse.redirect(new URL("/doctor/profile", req.url));
        }

        // --------------------------------------------
        // 4C: Profile complete - allow profile page access for editing
        // --------------------------------------------
        // We previously blocked this, but doctors need to access it to edit their info.
        // So we just allow it to continue.
        if (token.isProfileComplete && pathname.startsWith("/doctor/profile")) {
            console.log(`✅ Profile complete. Allowing access to ${pathname} for editing.`);
            return NextResponse.next();
        }
    }

    // ============================================
    // STEP 5: Allow the request to continue
    // ============================================
    // If none of the above conditions triggered a redirect, allow the request to proceed normally
    console.log(`✅ Allowing access to ${pathname}`);
    return NextResponse.next();
}

