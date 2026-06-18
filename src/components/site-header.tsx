import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "./search-bar";

const NAV = [
  { href: "/", label: "首頁" },
  { href: "/elections", label: "選舉" },
  { href: "/government", label: "政府" },
  { href: "/people", label: "政治人物" },
  { href: "/parties", label: "政黨" },
  { href: "/platforms", label: "政見" },
  { href: "/topics", label: "主題" },
  { href: "/issues", label: "議題缺口" },
  { href: "/data", label: "數據" },
  { href: "/about", label: "關於" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="group flex items-baseline gap-2 shrink-0">
            <span className="font-serif text-2xl font-bold tracking-tight">
              正至
            </span>
            <span className="hidden sm:inline text-xs text-ink-soft tracking-widest uppercase">
              Taiwan Election
            </span>
          </Link>

          <Suspense fallback={<div className="flex-1 max-w-md h-8" />}>
            <SearchBar />
          </Suspense>

          <nav className="hidden lg:flex items-center gap-0.5 text-sm">
            {NAV.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-2 py-1.5 text-ink-soft hover:text-ink hover:underline underline-offset-4 whitespace-nowrap transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-2 text-sm overflow-x-auto -mx-4 px-4 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 sm:px-3 py-1.5 text-ink-soft hover:text-ink hover:underline underline-offset-4 whitespace-nowrap transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden lg:flex items-center gap-2 text-sm">
          {NAV.slice(4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1.5 text-ink-soft hover:text-ink hover:underline underline-offset-4 whitespace-nowrap transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
