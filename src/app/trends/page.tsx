import {
  getPresidentialTrend,
  getPartyListTrend,
  getLegislativeSeatTrend,
  getPresidentialCountyWinners,
  getMayoralCountyWinners,
} from "@/lib/api";
import { PresidentialChart } from "./presidential-chart";
import { PartyListChart } from "./party-list-chart";
import { LegislativeChart } from "./legislative-chart";
import { CountyHeatmap } from "./county-heatmap";

export const revalidate = 60;

export const metadata = {
  title: "趨勢分析 · 正至",
  description: "總統選舉得票趨勢、立委不分區政黨票、縣市政治版圖變遷",
};

// 段落 anchor
const SECTIONS = [
  { id: "presidential-vote", label: "總統得票", emoji: "①" },
  { id: "party-list-vote", label: "政黨票", emoji: "②" },
  { id: "legislative-seats", label: "立委席次", emoji: "③" },
  { id: "presidential-county", label: "總統版圖", emoji: "④" },
  { id: "mayoral-county", label: "縣市長版圖", emoji: "⑤" },
];

export default async function TrendsPage() {
  const [
    presidential,
    partyList,
    legislative,
    presCounty,
    mayoralCounty,
  ] = await Promise.all([
    getPresidentialTrend().catch(() => []),
    getPartyListTrend().catch(() => []),
    getLegislativeSeatTrend().catch(() => []),
    getPresidentialCountyWinners().catch(() => []),
    getMayoralCountyWinners().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      {/* ── 頁面標題 ── */}
      <header className="border-b-2 border-ink pb-10 mb-12">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TRENDS · ANALYTICS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-6xl font-bold leading-[1.05] mb-5">
          政治版圖的<br />30 年變遷
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-2xl">
          1996 年首次總統直選以來，台灣政治版圖經歷三次政黨輪替與多次九合一翻轉。
          這頁用六張圖呈現宏觀趨勢與微觀地理差異。
        </p>

        {/* 段落導覽 */}
        <nav className="mt-8 flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 border border-rule text-ink-soft hover:border-ink hover:text-ink transition"
            >
              <span className="mr-1">{s.emoji}</span>
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ① 總統得票 */}
      <section id="presidential-vote" className="mb-20 scroll-mt-4">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif text-3xl text-ink-soft">①</span>
          <h2 className="font-serif text-2xl font-bold">總統選舉得票率</h2>
          <span className="text-sm text-ink-soft">1996 — 2024（8 屆）</span>
        </div>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          每屆主要候選人的全國得票率。可看出兩大黨拉鋸 + 第三勢力（民眾黨 2024）的出現。
        </p>
        <PresidentialChart data={presidential} />
      </section>

      {/* ② 政黨票 */}
      <section id="party-list-vote" className="mb-20 scroll-mt-4">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif text-3xl text-ink-soft">②</span>
          <h2 className="font-serif text-2xl font-bold">立委不分區政黨票</h2>
          <span className="text-sm text-ink-soft">2008 — 2024（5 屆）</span>
        </div>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          2008 年起立委採並立制，選民可投政黨票。圖為達 5% 門檻（或有過半席次）政黨得票率。
          能看出時力 2016 崛起、2024 退場；民眾黨 2020 出現、2024 成第三大黨。
        </p>
        <PartyListChart data={partyList} />
      </section>

      {/* ③ 立委席次 */}
      <section id="legislative-seats" className="mb-20 scroll-mt-4">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif text-3xl text-ink-soft">③</span>
          <h2 className="font-serif text-2xl font-bold">立委席次（含不分區）</h2>
          <span className="text-sm text-ink-soft">2008 — 2024（5 屆）</span>
        </div>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          每屆 113 席各黨分布：73 區域 + 6 原住民 + 34 不分區。
          不分區依政黨票得票率以 Hare quota 配額計算。
        </p>
        <LegislativeChart data={legislative} />
      </section>

      {/* ④ 總統版圖 */}
      <section id="presidential-county" className="mb-20 scroll-mt-4">
        <CountyHeatmap
          data={presCounty}
          title="總統選舉縣市政治版圖"
          desc="每屆總統選舉中各縣市勝出政黨的色塊熱力圖。數字為該政黨在該縣市得票率（≥30% 才顯示），下方統計每屆各黨贏的縣市數。"
          prefix="④"
        />
      </section>

      {/* ⑤ 縣市長版圖 */}
      <section id="mayoral-county" className="mb-20 scroll-mt-4">
        <CountyHeatmap
          data={mayoralCounty}
          title="縣市長選舉政治版圖"
          desc="歷屆縣市長選舉各縣市勝出政黨。1994 年起逐步建立直選傳統，2010 年五都改制；2022 大選國民黨拿下 13 縣市。"
          prefix="⑤"
        />
      </section>

      {/* 結尾 */}
      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-10">
        資料來源：中央選舉委員會公開資料庫；本頁每分鐘自動更新。
      </p>
    </div>
  );
}
