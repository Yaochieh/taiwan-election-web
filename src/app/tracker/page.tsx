import Link from "next/link";
import { getFlagshipTargets } from "@/lib/api";
import { PromiseTracker } from "@/components/promise-tracker";

export const revalidate = 300;

export const metadata = {
  title: "兌現追蹤 · 正至",
  description:
    "現任者競選承諾逐條對照政府公開統計：社會住宅、國防預算、托育、能源……每一筆進度都附官方來源。",
};

export default async function TrackerPage() {
  const items = await getFlagshipTargets().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
            Promise Tracker · 兌現追蹤
          </p>
          {items[0] && (
            <p className="text-xs text-ink-soft tabular-nums">
              更新 {items[0].recorded_at} · 每日自動對照
            </p>
          )}
        </div>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4">
          說到，做到了嗎？
        </h1>
        <p className="text-ink-soft max-w-3xl leading-relaxed">
          把現任者的競選承諾逐條對照政府公開統計。黑色刻度是目標線，
          條衝過線代表做到；有設「基準」者，進度以<strong>上任後新增</strong>計算，
          避免把前任的成績算到現任頭上。每一筆進度都附來源，歡迎自行查證。
        </p>
      </header>

      <PromiseTracker items={items} variant="full" />

      {/* ── 方法說明 ── */}
      <section className="mt-14 border-t-2 border-ink pt-8">
        <h2 className="font-serif text-2xl font-bold mb-4">我們怎麼追蹤</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h3 className="font-bold text-ink mb-2">1 · 承諾來源</h3>
            承諾全數取自中選會選舉公報的候選人政見原文，逐條人工挑選
            「有明確數字或可檢驗事實」者，附政見原文與公報連結。
          </div>
          <div>
            <h3 className="font-bold text-ink mb-2">2 · 進度對照</h3>
            進度值來自政府公開統計（內政部、能源署、市府公告、開放資料
            API 等），每筆記錄都附來源連結；可程式化的來源每日自動抓取。
          </div>
          <div>
            <h3 className="font-bold text-ink mb-2">3 · 歸屬與基準</h3>
            延續性政策（如社會住宅為 2016 年起累計）設「基準值」＝上任時水位，
            進度以任內新增計；無法歸屬者於進度紀錄中明確註記。
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          想看單一政治人物的完整政見與追蹤，到
          <Link
            href="/people"
            className="underline underline-offset-4 hover:text-accent-red mx-1"
          >
            政治人物頁
          </Link>
          ；立委的「政見 × 立院提案」對照在各立委個人頁。
        </p>
      </section>
    </div>
  );
}
