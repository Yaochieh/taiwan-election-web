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

export const metadata = {
  title: "趨勢分析 · 正至",
  description: "總統選舉得票趨勢與立委不分區政黨票歷年變化",
};

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
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TRENDS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          趨勢分析
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          從歷次選舉資料觀察政治版圖的變化——總統選舉的兩黨得票對比，
          以及立委不分區政黨票看小黨興衰。
        </p>
      </header>

      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          總統選舉
          <span className="text-sm font-normal text-ink-soft">
            1996 — 2024（8 屆）
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          台灣自 1996 年首次直選總統以來，每屆主要候選人的全國得票率。
        </p>
        <PresidentialChart data={presidential} />
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          立委不分區政黨票
          <span className="text-sm font-normal text-ink-soft">
            2008 — 2024（5 屆）
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          2008 年起立委採並立制，選民可投政黨票。圖為各屆達 5% 門檻（或有過半席次政黨）得票率。
        </p>
        <PartyListChart data={partyList} />
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          立委席次（含不分區）
          <span className="text-sm font-normal text-ink-soft">
            2008 — 2024（5 屆）
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          每屆 113 席各黨分布：73 區域 + 6 原住民 + 34 不分區。
          不分區依政黨票得票率以 Hare quota 配額計算。
        </p>
        <LegislativeChart data={legislative} />
      </section>

      <CountyHeatmap
        data={presCounty}
        title="總統選舉縣市政治版圖"
        desc="每屆總統選舉中各縣市勝出政黨的色塊熱力圖。數字為該政黨在該縣市得票率（≥30% 才顯示），下方統計每屆各黨贏的縣市數。"
      />

      <CountyHeatmap
        data={mayoralCounty}
        title="縣市長選舉政治版圖"
        desc="歷屆縣市長選舉各縣市勝出政黨。1994 年起逐步建立直選傳統，2010 年五都改制；2022 大選國民黨拿下 13 縣市。"
      />
    </div>
  );
}
