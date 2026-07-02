import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { getPageViews, incrementPageViews } from "@/lib/page-views";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!turso) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  const views = await getPageViews(turso, slug);
  return NextResponse.json({ views }, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!turso) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }

  const views = await incrementPageViews(turso, slug);
  return NextResponse.json({ views }, { status: 200 });
}
