import Link from "next/link";
import type { FlagshipTarget } from "@/lib/types";
import { partyColor } from "@/lib/format";

/**
 * 兌現追蹤看板
 *
 * 視覺語言借自台灣人最熟的「開票之夜長條」：粗條、政黨色、大字百分比，
 * 加上開票條沒有的「目標刻度線」。
 *
 * variant="home"：首頁緊湊版——未達標畫條、已達標精簡清單、附「查看完整」CTA
 * variant="full"：/tracker 完整版——全部畫條（超標衝線本身就是資訊）
 */

const MAX_PCT = 128;
const TICK_POS = (100 / MAX_PCT) * 100; // ≈ 78.1%

function fmtValue(v: number | null, unit: string | null): string {
  if (v == null) return "—";
  if (unit === "政策開辦") return "已開辦";
  if (unit === "%") return `${v}%`;
  if (unit === "戶" && v >= 10000)
    return `${(v / 10000).toLocaleString("zh-TW", { maximumFractionDigits: 1 })} 萬戶`;
  return `${v.toLocaleString("zh-TW")} ${unit || ""}`.trim();
}

function personHref(t: FlagshipTarget): string {
  return t.person_name === t.party_name
    ? `/parties/${encodeURIComponent(t.person_name)}`
    : `/people/${encodeURIComponent(t.person_name)}`;
}

