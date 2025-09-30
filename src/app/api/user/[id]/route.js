import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const user = await User.findOne({ clerkId: params.id });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ cash: user.cash, name: user.name }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), { status: 500 });
  }
}
