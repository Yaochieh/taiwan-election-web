import { getElections } from "@/lib/api";

export const metadata = { title: "選舉時程 · 正至" };

export default async function ElectionsPage() {
  const elections = await getElections().catch(() => []);
  const typeZh: Record<string, string> = {
    presidential: "總統",
    legislative: "立委",
    mayoral: "縣市長",
    council: "議員",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          ELECTIONS
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">
          選舉時程
        </h1>
        <p className="text-ink-soft mt-3">共 {elections.length} 場選舉。</p>
      </header>

      <div className="border-t-2 border-ink">
        {elections.map((e) => (
          <article
            key={e.election_id}
            className="grid grid-cols-12 gap-4 py-5 border-b border-rule items-baseline"
          >
            <div className="col-span-3 sm:col-span-2 font-serif text-xl tabular-nums">
              {e.date.slice(0, 10)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-sm text-ink-soft">
              {typeZh[e.type] || e.type}
            </div>
            <div className="col-span-6 sm:col-span-8 font-medium">
              {e.name}
              {e.description && (
                <span className="ml-2 text-ink-soft">（{e.description}）</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
