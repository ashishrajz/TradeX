// app/api/simulate/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export async function POST(req) {
  try {
    const { scenario, clerkId } = await req.json();
    if (!scenario || !clerkId)
      return NextResponse.json({ error: "Missing inputs" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ clerkId }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trades = Array.isArray(user.trades) ? user.trades : [];
    const positions =
      user.positions instanceof Map
        ? Object.fromEntries(user.positions)
        : user.positions || {};

    const prompt = `
You are an AI scenario simulator for trading analysis.

User has ${trades.length} trades and current positions: ${JSON.stringify(
      positions
    )}.
Scenario to simulate: "${scenario}"

Estimate the hypothetical change in total value, PnL impact, and give a clear explanation.
Return output as JSON:
{
  "summary": "...",
  "pnlImpact": number,
  "details": ["line 1", "line 2", ...]
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
      parsed = { summary: text, pnlImpact: 0, details: [] };
    }

    // log simulation
    await User.updateOne(
      { clerkId },
      {
        $push: {
          strategyLogs: {
            at: new Date(),
            payload: { scenario },
            response: parsed,
          },
        },
      }
    );

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error("[SIMULATION ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
