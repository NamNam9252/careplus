import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";
import Patient from "@/lib/models/Patient";
import { cookies } from "next/headers";

/**
 * UNIFIED AUTH HANDLER
 * 
 * Single authentication endpoint that handles both Doctor and Patient.
 * 
 * KEY FEATURE: One email can have BOTH a Doctor and Patient account!
 * The intended role cookie determines which account to use/create.
 */
const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    callbacks: {
        async signIn({ user }) {
            await connectDB();
            
            // Get the intended role from cookies
            const cookieStore = await cookies();
            const intendedRole = cookieStore.get("careplus.intended-role")?.value || "patient";
            
            console.log(`🔐 Sign-in attempt: ${user.email} as ${intendedRole.toUpperCase()}`);
            
            // Check and create based on INTENDED role
            // This allows one email to be registered as BOTH doctor and patient
            if (intendedRole === "doctor") {
                const existingDoctor = await Doctor.findOne({ email: user.email });
                if (!existingDoctor) {
                    await Doctor.create({
                        name: user.name,
                        email: user.email,
                        role: "doctor",
                        isProfileComplete: false,
                    });
                    console.log(`✅ Created new DOCTOR account for: ${user.email}`);
                } else {
                    console.log(`✅ Existing DOCTOR found: ${user.email}`);
                }
            } else {
                const existingPatient = await Patient.findOne({ email: user.email });
                if (!existingPatient) {
                    await Patient.create({
                        name: user.name,
                        email: user.email,
                        role: "patient",
                    });
                    console.log(`✅ Created new PATIENT account for: ${user.email}`);
                } else {
                    console.log(`✅ Existing PATIENT found: ${user.email}`);
                }
            }
            
            return true;
        },

        async jwt({ token, user, trigger }) {
            // Always fetch fresh data from DB
            if (user || trigger === "update") {
                await connectDB();
                
                // Get the intended role from cookies
                const cookieStore = await cookies();
                const intendedRole = cookieStore.get("careplus.intended-role")?.value;
                
                // If we have an intended role cookie, use that to determine which account to load
                if (intendedRole === "doctor") {
                    const doctor = await Doctor.findOne({ email: token.email || user?.email });
                    if (doctor) {
                        token.id = doctor._id?.toString();
                        token.email = doctor.email;
                        token.name = doctor.name;
                        token.role = "doctor";
                        token.isProfileComplete = doctor.isProfileComplete;
                        token.specializations = doctor.specializations || [];
                        token.experience = doctor.experience || 0;
                        return token;
                    }
                } else if (intendedRole === "patient") {
                    const patient = await Patient.findOne({ email: token.email || user?.email });
                    if (patient) {
                        token.id = patient._id?.toString();
                        token.email = patient.email;
                        token.name = patient.name;
                        token.role = "patient";
                        return token;
                    }
                }
                
                // Fallback: If no intended role cookie (e.g., session refresh), 
                // check existing token role first, then default to checking both collections
                if (token.role === "doctor") {
                    const doctor = await Doctor.findOne({ email: token.email || user?.email });
                    if (doctor) {
                        token.id = doctor._id?.toString();
                        token.isProfileComplete = doctor.isProfileComplete;
                        token.specializations = doctor.specializations || [];
                        token.experience = doctor.experience || 0;
                        token.name = doctor.name;
                        return token;
                    }
                } else if (token.role === "patient") {
                    const patient = await Patient.findOne({ email: token.email || user?.email });
                    if (patient) {
                        token.id = patient._id?.toString();
                        token.name = patient.name;
                        return token;
                    }
                }
                
                // Last resort: check both collections (for new sessions without cookie)
                const doctor = await Doctor.findOne({ email: token.email || user?.email });
                if (doctor) {
                    token.id = doctor._id?.toString();
                    token.email = doctor.email;
                    token.name = doctor.name;
                    token.role = "doctor";
                    token.isProfileComplete = doctor.isProfileComplete;
                    token.specializations = doctor.specializations || [];
                    token.experience = doctor.experience || 0;
                    return token;
                }
                
                const patient = await Patient.findOne({ email: token.email || user?.email });
                if (patient) {
                    token.id = patient._id?.toString();
                    token.email = patient.email;
                    token.name = patient.name;
                    token.role = "patient";
                    return token;
                }
            }
            
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.isProfileComplete = token.isProfileComplete;
                (session.user as any).specializations = token.specializations;
                (session.user as any).experience = token.experience;
            }
            return session;
        },

        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            try {
                if (new URL(url).origin === baseUrl) return url;
            } catch { /* invalid URL */ }
            return baseUrl;
        },
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60,
            },
        },
        callbackUrl: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.callback-url`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        csrfToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        pkceCodeVerifier: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.pkce`,
            options: {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 900,
            },
        },
        state: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.state`,
            options: {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 900,
            },
        },
    },
});

export { handler as GET, handler as POST };
