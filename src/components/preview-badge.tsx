import Link from "next/link";

/**
 * 標示「這個功能可以用，但資料還不完整或方法還在調整」。
 * 點擊連到 /about 的完成度總表，讓讀者知道該保留多少懷疑。
 */
export function PreviewBadge({ label = "PREVIEW" }: { label?: string }) {
  return (
    <Link
      href="/about#status"
      title="這項功能仍在建設中，點擊看目前完成度與已知限制"
      className="shrink-0 text-[10px] tracking-widest px-1.5 py-0.5 border border-accent-red text-accent-red hover:bg-accent-red hover:text-paper transition"
    >
      {label}
    </Link>
  );
}

/**
 * 頁面標題下方的說明條，講清楚這一頁的資料限制。
 */
export function PreviewNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 border-l-2 border-accent-red pl-3 py-1 text-sm text-ink-soft leading-relaxed max-w-3xl">
      {children}{" "}
      <Link
        href="/about"
        className="underline underline-offset-2 hover:text-ink whitespace-nowrap"
      >
        完成度說明 →
      </Link>
    </div>
  );
}
