import { getLegislatureComposition } from "@/lib/api";
import { HemicycleChart } from "./hemicycle-chart";
import { LegislatorList } from "./legislator-list";

export const metadata = {
  title: "立法院 · 正至",
  description: "第 11 屆立法院（2024-2028）113 席組成、各政黨席次、立委名單",
};

export default async function LegislaturePage() {
  const data = await getLegislatureComposition("2024").catch(() => null);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <p className="text-ink-soft">立法院資料載入失敗</p>
      </div>
    );
  }

  // 為半圓圖排序 — 左到右按政黨意識形態（暫用：DPP/獨派 左、KMT/民眾黨 右）
  // 實務上常用：左 → 中 → 右
  const partyOrder = ["民主進步黨", "無黨籍及未經政黨推薦", "台灣民眾黨", "中國國民黨"];
  const sortedParties = [...data.parties].sort((a, b) => {
    const ai = partyOrder.indexOf(a.name);
    const bi = partyOrder.indexOf(b.name);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // 找最大黨確認多數
  const sortedByTotal = [...data.parties].sort((a, b) => b.total - a.total);
  const largest = sortedByTotal[0];
  const isAbsoluteMajority = largest.total > data.total_seats / 2;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          LEGISLATURE
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4">
          第 11 屆立法院
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <span>📅 任期：2024-02-01 — 2028-01-31</span>
          <span>共 {data.total_seats} 席</span>
          <span>
            {isAbsoluteMajority ? (
              <span>
                <strong className="text-ink">{largest.name}</strong>{" "}
                取得單獨過半（{largest.total} 席）
              </span>
            ) : (
              <span className="text-accent-red">無單一政黨過半（懸峙國會）</span>
            )}
          </span>
        </div>
      </header>

      {/* ── 半圓席次圖 ── */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-6">席次分佈</h2>
        <div className="border border-rule p-4 sm:p-8 bg-paper">
          <HemicycleChart parties={sortedParties} totalSeats={data.total_seats} />
        </div>
      </section>

      {/* ── 政黨席次表 ── */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-6">政黨組成</h2>
        <div className="border border-rule">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-ink-soft">
                  政黨
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink-soft">
                  區域
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink-soft">
                  原住民
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink-soft">
                  不分區
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink">
                  總席次
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink-soft">
                  比例
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedByTotal.map((p) => {
                const pct = (p.total / data.total_seats) * 100;
                return (
                  <tr key={p.name} className="border-b border-rule last:border-0">
                    <td className="px-4 py-3">
                      <span
                        className="font-medium"
                        style={{ color: p.color_hex || "#444" }}
                      >
                        {p.name}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 tabular-nums">
                      {p.regional}
                    </td>
                    <td className="text-center px-4 py-3 tabular-nums">
                      {p.aboriginal}
                    </td>
                    <td className="text-center px-4 py-3 tabular-nums">
                      {p.party_list}
                    </td>
                    <td className="text-center px-4 py-3 font-serif text-lg font-bold tabular-nums">
                      {p.total}
                    </td>
                    <td className="text-center px-4 py-3 text-ink-soft tabular-nums">
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-ink bg-rule/30">
              <tr>
                <td className="px-4 py-2 text-xs uppercase tracking-widest text-ink-soft">
                  合計
                </td>
                <td className="text-center px-4 py-2 font-medium tabular-nums">
                  {sortedByTotal.reduce((a, b) => a + b.regional, 0)}
                </td>
                <td className="text-center px-4 py-2 font-medium tabular-nums">
                  {sortedByTotal.reduce((a, b) => a + b.aboriginal, 0)}
                </td>
                <td className="text-center px-4 py-2 font-medium tabular-nums">
                  {sortedByTotal.reduce((a, b) => a + b.party_list, 0)}
                </td>
                <td className="text-center px-4 py-2 font-serif text-lg font-bold tabular-nums">
                  {data.total_seats}
                </td>
                <td className="text-center px-4 py-2 text-ink-soft">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ── 立委名單 ── */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-6">立委名單</h2>
        <LegislatorList members={data.members} parties={sortedByTotal} />
      </section>
    </div>
  );
}
