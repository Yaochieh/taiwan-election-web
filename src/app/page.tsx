import Link from "next/link";
import {
  getElections,
  getElectionsWithPlatforms,
  getMayoralHistory,
  getCandidatesStatus,
  getPresidentialTrend,
  getPersonTargets,
  getPersonProfile,
  candidatePhotoUrl,
} from "@/lib/api";
import {
  formatElectionLabelShort,
  partyColor,
  formatVotes,
  sortCounties,
} from "@/lib/format";
import { PersonLink, PartyLink } from "@/components/entity-links";

const TYPE_ZH: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

// 現任政府首長（手動策展，與 /government/cabinet 同步）
const INCUMBENTS = [
  { role: "總統", name: "賴清德", since: "2024-05-20" },
  { role: "副總統", name: "蕭美琴", since: "2024-05-20" },
  { role: "行政院長", name: "卓榮泰", since: "2024-05-20" },
  { role: "立法院長", name: "韓國瑜", since: "2024-02-01" },
];
const MAYORS = [
  { role: "臺北市", name: "蔣萬安", since: "2022-12-25" },
  { role: "新北市", name: "侯友宜", since: "2022-12-25" },
  { role: "桃園市", name: "張善政", since: "2022-12-25" },
  { role: "臺中市", name: "盧秀燕", since: "2022-12-25" },
  { role: "臺南市", name: "黃偉哲", since: "2022-12-25" },
  { role: "高雄市", name: "陳其邁", since: "2022-12-25" },
];

