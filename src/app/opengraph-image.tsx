import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "正至 — 台灣選舉資訊平台";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#fafaf8",
          color: "#1a1a1a",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#666",
            marginBottom: 24,
          }}
        >
          ZHENG ZHI · TAIWAN ELECTION
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#1a1a1a",
          }}
        >
          正至
        </div>
        <div
          style={{
            fontSize: 48,
            marginTop: 28,
            color: "#1a1a1a",
            fontWeight: 600,
          }}
        >
          讓選舉資料成為公民的
          <span style={{ color: "#C00000" }}>日常知識</span>
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 40,
            color: "#666",
            lineHeight: 1.4,
          }}
        >
          整合中選會選舉公報 · 候選人政見 · 歷屆當選結果 · 政黨席次趨勢
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 22,
            color: "#999",
          }}
        >
          taiwan-election-web.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
