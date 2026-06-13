import Link from "next/link";
import { getPersonProfile } from "@/lib/api";
import type { PersonProfile } from "@/lib/types";
import { partyColor, formatVotes } from "@/lib/format";
import { PersonLink, PartyLink } from "@/components/entity-links";

export const metadata = { title: "比較工具 · 正至" };

const SUGGESTED_PAIRS: { names: string[]; label: string }[] = [
  { names: ["賴清德", "侯友宜", "柯文哲"], label: "2024 總統候選人" },
  { names: ["蔡英文", "馬英九"], label: "前後總統" },
  { names: ["蔣萬安", "陳時中", "黃珊珊"], label: "2022 臺北市長候選人" },
  { names: ["陳其邁", "韓國瑜"], label: "2018 / 2020 高雄市長" },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ names?: string }>;
}) {
  const params = await searchParams;
  const raw = params.names?.trim() || "";
  const names = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const profiles: (PersonProfile | null)[] = await Promise.all(
    names.map((n) => getPersonProfile(n).catch(() => null)),
  );
  const valid = profiles.filter((p): p is PersonProfile => p !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/people" className="hover:text-ink">
            ← 政治人物
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          PEOPLE · COMPARE
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          候選人比較
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          並列比較多位政治人物的參選經歷、政黨變遷、勝率。
        </p>
        <form
          method="GET"
          className="mt-4 flex flex-col sm:flex-row gap-3 max-w-2xl"
        >
          <input
            name="names"
            defaultValue={raw}
            placeholder="輸入姓名，逗號分隔，例：賴清德,侯友宜,柯文哲"
            className="flex-1 border border-rule px-3 py-2 text-sm bg-paper"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-ink text-paper text-sm hover:opacity-85"
          >
            比較
          </button>
        </form>
      </header>

      {valid.length === 0 ? (
        <section>
          <h2 className="font-serif text-xl font-bold mb-4">建議組合</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {SUGGESTED_PAIRS.map((p) => {
              const q = encodeURIComponent(p.names.join(","));
              return (
                <Link
                  key={p.label}
                  href={`/people/compare?names=${q}`}
                  className="border border-rule p-4 hover:border-ink transition block"
                >
                  <div className="text-xs text-ink-soft mb-1">{p.label}</div>
                  <div className="font-serif text-lg font-bold">
                    {p.names.join(" vs ")}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          {/* 概覽列 */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${valid.length}, minmax(0, 1fr))`,
            }}
          >
            {valid.map((p) => {
              const latestParty = p.party_history[0]?.party || "無黨籍";
              const color = partyColor(latestParty);
              return (
                <div
                  key={p.name}
                  className="border-2 p-4"
                  style={{ borderColor: color }}
                >
                  <PersonLink
                    name={p.name}
                    color={color}
                    className="font-serif text-2xl font-bold"
                  />
                  <div className="text-xs mt-1">
                    <PartyLink name={latestParty} />
                  </div>
                  {p.background && (
                    <div className="text-xs text-ink-soft mt-1">
                      {p.background}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="border border-rule p-2">
                      <div className="text-ink-soft">參選</div>
                      <div className="font-serif text-xl">{p.total_races}</div>
                    </div>
                    <div className="border border-rule p-2">
                      <div className="text-ink-soft">當選</div>
                      <div
                        className="font-serif text-xl"
                        style={{ color }}
                      >
                        {p.total_wins}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-soft mt-1">
                    勝率 {(p.win_rate * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* 政黨歷程 */}
          <section>
            <h2 className="font-serif text-xl font-bold mb-3">政黨歷程</h2>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${valid.length}, minmax(0, 1fr))`,
              }}
            >
              {valid.map((p) => (
                <div key={p.name} className="border border-rule p-3 text-xs">
                  {p.party_history.length === 0 && (
                    <span className="text-ink-soft">—</span>
                  )}
                  <ul className="space-y-1">
                    {p.party_history.map((h, i) => {
                      const color = partyColor(h.party, h.color_hex);
                      return (
                        <li
                          key={i}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="w-2 h-3"
                            style={{ backgroundColor: color }}
                          />
                          <span>{h.party}</span>
                          <span className="text-ink-soft ml-auto tabular-nums">
                            {h.from_date.slice(0, 4)} 起
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 重要選戰 */}
          <section>
            <h2 className="font-serif text-xl font-bold mb-3">主要參選紀錄</h2>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${valid.length}, minmax(0, 1fr))`,
              }}
            >
              {valid.map((p) => (
                <div key={p.name} className="border border-rule p-3 text-xs">
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {p.races.slice(0, 12).map((r) => (
                      <li
                        key={r.candidate_id}
                        className={
                          "border-l-2 pl-2 py-1 " +
                          (r.elected
                            ? "border-accent-red bg-ink/[0.03]"
                            : "border-rule")
                        }
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif tabular-nums">
                            {r.election_date.slice(0, 4)}
                          </span>
                          {r.elected === 1 && (
                            <span className="text-accent-red font-bold">★</span>
                          )}
                        </div>
                        <div className="text-ink-soft">
                          {r.election_name}
                        </div>
                        {r.votes != null && (
                          <div className="tabular-nums">
                            {formatVotes(r.votes)} 票
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {p.races.length > 12 && (
                    <p className="text-ink-soft mt-2">
                      ⋯ 還有 {p.races.length - 12} 筆
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {profiles.some((p) => p === null) && (
            <p className="text-sm text-accent-red border border-accent-red p-3">
              下列姓名找不到：
              {names
                .filter((_, i) => profiles[i] === null)
                .join("、")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
