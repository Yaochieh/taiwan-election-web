import Link from "next/link";
import { getElections, getElectionMilestones } from "@/lib/api";
import type { Election, ElectionMilestone } from "@/lib/types";
import { formatElectionLabelShort } from "@/lib/format";

export const metadata = { title: "歷屆選舉 · 正至" };

const TYPE_ZH: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "presidential", label: "總統" },
  { value: "legislative", label: "立委" },
  { value: "mayoral", label: "縣市長" },
  { value: "council", label: "議員" },
];

export default async function ElectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeFilter =
    FILTERS.find((f) => f.value === params.type)?.value ?? "all";
  const [allElections, milestones] = await Promise.all([
    getElections().catch(() => []),
    getElectionMilestones().catch(() => [] as ElectionMilestone[]),
  ]);
  const elections =
    typeFilter === "all"
      ? allElections
      : allElections.filter((e) => e.type === typeFilter);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = elections.filter((e) => e.date >= today);
  const past = elections.filter((e) => e.date < today);

  // 把同一天的多筆合併成一個選舉日
  const upcomingGroups = groupByDate(upcoming).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const pastGroups = groupByDate(past).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const nextDate = upcomingGroups[0]?.date;
  const daysToNext = nextDate ? daysUntil(nextDate) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          ELECTIONS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          選舉時程
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed">
          1994 年至今 {past.length} 場已舉行選舉，
          {upcoming.length > 0 && (
            <span>
              {" 預計還有 "}
              <strong className="text-ink">{upcoming.length} 場</strong>{" "}
              即將舉行。2026 地方選舉投票日 11 月 28 日為
              <a
                href="https://web.cec.gov.tw/central/article/61722"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-accent-red"
              >
                中選會正式公告
              </a>
              （候選人登記 8/31–9/4）；2028 之後日期為依四年週期推算。
            </span>
          )}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === typeFilter;
            const href = f.value === "all" ? "/elections" : `/elections?type=${f.value}`;
            return (
              <a
                key={f.value}
                href={href}
                className={
                  "text-xs px-3 py-1.5 border transition " +
                  (active
                    ? "bg-ink text-paper border-ink"
                    : "border-rule hover:border-ink text-ink-soft hover:text-ink")
                }
              >
                {f.label}
              </a>
            );
          })}
        </div>
      </header>

      {/* ── 倒數區塊 ── */}
      {nextDate && daysToNext !== null && (
        <section className="border border-ink p-6 sm:p-10 mb-12 flex flex-col sm:flex-row items-baseline justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
              下一場投票日
            </p>
            <p className="font-serif text-3xl sm:text-4xl font-bold leading-none">
              {nextDate}
            </p>
            <p className="text-sm text-ink-soft mt-2">
              {formatChineseDate(nextDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
              倒數
            </p>
            <p className="font-serif text-5xl sm:text-7xl font-bold leading-none text-accent-red">
              {daysToNext > 0 ? daysToNext : 0}
            </p>
            <p className="text-sm text-ink-soft mt-2">
              {daysToNext > 0 ? "天" : "今天投票！"}
            </p>
          </div>
        </section>
      )}

      {/* ── 選舉日曆：中選會時程 ── */}
      {nextDate && milestones.length > 0 && milestones[0].vote_date === nextDate && (
        <MilestoneTimeline milestones={milestones} today={today} />
      )}

      {/* ── 即將舉行 ── */}
      {upcomingGroups.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6 flex items-baseline gap-3">
            即將舉行
            <span className="text-sm font-normal text-ink-soft">
              {upcoming.length} 場
            </span>
          </h2>
          <div className="border-t-2 border-ink">
            {upcomingGroups.map((g) => (
              <ElectionDayRow key={g.date} group={g} upcoming />
            ))}
          </div>
        </section>
      )}

      {/* ── 歷史 ── */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-6 flex items-baseline gap-3">
          歷年選舉
          <span className="text-sm font-normal text-ink-soft">
            {past.length} 場
          </span>
        </h2>
        <div className="border-t-2 border-ink">
          {pastGroups.map((g) => (
            <ElectionDayRow key={g.date} group={g} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MilestoneTimeline({
  milestones,
  today,
}: {
  milestones: ElectionMilestone[];
  today: string;
}) {
  // 事件狀態：已完成（結束日過了）/ 進行中（起訖之間）/ 未來
  const stateOf = (m: ElectionMilestone) => {
    const end = m.date_end ?? m.date;
    if (end < today) return "done";
    if (m.date <= today) return "active";
    return "future";
  };
  const nextIdx = milestones.findIndex((m) => stateOf(m) !== "done");
  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <h2 className="font-serif text-2xl font-bold">
          選舉日曆
          <span className="ml-3 text-sm font-normal text-ink-soft">
            {milestones[0].vote_date.slice(0, 4)} 地方選舉選務時程
          </span>
        </h2>
        <a
          href={milestones[0].source_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ink-soft underline underline-offset-2 hover:text-accent-red"
        >
          資料來源：中選會工作進行程序表 →
        </a>
      </div>
      <ol className="border-l-2 border-rule ml-2">
        {milestones.map((m, i) => {
          const st = stateOf(m);
          const isNext = i === nextIdx;
          return (
            <li key={`${m.date}-${m.label}`} className="relative pl-6 pb-5 last:pb-0">
              <span
                className={
                  "absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 " +
                  (st === "done"
                    ? "bg-rule border-rule"
                    : st === "active" || isNext
                      ? "bg-accent-red border-accent-red"
                      : "bg-paper border-ink")
                }
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className={
                    "tabular-nums text-sm " +
                    (st === "done" ? "text-ink-soft" : "font-bold")
                  }
                >
                  {m.date.slice(5).replace("-", "/")}
                  {m.date_end && `–${m.date_end.slice(5).replace("-", "/")}`}
                </span>
                <span className={st === "done" ? "text-ink-soft line-through decoration-rule" : ""}>
                  {m.label}
                </span>
                {st === "done" && <span className="text-xs text-ink-soft">✓</span>}
                {st === "active" && (
                  <span className="text-xs px-1.5 py-0.5 border border-accent-red text-accent-red">
                    進行中
                  </span>
                )}
                {isNext && st === "future" && (
                  <span className="text-xs px-1.5 py-0.5 bg-ink text-paper">下一步</span>
                )}
                {m.note && <span className="text-xs text-ink-soft">{m.note}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ElectionDayRow({
  group,
  upcoming,
}: {
  group: ElectionGroup;
  upcoming?: boolean;
}) {
  return (
    <article className="py-5 border-b border-rule">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-3">
        <div className="font-serif text-xl tabular-nums">{group.date}</div>
        {upcoming && (
          <span className="inline-block text-xs px-2 py-0.5 border border-accent-red text-accent-red">
            即將舉行
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {group.elections.map((e) => (
          <Link
            key={`${e.election_id}-${e.description || ""}`}
            href={`/elections/${e.election_id}`}
            className="group inline-flex items-baseline gap-2 px-3 py-1.5 border border-rule hover:border-ink hover:bg-ink hover:text-paper text-sm transition"
          >
            <span className="text-xs text-ink-soft group-hover:text-paper/80 tracking-widest">
              {TYPE_ZH[e.type] || e.type}
            </span>
            <span>
              {formatElectionLabelShort(e.date, e.name)}
              {e.description && (
                <span className="ml-1 text-xs opacity-80">
                  · {e.description}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

type ElectionGroup = { date: string; elections: Election[] };

function groupByDate(elections: Election[]): ElectionGroup[] {
  const map = new Map<string, Election[]>();
  for (const e of elections) {
    const day = e.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(e);
  }
  return Array.from(map.entries()).map(([date, list]) => ({
    date,
    elections: list,
  }));
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatChineseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const wk = weekdays[d.getDay()];
  return `星期${wk}`;
}
