import Link from "next/link";

export const metadata = { title: "數據 · 正至" };

const SECTIONS = [
  {
    href: "/trends",
    title: "趨勢分析",
    desc: "總統得票與政黨票歷年變化折線圖。",
    status: "✓",
  },
  {
    href: "/data/turnout",
    title: "投票率",
    desc: "歷屆各類選舉投票率與選民結構。",
    status: "✓",
  },
  {
    href: "/data/downloads",
    title: "開放資料",
    desc: "選舉結果、政見、候選人資料 CSV/JSON 下載。",
    status: "✓",
  },
];

export default function DataLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          DATA
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          數據
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          選舉資料的量化分析與圖表呈現。所有資料皆來自公開來源，可下載供研究使用。
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-10">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group block border-t-2 border-ink pt-6 hover:border-accent-red transition"
          >
            <p className="text-xs text-ink-soft mb-2">
              {s.status === "✓" ? "已上線" : "建置中"}
            </p>
            <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent-red transition">
              {s.title} →
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