function daysInOffice(since: string): number {
  const start = new Date(since + "T00:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

async function fetchIncumbentStats(name: string) {
  const [profile, targets] = await Promise.all([
    getPersonProfile(name).catch(() => null),
    getPersonTargets(name).catch(() => []),
  ]);
  // 只算 parent target，避免 sub-metric 重複計數
  const top = targets.filter((t) => t.parent_target_id === null);
  const past = top.filter((t) => t.tense === "past").length;
  const future = top.filter((t) => t.tense === "future").length;
  const party = profile?.party_history?.[profile.party_history.length - 1];
  return {
    name,
    party_name: party?.party || null,
    color_hex: party?.color_hex || null,
    photo_path: profile?.photo_path || null,
    total: top.length,
    past,
    future,
  };
}

export default async function HomePage() {
  const [withPlatforms, mayoralHistory, allElections, presidential, ...incumbentStats] =
    await Promise.all([
      getElectionsWithPlatforms().catch(() => []),
      getMayoralHistory().catch(() => []),
      getElections().catch(() => []),
      getPresidentialTrend().catch(() => []),
      ...INCUMBENTS.map((o) => fetchIncumbentStats(o.name)),
      ...MAYORS.map((m) => fetchIncumbentStats(m.name)),
    ]);
  const incumbentStatsByName = new Map(
    incumbentStats.map((s) => [s.name, s]),
  );

  const latestPlatformElection = withPlatforms[0];

  // 下一場選舉
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = allElections
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextDate = upcoming[0]?.date;
  const nextDateElections = nextDate
    ? upcoming.filter((e) => e.date.slice(0, 10) === nextDate.slice(0, 10))
    : [];
  const nextTypes = Array.from(
    new Set(nextDateElections.map((e) => TYPE_ZH[e.type] || e.type)),
  );
  const daysToNext = nextDate ? daysUntil(nextDate) : null;

  // 政見資料最豐富的選舉（取候選人數最多者）
  const featuredCandidates = latestPlatformElection
    ? await getCandidatesStatus(latestPlatformElection.election_id).catch(() => [])
    : [];

  // 政見涵蓋率
  const total = featuredCandidates.length;
  const withText = featuredCandidates.filter((c) => c.platform_count > 0).length;
  const withImage = featuredCandidates.filter(
    (c) => c.platform_count === 0 && c.image_count > 0,
  ).length;
  const covered = withText + withImage;
  const coverRate = total > 0 ? Math.round((covered / total) * 100) : 0;

  // 最近三場 + 突出當選候選人
  const latestMayorByCounty = new Map<
    string,
    { candidate: string; party: string | null; year: string }
  >();
  for (const h of mayoralHistory) {
    const county = h.district || "";
    if (county === "地區(10, 0, 0)") continue;
    const year = h.date.slice(0, 4);
    if (!latestMayorByCounty.has(county) ||
        latestMayorByCounty.get(county)!.year < year) {
      latestMayorByCounty.set(county, {
        candidate: h.candidate_name,
        party: h.party_name,
        year,
      });
    }
  }

  // 最近一屆總統各黨得票（正總統，不重複計副）
  const latestPresYear = presidential
    .map((p) => p.date.slice(0, 4))
    .sort()
    .pop();
  const latestPres = presidential
    .filter((p) => p.date.startsWith(latestPresYear || ""))
    .sort((a, b) => b.votes - a.votes);
  const latestPresTotal = latestPres.reduce((a, b) => a + b.votes, 0);

  // 找副總統配對（從 search candidates 取一次）
  // 簡單做法：搜尋每位正總統得票相同者作為副
  const latestPresPairs = latestPres.map((p) => {
    // 副總統從 search 拿不到，這裡直接用既有資料的副人名硬編
    // (從 2024 結果：賴清德/蕭美琴, 侯友宜/趙少康, 柯文哲/吳欣盈)
    const RUNNING_MATES: Record<string, string> = {
      賴清德: "蕭美琴",
      侯友宜: "趙少康",
      柯文哲: "吳欣盈",
    };
    return {
      ...p,
      running_mate: RUNNING_MATES[p.candidate_name],
    };
  });

  return (
    <>
      {/* ── 倒數帶 ── */}
      {nextDate && daysToNext !== null && (
        <Link
          href="/elections"
          className="block bg-ink text-paper hover:bg-accent-red transition-colors"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
            <span className="tracking-[0.2em] uppercase text-xs opacity-70">
              下一場選舉
            </span>
            <span className="font-serif text-base sm:text-lg font-bold">
              {nextDate.slice(0, 10)}
            </span>
            <span className="opacity-90">{nextTypes.slice(0, 4).join("、")}</span>
            <span className="ml-auto font-serif font-bold">
              {daysToNext > 0 ? `倒數 ${daysToNext} 天` : "今天投票！"} →
            </span>
          </div>
        </Link>
      )}

      {/* ── Hero ── */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-6">
              台灣選舉資訊平台
            </p>
            <h1 className="article-title font-serif text-4xl sm:text-6xl font-bold leading-[1.1] mb-6 text-ink">
              讓選舉資料
              <br />
              成為公民的<span className="text-accent-red">日常知識</span>
            </h1>
            <p className="text-lg sm:text-xl text-ink-soft leading-relaxed mb-8">
              整合中選會選舉公報，提供候選人政見、歷屆當選結果、政黨席次的查詢與比對。
              每一筆政見都標註原始來源，讓你輕鬆查證。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/platforms"
                className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper text-sm font-medium hover:opacity-85 transition"
              >
                查看候選人政見 →
              </Link>
              <Link
                href="/elections"
                className="inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-paper transition"
              >
                歷屆選舉
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 現任執政者政績追蹤 ── */}
      <section className="border-y border-rule bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                INCUMBENTS · 現任執政者
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                政績追蹤
              </h2>
            </div>
            <Link
              href="/government/cabinet"
              className="text-sm underline underline-offset-4 hover:text-accent-red"
            >
              查看完整內閣名單 →
            </Link>
          </div>
          <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
            「政績」= 已完成事項；「承諾」= 競選時提出尚待達成。數字來自 LLM 自動分類。
          </p>

          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-3">
            中央 · 行政與立法
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {INCUMBENTS.map((o) => (
              <IncumbentCard
                key={o.name}
                role={o.role}
                name={o.name}
                since={o.since}
                stats={incumbentStatsByName.get(o.name)}
              />
            ))}
          </div>

          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mb-3">
            六都市長
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAYORS.map((m) => (
              <IncumbentCard
                key={m.name}
                role={m.role}
                name={m.name}
                since={m.since}
                stats={incumbentStatsByName.get(m.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 下次選舉聚焦 ── */}
      {nextDate && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 border-b border-rule">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                NEXT ELECTION · 下次選舉
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                {nextDate.slice(0, 10)}
                <span className="ml-3 text-base text-ink-soft font-normal">
                  {nextTypes.slice(0, 4).join("、")}
                </span>
              </h2>
            </div>
            <div className="text-right">
              <div className="font-serif text-5xl font-bold text-accent-red tabular-nums">
                {daysToNext}
              </div>
              <div className="text-xs text-ink-soft">天</div>
            </div>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed max-w-3xl">
            候選人與政見會在中選會公報公告後陸續上線。可先看
            <Link
              href="/elections"
              className="underline underline-offset-4 hover:text-accent-red mx-1"
            >
              歷屆選舉
            </Link>
            或
            <Link
              href="/government/cabinet"
              className="underline underline-offset-4 hover:text-accent-red mx-1"
            >
              現任政府
            </Link>
            。
          </p>
        </section>
      )}

      {/* ── 平台收錄 三大區塊 ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-8">
          平台收錄
        </h2>
        <div className="grid sm:grid-cols-3 gap-12">
          <FeatureCard
            number="01"
            title="候選人政見"
            desc={`抓取中選會選舉公報原檔（含 PDF 文字、圖檔），標註是否提交、來源連結。已收錄 ${withPlatforms.length} 場選舉、約 1,600 條政見，其中 300+ 條經人工潤稿整理。`}
            href="/platforms"
          />
          <FeatureCard
            number="02"
            title="歷屆當選結果"
            desc={`從 1994 年起的歷屆縣市長、立委、總統選舉結果。目前已收錄 ${mayoralHistory.length} 筆縣市長當選紀錄。`}
            href="/mayors"
          />
          <FeatureCard
            number="03"
            title="趨勢分析"
            desc="總統選舉得票趨勢、立委不分區政黨票歷年變化。看政黨版圖如何演變。"
            href="/trends"
          />
        </div>
      </section>

      {/* ── 政見焦點 ── */}
      {latestPlatformElection && (
        <section className="border-y border-rule bg-rule/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <div className="grid sm:grid-cols-12 gap-8">
              <div className="sm:col-span-5">
                <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
                  政見焦點
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
                  {formatElectionLabelShort(
                    latestPlatformElection.date,
                    latestPlatformElection.name,
                  )}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  共 {total} 位候選人，其中 {covered} 位在公報上提交政見內容
                  （文字 {withText} 位、圖片 {withImage} 位）。
                </p>
                <Link
                  href={`/platforms?election=${latestPlatformElection.election_id}`}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper text-sm hover:opacity-85 transition"
                >
                  查看所有政見 →
                </Link>
              </div>
              <div className="sm:col-span-7 grid grid-cols-2 gap-2">
                <CoverageStat
                  label="候選人總數"
                  value={total}
                  color="text-ink"
                />
                <CoverageStat
                  label="政見涵蓋率"
                  value={`${coverRate}%`}
                  color="text-accent-red"
                />
                <CoverageStat label="文字版" value={withText} color="text-ink" />
                <CoverageStat label="圖片版" value={withImage} color="text-ink" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 最近一屆總統 ── */}
      {latestPres.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
            最近一屆總統選舉
          </p>
          <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-8">
            {latestPresYear} 年 第 {Math.floor(parseInt(latestPresYear!) / 4) - 489}{" "}
            任總統選舉
          </h3>
          <div className="space-y-3">
            {latestPresPairs.map((p, idx) => {
              const pct = (p.votes / latestPresTotal) * 100;
              return (
                <div
                  key={p.candidate_name}
                  className="border-b border-rule pb-3 last:border-0"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 mb-2">
                    {idx === 0 && (
                      <span className="text-accent-red font-bold text-sm">
                        ★ 當選
                      </span>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <PersonLink
                        name={p.candidate_name}
                        color={partyColor(p.party_name)}
                        className="font-serif text-xl font-bold"
                      />
                      {p.running_mate && (
                        <>
                          <span className="text-ink-soft text-sm">／</span>
                          <PersonLink
                            name={p.running_mate}
                            color={partyColor(p.party_name)}
                            className="font-serif text-sm font-medium"
                          />
                        </>
                      )}
                    </div>
                    <span className="text-sm">
                      <PartyLink name={p.party_name} />
                    </span>
                    <span className="ml-auto text-sm tabular-nums">
                      {formatVotes(p.votes)} 票
                      <span className="ml-2 font-bold">{pct.toFixed(2)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-rule h-2">
                    <div
                      className="h-2"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: partyColor(p.party_name),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 最近一屆縣市長 ── */}
      {(() => {
        const latestMayoralYear = mayoralHistory
          .map((m) => m.date.slice(0, 4))
          .sort()
          .pop();
        if (!latestMayoralYear) return null;
        const winners = mayoralHistory.filter((m) =>
          m.date.startsWith(latestMayoralYear),
        );
        const partyTotals = new Map<string, number>();
        for (const w of winners) {
          const party = w.party_name || "無黨籍";
          partyTotals.set(party, (partyTotals.get(party) || 0) + 1);
        }
        const sortedTotals = Array.from(partyTotals.entries()).sort(
          (a, b) => b[1] - a[1],
        );
        return (
          <section className="border-y border-rule bg-rule/20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
              <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
                最近一屆縣市長
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-2">
                {latestMayoralYear} 年九合一選舉
              </h3>
              <p className="text-sm text-ink-soft mb-8">
                {winners.length} 個縣市的勝選政黨分佈
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {sortedTotals.map(([party, count]) => (
                  <div
                    key={party}
                    className="flex items-baseline gap-2 border border-rule px-4 py-2"
                    style={{
                      borderLeftColor: partyColor(party),
                      borderLeftWidth: 4,
                    }}
                  >
                    <PartyLink name={party} />
                    <span className="font-serif text-2xl font-bold tabular-nums">
                      {count}
                    </span>
                    <span className="text-xs text-ink-soft">席</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {sortCounties(winners, (m) => m.district || "")
                  .map((w) => {
                    const color = partyColor(w.party_name);
                    return (
                      <div
                        key={w.district}
                        className="border border-rule px-3 py-2"
                        style={{
                          borderLeftColor: color,
                          borderLeftWidth: 3,
                        }}
                      >
                        <div className="text-xs text-ink-soft">
                          {w.district}
                        </div>
                        <PersonLink
                          name={w.candidate_name}
                          color={color}
                          className="font-medium text-sm truncate inline-block max-w-full"
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="mt-6 text-right">
                <Link
                  href="/government/mayors"
                  className="text-sm underline underline-offset-2 hover:text-accent-red"
                >
                  看歷屆縣市長矩陣 →
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── 倡議標語 ── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="font-serif text-2xl sm:text-3xl leading-relaxed text-ink-soft">
          「希望台灣政治正在往好的路上走。」
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          降低公民參與政治的門檻，是「正至」存在的初衷。
        </p>
      </section>
    </>
  );
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr.slice(0, 10) + "T00:00:00");
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function IncumbentCard({
  role,
  name,
  since,
  stats,
}: {
  role: string;
  name: string;
  since: string;
  stats:
    | {
        party_name: string | null;
        color_hex: string | null;
        photo_path: string | null;
        total: number;
        past: number;
        future: number;
      }
    | undefined;
}) {
  const color = partyColor(stats?.party_name, stats?.color_hex || undefined);
  const total = stats?.total ?? 0;
  const past = stats?.past ?? 0;
  const future = stats?.future ?? 0;
  const other = Math.max(0, total - past - future);
  const photo = candidatePhotoUrl(stats?.photo_path ?? null);
  return (
    <Link
      href={`/people/${encodeURIComponent(name)}`}
      className="border border-rule p-4 hover:bg-rule/20 transition group flex items-start gap-3"
    >
      <div
        className="w-1 self-stretch shrink-0"
        style={{ backgroundColor: color }}
      />
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          className="w-12 h-16 object-cover border shrink-0"
          style={{ borderColor: color }}
        />
      ) : (
        <div
          className="w-12 h-16 flex items-center justify-center border shrink-0 font-serif text-2xl"
          style={{ borderColor: color, color, backgroundColor: `${color}10` }}
        >
          {name.slice(0, 1)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] tracking-[0.2em] text-ink-soft mb-1">
          {role}
        </div>
        <div className="font-serif text-2xl font-bold mb-1 group-hover:text-accent-red transition truncate">
          {name}
        </div>
        <div className="text-xs text-ink-soft mb-2 truncate">
          {stats?.party_name || "—"} · 上任 {daysInOffice(since)} 天
        </div>
        <div className="flex gap-3 text-xs tabular-nums">
          {total === 0 ? (
            <span className="text-ink-soft">— 政見資料整理中</span>
          ) : (
            <>
              <span title="已完成政績">📜 {past}</span>
              <span className="text-accent-red" title="未達成承諾">
                🎯 {future}
              </span>
              {other > 0 && (
                <span className="text-ink-soft" title="未分類">
                  ⋯ {other}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
  number,
  title,
  desc,
  href,
}: {
  number: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-t-2 border-ink pt-6 hover:border-accent-red transition-colors"
    >
      <p className="font-serif text-xs text-ink-soft mb-2">{number}</p>
      <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent-red transition-colors">
        {title}
      </h3>
      <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
    </Link>
  );
}

function CoverageStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-paper p-4">
      <p className="text-xs tracking-widest uppercase text-ink-soft mb-2">
        {label}
      </p>
      <p className={`font-serif text-3xl font-bold tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  );
}
