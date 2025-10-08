import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// 🔧 Disable prerendering for Clerk-dependent routes
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


// Load fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Clerk publishable key from env
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }) {
  const isMissingKey = !publishableKey;

  return (
    <html lang="en">
      <head>
        <title>TradeX</title>
        <meta name="description" content="AI-powered trading platform" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isMissingKey ? (
          <>
            {/* ⚠️ Skip Clerk during build if key is missing */}
            <div className="p-4 text-center text-red-500">
              ⚠️ Clerk key missing during build — rendered without ClerkProvider.
            </div>
            {children}
          </>
        ) : (
          <ClerkProvider publishableKey={publishableKey}>
            {children}
          </ClerkProvider>
        )}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
