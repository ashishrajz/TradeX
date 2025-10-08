// app/api/benchmark/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export async function POST(req) {
  try {
    const { asset = "BTC", clerkId } = await req.json();

    await connectDB();
    const user = await User.findOne({ clerkId }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trades = user.trades || [];
    const totalEquity = user.cash + (user.equityHistory?.slice(-1)[0]?.total || 0);

    const prompt = `
Compare the user's portfolio (${totalEquity.toFixed(
      2
    )}) to ${asset} performance this month.
Estimate underperformance or outperformance in percentage.
Also suggest how to rebalance.
Output JSON:
{
  "summary": "...",
  "performanceDelta": number,
  "recommendations": ["..."]
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { summary: text, performanceDelta: 0, recommendations: [] };
    }

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error("[BENCHMARK ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
