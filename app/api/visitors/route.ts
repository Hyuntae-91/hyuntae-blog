import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { logVisitor, getVisitorStats } from "@/lib/visitor-stats";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  if (!turso) {
    return NextResponse.json({ today: 0, total: 0 }, { status: 200 });
  }

  const todayDate = new Date().toISOString().split("T")[0];

  try {
    const stats = await getVisitorStats(turso, todayDate);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch visitor stats:", error);
    return NextResponse.json({ today: 0, total: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!turso) {
    return NextResponse.json({ success: false, today: 0, total: 0 }, { status: 200 });
  }

  // Get client IP address from Vercel/Proxy headers
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const ip = rawIp.trim();

  // Get country code from Vercel edge header
  const country = request.headers.get("x-vercel-ip-country") || "unknown";

  // Hash IP address with a secret salt to preserve privacy
  const salt = process.env.IP_SALT || "default-site-salt-secret";
  const ipHash = crypto.createHash("sha256").update(ip + salt).digest("hex");

  // Get current date in UTC
  const todayDate = new Date().toISOString().split("T")[0];

  // Try to insert a record for this unique IP hash on this date.
  // ON CONFLICT DO NOTHING (in logVisitor) prevents duplicate counting per day.
  try {
    await logVisitor(turso, { date: todayDate, ipHash, country });
  } catch (error) {
    console.error("Failed to log visitor session:", error);
  }

  // Fetch updated stats to return to the client
  try {
    const stats = await getVisitorStats(turso, todayDate);
    return NextResponse.json({ success: true, ...stats }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch visitor stats:", error);
    return NextResponse.json({ success: true, today: 0, total: 0 }, { status: 200 });
  }
}
