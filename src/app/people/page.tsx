import Link from "next/link";

export const metadata = { title: "政治人物 · 正至" };

const SECTIONS = [
  {
    href: "/people/search",
    title: "搜尋",
    desc: "跨選舉搜尋候選人，看歷年參選紀錄。",
    status: "✓",
  },
  {
    href: "/people/compare",
    title: "比較工具",
    desc: "並列比對兩位以上候選人的政見、得票與背景。",
    status: "✓",
  },
];

export default function PeopleLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          PEOPLE
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          政治人物
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          候選人個人頁面、跨選舉歷史紀錄、比較工具。每位曾參選者的所有政見、得票、政黨變化都應該可被追溯。
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-10">
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
