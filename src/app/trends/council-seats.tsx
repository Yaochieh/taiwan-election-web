import type { CouncilSeatRow } from "@/lib/api";
import { partyColor, COUNTY_ORDER } from "@/lib/format";

/** ⑥ 各縣市議會歷屆政黨席次（2014／2018／2022）。
 *  資料：中選會選舉資料庫，當選以 elcand「*」為準；2009／2010 舊資料選區未解析，未納入。 */

const MAIN = ["中國國民黨", "民主進步黨", "台灣民眾黨", "時代力量", "無黨籍及未經政黨推薦"];
const OTHER = "其他政黨";
const LABEL: Record<string, string> = { 無黨籍及未經政黨推薦: "無黨籍" };

type Seg = { party: string; seats: number; color: string };

function group(rows: CouncilSeatRow[]): Seg[] {
  const m = new Map<string, Seg>();
  for (const r of rows) {
    const key = MAIN.includes(r.party) ? r.party : OTHER;
    const color = key === OTHER ? "#b8b2a7" : partyColor(r.party, r.color);
    const s = m.get(key) ?? { party: key, seats: 0, color };
    s.seats += r.seats;
    m.set(key, s);
  }
  const order = [...MAIN, OTHER];
  return Array.from(m.values()).sort((a, b) => order.indexOf(a.party) - order.indexOf(b.party));
}

function Bar({ segs, height = "h-5", showNumbers = false }: { segs: Seg[]; height?: string; showNumbers?: boolean }) {
  const total = segs.reduce((s, x) => s + x.seats, 0);
  return (
    <div className={`flex w-full ${height} overflow-hidden bg-rule/40`}>
      {segs.map((s) => (
        <div
          key={s.party}
          className="h-full flex items-center justify-center text-[11px] font-medium text-paper tabular-nums"
          style={{ width: `${(s.seats / total) * 100}%`, backgroundColor: s.color }}
          title={`${LABEL[s.party] ?? s.party} ${s.seats} 席`}
        >
          {showNumbers && s.seats / total > 0.06 ? s.seats : ""}
        </div>
      ))}
    </div>
  );
}

export function CouncilSeats({ data }: { data: CouncilSeatRow[] }) {
  if (data.length === 0) return null;
  const years = Array.from(new Set(data.map((r) => r.year))).sort();
  const counties = Array.from(new Set(data.map((r) => r.county))).sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a);
    const ib = COUNTY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const national = years.map((y) => ({ year: y, segs: group(data.filter((r) => r.year === y)) }));
  const legend = group(data);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-serif text-3xl text-ink-soft">⑥</span>
        <h2 className="font-serif text-2xl font-bold">縣市議會政黨席次</h2>
        <span className="text-sm text-ink-soft">
          {years[0]} — {years[years.length - 1]}（{years.length} 屆）
        </span>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed mb-6 max-w-3xl">
        各縣市議會當選席次依推薦政黨分色，含原住民選區。當選人以中選會選舉資料庫標記為準；
        2009／2010 年舊資料的選區尚未整理，暫不列入。滑鼠移到色塊可看席次。
      </p>

      {/* 全國合計 */}
      <div className="space-y-2 mb-3">
        {national.map(({ year, segs }) => (
          <div key={year} className="flex items-center gap-3">
            <span className="font-serif text-lg w-12 shrink-0">{year}</span>
            <div className="flex-1 min-w-0">
              <Bar segs={segs} height="h-8" showNumbers />
            </div>
            <span className="text-xs text-ink-soft w-16 text-right shrink-0">
              共 {segs.reduce((s, x) => s + x.seats, 0)} 席
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft border-t border-rule pt-3 mb-8">
        {legend.map((s) => (
          <span key={s.party} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3" style={{ backgroundColor: s.color }} />
            {LABEL[s.party] ?? s.party}
          </span>
        ))}
      </div>

      {/* 各縣市 */}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {counties.map((county) => (
          <div key={county} className="min-w-0">
            <p className="font-serif font-bold mb-1.5">{county}</p>
            <div className="space-y-1">
              {years.map((y) => {
                const segs = group(data.filter((r) => r.year === y && r.county === county));
                const total = segs.reduce((s, x) => s + x.seats, 0);
                if (total === 0) return null;
                return (
                  <div key={y} className="flex items-center gap-2">
                    <span className="text-[11px] text-ink-soft tabular-nums w-8 shrink-0">{y}</span>
                    <div className="flex-1 min-w-0">
                      <Bar segs={segs} height="h-3.5" />
                    </div>
                    <span className="text-[11px] text-ink-soft tabular-nums w-9 text-right shrink-0">{total} 席</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
