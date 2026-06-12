import Link from "next/link";
import {
  getElections,
  getElectionsWithPlatforms,
  getMayoralHistory,
} from "@/lib/api";

const TYPE_ZH: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

export default async function HomePage() {
  // 平行抓取（容錯 fallback）
  const [withPlatforms, mayoralHistory, allElections] = await Promise.all([
    getElectionsWithPlatforms().catch(() => []),
    getMayoralHistory().catch(() => []),
    getElections().catch(() => []),
  ]);

  const latestPlatformElection = withPlatforms[0];

  // 找下一場選舉
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
            <span className="opacity-90">
              {nextTypes.slice(0, 4).join("、")}
            </span>
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
                選舉時程
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 三大區塊 ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-8">
          平台收錄
        </h2>
        <div className="grid sm:grid-cols-3 gap-12">
          <FeatureCard
            number="01"
            title="候選人政見"
            desc={`抓取中選會選舉公報原檔（含 PDF 文字、圖檔），標註是否提交、來源連結。已收錄 ${withPlatforms.length} 場選舉的政見資料。`}
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

      {/* ── 最近選舉橫幅 ── */}
      {latestPlatformElection && (
        <section className="border-y border-rule">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
                  最新政見資料
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                  {latestPlatformElection.date.slice(0, 4)}
                  {latestPlatformElection.name}
                </h3>
              </div>
              <Link
                href="/platforms"
                className="text-sm underline underline-offset-4 hover:text-accent-red transition shrink-0"
              >
                查看候選人政見 →
              </Link>
            </div>
          </div>
        </section>
      )}

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
