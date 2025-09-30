"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import HomePage from "@/app/HomePage"; // your chart page
import LandingPage from "@/app/LandingPage"; // the long welcome component above

export default function IndexPage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null; // wait for Clerk to load

  if (isSignedIn) {
    return <HomePage />; // show trading UI
  } else {
    return <LandingPage />; // show welcome page
  }
}
