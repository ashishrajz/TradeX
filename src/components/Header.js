'use client';

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

export default function Header() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [cash, setCash] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Fetch user from your backend using clerkId
    fetch(`/api/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCash(data.cash); // set cash from MongoDB
      })
      .catch((err) => console.error("Failed to fetch user cash:", err));
  }, [user, isLoaded, isSignedIn]);

  if (!isLoaded) return <div className="text-gray-400">Loading...</div>;
  if (!isSignedIn) return <div className="text-red-400">User not signed in</div>;

  return (
    <div className="px-8 py-6 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
      <div>
  <div className="flex items-baseline gap-2">
    <h1 className="text-2xl font-bold text-white">Welcome</h1>
    <h1 className="text-2xl font-bold text-green-500">
      {user.firstName || "User"}!
    </h1>
  </div>
  <p className="text-gray-400 mt-1">
    Monitor and trade your favorite stocks
  </p>
</div>


      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-black/90 border-l border-green-500 rounded-full px-6 py-4 shadow-lg hover:shadow-green-500/30 transition-all">
          {/* Wallet Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20">
            <img src="Wallet1.png" alt="Wallet" className="w-10 h-10" />
          </div>
          {/* Amount Text */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-green-400">
              ${cash?.toLocaleString() || "0.00"}
            </h1>
            <p className="text-sm text-gray-400">Available Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