function BarRow({
  t,
  i,
  compact,
}: {
  t: FlagshipTarget;
  i: number;
  compact: boolean;
}) {
  const color = partyColor(t.party_name ?? t.person_name, t.color_hex);
  const pct = t.progress_pct;
  const width = pct != null ? (Math.min(pct, MAX_PCT) / MAX_PCT) * 100 : 0;
  const met = pct != null && pct >= 100;
  return (
    <div className={compact ? "py-3.5" : "py-5 sm:py-6"}>
      {/* 標題列 */}
      <div className={"flex items-baseline gap-x-3 gap-y-1 flex-wrap " + (compact ? "mb-2" : "mb-3")}>
        <Link
          href={personHref(t)}
          className={
            "font-serif font-bold hover:underline underline-offset-4 shrink-0 " +
            (compact ? "text-base sm:text-lg" : "text-lg sm:text-xl")
          }
          style={{ color }}
        >
          {t.person_name}
        </Link>
        <span className={"font-serif leading-snug " + (compact ? "text-base sm:text-lg" : "text-lg sm:text-xl")}>
          {t.title}
        </span>
        {met && !compact && (
          <span className="text-[10px] px-1.5 py-0.5 bg-accent-red text-paper font-bold tracking-wider shrink-0">
            {pct! > 105 ? "超標" : "達標"}
          </span>
        )}
        <span
          className={
            "ml-auto font-serif font-bold tabular-nums shrink-0 " +
            (compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl") +
            (met ? " text-accent-red" : "")
          }
        >
          {pct != null ? `${pct.toFixed(1)}%` : "—"}
        </span>
      </div>

      {/* 開票條 + 目標刻度線 */}
      <div
        className={"relative bg-rule/40 " + (compact ? "h-3 mb-1.5" : "h-4 mb-2")}
        role="img"
        aria-label={`進度 ${pct ?? "未知"}%，目標 ${fmtValue(t.target_value, t.metric_unit)}`}
      >
        <div
          className="promise-bar-fill absolute inset-y-0 left-0"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            animationDelay: `${i * 80}ms`,
          }}
        />
        <div
          className="absolute inset-y-[-3px] w-[2px] bg-ink"
          style={{ left: `${TICK_POS}%` }}
        />
        {!compact && (
          <span
            className="absolute top-[-4px] translate-y-[-100%] text-[9px] tracking-widest text-ink-soft hidden sm:block"
            style={{ left: `calc(${TICK_POS}% + 5px)` }}
          >
            目標
          </span>
        )}
      </div>

      {/* 數字與來源 */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className="tabular-nums">
          {t.metric_unit === "政策開辦" ? (
            <>已開辦（排富）</>
          ) : (
            <>
              {t.baseline_value != null && (
                <>
                  基準 {fmtValue(t.baseline_value, t.metric_unit)}
                  <span className="mx-1">→</span>
                </>
              )}
              最新{" "}
              <strong className="text-ink">
                {fmtValue(t.latest_value, t.metric_unit)}
              </strong>
              <span className="mx-1">／</span>
              目標 {fmtValue(t.target_value, t.metric_unit)}
              {t.baseline_value != null && !compact && (
                <span className="ml-1 text-ink-soft/70">（進度以基準後新增計）</span>
              )}
            </>
          )}
        </span>
        {t.target_date && (
          <span className="tabular-nums">截止 {t.target_date.slice(0, 4)} 年</span>
        )}
        {t.progress_source_url && (
          <a
            href={t.progress_source_url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-accent-red"
          >
            資料來源 →
          </a>
        )}
      </div>
    </div>
  );
}

export function PromiseTracker({
  items,
  variant = "home",
}: {
  items: FlagshipTarget[];
  variant?: "home" | "full";
}) {
  if (items.length === 0) return null;
  const compact = variant === "home";
  const inProgress = items
    .filter((t) => t.progress_pct == null || t.progress_pct < 100)
    .sort((a, b) => (b.progress_pct ?? -1) - (a.progress_pct ?? -1));
  const met = items
    .filter((t) => t.progress_pct != null && t.progress_pct >= 100)
    .sort((a, b) => b.progress_pct! - a.progress_pct!);

  return (
    <section className={compact ? "border-b border-rule" : ""}>
      <div className={compact ? "mx-auto max-w-6xl px-4 sm:px-6 py-12" : ""}>
        {compact && (
          <>
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
              <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
                Promise Tracker · 兌現追蹤
              </p>
              <p className="text-xs text-ink-soft tabular-nums">
                更新 {items[0]?.recorded_at}
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-2">
              說到，做到了嗎？
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed max-w-2xl mb-8">
              現任者的競選承諾，逐條對照政府公開統計——黑色刻度是目標線。
              每一筆進度都附來源可查證。
            </p>
          </>
        )}

        {/* ── 未達標 ── */}
        {inProgress.length > 0 && (
          <>
            <h3 className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-1">
              進行中 · {inProgress.length} 項
            </h3>
            <div className={"divide-y divide-rule border-y border-rule " + (compact ? "mb-8" : "mb-10")}>
              {inProgress.map((t, i) => (
                <BarRow key={t.target_id} t={t} i={i} compact={compact} />
              ))}
            </div>
          </>
        )}

        {/* ── 已達標 ── */}
        {met.length > 0 && (
          <>
            <h3 className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-1">
              已達標 · {met.length} 項
            </h3>
            {compact ? (
              <div className="grid sm:grid-cols-2 border-y border-rule divide-y divide-rule sm:divide-y-0">
                {met.map((t) => {
                  const color = partyColor(t.party_name ?? t.person_name, t.color_hex);
                  return (
                    <div
                      key={t.target_id}
                      className="flex items-baseline gap-x-2 py-3 sm:pr-8 sm:[&:nth-child(odd)]:border-r sm:border-rule sm:[&:nth-child(n+3)]:border-t"
                    >
                      <span className="text-accent-red font-bold shrink-0">✓</span>
                      <Link
                        href={personHref(t)}
                        className="font-serif font-bold hover:underline underline-offset-4 shrink-0"
                        style={{ color }}
                      >
                        {t.person_name}
                      </Link>
                      <span className="text-sm leading-snug min-w-0">{t.title}</span>
                      <span className="ml-auto font-serif font-bold tabular-nums text-accent-red shrink-0">
                        {t.metric_unit === "政策開辦"
                          ? "已開辦"
                          : `${t.progress_pct!.toFixed(0)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-rule border-y border-rule">
                {met.map((t, i) => (
                  <BarRow key={t.target_id} t={t} i={i + inProgress.length} compact={false} />
                ))}
              </div>
            )}
          </>
        )}

        {compact ? (
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[11px] text-ink-soft leading-relaxed">
              進度為承諾提出後之最新官方統計；超過 100% 表示超標。
            </p>
            <Link
              href="/tracker"
              className="text-sm underline underline-offset-4 hover:text-accent-red font-medium"
            >
              查看完整兌現追蹤 →
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-[11px] text-ink-soft leading-relaxed">
            進度為承諾提出後之最新官方統計，累計基準與任期歸屬詳見各進度紀錄；
            超過 100% 表示超標。
          </p>
        )}
      </div>
    </section>
  );
}
