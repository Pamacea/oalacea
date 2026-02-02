import { ImageResponse } from "next/og"
import { siteConfig } from "@/config/site"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") || siteConfig.name
  const description = searchParams.get("description") || siteConfig.description
  const type = searchParams.get("type") || "website"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: `
            linear-gradient(135deg, rgba(154, 17, 21, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(154, 17, 21, 0.15) 0%, transparent 40%)
          `,
          fontSize: 60,
          fontWeight: 700,
          color: "#fff",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #9a1115 0%, #d4af37 50%, #9a1115 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #9a1115 0%, #d4af37 50%, #9a1115 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: "#d4af37",
              marginBottom: 20,
              letterSpacing: "4px",
            }}
          >
            OALACEA
          </div>
          <div
            style={{
              fontSize: type === "article" ? 48 : 56,
              fontWeight: 700,
              color: "#fff",
              maxWidth: 900,
              lineHeight: 1.2,
            }}
          >
            {title.length > 60 ? title.substring(0, 60) + "..." : title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "#888",
                marginTop: 20,
                maxWidth: 700,
              }}
            >
              {description.length > 120
                ? description.substring(0, 120) + "..."
                : description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "#666",
          }}
        >
          oalacea.fr
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
