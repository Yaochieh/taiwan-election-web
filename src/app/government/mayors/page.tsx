import Link from "next/link";
import { getMayoralHistory, getElections } from "@/lib/api";
import {
  cleanDistrict,
  formatVotes,
  partyColor,
  COUNTY_ORDER,
  COUNTY_TO_GROUP,
} from "@/lib/format";
import { TaiwanMap } from "./taiwan-map";
import { PersonLink, PartyLink } from "@/components/entity-links";

export const metadata = {
  title: "縣市長歷屆 · 正至",
  description: "歷屆縣市長當選人矩陣與地圖",
};

const MAJOR_PARTIES = ["民主進步黨", "中國國民黨"] as const;

export default async function MayorsPage() {
  const [history, allElections] = await Promise.all([
    getMayoralHistory().catch(() => []),
    getElections().catch(() => []),
  ]);

  // year → mayoral election_id mapping
  const yearToElectionId = new Map<string, number>();
  for (const e of allElections) {
    if (e.type === "mayoral") {
      const year = e.date.slice(0, 4);
      // 若同年多筆，優先取沒 description 的（主選舉）
      if (!yearToElectionId.has(year) || !e.description) {
        yearToElectionId.set(year, e.election_id);
      }
    }
  }

  // 整理：以「縣市 × 年份」當 key
  type Cell = {
    candidate: string;
    party: string | null;
    votes: number;
    color: string;
  };
  const grid = new Map<string, Map<string, Cell>>();
  const years = new Set<string>();
  const counties = new Set<string>();

  for (const h of history) {
    if (h.district === "地區(10, 0, 0)") continue;
    const county = cleanDistrict(h.district);
    if (!county) continue;
    const year = h.date.slice(0, 4);
    years.add(year);
    counties.add(county);

    // 同一縣市同一年只保留得票最高（一場 normal 選舉一名當選人）
    if (!grid.has(county)) grid.set(county, new Map());
    const row = grid.get(county)!;
    const existing = row.get(year);
    if (!existing || h.votes > existing.votes) {
      row.set(year, {
        candidate: h.candidate_name,
        party: h.party_name,
        votes: h.votes,
        color: partyColor(h.party_name),
      });
    }
  }

  const yearList = Array.from(years).sort();
  const countyList = Array.from(counties).sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a);
    const ib = COUNTY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "zh-TW");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const latestYear = yearList[yearList.length - 1];

  // 最近一屆地圖資料
  const latestMap = new Map<string, { party: string | null; candidate: string }>();
  for (const county of countyList) {
    const cell = grid.get(county)?.get(latestYear);
    if (cell) latestMap.set(county, { party: cell.party, candidate: cell.candidate });
  }

  // 各年份各政黨席次
  const yearPartyCount = new Map<string, Map<string, number>>();
  for (const year of yearList) {
    const counter = new Map<string, number>();
    for (const county of countyList) {
      const cell = grid.get(county)?.get(year);
      if (!cell) continue;
      const key = MAJOR_PARTIES.includes(cell.party as (typeof MAJOR_PARTIES)[number])
        ? cell.party!
        : "其他";
      counter.set(key, (counter.get(key) || 0) + 1);
    }
    yearPartyCount.set(year, counter);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          MAYORS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          縣市長歷屆
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          從 1994 年首次省市長民選以來的歷屆縣市長當選人。
          顏色代表政黨：
          <span className="ml-2" style={{ color: partyColor("民主進步黨") }}>
            ● 民進黨
          </span>
          <span className="ml-2" style={{ color: partyColor("中國國民黨") }}>
            ● 國民黨
          </span>
          <span className="ml-2 text-ink-soft">● 其他/無黨籍</span>
        </p>
      </header>

      {/* ── 最近一屆地圖 ── */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          {latestYear} 年現任縣市長地圖
          <span className="text-sm font-normal text-ink-soft">
            {latestMap.size} 縣市
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          將滑鼠移到縣市上可看到當選人姓名。
        </p>
        <TaiwanMap data={Object.fromEntries(latestMap)} />
      </section>

      {/* ── 矩陣 ── */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          歷屆當選矩陣
          <span className="text-sm font-normal text-ink-soft">
            {countyList.length} 縣市 × {yearList.length} 屆
          </span>
        </h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="sticky left-0 bg-paper z-10 text-left px-3 py-2 text-xs font-medium tracking-widest uppercase text-ink-soft">
                  縣市
                </th>
                {yearList.map((y) => (
                  <th
                    key={y}
                    className="text-center px-3 py-2 text-xs font-medium tabular-nums font-serif"
                  >
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countyList.map((county, idx) => {
                const group = COUNTY_TO_GROUP.get(county);
                const prevGroup = idx > 0 ? COUNTY_TO_GROUP.get(countyList[idx - 1]) : null;
                const isFirstOfGroup = group && group !== prevGroup;
                return (
                <tr
                  key={county}
                  className={
                    "border-b border-rule " +
                    (isFirstOfGroup ? "border-t-2 border-t-ink/60" : "")
                  }
                >
                  <th className="sticky left-0 bg-paper z-10 text-left px-3 py-2 font-medium">
                    {isFirstOfGroup && (
                      <span className="block text-[10px] text-accent-red font-bold tracking-wider mb-0.5">
                        {group}
                      </span>
                    )}
                    {county}
                  </th>
                  {yearList.map((y) => {
                    const cell = grid.get(county)?.get(y);
                    const electionId = yearToElectionId.get(y);
                    return (
                      <td
                        key={y}
                        className="text-center px-2 py-2 align-top"
                      >
                        {cell ? (
                          electionId ? (
                            <Link
                              href={`/elections/${electionId}`}
                              className="block hover:bg-rule/40 px-2 py-1 transition"
                              title={`${cell.candidate} (${cell.party || "無黨籍"})\n得票 ${formatVotes(cell.votes)}\n點擊看選舉詳情`}
                            >
                              <div
                                className="font-medium leading-tight"
                                style={{ color: cell.color }}
                              >
                                {cell.candidate}
                              </div>
                              <div className="text-[10px] text-ink-soft mt-0.5">
                                {(cell.party || "無黨籍").slice(0, 4)}
                              </div>
                            </Link>
                          ) : (
                            <div>
                              <div
                                className="font-medium leading-tight"
                                style={{ color: cell.color }}
                              >
                                {cell.candidate}
                              </div>
                              <div className="text-[10px] text-ink-soft mt-0.5">
                                {(cell.party || "無黨籍").slice(0, 4)}
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-ink-soft">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 歷年席次 ── */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-6">歷年各政黨縣市長席次</h2>
        <div className="border border-rule">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left px-4 py-2 text-xs tracking-widest uppercase text-ink-soft">
                  年份
                </th>
                {[...MAJOR_PARTIES, "其他"].map((p) => (
                  <th
                    key={p}
                    className="text-center px-4 py-2"
                    style={{ color: partyColor(p) }}
                  >
                    {p === "其他" ? (
                      "其他"
                    ) : (
                      <PartyLink name={p}>
                        {p === "民主進步黨" ? "民進黨" : "國民黨"}
                      </PartyLink>
                    )}
                  </th>
                ))}
                <th className="text-center px-4 py-2 text-ink-soft text-xs uppercase">
                  總席次
                </th>
              </tr>
            </thead>
            <tbody>
              {yearList.map((y) => {
                const c = yearPartyCount.get(y)!;
                const total = [...c.values()].reduce((a, b) => a + b, 0);
                return (
                  <tr key={y} className="border-b border-rule last:border-0">
                    <td className="px-4 py-2 font-serif tabular-nums">{y}</td>
                    {[...MAJOR_PARTIES, "其他"].map((p) => (
                      <td
                        key={p}
                        className="text-center px-4 py-2 tabular-nums"
                      >
                        {c.get(p) || 0}
                      </td>
                    ))}
                    <td className="text-center px-4 py-2 text-ink-soft tabular-nums">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
