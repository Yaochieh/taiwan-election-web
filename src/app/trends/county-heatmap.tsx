import type { CountyWinnerCell } from "@/lib/api";
import { partyColor } from "@/lib/format";

interface Props {
  data: CountyWinnerCell[];
  title: string;
  desc: string;
  prefix?: string;
}

// 縣市分區
const REGION_GROUPS: { label: string; counties: string[] }[] = [
  {
    label: "北部",
    counties: ["臺北市", "新北市", "基隆市", "桃園市", "新竹市", "新竹縣"],
  },
  {
    label: "中部",
    counties: ["苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣"],
  },
  {
    label: "南部",
    counties: ["嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣"],
  },
  { label: "東部", counties: ["宜蘭縣", "花蓮縣", "臺東縣"] },
  { label: "外島", counties: ["澎湖縣", "金門縣", "連江縣"] },
];

const COUNTY_ORDER = REGION_GROUPS.flatMap((g) => g.counties);
const COUNTY_TO_REGION = new Map<string, string>();
for (const g of REGION_GROUPS) {
  for (const c of g.counties) COUNTY_TO_REGION.set(c, g.label);
}

export function CountyHeatmap({ data, title, desc, prefix }: Props) {
  // 找所有年份
  const years = Array.from(new Set(data.map((d) => d.year))).sort();
  // 建索引：year × county → cell
  const map = new Map<string, CountyWinnerCell>();
  for (const d of data) {
    map.set(`${d.year}|${d.county}`, d);
  }
  // 排序縣市（已知縣市 + 未知接在後面）
  const seenCounties = new Set(data.map((d) => d.county));
  const counties = [
    ...COUNTY_ORDER.filter((c) => seenCounties.has(c)),
    ...Array.from(seenCounties).filter((c) => !COUNTY_ORDER.includes(c)).sort(),
  ];

  // 政黨統計（每年贏的縣市數）
  const yearPartyCount = new Map<string, Map<string, number>>();
  for (const cell of data) {
    if (!yearPartyCount.has(cell.year)) yearPartyCount.set(cell.year, new Map());
    const m = yearPartyCount.get(cell.year)!;
    m.set(cell.party, (m.get(cell.party) || 0) + 1);
  }

  // 各縣市政黨輪替次數（相鄰兩屆不同政黨算 1 次）
  const countySwings = new Map<string, number>();
  for (const c of counties) {
    let swings = 0;
    let prev: string | null = null;
    for (const y of years) {
      const cell = map.get(`${y}|${c}`);
      if (!cell) continue;
      if (prev && prev !== cell.party) swings++;
      prev = cell.party;
    }
    countySwings.set(c, swings);
  }
  const maxSwings = Math.max(...Array.from(countySwings.values()), 0);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        {prefix && (
          <span className="font-serif text-3xl text-ink-soft">{prefix}</span>
        )}
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        <span className="text-sm text-ink-soft">
          {counties.length} 縣市 × {years.length} 屆
        </span>
      </div>
      <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
        {desc}
      </p>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left px-2 py-1 sticky left-0 bg-paper">縣市</th>
              {years.map((y) => (
                <th
                  key={y}
                  className="px-1 py-1 font-medium text-ink-soft tabular-nums"
                >
                  {y}
                </th>
              ))}
              <th className="px-2 py-1 font-medium text-ink-soft text-center border-l-2 border-ink">
                輪替
              </th>
            </tr>
          </thead>
          <tbody>
            {counties.map((c, idx) => {
              const region = COUNTY_TO_REGION.get(c);
              const prevRegion = idx > 0 ? COUNTY_TO_REGION.get(counties[idx - 1]) : null;
              const isFirstOfRegion = region && region !== prevRegion;
              return (
              <tr
                key={c}
                className={
                  "border-b border-rule/30 " +
                  (isFirstOfRegion ? "border-t-2 border-t-ink/60" : "")
                }
              >
                <td className="px-2 py-0.5 sticky left-0 bg-paper text-ink-soft whitespace-nowrap">
                  {isFirstOfRegion && (
                    <span className="inline-block text-[10px] text-accent-red font-bold mr-1.5 tracking-wider">
                      {region}
                    </span>
                  )}
                  {c}
                </td>
                {years.map((y) => {
                  const cell = map.get(`${y}|${c}`);
                  if (!cell)
                    return (
                      <td
                        key={y}
                        className="w-12 h-7 border border-rule/30 bg-rule/10"
                      />
                    );
                  const color = partyColor(cell.party, cell.color_hex);
                  // 透明度根據得票% 調整：50% → 0.8 opacity, 30% → 0.4 opacity
                  const opacity = Math.min(1, 0.35 + (cell.pct - 25) / 100);
                  return (
                    <td
                      key={y}
                      title={`${cell.year} ${c}: ${cell.candidate ? cell.candidate + " · " : ""}${cell.party} ${cell.pct}%`}
                      className="w-12 h-7 border border-paper text-center tabular-nums text-paper font-bold"
                      style={{
                        backgroundColor: color,
                        opacity,
                      }}
                    >
                      {cell.pct >= 30 ? cell.pct.toFixed(0) : ""}
                    </td>
                  );
                })}
                {/* 輪替次數 column */}
                <td
                  className="w-12 h-7 border-l-2 border-ink text-center tabular-nums"
                  title={`${c} 共輪替 ${countySwings.get(c) || 0} 次政黨`}
                >
                  <span
                    className={
                      "inline-block px-1.5 text-xs font-bold " +
                      ((countySwings.get(c) || 0) === 0
                        ? "text-ink-soft"
                        : (countySwings.get(c) || 0) >= maxSwings
                          ? "text-accent-red"
                          : "text-ink")
                    }
                  >
                    {countySwings.get(c) || 0}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
          {/* 每年各黨總計 */}
          <tfoot className="border-t-2 border-ink">
            {Array.from(
              new Set(data.map((d) => d.party)),
            )
              .sort((a, b) => {
                // 主要兩黨優先
                const order = ["民主進步黨", "中國國民黨"];
                const ai = order.indexOf(a);
                const bi = order.indexOf(b);
                if (ai !== -1 && bi !== -1) return ai - bi;
                if (ai !== -1) return -1;
                if (bi !== -1) return 1;
                return 0;
              })
              .map((party) => {
                const color = partyColor(party);
                return (
                  <tr key={party}>
                    <td className="px-2 py-1 sticky left-0 bg-paper text-ink-soft text-right">
                      <span style={{ color }}>{party}</span>
                    </td>
                    {years.map((y) => {
                      const count = yearPartyCount.get(y)?.get(party) ?? 0;
                      return (
                        <td
                          key={y}
                          className="w-12 h-6 text-center tabular-nums font-bold"
                          style={{
                            color: count > 0 ? color : "#ccc",
                          }}
                        >
                          {count > 0 ? count : ""}
                        </td>
                      );
                    })}
                    <td className="border-l-2 border-ink" />

                  </tr>
                );
              })}
          </tfoot>
        </table>
      </div>

      {/* 輪替次數統計 */}
      {maxSwings > 0 && (
        <div className="mt-4 text-xs text-ink-soft border-t border-rule pt-3 flex flex-wrap gap-x-4 gap-y-1">
          <span>政黨輪替排行：</span>
          {Array.from(countySwings.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([county, swings]) => (
              <span key={county}>
                <span className="text-ink-soft">{county}</span>
                <strong
                  className={
                    "ml-1 " +
                    (swings === maxSwings ? "text-accent-red" : "text-ink")
                  }
                >
                  {swings} 次
                </strong>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
