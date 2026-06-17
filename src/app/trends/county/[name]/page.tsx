import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPresidentialCountyWinners,
  getMayoralCountyWinners,
} from "@/lib/api";
import { partyColor } from "@/lib/format";

export const revalidate = 60;

const COUNTY_MERGE: Record<string, string> = {
  "臺北縣": "新北市",
  "桃園縣": "桃園市",
  "臺中縣": "臺中市",
  "臺南縣": "臺南市",
  "高雄縣": "高雄市",
};

export default async function CountyHistoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encoded } = await params;
  const county = decodeURIComponent(encoded);

  // 抓 split 版本 (含舊縣)，再用 COUNTY_MERGE 對應到現代縣市
  const [presSplit, mayoralSplit] = await Promise.all([
    getPresidentialCountyWinners(false).catch(() => []),
    getMayoralCountyWinners(false).catch(() => []),
  ]);

  const matchesCounty = (district: string) =>
    district === county || COUNTY_MERGE[district] === county;

  const presRows = presSplit
    .filter((c) => matchesCounty(c.county))
    .sort((a, b) => a.year.localeCompare(b.year));
  const mayoralRows = mayoralSplit
    .filter((c) => matchesCounty(c.county))
    .sort((a, b) => a.year.localeCompare(b.year));

  if (presRows.length === 0 && mayoralRows.length === 0) notFound();

  // 各黨歷次贏次
  const partyWins = new Map<string, { pres: number; mayoral: number; color: string }>();
  for (const r of presRows) {
    const e = partyWins.get(r.party) || {
      pres: 0,
      mayoral: 0,
      color: partyColor(r.party, r.color_hex),
    };
    e.pres += 1;
    partyWins.set(r.party, e);
  }
  for (const r of mayoralRows) {
    const e = partyWins.get(r.party) || {
      pres: 0,
      mayoral: 0,
      color: partyColor(r.party, r.color_hex),
    };
    e.mayoral += 1;
    partyWins.set(r.party, e);
  }
  const partyList = Array.from(partyWins.entries()).sort(
    (a, b) => b[1].pres + b[1].mayoral - (a[1].pres + a[1].mayoral),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b-2 border-ink pb-8 mb-10">
        <p className="text-sm text-ink-soft mb-3">
          <Link href="/trends" className="hover:text-ink">
            ← 回趨勢分析
          </Link>
        </p>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          COUNTY HISTORY
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          {county}
        </h1>
        <p className="text-ink-soft leading-relaxed">
          歷屆總統選舉 {presRows.length} 屆、縣市長選舉 {mayoralRows.length} 屆。
          {COUNTY_MERGE[county] === undefined &&
            Object.entries(COUNTY_MERGE).some(([_, v]) => v === county) && (
              <span className="ml-1 text-xs">
                （含合併前{" "}
                {Object.entries(COUNTY_MERGE)
                  .filter(([_, v]) => v === county)
                  .map(([k]) => k)
                  .join("、")}
                ）
              </span>
            )}
        </p>
      </header>

      {/* 各黨贏次 */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4">各黨贏次</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {partyList.map(([name, e]) => (
            <div
              key={name}
              className="border-l-4 border-rule pl-3 py-1"
              style={{ borderLeftColor: e.color }}
            >
              <div className="font-medium" style={{ color: e.color }}>
                {name}
              </div>
              <div className="text-sm text-ink-soft">
                總統 {e.pres} 次 · 縣市長 {e.mayoral} 次
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 總統選舉歷年 */}
      {presRows.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">總統選舉歷年勝出黨</h2>
          <div className="border-t-2 border-ink">
            {presRows.map((r, i) => {
              const c = partyColor(r.party, r.color_hex);
              return (
                <div
                  key={`${r.year}-${i}`}
                  className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-baseline"
                >
                  <div className="col-span-2 font-serif text-lg tabular-nums">
                    {r.year}
                  </div>
                  <div className="col-span-3 text-sm text-ink-soft">
                    {r.county !== county && (
                      <span className="px-1 py-0.5 text-[10px] bg-rule/40 mr-1">
                        {r.county}
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 font-medium" style={{ color: c }}>
                    {r.party}
                  </div>
                  <div className="col-span-3 text-right tabular-nums text-sm">
                    {r.pct.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 縣市長歷年 */}
      {mayoralRows.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">縣市長選舉歷年勝出</h2>
          <div className="border-t-2 border-ink">
            {mayoralRows.map((r, i) => {
              const c = partyColor(r.party, r.color_hex);
              return (
                <div
                  key={`${r.year}-${i}`}
                  className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-baseline"
                >
                  <div className="col-span-2 font-serif text-lg tabular-nums">
                    {r.year}
                  </div>
                  <div className="col-span-3 text-sm text-ink-soft">
                    {r.county !== county && (
                      <span className="px-1 py-0.5 text-[10px] bg-rule/40 mr-1">
                        {r.county}
                      </span>
                    )}
                    {r.candidate && (
                      <span className="text-xs ml-1">{r.candidate}</span>
                    )}
                  </div>
                  <div className="col-span-4 font-medium" style={{ color: c }}>
                    {r.party}
                  </div>
                  <div className="col-span-3 text-right tabular-nums text-sm">
                    {r.pct.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-10">
        合併前的舊縣（如高雄縣）在表格中以小灰標籤顯示。
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return { title: `${decoded} 縣市歷史 · 正至` };
}
