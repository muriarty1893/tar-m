import { clerkMiddleware } from "@clerk/nextjs/server";

/** CORS preflight for the mobile app's API (lib/app-api.ts); answered here, before any route runs. */
const APP_API_PREFLIGHT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

/**
 * Clerk reads the session on every request. Private pages (Mesajlar, Hesabım, İlan ver…) check
 * sign-in themselves (lib/auth.ts), as Clerk recommends, rather than by path here. The mobile app
 * sends its session token in the Authorization header, which Clerk reads the same way.
 */
export default clerkMiddleware(
  (_auth, req) => {
    if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api/app/")) {
      return new Response(null, { status: 204, headers: APP_API_PREFLIGHT_HEADERS });
    }
  },
  { signInUrl: "/giris", signUpUrl: "/kayit" },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files (the 3D model and video too), unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|glb|mp4|txt|xml)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
