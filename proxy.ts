import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  "/",            // landing page
  "/sign-in(.*)",
]);

/**
 * Clerk authentication middleware.
 * - Signed-in users on the landing "/" are redirected to "/app".
 * - All other non-public routes are protected.
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // Send authenticated users from the landing straight into the app
  if (userId && url.pathname === "/") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
