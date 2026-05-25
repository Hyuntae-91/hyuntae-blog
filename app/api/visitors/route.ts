import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ today: 0, total: 0 }, { status: 200 });
  }

  const { data, error } = await supabase.rpc("get_visitor_stats");

  if (error || !data || data.length === 0) {
    console.error("Failed to fetch visitor stats:", error);
    return NextResponse.json({ today: 0, total: 0 }, { status: 200 });
  }

  return NextResponse.json(
    {
      today: Number(data[0].today_count),
      total: Number(data[0].total_count),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  if (!supabase) {
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

  // Get current date in UTC (matching Supabase's default behavior)
  const todayDate = new Date().toISOString().split("T")[0];

  // Try to insert a record for this unique IP hash on this date.
  // The primary key constraint prevents duplicate counting per day.
  const { error } = await supabase
    .from("site_visitors")
    .insert({ date: todayDate, ip_hash: ipHash, country: country });

  // Code '23505' indicates duplicate key (IP already registered today), which we safely ignore
  if (error && error.code !== "23505") {
    console.error("Failed to log visitor session:", error);
  }

  // Fetch updated stats to return to the client
  const { data: stats, error: statsError } = await supabase.rpc("get_visitor_stats");

  if (statsError || !stats || stats.length === 0) {
    return NextResponse.json({ success: true, today: 0, total: 0 }, { status: 200 });
  }

  return NextResponse.json(
    {
      success: true,
      today: Number(stats[0].today_count),
      total: Number(stats[0].total_count),
    },
    { status: 200 }
  );
}
