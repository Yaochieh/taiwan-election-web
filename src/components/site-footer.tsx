export function SiteFooter() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-4 text-sm text-ink-soft">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="font-serif text-lg text-ink">正至</span>
          <span>台灣選舉資訊平台 · 開源專案</span>
        </div>
        <p className="leading-relaxed">
          資料來源：
          <a
            href="https://bulletin.cec.gov.tw"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            中央選舉委員會
          </a>
          、政府開放資料平台。本網站政見內容皆引自選舉公報原檔，僅作公民查閱用途。
        </p>
        <p className="text-xs flex flex-wrap items-baseline gap-x-4">
          <span>© 2026 正至</span>
          <a
            href="https://github.com/Yaochieh/taiwan-election-web"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            GitHub
          </a>
          <a
            href="/about"
            className="underline underline-offset-2 hover:text-ink"
          >
            關於
          </a>
          <a
            href="/changelog"
            className="underline underline-offset-2 hover:text-ink"
          >
            更新紀錄
          </a>
          <a
            href="/timeline"
            className="underline underline-offset-2 hover:text-ink"
          >
            民主大事記
          </a>
          <a
            href="/data/downloads"
            className="underline underline-offset-2 hover:text-ink"
          >
            開放資料 API
          </a>
        </p>
      </div>
    </footer>
  );
}
