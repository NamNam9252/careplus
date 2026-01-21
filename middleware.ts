/**
 * ROOT MIDDLEWARE FILE
 * 
 * Next.js requires middleware to be at the root level (this file).
 * We import the middleware function from /middleware folder but define config here
 * because Next.js doesn't allow re-exporting the config object.
 */
export { middleware } from "./middleware/middleware";

/**
 * Next.js requires the config to be defined directly in this file, not re-exported.
 * This matcher pattern runs middleware on all routes except static files and images.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public paths)
         * - Image files (svg, png, jpg, jpeg, gif, webp)
         */
        "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
