import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { getPageViews, incrementPageViews } from "@/lib/page-views";

export const dynamic = "force-dynamic";

function viewsResponse(views: number) {
  return NextResponse.json(
    { views },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!turso) {
    return viewsResponse(0);
  }

  const views = await getPageViews(turso, slug);
  return viewsResponse(views);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!turso) {
    return viewsResponse(0);
  }

  const views = await incrementPageViews(turso, slug);
  return viewsResponse(views);
}
