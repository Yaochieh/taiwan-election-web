import Link from "next/link";
import type { FlagshipTarget } from "@/lib/types";
import { partyColor } from "@/lib/format";

/**
 * 兌現追蹤看板（首頁招牌）
 *
 * 視覺語言借自台灣人最熟的「開票之夜長條」：粗條、政黨色、大字百分比。
 * 多了一個開票條沒有的裝置——「目標刻度線」。條衝過線 = 超標，
 * 一眼看懂「承諾 vs 實績」。每條附官方來源。
 */

// track 全長對應 0% → MAX_PCT，目標線固定落在 100/MAX_PCT 處
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

export function PromiseTracker({ items }: { items: FlagshipTarget[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
            Promise Tracker · 兌現追蹤
          </p>
          <p className="text-xs text-ink-soft tabular-nums">
            更新 {items[0]?.recorded_at}
          </p>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mb-3">
          說到，做到了嗎？
        </h2>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-2xl mb-10">
          現任者的競選承諾，逐條對照政府公開統計——黑色刻度是目標線，
          條衝過線代表做到。每一筆進度都附來源可查證。
        </p>

        <div className="divide-y divide-rule border-y border-rule">
          {items.map((t, i) => {
            const color = partyColor(t.party_name ?? t.person_name, t.color_hex);
            const pct = t.progress_pct;
            const isPolicy = t.metric_unit === "政策開辦";
            const width =
              pct != null ? (Math.min(pct, MAX_PCT) / MAX_PCT) * 100 : 0;
            const met = pct != null && pct >= 100;
            return (
              <div key={t.target_id} className="py-5 sm:py-6">
                {/* 標題列 */}
                <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap mb-3">
                  <Link
                    href={
                      // person_name 是政黨（如「民主進步黨」執政承諾）時連政黨頁
                      t.person_name === t.party_name
                        ? `/parties/${encodeURIComponent(t.person_name)}`
                        : `/people/${encodeURIComponent(t.person_name)}`
                    }
                    className="font-serif text-lg sm:text-xl font-bold hover:underline underline-offset-4 shrink-0"
                    style={{ color }}
                  >
                    {t.person_name}
                  </Link>
                  <span className="font-serif text-lg sm:text-xl leading-snug">
                    {t.title}
                  </span>
                  {met && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent-red text-paper font-bold tracking-wider shrink-0">
                      {pct! > 105 ? "超標" : "達標"}
                    </span>
                  )}
                  <span
                    className={
                      "ml-auto font-serif text-2xl sm:text-3xl font-bold tabular-nums shrink-0" +
                      (met ? " text-accent-red" : "")
                    }
                  >
                    {pct != null ? `${pct.toFixed(1)}%` : "—"}
                  </span>
                </div>

                {/* 開票條 + 目標刻度線 */}
                <div className="relative h-4 bg-rule/40 mb-2" role="img"
                     aria-label={`進度 ${pct ?? "未知"}%，目標 ${fmtValue(t.target_value, t.metric_unit)}`}>
                  <div
                    className="promise-bar-fill absolute inset-y-0 left-0"
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                  {/* 目標線 */}
                  <div
                    className="absolute inset-y-[-4px] w-[2px] bg-ink"
                    style={{ left: `${TICK_POS}%` }}
                  />
                  <span
                    className="absolute top-[-4px] translate-y-[-100%] text-[9px] tracking-widest text-ink-soft hidden sm:block"
                    style={{ left: `calc(${TICK_POS}% + 5px)` }}
                  >
                    目標
                  </span>
                </div>

                {/* 數字與來源 */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-ink-soft">
                  <span className="tabular-nums">
                    {isPolicy ? (
                      <>已開辦（排富）</>
                    ) : (
                      <>
                        {t.baseline_value != null && (
                          <>
                            基準 {fmtValue(t.baseline_value, t.metric_unit)}
                            <span className="mx-1">→</span>
                          </>
                        )}
                        最新 <strong className="text-ink">{fmtValue(t.latest_value, t.metric_unit)}</strong>
                        <span className="mx-1">／</span>
                        目標 {fmtValue(t.target_value, t.metric_unit)}
                        {t.baseline_value != null && (
                          <span className="ml-1 text-ink-soft/70">（進度以基準後新增計）</span>
                        )}
                      </>
                    )}
                  </span>
                  {t.target_date && (
                    <span className="tabular-nums">
                      截止 {t.target_date.slice(0, 4)} 年
                    </span>
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
          })}
        </div>

        <p className="mt-4 text-[11px] text-ink-soft leading-relaxed">
          進度為承諾提出後之最新官方統計，累計基準與任期歸屬詳見各進度紀錄；
          超過 100% 表示超標。到
          <Link
            href="/people"
            className="underline underline-offset-2 hover:text-accent-red mx-1"
          >
            政治人物頁
          </Link>
          看完整政見追蹤。
        </p>
      </div>
    </section>
  );
}
