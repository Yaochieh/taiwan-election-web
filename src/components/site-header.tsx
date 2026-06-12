import Link from "next/link";

const NAV = [
  { href: "/", label: "首頁" },
  { href: "/elections", label: "歷屆選舉" },
  { href: "/platforms", label: "候選人政見" },
  { href: "/parties", label: "政黨資訊" },
  { href: "/trends", label: "趨勢分析" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="group flex items-baseline gap-2 shrink-0">
          <span className="font-serif text-2xl font-bold tracking-tight">正至</span>
          <span className="hidden sm:inline text-xs text-ink-soft tracking-widest uppercase">
            Taiwan Election
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1 text-sm overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-ink-soft hover:text-ink hover:bg-paper hover:underline underline-offset-4 whitespace-nowrap transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
