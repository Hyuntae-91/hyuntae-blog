import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { SITE_NAME } from "@/lib/constants";
import { hasLocale } from "@/lib/locale-helpers";
import { loadOgFont } from "@/lib/og-font";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = hasLocale(locale) ? await getPost(slug, locale) : null;

  const title = post?.meta.title ?? SITE_NAME;
  const category = post?.meta.category ?? "";
  const fontData = await loadOgFont(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: "title",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#38bdf8",
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, color: "#cbd5e1" }}>
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#64748b" }}>
            hyuntae-blog.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "title", data: fontData, weight: 700, style: "normal" }]
        : [],
    }
  );
}
