export const metadata = { title: "關於 · 正至" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          ABOUT
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          關於正至
        </h1>
      </header>

      <div className="space-y-12 max-w-3xl">
        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">緣起</h2>
          <p className="leading-[1.85]">
            「正至」是一個獨立、開源的台灣選舉資訊平台。
            我們希望透過整理公開資料、降低查詢門檻，讓更多公民能輕鬆了解選舉、政府與政黨運作。
          </p>
          <p className="leading-[1.85] mt-3 text-ink-soft">
            平台名稱來自《大學》：「致知在格物，物格而后知至。」
            希望大家在做政治判斷之前，能先「致知」，了解事實。
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">資料來源</h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              ·{" "}
              <a
                href="https://db.cec.gov.tw"
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                中央選舉委員會選舉資料庫
              </a>{" "}
              — 選舉結果、候選人名單
            </li>
            <li>
              ·{" "}
              <a
                href="https://bulletin.cec.gov.tw"
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                中選會選舉公報
              </a>{" "}
              — 候選人政見原始 PDF
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">開源專案</h2>
          <p className="leading-[1.85]">
            「正至」採用 MIT 授權的開源專案，歡迎指正錯誤、提供建議或貢獻程式碼。
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href="https://github.com/Yaochieh/taiwan-election-web"
              className="inline-block px-4 py-2 border border-ink hover:bg-ink hover:text-paper transition"
              target="_blank"
              rel="noreferrer"
            >
              前端 GitHub →
            </a>
            <a
              href="https://github.com/Yaochieh/taiwan-election"
              className="inline-block px-4 py-2 border border-ink hover:bg-ink hover:text-paper transition"
              target="_blank"
              rel="noreferrer"
            >
              後端 GitHub →
            </a>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">技術架構</h2>
          <ul className="space-y-1 text-sm">
            <li>· 前端：Next.js 16 + TypeScript + Tailwind CSS</li>
            <li>· 後端：FastAPI + SQLite（部署於 Railway）</li>
            <li>· 部署：Vercel（前端）+ Railway（後端 API）</li>
            <li>· 視覺化：Recharts + 自製 SVG 半圓席次圖、台灣地圖</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
