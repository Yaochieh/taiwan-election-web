import Link from "next/link";
import type { ReactNode } from "react";

/** 選舉頁共用的篩選方框（縣市 → 選舉區／鄉鎮），樣式與立委頁的縣市篩選一致。 */

export function PickerBox({ children }: { children: ReactNode }) {
  return <section className="border border-rule p-4 sm:p-5 space-y-4">{children}</section>;
}

export function PickerRow({
  label,
  clearHref,
  children,
}: {
  label: string;
  clearHref?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">
        {label}
        {clearHref && (
          <Link
            href={clearHref}
            scroll={false}
            className="ml-3 text-xs text-ink-soft hover:text-accent-red underline underline-offset-2"
          >
            清除
          </Link>
        )}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function PickerChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number | string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={
        "text-xs px-3 py-1.5 border transition " +
        (active
          ? "bg-ink text-paper border-ink"
          : "border-rule hover:border-ink text-ink-soft hover:text-ink")
      }
    >
      {label}
      {count != null && <span className="ml-1.5 opacity-70 tabular-nums">{count}</span>}
    </Link>
  );
}

export function PickerHint({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-rule p-8 text-center text-ink-soft">{children}</div>
  );
}
