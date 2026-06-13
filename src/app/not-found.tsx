import Link from "next/link";

export const metadata = { title: "找不到頁面 · 正至" };

const LINKS = [
  { href: "/elections", label: "歷屆選舉" },
  { href: "/people/search", label: "政治人物" },
  { href: "/parties", label: "政黨" },
  { href: "/trends", label: "趨勢分析" },
  { href: "/about", label: "關於" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-4">
        404
      </p>
      <h1 className="article-title font-serif text-5xl sm:text-6xl font-bold leading-tight mb-6">
        找不到這個頁面
      </h1>
      <p className="text-ink-soft leading-relaxed mb-10 max-w-md mx-auto">
        你要找的資源可能已被移除、改名，或者從來不存在。
        嘗試從下方常用頁面進入，或回首頁。
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 border border-ink hover:bg-ink hover:text-paper text-sm transition"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="inline-block text-sm underline underline-offset-2 hover:text-accent-red"
      >
        ← 回首頁
      </Link>
    </div>
  );
}
