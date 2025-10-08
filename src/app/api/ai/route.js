import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);


const safe = (x) => {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    

    const { prompt, clerkId } = body;
    if (!prompt || typeof prompt !== "string") {
      console.warn("[AI ROUTE] ⚠️ Missing or invalid prompt");
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    await connectDB();

    let user = null;
    if (clerkId) {
      user = await User.findOne({ clerkId }).lean();
      if (!user) console.warn(`[AI ROUTE] ⚠️ User not found for clerkId=${clerkId}`);
    } else {
      console.warn("[AI ROUTE] ⚠️ No clerkId provided");
    }

    
    let summary = "";
    if (user) {
      const positions =
        user.positions instanceof Map
          ? Object.fromEntries(user.positions)
          : user.positions || {};
      const trades = Array.isArray(user.trades) ? user.trades : [];

      summary = `
User profile:
💰 Cash: $${user.cash?.toFixed(2) || 0}
📦 Active Positions: ${
        Object.entries(positions)
          .map(([sym, qty]) => `${sym}: ${qty}`)
          .join(", ") || "None"
      }
📊 Total Trades: ${trades.length}

🕒 Recent Trades:
${trades
  .slice(-10)
  .map(
    (t) =>
      `${t.side} ${t.quantity} ${t.symbol} @ $${t.price} (${t.date || t.at})`
  )
  .join("\n") || "No trades yet."}
`;
    }

    //System prompt
    const systemPrompt = `
You are **Opus**, an advanced AI Trading Mentor.
Your job is to analyze trading data and respond in a human-readable, ChatGPT-style Markdown format.

🧭 Output Format Guidelines:
- Write in **Markdown** with headings (##, ###), bullet points, and short paragraphs.
- Include emojis for clarity (📊💡⚠️💰🧠📈).
- Start with a short **Summary**.
- Follow with **Insights**, **Risk & Exposure**, **Learning Tips**, **Emotional Bias**, **Scenario Simulation**, and **Key Takeaways**.
- Make it natural, professional, and easy to read.

Also, provide a minimal JSON structure at the end for saving, like this (wrapped in code block):

\`\`\`json
{
  "summary": "short natural language summary",
  "scores": { "discipline": number, "risk": number, "consistency": number },
  "insights": ["list of short insights"],
  "recommendations": ["list of short recommendations"]
}
\`\`\`

Focus your tone to sound like a calm, professional mentor offering guidance.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });

    const combinedPrompt = `
${systemPrompt}

User Query:
"${prompt}"

${user ? `User Data:\n${summary}` : "(no user data provided)"}
`;

    
    const result = await model.generateContent(combinedPrompt);
    const text = result?.response?.text() || "No meaningful response.";

    

    //Extract JSON block 
    let parsed;
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
      } catch {
        parsed = { summary: "Unable to parse JSON", scores: {}, insights: [], recommendations: [] };
      }
    } else {
      // fallback if only natural text (markdown) returned
      parsed = { summary: text, scores: {}, insights: [], recommendations: [] };
    }

    //Save to user logs
    if (clerkId && parsed?.summary) {
      await User.updateOne(
        { clerkId },
        {
          $push: {
            strategyLogs: {
              at: new Date(),
              payload: { prompt },
              response: parsed,
            },
          },
        }
      );
    }

    // Return markdown response (human readable)
    return NextResponse.json({
      result: text, // full markdown (ChatGPT style)
      parsed, // extracted JSON if needed for structured UI parts
    });
  } catch (error) {
    console.error("[AI ROUTE ERROR ❌]", error);
    return NextResponse.json(
      { error: "AI processing failed", details: error.message },
      { status: 500 }
    );
  }
}
