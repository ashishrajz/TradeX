// src/app/api/news/route.js
import { NextResponse } from "next/server";

let cachedData = null;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();

  // Cache for 30 minutes
  if (cachedData && now - lastFetchTime < 30 * 60 * 1000) {
    console.log("[News API] Serving cached crypto news");
    return NextResponse.json(cachedData);
  }

  try {
    // Fetch crypto-related news only
    const url = `https://gnews.io/api/v4/search?q=cryptocurrency OR bitcoin OR ethereum OR blockchain OR trading&lang=en&max=15&apikey=${process.env.GNEWS_API_KEY}`;
    
    console.log("[News API] Fetching from GNews:", url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const data = await response.json();

    // Only cache if valid data
    if (data?.articles?.length) {
      cachedData = data;
      lastFetchTime = now;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[News API] Error fetching crypto news:", error);
    return NextResponse.json({ error: "Failed to fetch crypto news" }, { status: 500 });
  }
}
