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

export const revalidate = 30;

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

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ split?: string }>;
}) {
  const params = await searchParams;
  const split = params.split === "1";
  const merge = !split;
  const [
    presidential,
    partyList,
    legislative,
    presCounty,
    presCountySplit,
    mayoralCounty,
    mayoralCountySplit,
  ] = await Promise.all([
    getPresidentialTrend().catch(() => []),
    getPartyListTrend().catch(() => []),
    getLegislativeSeatTrend().catch(() => []),
    // 縣 + 市 一律保留原始 row（COUNTY_GROUPS 已併排）
    getPresidentialCountyWinners(false).catch(() => []),
    Promise.resolve([] as Awaited<ReturnType<typeof getPresidentialCountyWinners>>),
    getMayoralCountyWinners(false).catch(() => []),
    Promise.resolve([] as Awaited<ReturnType<typeof getMayoralCountyWinners>>),
  ]);

  // 把 split 版本依現代縣市 group → 提供給 CountyHeatmap 用於畫小方塊
  const COUNTY_MERGE: Record<string, string> = {
    "臺北縣": "新北市",
    "桃園縣": "桃園市",
    "臺中縣": "臺中市",
    "臺南縣": "臺南市",
    "高雄縣": "高雄市",
  };
  type Cell = (typeof presCountySplit)[number];
  const buildSubsIndex = (split: Cell[]) => {
    const idx = new Map<string, Cell[]>();
    for (const cell of split) {
      const modern = COUNTY_MERGE[cell.county] || cell.county;
      const key = `${cell.year}|${modern}`;
      if (!idx.has(key)) idx.set(key, []);
      idx.get(key)!.push(cell);
    }
    return idx;
  };
  const presSubs = buildSubsIndex(presCountySplit);
  const mayoralSubs = buildSubsIndex(mayoralCountySplit);

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

      {/* 升格前後舊縣 toggle */}
      <div className="border border-rule p-4 mb-8 flex flex-wrap items-baseline gap-3 text-sm">
        <span className="text-ink-soft">舊縣顯示方式：</span>
        <a
          href="/trends"
          className={
            "px-3 py-1.5 border transition " +
            (!split
              ? "bg-ink text-paper border-ink"
              : "border-rule text-ink-soft hover:border-ink hover:text-ink")
          }
        >
          合併到升格後直轄市
        </a>
        <a
          href="/trends?split=1"
          className={
            "px-3 py-1.5 border transition " +
            (split
              ? "bg-ink text-paper border-ink"
              : "border-rule text-ink-soft hover:border-ink hover:text-ink")
          }
        >
          保留原始縣市（高雄縣/高雄市分開）
        </a>
        <span className="text-xs text-ink-soft ml-auto">
          {split
            ? "1996–2008 顯示原始舊縣名稱（高雄縣/桃園縣/臺北縣等）"
            : "合併版：升格前的格子會內切兩半顯示縣 / 市；升格後合為一格"}
        </span>
      </div>
      <p className="text-xs text-ink-soft mb-6">
        色塊顏色 = 該屆勝選政黨；
        <span className="inline-block w-3 h-3 align-middle mr-1" style={{ backgroundColor: "#888" }} />
        灰色 = 連署候選人（無政黨提名，如 1996 彭明敏 / 林洋港 / 陳履安）。
        點任一格可進入該縣市歷史頁。
      </p>

      {/* ④ 總統版圖 */}
      <section id="presidential-county" className="mb-20 scroll-mt-4">
        <CountyHeatmap
          data={presCounty}
          subsIndex={presSubs}
          title="總統選舉縣市政治版圖"
          desc={
            split
              ? "每屆總統選舉各縣市勝出政黨。1996–2008 保留升格前的舊縣（高雄縣/臺北縣等），可以看到當年的真實行政區分佈。"
              : "每屆總統選舉各縣市勝出政黨。1996/2000/2004 升格前的高雄縣 + 高雄市等會在同一格內切兩半顯示，2010 後合為單一格。"
          }
          prefix="④"
        />
      </section>

      {/* ⑤ 縣市長版圖 */}
      <section id="mayoral-county" className="mb-20 scroll-mt-4">
        <CountyHeatmap
          data={mayoralCounty}
          subsIndex={mayoralSubs}
          title="縣市長選舉政治版圖"
          desc={
            split
              ? "歷屆縣市長選舉各縣市勝出政黨。1997/2001/2005/2009 保留原始縣市（高雄縣/臺北縣等），對照當年真實行政區分佈。"
              : "歷屆縣市長選舉各縣市勝出政黨。1997/2001/2005/2009 升格前的高雄縣 + 高雄市等會在同一格內切兩半顯示。"
          }
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
