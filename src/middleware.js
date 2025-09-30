import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Everything EXCEPT /nothing, Next.js internals, and static files
    '/((?!nothing|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except if explicitly /nothing/api
    '/(api|trpc)(.*)',
  ],
};
