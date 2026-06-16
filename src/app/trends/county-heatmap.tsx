import type { CountyWinnerCell } from "@/lib/api";
import { partyColor } from "@/lib/format";

interface Props {
  data: CountyWinnerCell[];
  title: string;
  desc: string;
}

// 縣市排序：北 → 中 → 南 → 東 → 外島
const COUNTY_ORDER = [
  "臺北市",
  "新北市",
  "基隆市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "臺中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "臺南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

export function CountyHeatmap({ data, title, desc }: Props) {
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

  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
        {title}
        <span className="text-sm font-normal text-ink-soft">
          {counties.length} 縣市 × {years.length} 屆
        </span>
      </h2>
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
            </tr>
          </thead>
          <tbody>
            {counties.map((c) => (
              <tr key={c} className="border-b border-rule/40">
                <td className="px-2 py-0.5 sticky left-0 bg-paper text-ink-soft whitespace-nowrap">
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
              </tr>
            ))}
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
                  </tr>
                );
              })}
          </tfoot>
        </table>
      </div>
    </section>
  );
}
