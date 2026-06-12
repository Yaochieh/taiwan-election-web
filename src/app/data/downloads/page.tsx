export const metadata = { title: "開放資料 · 正至" };

export default function DownloadsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <h1 className="font-serif text-4xl font-bold">開放資料</h1>
      </header>
      <div className="border border-rule p-8 text-center text-ink-soft">
        <p className="font-serif text-xl mb-3">此頁面建置中</p>
        <p className="text-sm">
          將提供選舉結果、政見、候選人資料的 CSV / JSON 下載。
          目前可直接呼叫{" "}
          <a
            href={
              (process.env.NEXT_PUBLIC_API_URL ||
                "https://web-production-f7c522.up.railway.app") + "/docs"
            }
            className="underline underline-offset-2 hover:text-ink"
            target="_blank"
            rel="noreferrer"
          >
            API
          </a>{" "}
          取得資料。
        </p>
      </div>
    </div>
  );
}
