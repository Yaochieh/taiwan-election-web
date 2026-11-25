"use client";

import { useCallback, useEffect, useState, type ReactNode, type MouseEvent } from "react";

/** 選舉頁共用的篩選方框（縣市 → 選舉區／鄉鎮），樣式與立委頁的縣市篩選一致。
 *
 *  篩選完全在瀏覽器端做：頁面本身是靜態快取（ISR），點按鈕只改網址列
 *  （history.pushState），不會讓伺服器重算整頁。網址照樣帶 ?county=… 可以分享，
 *  打開時由 useQueryParams 讀回來。 */

type Params = Record<string, string | undefined>;

function readParams(keys: readonly string[]): Params {
  const sp = new URLSearchParams(window.location.search);
  return Object.fromEntries(keys.map((k) => [k, sp.get(k) ?? undefined]));
}

export function buildHref(params: Params): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const q = sp.toString();
  return q ? `${window.location.pathname}?${q}` : window.location.pathname;
}

/** 讀寫網址列上的篩選參數；上一頁／下一頁也會同步。首次渲染（含伺服器）一律是空的。 */
export function useQueryParams<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useState<Partial<Record<K, string>>>({});
  const keyStr = keys.join(",");

  useEffect(() => {
    const ks = keyStr.split(",");
    const sync = () => setParams(readParams(ks) as Partial<Record<K, string>>);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [keyStr]);

  const go = useCallback((next: Partial<Record<K, string>>) => {
    window.history.pushState(null, "", buildHref(next));
    setParams(next);
  }, []);

  return [params, go] as const;
}

/** 有 href（可右鍵開新分頁）但左鍵只在瀏覽器端切換。 */
function ClientLink({
  query,
  onSelect,
  className,
  children,
}: {
  query: string;
  onSelect: () => void;
  className: string;
  children: ReactNode;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelect();
  };
  return (
    <a href={query || "?"} rel="nofollow" onClick={onClick} className={className}>
      {children}
    </a>
  );
}

export function queryString(params: Params): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export function PickerBox({ children }: { children: ReactNode }) {
  return <section className="border border-rule p-4 sm:p-5 space-y-4">{children}</section>;
}

export function PickerRow({
  label,
  onClear,
  clearQuery = "",
  children,
}: {
  label: string;
  onClear?: () => void;
  clearQuery?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">
        {label}
        {onClear && (
          <ClientLink
            query={clearQuery}
            onSelect={onClear}
            className="ml-3 text-xs text-ink-soft hover:text-accent-red underline underline-offset-2"
          >
            清除
          </ClientLink>
        )}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function PickerChip({
  query,
  onSelect,
  active,
  label,
  count,
}: {
  query: string;
  onSelect: () => void;
  active: boolean;
  label: string;
  count?: number | string;
}) {
  return (
    <ClientLink
      query={query}
      onSelect={onSelect}
      className={
        "text-xs px-3 py-1.5 border transition " +
        (active
          ? "bg-ink text-paper border-ink"
          : "border-rule hover:border-ink text-ink-soft hover:text-ink")
      }
    >
      {label}
      {count != null && <span className="ml-1.5 opacity-70 tabular-nums">{count}</span>}
    </ClientLink>
  );
}

/** 也給其他元件用的「看起來是連結、點了只在瀏覽器端切換」。 */
export { ClientLink };

export function PickerHint({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-rule p-8 text-center text-ink-soft">{children}</div>
  );
}
