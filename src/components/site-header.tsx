import Link from "next/link";

const NAV = [
  { href: "/", label: "首頁" },
  { href: "/platforms", label: "候選人政見" },
  { href: "/elections", label: "選舉時程" },
  { href: "/mayors", label: "縣市長歷屆" },
  { href: "/trends", label: "趨勢分析" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper sticky top-0 z-40 backdrop-blur-sm/0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight">正至</span>
          <span className="hidden sm:inline text-xs text-ink-soft tracking-widest uppercase">
            Taiwan Election
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1 text-ink-soft hover:text-ink hover:underline underline-offset-4 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
