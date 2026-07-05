import Link from "next/link";
import { getFlagshipTargets, getQuantStats } from "@/lib/api";
import { PromiseTracker } from "@/components/promise-tracker";

export const revalidate = 300;

export const metadata = {
  title: "兌現追蹤 · 正至",
  description:
    "現任者競選承諾逐條對照政府公開統計：社會住宅、國防預算、托育、能源……每一筆進度都附官方來源。",
};

export default async function TrackerPage() {
  const [items, stats] = await Promise.all([
    getFlagshipTargets().catch(() => []),
    getQuantStats().catch(() => null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
            Promise Tracker · 兌現追蹤
          </p>
          {items[0] && (
            <p className="text-xs text-ink-soft tabular-nums">
              更新 {items[0].recorded_at} · 每日自動對照
            </p>
          )}
        </div>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4">
          說到，做到了嗎？
        </h1>
        <p className="text-ink-soft max-w-3xl leading-relaxed">
          把現任者的競選承諾逐條對照政府公開統計。黑色刻度是目標線，
          條衝過線代表做到；有設「基準」者，進度以<strong>上任後新增</strong>計算，
          避免把前任的成績算到現任頭上。每一筆進度都附來源，歡迎自行查證。
        </p>
      </header>

      <PromiseTracker items={items} variant="full" />

      {/* ── 政治人物達標率（已定案者）── */}
      {(() => {
        const by = new Map<string, { achieved: number; failed: number; running: number }>();
        for (const t of items) {
          const s = by.get(t.person_name) || { achieved: 0, failed: 0, running: 0 };
          if (t.status === "achieved") s.achieved += 1;
          else if (t.status === "failed") s.failed += 1;
          else s.running += 1;
          by.set(t.person_name, s);
        }
        const rows = Array.from(by.entries()).sort(
          (a, b) => b[1].achieved + b[1].failed + b[1].running - (a[1].achieved + a[1].failed + a[1].running),
        );
        if (rows.length === 0) return null;
        return (
          <section className="mt-14 border-t-2 border-ink pt-8">
            <h2 className="font-serif text-2xl font-bold mb-2">政見達標率</h2>
            <p className="text-sm text-ink-soft mb-5 max-w-3xl leading-relaxed">
              只以<strong>已定案</strong>的承諾計算（達標或任期結束未兌現）；
              進行中的不計入——任期未到，不能提前判他失敗。
            </p>
            <table className="w-full max-w-3xl text-sm">
              <thead>
                <tr className="border-b border-ink text-left text-xs text-ink-soft">
                  <th className="py-2 font-normal">政治人物</th>
                  <th className="py-2 font-normal text-right">達標</th>
                  <th className="py-2 font-normal text-right">未兌現(結案)</th>
                  <th className="py-2 font-normal text-right">進行中</th>
                  <th className="py-2 font-normal text-right">達標率</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map(([name, s]) => {
                  const closedN = s.achieved + s.failed;
                  return (
                    <tr key={name} className="border-b border-rule">
                      <td className="py-2">
                        <Link
                          href={`/people/${encodeURIComponent(name)}`}
                          className="hover:underline underline-offset-4 hover:text-accent-red"
                        >
                          {name}
                        </Link>
                      </td>
                      <td className="py-2 text-right">{s.achieved}</td>
                      <td className="py-2 text-right">{s.failed || "—"}</td>
                      <td className="py-2 text-right text-ink-soft">{s.running || "—"}</td>
                      <td className="py-2 text-right font-bold">
                        {closedN > 0 ? (
                          <span className={s.failed > 0 && s.achieved === 0 ? "text-ink" : "text-accent-red"}>
                            {Math.round((s.achieved / closedN) * 100)}%
                          </span>
                        ) : (
                          <span className="text-ink-soft font-normal">尚無定案</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[10px] text-ink-soft">
              樣本為本站人工查證的旗艦承諾，非該人全部政見；樣本數少時達標率僅供參考。
            </p>
          </section>
        );
      })()}

      {/* ── 量化統計 ── */}
      {stats && (
        <section className="mt-14 border-t-2 border-ink pt-8">
          <h2 className="font-serif text-2xl font-bold mb-2">
            全站量化統計
          </h2>
          <p className="text-sm text-ink-soft mb-6 max-w-3xl leading-relaxed">
            從 {stats.funnel.items.toLocaleString("zh-TW")} 條政見到{" "}
            {stats.funnel.met} 條已驗證達標——這個漏斗顯示「可問責化」還有多遠。
          </p>

          {/* 漏斗 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-rule border border-rule mb-10">
            {[
              { label: "政見條目", value: stats.funnel.items, note: "公報政見拆條" },
              { label: "量化承諾", value: stats.funnel.targets, note: "有數字可檢驗" },
              { label: "當選者承諾", value: stats.funnel.elected_targets, note: "有權力執行" },
              { label: "已對照進度", value: stats.funnel.with_progress, note: "接上公開統計" },
              { label: "已達標", value: stats.funnel.met, note: "衝過目標線" },
            ].map((s, i) => (
              <div key={s.label} className="bg-paper p-4 sm:p-5">
                <p className="text-[10px] tracking-widest uppercase text-ink-soft mb-1.5">
                  {i + 1}·{s.label}
                </p>
                <p className={"font-serif text-2xl sm:text-3xl font-bold tabular-nums " + (i === 4 ? "text-accent-red" : "")}>
                  {s.value.toLocaleString("zh-TW")}
                </p>
                <p className="text-[10px] text-ink-soft mt-1">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* 政黨量化比例 */}
            <div>
              <h3 className="font-serif text-lg font-bold mb-3">
                各政黨政見量化比例
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink text-left text-xs text-ink-soft">
                    <th className="py-2 font-normal">政黨</th>
                    <th className="py-2 font-normal text-right">政見數</th>
                    <th className="py-2 font-normal text-right">條目</th>
                    <th className="py-2 font-normal text-right">量化承諾</th>
                    <th className="py-2 font-normal text-right">含量化比例</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {stats.parties.slice(0, 8).map((p) => (
                    <tr key={p.party} className="border-b border-rule">
                      <td className="py-2">{p.party}</td>
                      <td className="py-2 text-right">{p.platforms}</td>
                      <td className="py-2 text-right">{p.items.toLocaleString("zh-TW")}</td>
                      <td className="py-2 text-right">{p.targets}</td>
                      <td className="py-2 text-right font-bold">{p.quantified_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[10px] text-ink-soft">
                含量化比例 = 至少含一條量化承諾的政見 ÷ 該黨政見總數。
              </p>
            </div>

            {/* 歷年 */}
            <div>
              <h3 className="font-serif text-lg font-bold mb-3">歷年收錄與量化</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink text-left text-xs text-ink-soft">
                    <th className="py-2 font-normal">年份</th>
                    <th className="py-2 font-normal text-right">政見數</th>
                    <th className="py-2 font-normal text-right">條目</th>
                    <th className="py-2 font-normal text-right">量化承諾</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {stats.years.map((y) => (
                    <tr key={y.year} className="border-b border-rule">
                      <td className="py-2">{y.year}</td>
                      <td className="py-2 text-right">{y.platforms}</td>
                      <td className="py-2 text-right">{y.items.toLocaleString("zh-TW")}</td>
                      <td className="py-2 text-right">
                        {y.targets === 0 ? (
                          <span className="text-ink-soft" title="該年份尚未跑量化抽取">
                            尚未抽取
                          </span>
                        ) : (
                          y.targets
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[10px] text-ink-soft">
                「尚未抽取」= 該年份政見已收錄、量化抽取管線尚未涵蓋。
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 方法說明 ── */}
      <section className="mt-14 border-t-2 border-ink pt-8">
        <h2 className="font-serif text-2xl font-bold mb-4">我們怎麼追蹤</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h3 className="font-bold text-ink mb-2">1 · 承諾來源</h3>
            承諾全數取自中選會選舉公報的候選人政見原文，逐條人工挑選
            「有明確數字或可檢驗事實」者，附政見原文與公報連結。
          </div>
          <div>
            <h3 className="font-bold text-ink mb-2">2 · 進度對照</h3>
            進度值來自政府公開統計（內政部、能源署、市府公告、開放資料
            API 等），每筆記錄都附來源連結；可程式化的來源每日自動抓取。
          </div>
          <div>
            <h3 className="font-bold text-ink mb-2">3 · 歸屬與基準</h3>
            延續性政策（如社會住宅為 2016 年起累計）設「基準值」＝上任時水位，
            進度以任內新增計；無法歸屬者於進度紀錄中明確註記。
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          想看單一政治人物的完整政見與追蹤，到
          <Link
            href="/people"
            className="underline underline-offset-4 hover:text-accent-red mx-1"
          >
            政治人物頁
          </Link>
          ；立委的「政見 × 立院提案」對照在各立委個人頁。
        </p>
      </section>
    </div>
  );
}
