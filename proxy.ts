import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk reads the session on every request. Private pages (Mesajlar, Hesabım, İlan ver…) check
 * sign-in themselves (lib/auth.ts), as Clerk recommends, rather than by path here.
 */
export default clerkMiddleware({ signInUrl: "/giris", signUpUrl: "/kayit" });

export const config = {
  matcher: [
    // Skip Next.js internals and static files (the 3D model and video too), unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|glb|mp4|txt|xml)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
