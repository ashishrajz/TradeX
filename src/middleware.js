// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// ✅ Match all routes (default Next.js recommendation for Clerk)
export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|json|xml|csv|pdf|mp4|mp3|woff2?|ttf|css|js)).*)",
  ],
};
