import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getElection,
  getElectionResults,
  getCandidatesStatus,
  getElectionDistricts,
  getRecallResults,
} from "@/lib/api";
import type { RecallResult } from "@/lib/types";
import {
  cleanDistrict,
  formatElectionLabel,
  formatVotes,
  votePct,
  partyColor,
  COUNTY_ORDER,
  COUNTY_TO_GROUP,
} from "@/lib/format";
import { PersonLink, PartyLink } from "@/components/entity-links";
import { VoteMap } from "./vote-map";
import { ResultTreemap } from "./result-treemap";

const TYPE_ZH: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

function RecallSection({ recalls }: { recalls: RecallResult[] }) {
  const passedN = recalls.filter((r) => r.passed === 1).length;
  const metN = recalls.filter((r) => r.threshold_met === 1).length;
  return (
    <section>
      <p className="text-sm text-ink-soft mb-6 leading-relaxed">
        共 {recalls.length} 案罷免投票，{passedN === 0 ? "全數否決" : `${passedN} 案通過`}
        {metN > 0 && `；其中 ${metN} 案同意票達選舉人數 1/4 門檻，但不同意票較多`}。
        罷免通過需「同意多於不同意」且「同意達原選區選舉人總數 1/4」兩條件同時成立。
        數字為中選會審定結果，來源見各案連結。
      </p>
      <div className="border-t-2 border-ink">
        {recalls.map((r) => {
          const valid = r.valid_votes ?? r.agree_votes + r.disagree_votes;
          const agreePct = (r.agree_votes / valid) * 100;
          const thresholdPct =
            r.threshold_votes != null ? (r.threshold_votes / valid) * 100 : null;
          return (
            <article key={r.target_name} className="py-4 border-b border-rule">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <PersonLink
                  name={r.target_name}
                  className="font-serif text-lg font-bold hover:underline underline-offset-4"
                />
                <span className="text-xs text-ink-soft">
                  {r.party} · {r.district || r.target_office} · {r.target_office}
                </span>
                <span className="ml-auto inline-flex items-center gap-2">
                  {r.threshold_met === 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 border border-accent-red text-accent-red">
                      同意達門檻
                    </span>
                  )}
                  <span
                    className={
                      "text-xs font-bold " + (r.passed ? "text-accent-red" : "text-ink-soft")
                    }
                  >
                    {r.passed ? "通過" : "否決"}
                  </span>
                </span>
              </div>
              {/* 同意/不同意 開票條，黑色刻度＝門檻 */}
              <div className="relative h-4 bg-rule/40 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-accent-red/80"
                  style={{ width: `${agreePct}%` }}
                />
                <div
                  className="absolute inset-y-0 bg-ink/25"
                  style={{ left: `${agreePct}%`, right: 0 }}
                />
                {thresholdPct != null && thresholdPct <= 100 && (
                  <div
                    className="absolute inset-y-0 w-[2px] bg-ink"
                    style={{ left: `${thresholdPct}%` }}
                    title={`門檻 ${formatVotes(r.threshold_votes!)} 票`}
                  />
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft tabular-nums">
                <span>
                  同意 <strong className="text-accent-red">{formatVotes(r.agree_votes)}</strong>（
                  {agreePct.toFixed(1)}%）
                </span>
                <span>
                  不同意 <strong className="text-ink">{formatVotes(r.disagree_votes)}</strong>（
                  {(100 - agreePct).toFixed(1)}%）
                </span>
                {r.threshold_votes != null && <span>門檻 {formatVotes(r.threshold_votes)}</span>}
                {r.electors != null && <span>選舉人數 {formatVotes(r.electors)}</span>}
                <a
                  href={r.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-accent-red"
                >
                  中選會公告 →
                </a>
              </div>
              {r.note && <p className="mt-1 text-[11px] text-ink-soft">註：{r.note}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default async function ElectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ county?: string }>;
}) {
  const { id } = await params;
  const { county: countyParam } = await searchParams;
  const electionId = Number(id);
  if (!Number.isFinite(electionId)) notFound();

  const election = await getElection(electionId).catch(() => null);
  if (!election) notFound();

  const [results, candidatesStatus, districts, recalls] = await Promise.all([
    getElectionResults(electionId).catch(() => []),
    getCandidatesStatus(electionId).catch(() => []),
    getElectionDistricts(electionId).catch(() => []),
    getRecallResults(electionId).catch(() => [] as RecallResult[]),
  ]);

  // 按 district 分組
  type ResultRow = (typeof results)[number];
  const byDistrict = new Map<string, ResultRow[]>();
  for (const r of results) {
    const d = r.district || "(無)";
    if (!byDistrict.has(d)) byDistrict.set(d, []);
    byDistrict.get(d)!.push(r);
  }

  // 過濾掉「全國摘要」當有縣市分布時（避免重複顯示）
  const SUMMARY_KEYS = new Set(["全國", "地區(0, 0, 0)"]);
  const hasCounties =
    Array.from(byDistrict.keys()).filter((k) => !SUMMARY_KEYS.has(k)).length > 0;
  if (hasCounties) {
    for (const k of SUMMARY_KEYS) byDistrict.delete(k);
  }

  const districtList = Array.from(byDistrict.keys()).sort();

  // 把 districts 按縣市分組 (例：'臺北市第07選區' → 臺北市)
  const districtToCounty = (d: string): string => {
    const m = d.match(/^(.+?[市縣])第\d+選區$/);
    return m ? m[1] : d;
  };
  const countyToDistricts = new Map<string, string[]>();
  for (const d of districtList) {
    const c = districtToCounty(d);
    if (!countyToDistricts.has(c)) countyToDistricts.set(c, []);
    countyToDistricts.get(c)!.push(d);
  }
  const countyList = Array.from(countyToDistricts.keys()).sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a);
    const ib = COUNTY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "zh-TW");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const useCountyFilter =
    election.type === "legislative" && countyList.length > 6;
  const filteredDistrictList = useCountyFilter
    ? countyParam
      ? countyToDistricts.get(countyParam) || []
      : []
    : districtList;

  // 找有政見資料的候選人 ID 集合（用來顯示連結）
  const hasPlatform = new Set(
    candidatesStatus
      .filter((c) => c.platform_count > 0 || c.image_count > 0)
      .map((c) => c.candidate_name),
  );

  const isFuture = new Date(election.date) > new Date();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/elections" className="hover:text-ink">
            ← 歷屆選舉
          </Link>
          <span className="mx-2">·</span>
          <span>{TYPE_ZH[election.type] || election.type}選舉</span>
        </div>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {formatElectionLabel(election.date, election.name, election.description)}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <span>📅 投票日：{election.date}</span>
          <span>類型：{TYPE_ZH[election.type] || election.type}</span>
          {election.description && <span>分類：{election.description}</span>}
          {isFuture && (
            <span className="text-accent-red font-medium">即將舉行</span>
          )}
        </div>
        {!isFuture && results.length > 0 && (
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <Link
              href={`/platforms?election=${electionId}`}
              className="inline-block px-4 py-2 bg-ink text-paper text-sm hover:opacity-85 transition"
            >
              查看候選人政見 →
            </Link>
            {hasPlatform.size > 0 && (
              <span className="text-xs text-ink-soft">
                {hasPlatform.size} / {candidatesStatus.length} 位候選人有政見資料
              </span>
            )}
          </div>
        )}
      </header>

      {isFuture ? (
        <section className="border border-rule p-8 text-center">
          <p className="font-serif text-2xl mb-3">這場選舉尚未舉行</p>
          <p className="text-ink-soft max-w-xl mx-auto leading-relaxed">
            候選人登記預計於投票日前 2-3 個月開始。
            屆時將陸續公布候選人名單與政見資料。
          </p>
        </section>
      ) : recalls.length > 0 ? (
        <RecallSection recalls={recalls} />
      ) : results.length === 0 ? (
        <section className="border border-rule p-8 text-center">
          <p className="font-serif text-2xl mb-3">尚無結果資料</p>
          <p className="text-ink-soft">此選舉的得票資料正在補建中。</p>
        </section>
      ) : (
        <section className="space-y-12">
          <p className="text-sm text-ink-soft">
            共 {districtList.length} 個選區、
            {election.type === "presidential"
              ? `${results.length / 2} 組正副總統候選人`
              : `${results.length} 筆候選人結果`}
          </p>
          {/* presidential：用全國加總畫一張大 treemap + 地圖；不再逐縣市列文字 */}
          {election.type === "presidential" && (() => {
            type ResultRow = (typeof results)[number];
            const byCand = new Map<string, ResultRow & { total: number }>();
            // 若有「全國摘要列」優先用它（已是總票）；否則 SUM 縣市
            const hasNational = results.some((r) => r.district === "全國");
            for (const r of results) {
              if (hasNational && r.district !== "全國") continue;
              if (!hasNational && r.district === "全國") continue;
              const key = `${r.candidate_name}::${r.party_name}`;
              const ex = byCand.get(key);
              if (ex) ex.total += r.votes;
              else byCand.set(key, { ...r, total: r.votes });
            }
            const aggregated = Array.from(byCand.values())
              .map((r) => ({ ...r, votes: r.total }))
              .sort((a, b) => b.votes - a.votes);
            // 配對：以 background='正總統' 為 primary、'副總統' 為 running。
            // 同黨同票數視為一組。
            const seen = new Set<number>();
            const items: { primary: ResultRow; running?: ResultRow }[] = [];
            for (let i = 0; i < aggregated.length; i++) {
              if (seen.has(i)) continue;
              seen.add(i);
              const pair: ResultRow[] = [aggregated[i]];
              for (let j = i + 1; j < aggregated.length; j++) {
                if (
                  !seen.has(j) &&
                  aggregated[j].votes === aggregated[i].votes &&
                  aggregated[j].party_name === aggregated[i].party_name
                ) {
                  pair.push(aggregated[j]);
                  seen.add(j);
                  break;
                }
              }
              // pair 內以 background 排，正在前、副在後
              pair.sort((a, b) => {
                const score = (r: ResultRow) =>
                  r.background === "副總統" ? 1 : r.background === "正總統" ? 0 : 0.5;
                return score(a) - score(b);
              });
              items.push({ primary: pair[0], running: pair[1] });
            }
            const totalAll = items.reduce((a, b) => a + b.primary.votes, 0);
            return (
              <div className="space-y-8">
                <div className="border border-rule p-4 sm:p-6">
                  <h2 className="font-serif text-xl font-bold mb-3 border-b border-ink pb-2">
                    全國得票分佈
                  </h2>
                  <p className="text-xs text-ink-soft mb-3 tabular-nums">
                    總有效票 {formatVotes(totalAll)}　·　方塊面積 = 得票數
                  </p>
                  <ResultTreemap items={items} total={totalAll} isPresident />
                </div>
                {hasCounties && (
                  <div className="border border-rule p-4 sm:p-6">
                    <h2 className="font-serif text-xl font-bold mb-4 border-b border-ink pb-2">
                      各縣市勝出政黨
                    </h2>
                    <VoteMap
                      results={results}
                      isPresident={true}
                      electionId={electionId}
                    />
                  </div>
                )}
              </div>
            );
          })()}
          {/* 立委選舉：縣市篩選器（73 個選區直接列太多） */}
          {useCountyFilter && (
            <section className="border border-rule p-5 mb-6">
              <p className="text-sm font-medium mb-3">
                按縣市瀏覽選區
                {countyParam && (
                  <a
                    href={`/elections/${electionId}`}
                    className="ml-3 text-xs text-ink-soft hover:text-accent-red underline underline-offset-2"
                  >
                    清除篩選
                  </a>
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {countyList.map((c, idx) => {
                  const active = countyParam === c;
                  const group = COUNTY_TO_GROUP.get(c);
                  const prevGroup =
                    idx > 0 ? COUNTY_TO_GROUP.get(countyList[idx - 1]) : null;
                  const isFirstOfGroup = group && group !== prevGroup;
                  return (
                    <span key={c} className="flex items-center gap-2">
                      {isFirstOfGroup && idx > 0 && (
                        <span className="text-ink-soft mx-1">｜</span>
                      )}
                      <a
                        href={`/elections/${electionId}?county=${encodeURIComponent(c)}`}
                        className={
                          "text-xs px-3 py-1.5 border transition " +
                          (active
                            ? "bg-ink text-paper border-ink"
                            : "border-rule hover:border-ink text-ink-soft hover:text-ink")
                        }
                      >
                        {c}
                        <span className="ml-1.5 opacity-70">
                          {countyToDistricts.get(c)!.length}
                        </span>
                      </a>
                    </span>
                  );
                })}
              </div>
              {!countyParam && (
                <p className="text-xs text-ink-soft mt-3">
                  共 73 個選區、{countyList.length} 個縣市，請選縣市開始瀏覽。
                </p>
              )}
            </section>
          )}
          {election.type !== "presidential" && filteredDistrictList.map((district) => {
            const rows = byDistrict.get(district)!;
            // 總統選舉每組正副候選人各有一筆 row，副總統不能納入總票數
            const total = rows
              .filter((r) => r.background !== "副總統")
              .reduce((a, b) => a + b.votes, 0);
            const label = cleanDistrict(district) || district;

            // 對 presidential：按相同票數配對正副
            const isPresident = election.type === "presidential";
            type ResultRow = (typeof rows)[number];
            const items: { primary: ResultRow; running?: ResultRow }[] = [];
            if (isPresident) {
              const sorted = rows.slice().sort((a, b) => {
                if (b.votes !== a.votes) return b.votes - a.votes;
                // 票數同時，正在副前
                const score = (r: ResultRow) =>
                  r.background === "副總統" ? 1 : r.background === "正總統" ? 0 : 0.5;
                return score(a) - score(b);
              });
              const seen = new Set<number>();
              for (let i = 0; i < sorted.length; i++) {
                if (seen.has(i)) continue;
                seen.add(i);
                const pair: ResultRow[] = [sorted[i]];
                for (let j = i + 1; j < sorted.length; j++) {
                  if (
                    !seen.has(j) &&
                    sorted[j].votes === sorted[i].votes &&
                    sorted[j].party_name === sorted[i].party_name
                  ) {
                    pair.push(sorted[j]);
                    seen.add(j);
                    break;
                  }
                }
                items.push({ primary: pair[0], running: pair[1] });
              }
            } else {
              items.push(
                ...rows
                  .slice()
                  .sort((a, b) => b.votes - a.votes)
                  .map((r) => ({ primary: r })),
              );
            }

            const electedCount = items.filter(
              (it) => it.primary.elected === 1,
            ).length;

            return (
              <div key={district}>
                <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2 mb-4">
                  <h2 className="font-serif text-xl font-bold">{label}</h2>
                  <div className="text-xs text-ink-soft">
                    {items.length} {isPresident ? "組" : "位"}候選人 · 當選{" "}
                    {electedCount} {isPresident ? "組" : "位"} · 共
                    {formatVotes(total)} 票
                  </div>
                </div>
                {items.length > 1 && (
                  <div className="mb-4">
                    <ResultTreemap
                      items={items}
                      total={total}
                      isPresident={false}
                    />
                  </div>
                )}
                <ol className="space-y-2">
                  {items.map((it, idx) => {
                    const r = it.primary;
                    const running = it.running;
                    return (
                      <li
                        key={`${r.candidate_name}-${idx}`}
                        className={
                          "grid grid-cols-12 gap-2 py-2 px-3 items-baseline " +
                          (r.elected === 1
                            ? "bg-ink/[0.03] border-l-2 border-accent-red"
                            : "")
                        }
                      >
                        <div className="col-span-2 sm:col-span-1 font-serif text-xl tabular-nums text-ink-soft">
                          {idx + 1}
                        </div>
                        <div className="col-span-10 sm:col-span-5">
                          {running ? (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <PersonLink
                                name={r.candidate_name}
                                color={partyColor(r.party_name, r.color_hex)}
                                className="font-medium"
                              />
                              <span className="text-ink-soft">／</span>
                              <PersonLink
                                name={running.candidate_name}
                                color={partyColor(r.party_name, r.color_hex)}
                                className="font-medium"
                              />
                            </div>
                          ) : (
                            <PersonLink
                              name={r.candidate_name}
                              color={partyColor(r.party_name, r.color_hex)}
                              className="font-medium"
                            />
                          )}
                          {r.elected === 1 && (
                            <span className="ml-2 text-xs text-accent-red font-bold">
                              ★ 當選
                            </span>
                          )}
                          {hasPlatform.has(r.candidate_name) && (
                            <Link
                              href={`/platforms?election=${electionId}&district=${encodeURIComponent(district)}`}
                              className="ml-2 text-xs underline underline-offset-2 text-ink-soft hover:text-accent-red"
                            >
                              看政見
                            </Link>
                          )}
                          <div className="text-xs text-ink-soft mt-0.5">
                            <PartyLink name={r.party_name} />
                          </div>
                        </div>
                        <div className="col-span-7 sm:col-span-3 text-sm tabular-nums">
                          {formatVotes(r.votes)} 票
                        </div>
                        <div className="col-span-5 sm:col-span-3 text-sm tabular-nums text-ink-soft">
                          {votePct(r.votes, total) || "—"}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const election = await getElection(Number(id)).catch(() => null);
  if (!election) return { title: "選舉 · 正至" };
  return {
    title: `${formatElectionLabel(election.date, election.name, election.description)} · 正至`,
  };
}
