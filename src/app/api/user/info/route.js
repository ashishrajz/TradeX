import connectDB from "@/lib/db"; // your mongoose connection
import User from "@/lib/models/User";

export async function GET(req) {
  await connectDB();

  // You may get user ID from Clerk or request headers
  const userId = req.headers.get("x-user-id"); 
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({
    name: user.name || "User",
    cash: user.cash || 0
  }), { status: 200 });
}
