import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const notoSans = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "正至 — 台灣選舉資訊平台",
  description:
    "整合中選會選舉公報，提供候選人政見、歷屆結果、政黨席次的查詢與比對。希望降低公民參與政治的門檻。",
  metadataBase: new URL("https://taiwan-election-web.vercel.app"),
  openGraph: {
    title: "正至 — 台灣選舉資訊平台",
    description: "整合中選會選舉公報，提供候選人政見、歷屆結果、政黨席次的查詢與比對。",
    type: "website",
    locale: "zh_TW",
  },
  twitter: {
    card: "summary_large_image",
    title: "正至 — 台灣選舉資訊平台",
    description: "整合中選會選舉公報，提供候選人政見、歷屆結果、政黨席次的查詢與比對。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "正至 — 台灣選舉資訊平台",
              alternateName: "ZhengZhi · Taiwan Election",
              url: "https://taiwan-election-web.vercel.app",
              description:
                "整合中選會選舉公報，提供候選人政見、歷屆當選結果、政黨席次的查詢與比對。",
              inLanguage: "zh-TW",
              license: "https://opensource.org/license/mit",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://taiwan-election-web.vercel.app/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
