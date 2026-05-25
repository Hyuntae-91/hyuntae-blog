import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({}, { status: 200 });
  }

  const { data, error } = await supabase
    .from("page_views")
    .select("slug, views");

  if (error || !data) {
    return NextResponse.json({}, { status: 200 });
  }

  // Convert array to a slug -> views key-value dictionary
  const viewsMap = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.slug] = Number(item.views);
    return acc;
  }, {});

  return NextResponse.json(viewsMap, { status: 200 });
}
