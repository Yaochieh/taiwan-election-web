"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-accent-red mb-4">
        ERROR
      </p>
      <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-6">
        系統發生錯誤
      </h1>
      <p className="text-ink-soft leading-relaxed mb-6 max-w-md mx-auto">
        我們已記錄這個錯誤。可以試著重新載入；若持續發生，請到 GitHub 開
        issue。
      </p>
      {error.digest && (
        <p className="text-xs text-ink-soft mb-6 font-mono">
          digest: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-ink text-paper text-sm hover:opacity-85 transition"
        >
          重新載入
        </button>
        <Link
          href="/"
          className="px-4 py-2 border border-ink text-sm hover:bg-ink hover:text-paper transition"
        >
          回首頁
        </Link>
      </div>
    </div>
  );
}
