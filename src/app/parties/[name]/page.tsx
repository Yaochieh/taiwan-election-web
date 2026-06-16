import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMayoralHistory,
  getPresidentialTrend,
  getPartyListTrend,
  getLegislatureComposition,
  getLegislativeSeatTrend,
} from "@/lib/api";
import { partyColor, formatElectionLabelShort, cleanDistrict } from "@/lib/format";
import { PARTY_INFO } from "@/lib/party-info";
import { PersonLink } from "@/components/entity-links";

export default async function PartyPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  const info = PARTY_INFO[name];

  const [mayoralHistory, presidential, partyList, legislature, legTrend] =
    await Promise.all([
      getMayoralHistory().catch(() => []),
      getPresidentialTrend().catch(() => []),
      getPartyListTrend().catch(() => []),
      getLegislatureComposition("2024").catch(() => null),
      getLegislativeSeatTrend().catch(() => []),
    ]);

  // 此黨歷年立委席次（區域+原住民）
  const partyLegTrend = legTrend
    .filter((r) => r.party === name)
    .sort((a, b) => a.year.localeCompare(b.year));

  // 此黨歷年當選縣市長
  const mayors = mayoralHistory.filter((h) => h.party_name === name);

  // 此黨歷年總統選舉得票（取每年最高得票）
  const presByYear = new Map<string, (typeof presidential)[number]>();
  for (const p of presidential) {
    if (p.party_name !== name) continue;
    const year = p.date.slice(0, 4);
    if (!presByYear.has(year) || (presByYear.get(year)?.votes ?? 0) < p.votes) {
      presByYear.set(year, p);
    }
  }
  const presList = Array.from(presByYear.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const presWins = presList.filter((p, i, arr) => {
    // 看當年是否第一名
    const sameYear = presidential.filter((x) =>
      x.date.startsWith(p.date.slice(0, 4)),
    );
    const winner = sameYear.sort((a, b) => b.votes - a.votes)[0];
    return winner.party_name === name;
  }).length;

  // 此黨歷年政黨票
  const partyListByYear = new Map<string, (typeof partyList)[number]>();
  for (const p of partyList) {
    if (p.party_name !== name) continue;
    partyListByYear.set(p.date.slice(0, 4), p);
  }
  const partyListEntries = Array.from(partyListByYear.entries()).sort();

  // 此黨現任立委
  const currentLegislators =
    legislature?.members.filter((m) => m.party === name) || [];

  // 沒這黨資料且不在 PARTY_INFO，404
  if (!info && mayors.length === 0 && presList.length === 0 && currentLegislators.length === 0) {
    notFound();
  }

  const color = info?.color || partyColor(name);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b-2 pb-6 mb-10" style={{ borderColor: color }}>
        <div className="text-sm text-ink-soft mb-4">
          <Link href="/parties" className="hover:text-ink">
            ← 政黨資訊
          </Link>
        </div>
        <p
          className="text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color }}
        >
          PARTY
        </p>
        <h1
          className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3"
          style={{ color }}
        >
          {name}
        </h1>
        {info && (
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{info.short}</span>
            <span className="mx-2">·</span>
            成立於 {info.foundedYear} 年
            {info.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noreferrer"
                className="ml-3 underline underline-offset-2 hover:text-accent-red"
              >
                官網 →
              </a>
            )}
          </p>
        )}
        {info && (
          <p className="mt-4 leading-relaxed max-w-3xl">{info.intro}</p>
        )}
      </header>

      {/* 主要指標 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        <Stat
          label="總統當選"
          value={presWins}
          color={color}
        />
        <Stat
          label="縣市長累計"
          value={mayors.length}
          color={color}
        />
        <Stat
          label="2024 立委席次"
          value={currentLegislators.length}
          color={color}
        />
        <Stat
          label="2024 政黨票"
          value={
            partyListEntries.find(([y]) => y === "2024")
              ? `${((partyListEntries.find(([y]) => y === "2024")![1].votes /
                  partyList
                    .filter((p) => p.date.startsWith("2024"))
                    .reduce((a, b) => a + b.votes, 0)) *
                  100).toFixed(1)}%`
              : "—"
          }
          color={color}
        />
      </section>

      {/* 2024 立委名單 */}
      {currentLegislators.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            2024 第 11 屆立委
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {currentLegislators.map((m, i) => (
              <article
                key={i}
                className="border border-rule px-3 py-2 hover:border-ink transition"
              >
                {m.kind !== "party_list" ? (
                  <PersonLink
                    name={m.candidate}
                    color={color}
                    className="font-medium"
                  />
                ) : (
                  <span className="font-medium text-ink">{m.candidate}</span>
                )}
                <div className="text-xs text-ink-soft mt-0.5">
                  {m.kind === "regional"
                    ? (cleanDistrict(m.district) || m.district)
                    : m.kind === "highland"
                      ? "山地原住民"
                      : m.kind === "lowland"
                        ? "平地原住民"
                        : "不分區"}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 歷屆立委席次 */}
      {partyLegTrend.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            歷屆立委席次（區域 + 原住民）
          </h2>
          <div className="border-t-2 border-ink pt-3">
            <div className="grid grid-cols-[60px_1fr_60px] gap-3 items-center">
              {partyLegTrend.map((r) => {
                const pct = (r.seats / 113) * 100;
                return (
                  <div key={r.year} className="contents">
                    <div className="font-serif tabular-nums">{r.year}</div>
                    <div className="flex h-7 bg-rule">
                      <div
                        className="flex items-center justify-end pr-2 text-paper text-xs font-bold"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      >
                        {pct > 8 ? r.seats : ""}
                      </div>
                    </div>
                    <div className="text-xs text-ink-soft tabular-nums">
                      {r.seats} 席
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-ink-soft mt-3">
              基準：每屆 113 席（73 區域 + 6 原住民 + 34 不分區，Hare quota）。
            </p>
          </div>
        </section>
      )}

      {/* 歷屆縣市長 */}
      {mayors.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            歷屆縣市長
            <span className="text-sm font-normal text-ink-soft ml-3">
              {mayors.length} 位
            </span>
          </h2>
          <div className="border-t-2 border-ink">
            {(() => {
              // 按年份分組
              const byYear = new Map<string, typeof mayors>();
              for (const m of mayors) {
                const year = m.date.slice(0, 4);
                if (!byYear.has(year)) byYear.set(year, []);
                byYear.get(year)!.push(m);
              }
              const years = Array.from(byYear.keys()).sort((a, b) =>
                b.localeCompare(a),
              );
              return years.map((year) => {
                const list = byYear
                  .get(year)!
                  .sort((a, b) =>
                    (cleanDistrict(a.district) || "").localeCompare(
                      cleanDistrict(b.district) || "",
                      "zh-TW",
                    ),
                  );
                return (
                  <article
                    key={year}
                    className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-baseline"
                  >
                    <div className="col-span-2 font-serif tabular-nums text-lg">
                      {year}
                    </div>
                    <div className="col-span-10 flex flex-wrap gap-x-3 gap-y-1.5">
                      {list.map((m, i) => (
                        <span
                          key={i}
                          className="text-sm whitespace-nowrap"
                        >
                          <span className="text-ink-soft mr-1">
                            {cleanDistrict(m.district) || m.district}
                          </span>
                          <PersonLink
                            name={m.candidate_name}
                            color={color}
                            className="font-medium"
                          />
                        </span>
                      ))}
                    </div>
                  </article>
                );
              });
            })()}
          </div>
        </section>
      )}

      {/* 歷屆總統候選人 */}
      {presList.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            歷屆總統候選人
          </h2>
          <div className="border-t-2 border-ink">
            {presList.map((p, i) => {
              const sameYear = presidential.filter((x) =>
                x.date.startsWith(p.date.slice(0, 4)),
              );
              const total = sameYear.reduce((a, b) => a + b.votes, 0);
              const pct = total > 0 ? (p.votes / total) * 100 : 0;
              const won = sameYear.sort((a, b) => b.votes - a.votes)[0]
                .candidate_name === p.candidate_name;
              return (
                <article
                  key={i}
                  className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-baseline"
                >
                  <div className="col-span-3 sm:col-span-2 font-serif tabular-nums">
                    {p.date.slice(0, 4)}
                  </div>
                  <div className="col-span-5 sm:col-span-4">
                    <PersonLink
                      name={p.candidate_name}
                      color={color}
                      className="font-medium"
                    />
                    {won && (
                      <span className="ml-2 text-xs text-accent-red font-bold">
                        ★ 當選
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-sm tabular-nums">
                    {new Intl.NumberFormat("zh-TW").format(Math.round(p.votes))} 票
                  </div>
                  <div className="col-span-12 sm:col-span-3 text-sm text-ink-soft tabular-nums text-right">
                    {pct.toFixed(2)}%
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="border border-rule p-3">
      <p className="text-[10px] tracking-widest uppercase text-ink-soft mb-1">
        {label}
      </p>
      <p
        className="font-serif text-3xl font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  return { title: `${name} · 政黨資訊 · 正至` };
}
