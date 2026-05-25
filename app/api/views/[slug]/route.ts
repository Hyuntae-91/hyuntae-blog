import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!supabase) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("page_views")
    .select("views")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  return NextResponse.json({ views: Number(data.views) }, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!supabase) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  // Increment view count in Supabase using the stored RPC function
  const { error: rpcError } = await supabase.rpc("increment_views", {
    post_slug: slug,
  });

  if (rpcError) {
    console.error("Failed to increment views:", rpcError);
    return NextResponse.json(
      { error: "Failed to increment views" },
      { status: 500 }
    );
  }

  // Fetch the updated count to return
  const { data, error } = await supabase
    .from("page_views")
    .select("views")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ views: 1 }, { status: 200 });
  }

  return NextResponse.json({ views: Number(data.views) }, { status: 200 });
}
