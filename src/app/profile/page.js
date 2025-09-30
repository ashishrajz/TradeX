"use client";

import { useState } from "react";
import UnderConstruction from "@/components/UnderConstruction";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Page content */}
      <main className="ml-20 flex-1 p-0">
  <div className="h-full w-full">
    <UnderConstruction title="Profile Page Coming Soon 🚧" />
  </div>
</main>

    </div>
  );
}
