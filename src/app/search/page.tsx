import Link from "next/link";
import { search } from "@/lib/api";
import { partyColor, formatElectionLabelShort } from "@/lib/format";
import { candidatePhotoUrl } from "@/lib/api";

export const metadata = { title: "搜尋 · 正至" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  if (!query) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold mb-4">搜尋</h1>
        <p className="text-ink-soft">在上方輸入關鍵字開始搜尋。</p>
      </div>
    );
  }

  const result = await search(query, 30).catch(() => null);

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold mb-4">搜尋失敗</h1>
        <p className="text-ink-soft">無法連接到後端。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-6 mb-8">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
          SEARCH
        </p>
        <h1 className="font-serif text-3xl font-bold mb-2">
          「{query}」的搜尋結果
        </h1>
        <p className="text-sm text-ink-soft">
          共找到 {result.total} 筆相關資料
        </p>
      </header>

      {/* ── 候選人 ── */}
      {result.candidates.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-baseline gap-2">
            候選人 / 政治人物
            <span className="text-sm font-normal text-ink-soft">
              {result.candidates.length}
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {result.candidates.map((c) => (
              <Link
                key={c.name}
                href={`/people/${encodeURIComponent(c.name)}`}
                className="border border-rule p-3 hover:border-ink hover:bg-rule/30 transition"
              >
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-xs text-ink-soft mt-1">
                  {c.election_count} 場選舉
                  {c.parties && <span className="ml-2">· {c.parties}</span>}
                  {c.ever_elected === 1 && (
                    <span className="ml-2 text-accent-red">★ 曾當選</span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 政黨 ── */}
      {result.parties.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-baseline gap-2">
            政黨
            <span className="text-sm font-normal text-ink-soft">
              {result.parties.length}
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {result.parties.map((p) => (
              <span
                key={p.party_id}
                className="inline-block px-3 py-1.5 text-sm border border-rule"
                style={{ color: p.color_hex || partyColor(p.name) }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── 選舉 ── */}
      {result.elections.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-baseline gap-2">
            選舉
            <span className="text-sm font-normal text-ink-soft">
              {result.elections.length}
            </span>
          </h2>
          <ul className="space-y-2">
            {result.elections.slice(0, 10).map((e) => (
              <li key={e.election_id}>
                <Link
                  href={`/elections/${e.election_id}`}
                  className="inline-block hover:underline underline-offset-4 hover:text-accent-red"
                >
                  {formatElectionLabelShort(e.date, e.name)}
                  {e.description && (
                    <span className="ml-2 text-ink-soft text-sm">
                      ({e.description})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 政見內容（文字版）── */}
      {result.platforms.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-baseline gap-2">
            政見內容
            <span className="text-sm font-normal text-ink-soft">
              {result.platforms.length}
            </span>
          </h2>
          <ul className="space-y-4">
            {result.platforms.map((p) => (
              <li
                key={p.platform_id}
                className="border-l-2 border-rule pl-4 hover:border-accent-red transition"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm mb-1">
                  <span
                    className="font-medium"
                    style={{ color: partyColor(p.party_name, p.color_hex) }}
                  >
                    {p.candidate_name}
                  </span>
                  <span className="text-ink-soft">{p.party_name}</span>
                  <Link
                    href={`/platforms?election=${p.election_id}`}
                    className="ml-auto text-xs text-ink-soft hover:text-accent-red"
                  >
                    {formatElectionLabelShort(p.election_date, p.election_name)} →
                  </Link>
                </div>
                <p className="text-sm leading-relaxed">
                  {highlightTerm(p.snippet, query)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── OCR 圖片政見 ── */}
      {result.ocr.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-baseline gap-2">
            圖片政見（OCR 文字）
            <span className="text-sm font-normal text-ink-soft">
              {result.ocr.length}
            </span>
          </h2>
          <ul className="space-y-4">
            {result.ocr.map((o, i) => (
              <li
                key={`${o.candidate_id}-${i}`}
                className="border-l-2 border-rule pl-4 hover:border-accent-red transition"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm mb-1">
                  <span
                    className="font-medium"
                    style={{ color: partyColor(o.party_name, o.color_hex) }}
                  >
                    {o.candidate_name}
                  </span>
                  <span className="text-ink-soft">{o.party_name}</span>
                  <Link
                    href={`/platforms?election=${o.election_id}`}
                    className="ml-auto text-xs text-ink-soft hover:text-accent-red"
                  >
                    {formatElectionLabelShort(o.election_date, o.election_name)} →
                  </Link>
                </div>
                <p className="text-sm leading-relaxed">
                  {highlightTerm(o.snippet, query)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.total === 0 && (
        <p className="text-ink-soft text-center py-12">
          沒有找到「{query}」相關資料。試試其他關鍵字？
        </p>
      )}
    </div>
  );
}

function highlightTerm(text: string, term: string) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "g"));
  return parts.map((p, i) =>
    p === term ? (
      <mark
        key={i}
        className="bg-accent-red/20 text-accent-red font-medium px-0.5"
      >
        {p}
      </mark>
    ) : (
      p
    ),
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
