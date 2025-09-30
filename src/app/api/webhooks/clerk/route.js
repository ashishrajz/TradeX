import { headers } from "next/headers";
import { Webhook } from "svix"; // Clerk webhooks are signed by Svix
import mongoose from "mongoose";
import User from "@/lib/models/User";

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

export async function POST(req) {
  // 1. Get raw body & headers
  const payload = await req.text();
  const heads = headers();
  const svixId = heads.get("svix-id");
  const svixTimestamp = heads.get("svix-timestamp");
  const svixSignature = heads.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  // 2. Verify webhook signature
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // 3. Connect DB
  await connectDB();

  // 4. Handle Clerk event
  const { type, data } = evt;
  // data contains user fields from Clerk
  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    const image = data.image_url;

    // Upsert user in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        email,
        name,
        image,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return new Response("User synced", { status: 200 });
  }

  if (type === "user.deleted") {
    // optional: remove user from DB
    await User.deleteOne({ clerkId: data.id });
    return new Response("User deleted", { status: 200 });
  }

  return new Response("Unhandled event", { status: 200 });
}
