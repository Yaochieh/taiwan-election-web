import Link from "next/link";
import { getTopics } from "@/lib/api";

export const revalidate = 300;
export const metadata = {
  title: "政見主題 · 正至",
  description: "依主題瀏覽歷屆候選人政見 — 住宅、長照、教育、交通…等",
};

export default async function TopicsPage() {
  const topics = await getTopics().catch(() => []);
  const total = topics.reduce((a, b) => a + b.platform_count, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b-2 border-ink pb-10 mb-12">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TOPICS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          政見主題
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-2xl">
          按主題瀏覽政見：同一議題被誰提過、提幾次、哪一年、有沒有達標。
          目前共 {topics.length} 個主題、累計 {total.toLocaleString()} 個政見標籤。
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics
          .slice()
          .sort((a, b) => b.platform_count - a.platform_count)
          .map((t) => {
            const maxCount = Math.max(...topics.map((x) => x.platform_count), 1);
            const bar = (t.platform_count / maxCount) * 100;
            return (
              <Link
                key={t.topic_id}
                href={`/topics/${encodeURIComponent(t.name)}`}
                className="border border-rule p-4 hover:border-ink hover:bg-rule/20 transition group relative overflow-hidden"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-rule/40 group-hover:bg-accent-red/10 transition"
                  style={{ width: `${bar}%` }}
                />
                <div className="relative flex items-baseline gap-3">
                  <span className="text-3xl">{t.icon}</span>
                  <span className="font-serif text-xl font-bold group-hover:text-accent-red transition">
                    {t.name}
                  </span>
                  <span className="ml-auto text-sm text-ink-soft tabular-nums">
                    {t.platform_count} 條
                  </span>
                </div>
              </Link>
            );
          })}
      </div>

      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-12 leading-relaxed">
        分類由關鍵字自動標註（一條政見可屬多主題）。例如政見裡只要出現「社宅、公宅、租屋…」等字眼，
        就會被歸到「住宅」主題。
      </p>
    </div>
  );
}
