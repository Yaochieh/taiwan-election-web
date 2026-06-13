"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
      className="relative flex-1 max-w-md"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜尋候選人、政黨、政見..."
        aria-label="搜尋"
        className="w-full px-3 py-1.5 pr-9 border border-rule bg-paper text-sm focus:outline-none focus:border-ink transition"
      />
      <button
        type="submit"
        aria-label="搜尋"
        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 text-ink-soft hover:text-ink"
      >
        🔍
      </button>
    </form>
  );
}
