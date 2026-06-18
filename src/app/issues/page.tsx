import Link from "next/link";
import { getFertilityGap, getIssueOverview } from "@/lib/api";

export const revalidate = 3600;
export const metadata = {
  title: "議題缺口 · 正至",
  description: "用政府公開統計對照政治關注度，找出重要卻被忽視的議題。",
};

export default async function IssuesPage() {
  const [fertility, overview] = await Promise.all([
    getFertilityGap().catch(() => null),
    getIssueOverview().catch(() => null),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <header className="border-b-2 border-ink pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          ISSUE GAPS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          議題缺口分析
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-2xl">
          反過來看：把<strong>政府公開統計（社會嚴重度）</strong>對照
          <strong>政見提及率（政治關注度）</strong>，
          找出「危機正在加劇、政治人物卻較少著墨」的議題。所有數據皆標來源。
        </p>
      </header>

      {/* 14 主題政治關注度排名 */}
      {overview && overview.topics.length > 0 && (() => {
        const maxPct = Math.max(...overview.topics.map((t) => t.pct));
        return (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-1">各議題政治關注度</h2>
            <p className="text-sm text-ink-soft mb-5 leading-relaxed">
              {overview.total_people} 位有政見的候選人中，提及各主題的比例。
              <strong>排在最上面的（提及率低）= 較少政治人物關注</strong>，可能是被忽視的議題。
            </p>
            <div className="space-y-1.5">
              {overview.topics.map((t, i) => {
                const isLow = i < 4;
                return (
                  <Link
                    key={t.name}
                    href={`/topics/${encodeURIComponent(t.name)}`}
                    className="grid grid-cols-[110px_1fr_50px] gap-2 items-center text-sm group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.icon}</span>
                      <span className="group-hover:text-accent-red transition">
                        {t.name}
                      </span>
                    </div>
                    <div className="h-5 bg-rule/40">
                      <div
                        className="h-5"
                        style={{
                          width: `${(t.pct / maxPct) * 100}%`,
                          backgroundColor: isLow ? "var(--color-accent-red,#c0392b)" : "#888",
                          opacity: isLow ? 0.8 : 0.55,
                        }}
                      />
                    </div>
                    <div className="text-right tabular-nums text-ink-soft">
                      {t.pct}%
                    </div>
                  </Link>
                );
              })}
            </div>
            <p className="text-xs text-ink-soft mt-3">
              <span className="inline-block w-3 h-3 align-middle mr-1" style={{ backgroundColor: "#c0392b", opacity: 0.8 }} />
              紅色 = 關注度最低的 4 個議題。資料：中選會公報政見（已 OCR 部分）。
            </p>
          </section>
        );
      })()}

      {fertility && fertility.births.length > 0 && (() => {
        const maxB = Math.max(...fertility.births.map((b) => b.births));
        return (
          <section className="mb-12">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl">👶</span>
              <h2 className="font-serif text-2xl font-bold">少子化</h2>
              <span className="ml-auto text-sm px-2 py-0.5 border border-accent-red text-accent-red">
                嚴重度 高
              </span>
            </div>
            <p className="text-sm text-ink-soft mb-6 leading-relaxed">
              台灣出生數持續探底，是國安級危機。
            </p>

            {/* 嚴重度：出生數趨勢 */}
            <div className="border border-rule p-5 mb-4">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-serif text-lg font-bold">出生數逐年變化</h3>
                <span className="text-sm text-accent-red font-bold">
                  {fertility.drop_pct}% 跌幅
                </span>
              </div>
              <div className="grid grid-cols-[50px_1fr_70px] gap-2 items-center text-sm">
                {fertility.births.map((b) => {
                  const pct = (b.births / maxB) * 100;
                  return (
                    <div key={b.year} className="contents">
                      <div className="font-serif tabular-nums">{b.year}</div>
                      <div className="h-6 bg-rule">
                        <div
                          className="h-6 bg-accent-red/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-right tabular-nums text-ink-soft">
                        {(b.births / 10000).toFixed(1)}萬
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-ink-soft mt-3">
                資料來源：{fertility.severity_source}
              </p>
            </div>

            {/* 政治關注度 */}
            <div className="border border-rule p-5">
              <h3 className="font-serif text-lg font-bold mb-3">政治關注度</h3>
              <div className="flex items-end gap-6 flex-wrap">
                <div>
                  <p className="font-serif text-4xl font-bold tabular-nums">
                    {fertility.attention.pct}%
                  </p>
                  <p className="text-xs text-ink-soft">
                    候選人提及少子化/生育/托育
                    <br />
                    （{fertility.attention.people} / {fertility.attention.total_people} 位）
                  </p>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <div className="h-8 bg-rule flex">
                    <div
                      className="h-8 bg-ink flex items-center justify-end pr-2 text-paper text-xs font-bold"
                      style={{ width: `${fertility.attention.pct}%` }}
                    >
                      {fertility.attention.pct}%
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft mt-1">
                    關鍵字：{fertility.attention_keywords.join("、")}
                  </p>
                </div>
              </div>
            </div>

            {/* 缺口結論 */}
            <div className="mt-4 border-l-4 border-accent-red pl-4 py-2 bg-rule/20">
              <p className="text-sm leading-relaxed">
                <strong>缺口判讀</strong>：出生數 5 年內崩跌 {fertility.drop_pct}%，
                但僅 {fertility.attention.pct}% 候選人在政見中觸及。
                少子化是長期國安危機，相對於其急迫性，政治著墨仍偏少。
              </p>
            </div>
          </section>
        );
      })()}

      <section className="border-t border-rule pt-8">
        <h2 className="font-serif text-xl font-bold mb-3">更多議題（建置中）</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          已找到可抓的政府公開統計：勞動部（失業率/職災）、內政部戶政（高齡化/婚育）。
          將陸續加入「勞工」「高齡化」等議題的嚴重度 vs 關注度對照。
          需要金鑰的環境部（空污）、主計總處（薪資）待開通。
        </p>
        <Link
          href="/topics"
          className="inline-block mt-4 text-sm underline underline-offset-4 hover:text-accent-red"
        >
          先看各主題政見 →
        </Link>
      </section>
    </div>
  );
}
