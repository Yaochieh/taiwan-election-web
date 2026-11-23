import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 篩選參數組合（縣市×選區×鄉鎮）有上萬種，每個都要伺服器即時算，
        // 爬蟲逐一點會吃光 Vercel 免費 CPU 額度；內容本身都在不帶參數的頁面。
        disallow: ["/*?", "/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
