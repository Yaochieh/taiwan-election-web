import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicPlatforms, getTopicStats, getTopics, getTopicAutoTargets } from "@/lib/api";
import { partyColor, formatElectionLabelShort } from "@/lib/format";
import { PersonLink, PartyLink } from "@/components/entity-links";

export const revalidate = 300;

const TYPE_LABEL: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{
    election_type?: string;
    party?: string;
    person?: string;
  }>;
}) {
  const { name: encoded } = await params;
  const name = decodeURIComponent(encoded);
  const q = await searchParams;

  const [stats, platforms, allTopics, autoTargets] = await Promise.all([
    getTopicStats(name).catch(() => null),
    getTopicPlatforms(name, {
      election_type: q.election_type,
      party: q.party,
      person: q.person,
    }).catch(() => []),
    getTopics().catch(() => []),
    getTopicAutoTargets(name).catch(() => []),
  ]);
  if (!stats) notFound();

  const topicMeta = allTopics.find((t) => t.name === name);
  const icon = topicMeta?.icon || "📌";

  const maxYearN = Math.max(...stats.by_year.map((y) => y.n), 1);

  const buildHref = (override: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { ...q, ...override };
    for (const [k, v] of Object.entries(merged)) {
      if (v) u.set(k, v);
    }
    const qs = u.toString();
    // 點人物/政黨/類型篩選後，自動定位到「政見原文」section
    const hasFilter = merged.person || merged.party || merged.election_type;
    const hash = hasFilter ? "#platforms" : "";
    return `/topics/${encodeURIComponent(name)}${qs ? "?" + qs : ""}${hash}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b-2 border-ink pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/topics" className="hover:text-ink">
            ← 政見主題
          </Link>
        </div>
        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-5xl sm:text-6xl">{icon}</span>
          <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
            {name}
          </h1>
          <span className="text-sm text-ink-soft">
            {topicMeta?.platform_count.toLocaleString()} 條
          </span>
        </div>
      </header>

      {/* 年度趨勢 */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-3">年度提及次數</h2>
        <p className="text-sm text-ink-soft mb-4">
          每屆選舉中被提到 {name} 議題的政見條數。
        </p>
        <div className="grid grid-cols-[80px_1fr_60px] gap-x-3 gap-y-2 items-center text-sm">
          {stats.by_year.map((y) => {
            const pct = (y.n / maxYearN) * 100;
            return (
              <div key={y.year} className="contents">
                <div className="font-serif text-lg tabular-nums">{y.year}</div>
                <div className="h-6 bg-rule">
                  <div
                    className="h-6 bg-ink"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-sm tabular-nums">{y.n}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 篩選 + 各黨次數 */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold mb-3">各黨次數</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {stats.by_party.slice(0, 12).map((p) => {
            const color = partyColor(p.party, p.color_hex);
            const active = q.party === p.party;
            return (
              <Link
                key={p.party}
                href={buildHref({ party: active ? undefined : p.party })}
                className={
                  "text-sm px-3 py-1.5 border transition flex items-baseline gap-2 " +
                  (active ? "text-paper" : "hover:opacity-80")
                }
                style={{
                  borderColor: color,
                  backgroundColor: active ? color : "transparent",
                  color: active ? "#fff" : color,
                }}
              >
                <span>{p.party}</span>
                <span className="text-xs opacity-75">{p.n}</span>
              </Link>
            );
          })}
        </div>

        {/* 類型篩選 */}
        <div className="flex flex-wrap gap-2 text-xs text-ink-soft pt-3 border-t border-rule">
          <span>選舉類型：</span>
          {[
            { v: "", l: "全部" },
            { v: "presidential", l: "總統" },
            { v: "legislative", l: "立委" },
            { v: "mayoral", l: "縣市長" },
            { v: "council", l: "議員" },
          ].map((t) => {
            const active = (q.election_type || "") === t.v;
            return (
              <Link
                key={t.v}
                href={buildHref({ election_type: t.v || undefined })}
                className={
                  "px-2.5 py-1 border transition " +
                  (active
                    ? "bg-ink text-paper border-ink"
                    : "border-rule hover:border-ink hover:text-ink")
                }
              >
                {t.l}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 最常提此主題的政治人物 */}
      {stats.by_person.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-3">最常提及者 Top 10</h2>
          <p className="text-sm text-ink-soft mb-4">
            按「在多少場選舉中提到此議題」+「關鍵字密度」排序。
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {stats.by_person.slice(0, 10).map((p) => {
              const color = partyColor(p.party, p.color_hex);
              return (
                <Link
                  key={p.name}
                  href={buildHref({
                    person: q.person === p.name ? undefined : p.name,
                  })}
                  className={
                    "border p-3 transition flex items-baseline gap-3 " +
                    (q.person === p.name
                      ? "border-ink bg-rule/20"
                      : "border-rule hover:border-ink")
                  }
                  style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                >
                  <PersonLink
                    name={p.name}
                    color={color}
                    className="font-medium"
                  />
                  <span className="text-xs text-ink-soft">
                    <PartyLink name={p.party} />
                  </span>
                  <span className="ml-auto text-xs">
                    <span className="text-ink">{p.times} 場</span>
                    <span className="text-ink-soft ml-1.5">
                      · 強度 {p.total_score}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 政府開放資料來源 */}
      {stats.data_sources && stats.data_sources.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-3">
            想追蹤達標？
            <span className="ml-3 text-sm text-ink-soft font-normal">
              {stats.data_sources.length} 個政府公開資料來源
            </span>
          </h2>
          <p className="text-sm text-ink-soft mb-4 leading-relaxed">
            這些是與 {name} 相關的政府公開資料 / 統計平台。可以前往對照各承諾是否達標。
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {stats.data_sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener"
                className="border border-rule p-3 hover:border-ink hover:bg-rule/30 transition block"
              >
                <div className="font-medium text-sm mb-0.5">{s.label}</div>
                {s.notes && (
                  <div className="text-xs text-ink-soft leading-relaxed">
                    {s.notes}
                  </div>
                )}
                <div className="text-[10px] text-ink-soft mt-1 truncate">
                  {s.url} →
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 量化承諾時間軸 */}
      {autoTargets.length > 0 && (() => {
        type AT = (typeof autoTargets)[number];
        const byYear = new Map<string, AT[]>();
        for (const t of autoTargets) {
          const y = (t.election_date || "").slice(0, 4) || "未知";
          if (!byYear.has(y)) byYear.set(y, []);
          byYear.get(y)!.push(t);
        }
        const years = Array.from(byYear.keys()).sort();
        const totalPlats = stats.by_year.reduce((a, b) => a + b.n, 0);
        const qRate = totalPlats > 0
          ? ((autoTargets.length / totalPlats) * 100).toFixed(1)
          : "0";
        return (
          <section id="targets" className="mb-12 scroll-mt-4">
            <h2 className="font-serif text-2xl font-bold mb-3">
              量化承諾時間軸
              <span className="ml-3 text-sm text-ink-soft font-normal">
                {autoTargets.length} 個 · 占政見 {qRate}%
              </span>
            </h2>
            <p className="text-sm text-ink-soft mb-4 leading-relaxed">
              自動從政見原文抽取的數字承諾（如「4 年內 5 萬戶社宅」）。
              注意：{name}主題中只有 {qRate}% 的政見有具體數字目標，
              其餘多為原則性主張。
            </p>
            {/* 年度堆疊 bar chart */}
            <div className="grid grid-cols-[60px_1fr_60px] gap-3 items-center text-sm mb-6">
              {years.map((y) => {
                const yearTargets = byYear.get(y) || [];
                const maxN = Math.max(...years.map((yr) => (byYear.get(yr) || []).length), 1);
                const pct = (yearTargets.length / maxN) * 100;
                return (
                  <div key={y} className="contents">
                    <div className="font-serif text-lg tabular-nums">{y}</div>
                    <div className="h-6 bg-rule">
                      <div className="h-6 bg-accent-red/70" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-sm tabular-nums">{yearTargets.length} 個</div>
                  </div>
                );
              })}
            </div>
            {/* 同單位最大承諾 by 年 */}
            {(() => {
              // 找最多人使用的 unit
              const unitCounts = new Map<string, number>();
              for (const t of autoTargets) {
                const u = t.metric_unit || "";
                if (!u) continue;
                unitCounts.set(u, (unitCounts.get(u) || 0) + 1);
              }
              const topUnit = Array.from(unitCounts.entries())
                .sort((a, b) => b[1] - a[1])[0]?.[0];
              if (!topUnit || (unitCounts.get(topUnit) || 0) < 3) return null;
              const maxByYear = new Map<string, { v: number; person: string }>();
              for (const t of autoTargets) {
                if (t.metric_unit !== topUnit) continue;
                const y = (t.election_date || "").slice(0, 4);
                if (!y) continue;
                const cur = maxByYear.get(y);
                const v = t.target_value || 0;
                if (!cur || v > cur.v) {
                  maxByYear.set(y, { v, person: t.person_name });
                }
              }
              const yrs = Array.from(maxByYear.keys()).sort();
              if (yrs.length < 2) return null;
              const maxVal = Math.max(...yrs.map((y) => maxByYear.get(y)!.v));
              return (
                <div className="border-t border-rule pt-4 mt-4 mb-4">
                  <p className="text-xs text-ink-soft mb-3">
                    歷年承諾最大值（單位：<strong>{topUnit}</strong>），
                    每年取該年最高承諾、附提出者：
                  </p>
                  <div className="grid grid-cols-[60px_1fr_120px] gap-3 items-center text-sm">
                    {yrs.map((y) => {
                      const entry = maxByYear.get(y)!;
                      const pct = (entry.v / maxVal) * 100;
                      const display = entry.v >= 10000
                        ? `${(entry.v / 10000).toFixed(1)} 萬`
                        : entry.v.toLocaleString();
                      return (
                        <div key={y} className="contents">
                          <div className="font-serif text-lg tabular-nums">{y}</div>
                          <div className="h-6 bg-rule">
                            <div className="h-6 bg-ink" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs tabular-nums">
                            <strong>{display}</strong>
                            <span className="text-ink-soft ml-1">({entry.person})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            <p className="text-xs text-ink-soft mb-3">完整列表：</p>
          <div className="space-y-2">
            {autoTargets.slice(0, 30).map((t) => {
              const color = partyColor(t.party_name, t.color_hex);
              return (
                <div
                  key={t.target_id}
                  className="border border-rule p-3 text-sm"
                  style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <PersonLink
                        name={t.person_name}
                        color={color}
                        className="font-medium"
                      />
                      <span className="text-xs text-ink-soft">
                        {t.party_name || "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-xl font-bold tabular-nums">
                        {t.target_value >= 10000
                          ? `${(t.target_value / 10000).toFixed(1)} 萬`
                          : t.target_value.toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-ink-soft">
                        {t.metric_unit}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    「{t.description.length > 150
                      ? t.description.slice(0, 150) + "…"
                      : t.description}」
                  </p>
                  {t.election_date && (
                    <p className="text-[10px] text-ink-soft mt-1">
                      出處：{t.election_date.slice(0, 7)}{" "}
                      {t.election_name?.slice(0, 20)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        );
      })()}

      {/* 政見內容 */}
      <section id="platforms" className="mb-12 scroll-mt-4">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-serif text-2xl font-bold">
            政見原文
            {q.person && (
              <span className="ml-2 text-base text-accent-red">
                · {q.person}
              </span>
            )}
          </h2>
          <span className="text-sm text-ink-soft">
            {platforms.length} 條
            {(q.election_type || q.party || q.person) && (
              <Link
                href={`/topics/${encodeURIComponent(name)}`}
                className="ml-3 underline underline-offset-2 hover:text-accent-red"
              >
                清除篩選
              </Link>
            )}
          </span>
        </div>
        <ul className="space-y-5">
          {platforms.slice(0, 50).map((p) => {
            const color = partyColor(p.party_name, p.color_hex);
            return (
              <li
                key={p.platform_id}
                className="border-l-2 pl-4 py-1"
                style={{ borderColor: color }}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2 text-sm">
                  <PersonLink
                    name={p.candidate_name}
                    color={color}
                    className="font-medium"
                  />
                  <PartyLink name={p.party_name} />
                  {p.district && (
                    <span className="text-ink-soft text-xs">{p.district}</span>
                  )}
                  <Link
                    href={`/elections/${p.election_id}`}
                    className="ml-auto text-xs text-ink-soft hover:text-accent-red underline underline-offset-2"
                  >
                    {formatElectionLabelShort(p.election_date, p.election_name)}
                    {p.election_desc && (
                      <span className="ml-1 opacity-70">
                        ({p.election_desc})
                      </span>
                    )}
                  </Link>
                </div>
                <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
                  {highlightNumbers(
                    p.content.length > 500
                      ? p.content.slice(0, 500) + "…"
                      : p.content,
                  )}
                </p>
              </li>
            );
          })}
        </ul>
        {platforms.length > 50 && (
          <p className="text-xs text-ink-soft mt-4">
            僅顯示前 50 條，請用上方篩選縮小範圍。
          </p>
        )}
      </section>

      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-10 leading-relaxed">
        本頁政見由 OCR + 關鍵字自動標註，可能有遺漏或誤標。
        想看可量化追蹤的具體承諾請看
        <Link
          href="/people"
          className="ml-1 underline underline-offset-2 hover:text-accent-red"
        >
          個人頁的「政見追蹤」區塊
        </Link>
        。
      </p>
    </div>
  );
}

// 反白政見內文中的數字 + 單位 (戶/萬/億/%/年/天/小時/元/座/班/條/公里 等)
function highlightNumbers(text: string): React.ReactNode[] {
  if (!text) return [];
  const RE = /(\d[\d,\.]*\s?(?:萬戶|戶|萬|億|千|%|元|年內|年|個月|月|天|小時|席|位|座|班|條|公里|公頃|班次|％))/g;
  const parts = text.split(RE);
  return parts.map((p, i) => {
    if (i % 2 === 1) {
      return (
        <mark
          key={i}
          className="bg-accent-red/15 text-accent-red font-bold tabular-nums px-0.5"
        >
          {p}
        </mark>
      );
    }
    return p;
  });
}
