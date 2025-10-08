"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClientClerkProvider({ children }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing Clerk publishable key! Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env"
    );
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
